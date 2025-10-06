# Backend Implementation: Media Messages Support

## Issue
Frontend is successfully uploading media files and sending the `mediaUrl` parameter, but the backend is not storing it in the database. All messages show `media_url: null`.

## Evidence from Logs
```
✅ File uploaded successfully: { mediaUrl: "https://...", ... }
📤 Sending message with media: { content: "Sent a file", mediaUrl: "https://..." }
🔍 handleSendDMMessage called: { content: "Sent a file", mediaUrl: "https://...", threadId: "..." }
📡 Sending via WebSocket
📥 WebSocket response: { success: true }

// BUT when fetching messages:
messages: [
  { content: 'Sent a file', media_url: null, ... }  // ❌ media_url is null!
]
```

## Required Backend Changes

### 1. Update Database Schema (if not already done)

Ensure the `messages` table has a `media_url` column:

```sql
-- Check if column exists
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'messages' AND column_name = 'media_url';

-- If not exists, add it
ALTER TABLE messages
ADD COLUMN media_url VARCHAR(500) NULL;
```

### 2. Update WebSocket Handler for DM Messages

**File**: `backend/socket/messageHandler.js` (or similar)

```javascript
// BEFORE (missing mediaUrl)
socket.on('send_dm_message', async (data, callback) => {
  const { userId, content, threadId } = data;

  // Insert message
  await db.query(
    'INSERT INTO messages (id, thread_id, sender_id, content, created_at) VALUES ($1, $2, $3, $4, $5)',
    [messageId, threadId, userId, content, new Date()]
  );

  callback({ success: true });
});

// AFTER (with mediaUrl support)
socket.on('send_dm_message', async (data, callback) => {
  const { userId, content, threadId, mediaUrl } = data;  // ✅ Added mediaUrl

  console.log('📩 Received DM message:', { userId, content, threadId, mediaUrl });

  // Insert message with media_url
  await db.query(
    'INSERT INTO messages (id, thread_id, sender_id, content, media_url, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
    [messageId, threadId, userId, content, mediaUrl || null, new Date()]  // ✅ Store mediaUrl
  );

  // Broadcast to other users in thread
  socket.to(threadId).emit('new_dm_message', {
    id: messageId,
    thread_id: threadId,
    sender_id: userId,
    content,
    media_url: mediaUrl || null,  // ✅ Include in broadcast
    created_at: new Date()
  });

  callback({ success: true });
});
```

### 3. Update REST API Handler for DM Messages

**File**: `backend/routes/messages.js` (or similar)

```javascript
// POST /api/snaps/messages/thread/:threadId
router.post('/thread/:threadId', async (req, res) => {
  const { threadId } = req.params;
  const { senderId, content, mediaUrl } = req.body;  // ✅ Added mediaUrl

  console.log('📩 REST API: Received DM message:', { senderId, content, threadId, mediaUrl });

  const messageId = uuidv4();

  // Insert message with media_url
  await db.query(
    `INSERT INTO messages (id, thread_id, sender_id, content, media_url, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [messageId, threadId, senderId, content, mediaUrl || null, new Date()]  // ✅ Store mediaUrl
  );

  // Fetch the created message
  const result = await db.query(
    `SELECT m.*, u.username as sender_username, u.avatar_url as sender_avatar
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.id = $1`,
    [messageId]
  );

  res.json({
    message: 'Message sent successfully',
    messageData: result.rows[0]  // ✅ Will include media_url
  });
});
```

### 4. Update Community Message Handlers

**WebSocket Handler**:
```javascript
socket.on('send_community_message', async (data, callback) => {
  const { userId, content, communityId, mediaUrl } = data;  // ✅ Added mediaUrl

  console.log('📩 Received community message:', { userId, content, communityId, mediaUrl });

  // Insert message with media_url
  await db.query(
    'INSERT INTO community_messages (id, community_id, sender_id, content, media_url, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
    [messageId, communityId, userId, content, mediaUrl || null, new Date()]
  );

  // Broadcast to community
  socket.to(communityId).emit('new_community_message', {
    id: messageId,
    community_id: communityId,
    sender_id: userId,
    content,
    media_url: mediaUrl || null,  // ✅ Include in broadcast
    created_at: new Date()
  });

  callback({ success: true });
});
```

**REST API Handler**:
```javascript
// POST /api/snaps/communities/:communityId/messages
router.post('/:communityId/messages', async (req, res) => {
  const { communityId } = req.params;
  const { senderId, content, mediaUrl } = req.body;  // ✅ Added mediaUrl

  console.log('📩 REST API: Received community message:', { senderId, content, communityId, mediaUrl });

  const messageId = uuidv4();

  await db.query(
    `INSERT INTO community_messages (id, community_id, sender_id, content, media_url, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [messageId, communityId, senderId, content, mediaUrl || null, new Date()]
  );

  const result = await db.query(
    `SELECT cm.*, u.username as sender_username, u.avatar_url as sender_avatar
     FROM community_messages cm
     JOIN users u ON cm.sender_id = u.id
     WHERE cm.id = $1`,
    [messageId]
  );

  res.json({
    message: 'Community message sent successfully',
    messages: result.rows
  });
});
```

### 5. Update Message Retrieval Queries

Ensure all SELECT queries include `media_url`:

```javascript
// GET /api/snaps/message-threads/:threadId/messages
router.get('/:threadId/messages', async (req, res) => {
  const { threadId } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  const result = await db.query(
    `SELECT
      m.id,
      m.thread_id,
      m.sender_id,
      m.content,
      m.media_url,  -- ✅ Include media_url
      m.created_at,
      u.username as sender_username,
      u.avatar_url as sender_avatar
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.thread_id = $1
     ORDER BY m.created_at DESC
     LIMIT $2 OFFSET $3`,
    [threadId, limit, offset]
  );

  res.json({
    message: 'Thread messages retrieved successfully',
    messages: result.rows
  });
});
```

## Testing

After implementing these changes:

### Test 1: Send Image via DM
1. Frontend uploads image to S3
2. Frontend sends message with `mediaUrl`
3. Backend saves message with `media_url` field
4. Verify in database: `SELECT * FROM messages WHERE media_url IS NOT NULL;`
5. Frontend fetches messages and displays image

### Test 2: Send Video via Community
1. Same flow as above for communities
2. Verify in database: `SELECT * FROM community_messages WHERE media_url IS NOT NULL;`

### Test 3: WebSocket Real-time Delivery
1. User A sends image
2. User B should see image appear in real-time
3. Check WebSocket broadcast includes `media_url`

## Database Check

Run these queries to verify:

```sql
-- Check if media_url column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('messages', 'community_messages')
  AND column_name = 'media_url';

-- Check if any messages have media
SELECT COUNT(*) as total_messages,
       COUNT(media_url) as messages_with_media
FROM messages;

-- View recent messages with media
SELECT id, sender_id, content, media_url, created_at
FROM messages
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC
LIMIT 10;
```

## Frontend Integration Status

✅ **Frontend is ready and waiting for backend support:**
- File upload to S3 works
- `mediaUrl` is sent to backend via WebSocket and REST API
- Message display supports images and videos
- UI shows media attachments properly

❌ **Backend is not storing the mediaUrl:**
- All messages return `media_url: null`
- Need to update handlers to accept and store `mediaUrl` parameter

## Priority

**HIGH** - This is blocking the media messaging feature. Frontend work is complete.

## Estimated Time

- Database changes: 15 minutes
- WebSocket handlers: 30 minutes
- REST API handlers: 30 minutes
- Testing: 30 minutes
- **Total: ~2 hours**

## Contact

Once implemented, test by:
1. Sending a message with an image
2. Checking the console logs for the mediaUrl
3. Verifying the database has non-null `media_url` values
4. Confirming the frontend displays the image

The frontend logs show everything working correctly on our end. We're just waiting for the backend to store and return the `media_url` field.
