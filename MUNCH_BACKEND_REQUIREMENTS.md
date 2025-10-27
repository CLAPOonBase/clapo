# Munch Backend Requirements

## Overview
Munch is a short-form video feature (max 60 seconds) similar to Instagram Reels/YouTube Shorts. The backend needs to support video upload, feed generation, engagement features, and analytics.

## Database Schema

### 1. `munch_videos` Table
```sql
CREATE TABLE munch_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  duration INTEGER NOT NULL, -- in seconds, max 60
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at DESC)
);
```

### 2. `munch_likes` Table
```sql
CREATE TABLE munch_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES munch_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(video_id, user_id),
  INDEX idx_video_id (video_id),
  INDEX idx_user_id (user_id)
);
```

### 3. `munch_views` Table
```sql
CREATE TABLE munch_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES munch_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(video_id, user_id),
  INDEX idx_video_id (video_id),
  INDEX idx_user_id (user_id)
);
```

### 4. `munch_comments` Table
```sql
CREATE TABLE munch_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES munch_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_video_id (video_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at DESC)
);
```

## API Endpoints

### 1. Get Munch Feed (For You)
**GET** `/api/snaps/munch`

**Query Parameters:**
- `user_id` (required): Current user ID
- `limit` (optional, default: 20): Number of videos to return
- `offset` (optional, default: 0): Pagination offset

**Response:**
```json
{
  "videos": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "video_url": "https://...",
      "thumbnail_url": "https://...",
      "caption": "Check this out!",
      "duration": 45,
      "created_at": "2024-01-01T00:00:00Z",
      "user": {
        "id": "uuid",
        "username": "john_doe",
        "name": "John Doe",
        "avatar_url": "https://..."
      },
      "like_count": 150,
      "comment_count": 23,
      "view_count": 1500,
      "has_liked": false,
      "has_viewed": false
    }
  ]
}
```

**Algorithm Suggestion:**
- Mix of recent videos from all users
- Can be enhanced with ML-based recommendations later
- For now: ORDER BY created_at DESC with random shuffle

---

### 2. Get Following Munch Feed
**GET** `/api/snaps/munch/following`

**Query Parameters:**
- `user_id` (required): Current user ID
- `limit` (optional, default: 20)
- `offset` (optional, default: 0)

**Response:** Same as above

**Logic:**
- Return videos from users that `user_id` is following
- Join with followers/following table

---

### 3. Create Munch Video
**POST** `/api/snaps/munch`

**Request Body:**
```json
{
  "user_id": "uuid",
  "video_url": "https://...",
  "thumbnail_url": "https://...",
  "caption": "My new video!",
  "duration": 45
}
```

**Validation:**
- `duration` must be <= 60 seconds
- `video_url` is required
- `user_id` must be valid

**Response:**
```json
{
  "video": {
    "id": "uuid",
    "user_id": "uuid",
    "video_url": "https://...",
    "thumbnail_url": "https://...",
    "caption": "My new video!",
    "duration": 45,
    "created_at": "2024-01-01T00:00:00Z",
    "user": { ... },
    "like_count": 0,
    "comment_count": 0,
    "view_count": 0,
    "has_liked": false,
    "has_viewed": false
  }
}
```

---

### 4. Like Video
**POST** `/api/snaps/munch/:videoId/like`

**Request Body:**
```json
{
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video liked"
}
```

**Logic:**
- Insert into `munch_likes` table (if not exists)
- Increment `like_count` on `munch_videos`
- Return error if already liked (or handle idempotently)

---

### 5. Unlike Video
**POST** `/api/snaps/munch/:videoId/unlike`

**Request Body:**
```json
{
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video unliked"
}
```

**Logic:**
- Delete from `munch_likes` table
- Decrement `like_count` on `munch_videos`

---

### 6. Record Video View
**POST** `/api/snaps/munch/:videoId/view`

**Request Body:**
```json
{
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "success": true
}
```

**Logic:**
- Insert into `munch_views` table (if not exists)
- Increment `view_count` on `munch_videos`
- Handle idempotently (don't count multiple views from same user)

---

### 7. Get Comments
**GET** `/api/snaps/munch/:videoId/comments`

**Query Parameters:**
- `user_id` (required): Current user ID

**Response:**
```json
{
  "comments": [
    {
      "id": "uuid",
      "video_id": "uuid",
      "user_id": "uuid",
      "content": "Great video!",
      "created_at": "2024-01-01T00:00:00Z",
      "user": {
        "id": "uuid",
        "username": "jane_doe",
        "name": "Jane Doe",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

---

### 8. Add Comment
**POST** `/api/snaps/munch/:videoId/comments`

**Request Body:**
```json
{
  "user_id": "uuid",
  "content": "Amazing video!"
}
```

**Response:**
```json
{
  "comment": {
    "id": "uuid",
    "video_id": "uuid",
    "user_id": "uuid",
    "content": "Amazing video!",
    "created_at": "2024-01-01T00:00:00Z",
    "user": { ... }
  }
}
```

**Logic:**
- Insert into `munch_comments` table
- Increment `comment_count` on `munch_videos`

---

### 9. Delete Video
**DELETE** `/api/snaps/munch/:videoId`

**Query Parameters:**
- `user_id` (required): Current user ID

**Response:**
```json
{
  "success": true,
  "message": "Video deleted"
}
```

**Logic:**
- Verify that `user_id` owns the video
- Delete from `munch_videos` (cascade deletes likes, views, comments)
- Optionally delete the video file from storage

---

### 10. Share Video (Optional - for analytics)
**POST** `/api/snaps/munch/:videoId/share`

**Request Body:**
```json
{
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "success": true
}
```

**Logic:**
- Increment `share_count` on `munch_videos`
- Optional: Track share analytics

---

## Implementation Notes

### 1. Video Storage
- Videos are uploaded via the existing `/api/upload` endpoint
- The upload endpoint should return a URL that can be used for `video_url`
- Consider using a CDN for video delivery

### 2. Thumbnail Generation
- Optionally generate thumbnails from the first frame of the video
- Can be done server-side or client-side before upload

### 3. Feed Algorithm
For the initial "For You" feed, use a simple algorithm:
```sql
SELECT v.*, u.username, u.avatar_url, u.name,
  EXISTS(SELECT 1 FROM munch_likes WHERE video_id = v.id AND user_id = :current_user_id) as has_liked,
  EXISTS(SELECT 1 FROM munch_views WHERE video_id = v.id AND user_id = :current_user_id) as has_viewed
FROM munch_videos v
JOIN users u ON v.user_id = u.id
WHERE v.duration <= 60
ORDER BY v.created_at DESC
LIMIT :limit OFFSET :offset;
```

### 4. Performance Optimization
- Add database indexes on frequently queried columns
- Cache video metadata in Redis
- Use pagination to limit response size
- Consider video transcoding for different quality levels

### 5. Security
- Validate that videos are actually <= 60 seconds
- Sanitize caption input to prevent XSS
- Rate limit video uploads (e.g., max 10 per day per user)
- Verify user authentication for all endpoints

## Quick Start Checklist

- [ ] Create database tables: `munch_videos`, `munch_likes`, `munch_views`, `munch_comments`
- [ ] Implement GET `/api/snaps/munch` (For You feed)
- [ ] Implement GET `/api/snaps/munch/following` (Following feed)
- [ ] Implement POST `/api/snaps/munch` (Create video)
- [ ] Implement POST `/api/snaps/munch/:id/like` (Like video)
- [ ] Implement POST `/api/snaps/munch/:id/unlike` (Unlike video)
- [ ] Implement POST `/api/snaps/munch/:id/view` (Record view)
- [ ] Implement GET `/api/snaps/munch/:id/comments` (Get comments)
- [ ] Implement POST `/api/snaps/munch/:id/comments` (Add comment)
- [ ] Implement DELETE `/api/snaps/munch/:id` (Delete video)
- [ ] Add database indexes for performance
- [ ] Test video upload flow end-to-end

## Testing the Feature

Once backend is implemented, you can test:

1. Upload a video (must be <= 60 seconds)
2. View the video in the Munch feed
3. Like/unlike the video (double tap or button)
4. Add comments
5. Swipe up/down to navigate between videos
6. Share the video
7. Delete your own video

## Questions?

If you need help implementing any of these endpoints or have questions about the architecture, feel free to ask!
