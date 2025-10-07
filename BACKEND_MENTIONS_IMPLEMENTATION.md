# Backend Implementation Guide for User Mentions

## Overview
This document outlines all the backend changes needed to support user mentions/tags in posts.

## Database Schema Changes

### 1. Create `post_mentions` Table

```sql
CREATE TABLE post_mentions (
    id SERIAL PRIMARY KEY,
    post_id VARCHAR(255) NOT NULL,
    mentioned_user_id VARCHAR(255) NOT NULL,
    mentioned_at INTEGER DEFAULT FLOOR(EXTRACT(EPOCH FROM NOW())),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, mentioned_user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (mentioned_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX idx_post_mentions_post_id ON post_mentions(post_id);
CREATE INDEX idx_post_mentions_user_id ON post_mentions(mentioned_user_id);
CREATE INDEX idx_post_mentions_created_at ON post_mentions(created_at DESC);
```

### 2. Update `notifications` Table (if needed)

If you don't have a `notification_type` column, add it:

```sql
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS notification_type VARCHAR(50) DEFAULT 'like';

-- Supported types: 'like', 'comment', 'retweet', 'follow', 'mention'
```

## API Endpoint Modifications

### 1. **POST `/api/snaps/posts`** - Create Post

#### Update Request Body to Include Mentions:
```javascript
{
  "userId": "user123",
  "content": "Hey @blazeswap check this out!",
  "mediaUrl": "https://...",
  "mentions": ["user456", "user789"]  // NEW: Array of mentioned user IDs
}
```

#### Backend Implementation:
```javascript
async function createPost(req, res) {
  const { userId, content, mediaUrl, mentions } = req.body;

  try {
    // 1. Create the post
    const post = await db.query(
      `INSERT INTO posts (id, user_id, content, media_url, created_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [generateUUID(), userId, content, mediaUrl, getCurrentTimestamp()]
    );

    const postId = post.rows[0].id;

    // 2. Insert mentions if provided
    if (mentions && Array.isArray(mentions) && mentions.length > 0) {
      // Validate mentioned users exist
      const validUsers = await db.query(
        `SELECT id FROM users WHERE id = ANY($1)`,
        [mentions]
      );
      const validUserIds = validUsers.rows.map(u => u.id);

      // Insert mentions
      for (const mentionedUserId of validUserIds) {
        await db.query(
          `INSERT INTO post_mentions (post_id, mentioned_user_id)
           VALUES ($1, $2) ON CONFLICT (post_id, mentioned_user_id) DO NOTHING`,
          [postId, mentionedUserId]
        );

        // 3. Create notification for mentioned user (skip if user mentions themselves)
        if (mentionedUserId !== userId) {
          // Get author info
          const author = await db.query(
            `SELECT username FROM users WHERE id = $1`,
            [userId]
          );

          await db.query(
            `INSERT INTO notifications (user_id, type, actor_id, post_id, message, is_read, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              mentionedUserId,
              'mention',
              userId,
              postId,
              `@${author.rows[0].username} mentioned you in a post`,
              false,
              getCurrentTimestamp()
            ]
          );
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: post.rows[0]
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  }
}
```

### 2. **GET `/api/snaps/posts/:postId`** - Get Single Post

#### Update Response to Include Mentions:
```javascript
async function getPost(req, res) {
  const { postId } = req.params;

  try {
    // Get post details
    const post = await db.query(
      `SELECT p.*, u.username, u.avatar_url
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [postId]
    );

    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get mentions for this post
    const mentions = await db.query(
      `SELECT pm.mentioned_user_id as user_id, u.username, u.avatar_url, u.name
       FROM post_mentions pm
       JOIN users u ON pm.mentioned_user_id = u.id
       WHERE pm.post_id = $1`,
      [postId]
    );

    return res.json({
      success: true,
      post: {
        ...post.rows[0],
        mentions: mentions.rows  // Add mentions to response
      }
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return res.status(500).json({ error: 'Failed to fetch post' });
  }
}
```

### 3. **GET `/api/snaps/feed/*`** - Get Feed/Timeline Posts

#### Update All Feed Queries to Include Mentions:

```javascript
async function getPersonalizedFeed(req, res) {
  const { userId, limit = 20, offset = 0 } = req.query;

  try {
    // Get posts
    const posts = await db.query(
      `SELECT p.*, u.username, u.avatar_url
       FROM posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get mentions for all posts in one query (more efficient)
    const postIds = posts.rows.map(p => p.id);
    const mentions = await db.query(
      `SELECT pm.post_id, pm.mentioned_user_id as user_id, u.username, u.avatar_url, u.name
       FROM post_mentions pm
       JOIN users u ON pm.mentioned_user_id = u.id
       WHERE pm.post_id = ANY($1)`,
      [postIds]
    );

    // Group mentions by post_id
    const mentionsByPost = {};
    mentions.rows.forEach(mention => {
      if (!mentionsByPost[mention.post_id]) {
        mentionsByPost[mention.post_id] = [];
      }
      mentionsByPost[mention.post_id].push({
        user_id: mention.user_id,
        username: mention.username,
        avatar_url: mention.avatar_url,
        name: mention.name
      });
    });

    // Add mentions to each post
    const postsWithMentions = posts.rows.map(post => ({
      ...post,
      mentions: mentionsByPost[post.id] || []
    }));

    return res.json({
      success: true,
      posts: postsWithMentions,
      totalCount: posts.rows.length
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return res.status(500).json({ error: 'Failed to fetch feed' });
  }
}
```

### 4. **GET `/api/snaps/users/:userId/mentions`** - Get Posts Where User Was Mentioned (NEW ENDPOINT)

```javascript
async function getUserMentions(req, res) {
  const { userId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  try {
    const posts = await db.query(
      `SELECT p.*, u.username, u.avatar_url, pm.mentioned_at
       FROM post_mentions pm
       JOIN posts p ON pm.post_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE pm.mentioned_user_id = $1
       ORDER BY pm.mentioned_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get mentions for these posts
    const postIds = posts.rows.map(p => p.id);
    const mentions = await db.query(
      `SELECT pm.post_id, pm.mentioned_user_id as user_id, u.username, u.avatar_url
       FROM post_mentions pm
       JOIN users u ON pm.mentioned_user_id = u.id
       WHERE pm.post_id = ANY($1)`,
      [postIds]
    );

    const mentionsByPost = {};
    mentions.rows.forEach(mention => {
      if (!mentionsByPost[mention.post_id]) {
        mentionsByPost[mention.post_id] = [];
      }
      mentionsByPost[mention.post_id].push(mention);
    });

    const postsWithMentions = posts.rows.map(post => ({
      ...post,
      mentions: mentionsByPost[post.id] || []
    }));

    return res.json({
      success: true,
      posts: postsWithMentions,
      totalCount: posts.rows.length
    });
  } catch (error) {
    console.error('Error fetching user mentions:', error);
    return res.status(500).json({ error: 'Failed to fetch mentions' });
  }
}
```

## Notification Handling

### Update Notifications Query to Include Mention Notifications:

```javascript
async function getUserNotifications(req, res) {
  const { userId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  try {
    const notifications = await db.query(
      `SELECT n.*,
              u.username as actor_username,
              u.avatar_url as actor_avatar,
              p.content as post_content
       FROM notifications n
       LEFT JOIN users u ON n.actor_id = u.id
       LEFT JOIN posts p ON n.post_id = p.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return res.json({
      success: true,
      notifications: notifications.rows
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}
```

## Additional Recommendations

### 1. **Rate Limiting**
Limit the number of mentions per post (e.g., max 10 mentions) to prevent abuse:

```javascript
if (mentions && mentions.length > 10) {
  return res.status(400).json({ error: 'Maximum 10 mentions allowed per post' });
}
```

### 2. **Validation**
- Validate that mentioned users exist before creating the post
- Strip @mentions from content before storing (or keep them, depending on your design)
- Prevent users from spamming mentions

### 3. **Privacy Settings** (Future Enhancement)
Consider adding user privacy settings:
- Allow users to disable mention notifications
- Allow users to control who can mention them

### 4. **Analytics** (Optional)
Track mention metrics:
```sql
CREATE TABLE mention_stats (
    user_id VARCHAR(255) PRIMARY KEY,
    total_mentions_received INTEGER DEFAULT 0,
    total_mentions_given INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing Checklist

- [ ] Create post with mentions
- [ ] Create post without mentions
- [ ] Verify mentioned users receive notifications
- [ ] Verify mentions appear in post details
- [ ] Verify mentions appear in feed
- [ ] Test getUserMentions endpoint
- [ ] Test maximum mentions limit
- [ ] Test mentioning non-existent users
- [ ] Test self-mentions (should not create notification)
- [ ] Test notification display for mentions

## Frontend Integration Points

The frontend changes have been completed and include:
- ✅ Mention detection with @ symbol
- ✅ User autocomplete dropdown
- ✅ Clickable mentions in posts
- ✅ Routing to user profiles when clicking mentions
- ✅ Updated TypeScript types

All backend endpoints should return data in the format expected by the frontend (see `app/types/api.ts` for TypeScript interfaces).
