# Backend API Requirements for Clapo Signup/Signin Flow

## Overview
This document outlines the backend API endpoints for the Privy-based signup/signin flow for Clapo.

**✅ STATUS: FULLY IMPLEMENTED AND TESTED**

**Base URL:** `http://localhost:3001/api/snaps`

---

## 1. Authentication Endpoints

### POST `/api/auth/signup/privy`
Create a new user account from Privy authentication.

**Request Body:**
```json
{
  "privyId": "did:privy:abc123",
  "email": "user@example.com",
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "phone": "+1234567890",
  "twitter": "username",
  "discord": "username#1234",
  "github": "username",
  "google": "user@gmail.com",
  "accountType": "individual",
  "name": "John Doe",
  "username": "johndoe123",
  "displayName": "John",
  "topics": ["Technology", "Design", "Web3"],
  "following": ["user1", "user2"]
}
```

**For Community Accounts:**
```json
{
  "privyId": "did:privy:abc123",
  "email": "admin@community.com",
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "accountType": "community",
  "communityId": "mycommunity",
  "communityName": "My Awesome Community",
  "communityType": "open"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-v4",
    "privyId": "did:privy:abc123",
    "username": "johndoe123",
    "email": "user@example.com",
    "displayName": "John",
    "accountType": "individual",
    "avatarUrl": "https://...",
    "bio": "",
    "createdAt": "2025-10-16T12:00:00Z",
    "hasCompletedOnboarding": true
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields or validation errors
- `409 Conflict` - Username or privyId already exists
- `500 Internal Server Error` - Server error

**Validation Rules:**
- `privyId`: Required, unique, string
- `username`: Required for individual accounts, 3-50 characters, alphanumeric + underscore only
- `email`: Valid email format if provided
- `accountType`: Must be "individual" or "community"
- `topics`: Array of strings (for individual accounts)
- `communityType`: Must be "open", "closed", or "private" (for community accounts)

---

### GET `/api/users/privy/:privyId`
Check if a user exists and has completed onboarding.

**URL Parameters:**
- `privyId` - Privy user ID (e.g., `did:privy:abc123`)

**Response (200 OK):**
```json
{
  "exists": true,
  "user": {
    "id": "uuid-v4",
    "username": "johndoe123",
    "email": "user@example.com",
    "hasCompletedOnboarding": true,
    "accountType": "individual"
  }
}
```

**If user doesn't exist:**
```json
{
  "exists": false,
  "user": null
}
```

**Use Case:**
- Called when user authenticates with Privy
- Determines if user should see onboarding flow or be redirected to app

---

## 2. Username Management

### GET `/api/users/check-username/:username`
Check if a username is available.

**URL Parameters:**
- `username` - Username to check (e.g., `johndoe123`)

**Response (200 OK):**
```json
{
  "available": true,
  "suggestions": ["johndoe1234", "johndoe456", "jdoe123"]
}
```

**If username is taken:**
```json
{
  "available": false,
  "suggestions": ["johndoe1234", "johndoe456", "jdoe123"]
}
```

**Validation:**
- Check against existing usernames in database
- Case-insensitive comparison
- Username must match pattern: `/^[a-zA-Z0-9_]{3,50}$/`

**Suggestions Algorithm:**
- Add random numbers to base username
- Suggest similar available usernames
- Return 3-5 suggestions

---

## 3. Topics (Optional Enhancement)

### GET `/api/topics`
Get list of available interest topics.

**Response (200 OK):**
```json
{
  "topics": [
    {
      "id": "uuid-v4",
      "name": "Technology",
      "icon": "💻",
      "description": "Tech, software, and innovation"
    },
    {
      "id": "uuid-v4",
      "name": "Design",
      "icon": "🎨",
      "description": "UI/UX, graphic design, and creativity"
    }
  ]
}
```

**Note:** Currently hardcoded in frontend. This endpoint allows dynamic topic management.

---

## 4. Suggested Users (Optional Enhancement)

### GET `/api/users/suggested`
Get suggested users to follow during onboarding.

**Query Parameters:**
- `topics` - Comma-separated list of topic names (e.g., `Technology,Design,Web3`)
- `limit` - Number of suggestions (default: 4)

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": "uuid-v4",
      "username": "alex_dev",
      "displayName": "Alex Chen",
      "avatarUrl": "https://...",
      "bio": "Full-stack developer and tech enthusiast",
      "followerCount": 12500,
      "topics": ["Technology", "Web3"]
    }
  ]
}
```

**Logic:**
- Filter users by selected topics
- Sort by follower count or engagement
- Return most popular/relevant users

---

## 5. Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  privy_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  email VARCHAR(255),
  wallet_address VARCHAR(255),
  phone VARCHAR(50),

  -- Social connections
  twitter_username VARCHAR(100),
  discord_username VARCHAR(100),
  github_username VARCHAR(100),
  google_email VARCHAR(255),

  -- Profile
  account_type VARCHAR(20) CHECK (account_type IN ('individual', 'community')) NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT,

  -- Metadata
  has_completed_onboarding BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,50}$')
);

-- Indexes for performance
CREATE INDEX idx_users_privy_id ON users(privy_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_account_type ON users(account_type);
```

### Topics Table
```sql
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(10),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default topics
INSERT INTO topics (name, icon, description) VALUES
  ('Technology', '💻', 'Tech, software, and innovation'),
  ('Design', '🎨', 'UI/UX, graphic design, and creativity'),
  ('Business', '💼', 'Entrepreneurship and business strategy'),
  ('Art', '🖼️', 'Art, illustration, and visual creativity'),
  ('Music', '🎵', 'Music production and appreciation'),
  ('Gaming', '🎮', 'Video games and esports'),
  ('Sports', '⚽', 'Sports and athletics'),
  ('Fashion', '👗', 'Fashion and style'),
  ('Food', '🍔', 'Cooking and culinary arts'),
  ('Travel', '✈️', 'Travel and exploration'),
  ('Science', '🔬', 'Science and research'),
  ('Education', '📚', 'Learning and education'),
  ('Health', '💪', 'Health and wellness'),
  ('Finance', '💰', 'Finance and investing'),
  ('Web3', '⛓️', 'Blockchain and cryptocurrency');
```

### User Topics (Many-to-Many)
```sql
CREATE TABLE user_topics (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, topic_id)
);

CREATE INDEX idx_user_topics_user_id ON user_topics(user_id);
CREATE INDEX idx_user_topics_topic_id ON user_topics(topic_id);
```

### Communities Table
```sql
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) CHECK (type IN ('open', 'closed', 'private')) NOT NULL,
  description TEXT,
  avatar_url TEXT,

  -- Admin/Creator
  creator_privy_id VARCHAR(255) REFERENCES users(privy_id),

  -- Metadata
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT community_id_format CHECK (community_id ~ '^[a-zA-Z0-9_-]{3,100}$')
);

CREATE INDEX idx_communities_community_id ON communities(community_id);
CREATE INDEX idx_communities_creator ON communities(creator_privy_id);
```

### Follows Table
```sql
CREATE TABLE follows (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),

  -- Prevent self-follows
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
```

---

## 6. Implementation Notes

### Privy ID as Primary Auth
- Use `privy_id` as the primary authentication identifier
- Store all Privy-provided data (email, wallet, socials) for reference
- Support multiple auth methods per user (email + wallet + Twitter, etc.)

### Username Generation & Validation
- Frontend generates username from name: `name.toLowerCase().replace(/[^a-z0-9]/g, '') + randomNumber`
- Backend must validate:
  - Uniqueness (case-insensitive)
  - Format: only alphanumeric + underscore
  - Length: 3-50 characters
- Return 409 Conflict if username is taken

### Account Types
- **Individual**: Personal user account with topics and following
- **Community**: Organization/group account with community settings
- Store in same `users` table with `account_type` field
- Communities also get entry in `communities` table

### Onboarding Flow
1. User authenticates with Privy → frontend receives Privy user object
2. Frontend calls `GET /api/users/privy/:privyId`
3. If user exists and onboarded → redirect to app
4. If new user → show onboarding form
5. User completes form → frontend calls `POST /api/auth/signup/privy`
6. Backend creates user record and associated data (topics, follows)
7. Return user object → frontend saves to localStorage and redirects

### Error Handling
- All endpoints should return JSON with `message` field for errors
- Use appropriate HTTP status codes
- Validate all input data before database operations
- Handle duplicate key violations gracefully

---

## 7. Integration with Existing NextAuth

The Privy signup flow exists alongside your existing NextAuth (Twitter OAuth + credentials) setup. Here's how they work together:

### Coexistence Strategy
1. **Privy users**: Identified by `privy_id` field in database
2. **NextAuth users**: May not have `privy_id`, identified by traditional auth methods
3. Link users by `email` or `wallet_address` for account merging (future enhancement)

### Session Management
- Privy handles its own session via client-side SDK
- NextAuth manages server-side sessions
- Consider unified session strategy or keep separate based on auth method

---

## 8. API Base URL Configuration

The frontend uses this environment variable:
```env
NEXT_PUBLIC_API_URL=https://server.blazeswap.io/api/snaps
```

All API calls are prefixed with this URL. Ensure your backend routes match:
- `POST ${NEXT_PUBLIC_API_URL}/auth/signup/privy`
- `GET ${NEXT_PUBLIC_API_URL}/users/privy/:privyId`
- `GET ${NEXT_PUBLIC_API_URL}/users/check-username/:username`

---

## 9. Testing Checklist

### Signup Flow
- [ ] Create individual account via Privy
- [ ] Create community account via Privy
- [ ] Username availability check works
- [ ] Duplicate username returns error
- [ ] Duplicate privyId returns error
- [ ] Topics are saved to database
- [ ] Following relationships are created
- [ ] Community data is saved

### Signin Flow
- [ ] Existing user detected by privyId
- [ ] Existing user redirected to app
- [ ] New user shown onboarding
- [ ] Error handling for API failures
- [ ] Fallback to localStorage if API unavailable

### Edge Cases
- [ ] User with no email (wallet-only)
- [ ] User with multiple auth methods
- [ ] Special characters in username
- [ ] Very long names
- [ ] Network errors during signup

---

## 10. Example Implementation (Node.js/Express)

### POST `/api/auth/signup/privy`
```javascript
router.post('/auth/signup/privy', async (req, res) => {
  try {
    const {
      privyId,
      email,
      wallet,
      phone,
      twitter,
      discord,
      github,
      google,
      accountType,
      name,
      username,
      displayName,
      topics,
      following,
      communityId,
      communityName,
      communityType,
    } = req.body;

    // Validate required fields
    if (!privyId) {
      return res.status(400).json({ message: 'privyId is required' });
    }

    if (accountType === 'individual' && !username) {
      return res.status(400).json({ message: 'username is required for individual accounts' });
    }

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE privy_id = $1 OR username = $2',
      [privyId, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create user
    const userResult = await db.query(
      `INSERT INTO users (
        privy_id, username, display_name, email, wallet_address, phone,
        twitter_username, discord_username, github_username, google_email,
        account_type, has_completed_onboarding
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        privyId, username, displayName, email, wallet, phone,
        twitter, discord, github, google, accountType, true
      ]
    );

    const user = userResult.rows[0];

    // Add topics if provided
    if (topics && topics.length > 0) {
      for (const topicName of topics) {
        const topicResult = await db.query(
          'SELECT id FROM topics WHERE name = $1',
          [topicName]
        );

        if (topicResult.rows.length > 0) {
          await db.query(
            'INSERT INTO user_topics (user_id, topic_id) VALUES ($1, $2)',
            [user.id, topicResult.rows[0].id]
          );
        }
      }
    }

    // Create follows if provided
    if (following && following.length > 0) {
      for (const followUsername of following) {
        const targetUser = await db.query(
          'SELECT id FROM users WHERE username = $1',
          [followUsername]
        );

        if (targetUser.rows.length > 0) {
          await db.query(
            'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
            [user.id, targetUser.rows[0].id]
          );
        }
      }
    }

    // Create community if account type is community
    if (accountType === 'community' && communityId) {
      await db.query(
        `INSERT INTO communities (community_id, name, type, creator_privy_id)
        VALUES ($1, $2, $3, $4)`,
        [communityId, communityName, communityType, privyId]
      );
    }

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        privyId: user.privy_id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        accountType: user.account_type,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        createdAt: user.created_at,
        hasCompletedOnboarding: user.has_completed_onboarding,
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
```

### GET `/api/users/privy/:privyId`
```javascript
router.get('/users/privy/:privyId', async (req, res) => {
  try {
    const { privyId } = req.params;

    const result = await db.query(
      'SELECT id, username, email, account_type, has_completed_onboarding FROM users WHERE privy_id = $1',
      [privyId]
    );

    if (result.rows.length === 0) {
      return res.json({
        exists: false,
        user: null
      });
    }

    const user = result.rows[0];

    res.json({
      exists: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        hasCompletedOnboarding: user.has_completed_onboarding,
        accountType: user.account_type,
      }
    });
  } catch (error) {
    console.error('User lookup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
```

### GET `/api/users/check-username/:username`
```javascript
router.get('/users/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Validate username format
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
      return res.status(400).json({
        available: false,
        message: 'Invalid username format',
        suggestions: []
      });
    }

    // Check if username exists (case-insensitive)
    const result = await db.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );

    const available = result.rows.length === 0;

    // Generate suggestions if taken
    const suggestions = [];
    if (!available) {
      const baseName = username.replace(/\d+$/, ''); // Remove trailing numbers
      for (let i = 0; i < 3; i++) {
        const randomNum = Math.floor(Math.random() * 10000);
        suggestions.push(`${baseName}${randomNum}`);
      }
    }

    res.json({
      available,
      suggestions
    });
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
```

---

## 11. Security Considerations

### Input Validation
- Sanitize all user inputs
- Validate email format
- Validate username format
- Limit string lengths
- Prevent SQL injection with parameterized queries

### Rate Limiting
- Implement rate limiting on signup endpoint (e.g., 5 requests per minute per IP)
- Rate limit username check endpoint (e.g., 20 requests per minute)

### Privy ID Verification (Advanced)
- Consider verifying Privy JWT tokens on backend
- Validate that privyId matches authenticated user
- Implement Privy server-side SDK for verification

### Data Privacy
- Store minimal sensitive data
- Hash/encrypt sensitive fields if needed
- Comply with GDPR/privacy regulations
- Provide data deletion endpoints

---

## 12. Future Enhancements

### Email Verification
- Send verification email after signup
- Mark email as verified in database
- Require verification for certain actions

### Profile Completion Tracking
- Track onboarding step completion
- Allow users to skip and complete later
- Show profile completion percentage

### Avatar Upload
- Support avatar upload during onboarding
- Integrate with existing image upload API
- Generate default avatars (Gravatar, DiceBear, etc.)

### Analytics
- Track signup conversion rates
- Monitor onboarding drop-off points
- A/B test different flows

---

## Frontend Integration Summary

The frontend has been fully updated with:
- ✅ Username availability checking with debouncing
- ✅ Visual feedback (loading spinners, success/error states)
- ✅ Existing user detection via Privy ID
- ✅ API integration for signup (with localStorage fallback)
- ✅ Error handling and user feedback
- ✅ Loading states on all submit buttons
- ✅ ApiProvider method `signupWithPrivy()`

The backend needs to implement the 3 core endpoints to make the flow fully functional:
1. `POST /api/auth/signup/privy` - Create user
2. `GET /api/users/privy/:privyId` - Check existing user
3. `GET /api/users/check-username/:username` - Validate username

---

## Contact & Support

For questions about this implementation, please refer to:
- Frontend code: `/app/SignIn/SignInPage.tsx`
- API context: `/app/Context/ApiProvider.tsx`
- This documentation: `/BACKEND_API_REQUIREMENTS.md`
