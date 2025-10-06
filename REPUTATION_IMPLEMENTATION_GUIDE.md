# Reputation System Implementation Guide

This guide walks you through implementing the Reputation System for Clapo, building on the comprehensive design document in `REPUTATION_SYSTEM_DESIGN.md`.

## Overview

The reputation system is a non-tradable score (0-1000) that influences:
- Feed visibility ranking
- Reply/comment ordering
- User credibility display

## Implementation Status

### ✅ Completed (Frontend)

1. **Type Definitions** (`app/types/api.ts`)
   - Added `ReputationScore` interface
   - Added `ReputationEvent` interface
   - Added `GiveRepRequest` and `GiveRepResponse` interfaces
   - Updated `UserProfile` to include `reputation_score` and `reputation_tier`
   - Updated `Post` to include `author_reputation` and `author_reputation_tier`

2. **API Service** (`app/lib/api.ts`)
   - `getReputationScore(userId)` - Fetch user's current reputation
   - `getReputationHistory(userId, limit, offset)` - Get reputation event history
   - `giveReputation(data)` - Send reputation points to another user
   - `getReputationLeaderboard(limit, offset)` - Get top users by reputation

3. **UI Components** (`app/components/ReputationBadge.tsx`)
   - Visual badge showing reputation tier with colored icons
   - Supports 5 tiers: Bronze, Silver, Gold, Platinum, Diamond
   - Three sizes: sm, md, lg
   - Optional score and label display

4. **Profile Integration** (`app/snaps/profile/[userId]/UserProfileClient.tsx`)
   - Reputation badge displayed next to username
   - Shows tier icon and score

5. **Post Card Integration** (`app/snaps/Sections/SnapCard.tsx`)
   - Reputation badge on each post author
   - Shows tier icon only (no score to save space)

### 🔄 Next Steps (Backend)

## Backend Implementation

### Step 1: Database Migration

**File:** `backend/migrations/001_reputation_system.sql`

Run the migration script to create:
- `reputation_scores` table
- `reputation_events` table
- `giverep_transactions` table
- `reputation_dedup` table (anti-spam)
- Triggers for auto-updating tiers
- Views for leaderboard and reporting

```bash
# Apply migration
psql -d your_database -f backend/migrations/001_reputation_system.sql
```

### Step 2: Create Reputation Service

Create `backend/services/reputationService.js`:

```javascript
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class ReputationService {
  // Tier thresholds
  static TIER_THRESHOLDS = {
    DIAMOND: 800,
    PLATINUM: 600,
    GOLD: 400,
    SILVER: 200,
    BRONZE: 0
  };

  // Daily caps
  static DAILY_CAPS = {
    CLAPS: 50,
    REPLIES: 20,
    GIVEREPS_SENT: 3,
    GIVEREPS_RECEIVED: 10
  };

  // Point values
  static POINT_VALUES = {
    CLAP: 1,
    REPLY: 2,
    REMIX: 5,
    GIVEREP_BASE: 10
  };

  /**
   * Get user's reputation score
   */
  async getReputationScore(userId) {
    const result = await pool.query(
      'SELECT * FROM reputation_scores WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Initialize reputation for new user
      return await this.initializeReputation(userId);
    }

    return result.rows[0];
  }

  /**
   * Initialize reputation for a new user
   */
  async initializeReputation(userId) {
    const result = await pool.query(
      `INSERT INTO reputation_scores (user_id, score, tier)
       VALUES ($1, 100, 'Bronze')
       ON CONFLICT (user_id) DO NOTHING
       RETURNING *`,
      [userId]
    );

    return result.rows[0];
  }

  /**
   * Award points for a clap
   */
  async awardClapPoints(userId, targetUserId, postId) {
    // Check daily cap
    const reputation = await this.getReputationScore(userId);
    if (reputation.daily_claps_given >= ReputationService.DAILY_CAPS.CLAPS) {
      return { success: false, reason: 'daily_cap_reached' };
    }

    // Check deduplication
    const isDuplicate = await this.checkDuplicate(userId, 'clap', targetUserId, postId);
    if (isDuplicate) {
      return { success: false, reason: 'duplicate_action' };
    }

    // Calculate points with weight function
    const targetReputation = await this.getReputationScore(targetUserId);
    const weight = this.calculateWeight(targetReputation.score);
    const points = Math.round(ReputationService.POINT_VALUES.CLAP * weight);

    // Award points
    await this.addPoints(userId, points, 'clap', targetUserId, postId);
    await this.incrementDailyCounter(userId, 'claps_given');
    await this.recordDedup(userId, 'clap', targetUserId, postId);

    return { success: true, points, newScore: reputation.score + points };
  }

  /**
   * Award points for a reply
   */
  async awardReplyPoints(userId, targetUserId, postId, replyId) {
    const reputation = await this.getReputationScore(userId);
    if (reputation.daily_replies_given >= ReputationService.DAILY_CAPS.REPLIES) {
      return { success: false, reason: 'daily_cap_reached' };
    }

    const isDuplicate = await this.checkDuplicate(userId, 'reply', targetUserId, postId);
    if (isDuplicate) {
      return { success: false, reason: 'duplicate_action' };
    }

    const targetReputation = await this.getReputationScore(targetUserId);
    const weight = this.calculateWeight(targetReputation.score);
    const points = Math.round(ReputationService.POINT_VALUES.REPLY * weight);

    await this.addPoints(userId, points, 'reply', targetUserId, replyId);
    await this.incrementDailyCounter(userId, 'replies_given');
    await this.recordDedup(userId, 'reply', targetUserId, postId);

    return { success: true, points, newScore: reputation.score + points };
  }

  /**
   * Award points for a remix (retweet)
   */
  async awardRemixPoints(userId, targetUserId, postId) {
    const isDuplicate = await this.checkDuplicate(userId, 'remix', targetUserId, postId);
    if (isDuplicate) {
      return { success: false, reason: 'duplicate_action' };
    }

    const targetReputation = await this.getReputationScore(targetUserId);
    const weight = this.calculateWeight(targetReputation.score);
    const points = Math.round(ReputationService.POINT_VALUES.REMIX * weight);

    await this.addPoints(userId, points, 'remix', targetUserId, postId);
    await this.recordDedup(userId, 'remix', targetUserId, postId);

    return { success: true, points };
  }

  /**
   * Give reputation directly to another user
   */
  async giveReputation(fromUserId, toUserId, context = null) {
    if (fromUserId === toUserId) {
      return { success: false, reason: 'cannot_give_self' };
    }

    const fromReputation = await this.getReputationScore(fromUserId);
    if (fromReputation.daily_givereps_sent >= ReputationService.DAILY_CAPS.GIVEREPS_SENT) {
      return { success: false, reason: 'daily_cap_reached' };
    }

    const toReputation = await this.getReputationScore(toUserId);
    if (toReputation.daily_givereps_received >= ReputationService.DAILY_CAPS.GIVEREPS_RECEIVED) {
      return { success: false, reason: 'receiver_cap_reached' };
    }

    // Points based on sender's reputation
    const points = Math.max(
      ReputationService.POINT_VALUES.GIVEREP_BASE,
      Math.floor(fromReputation.score / 100)
    );

    // Record transaction
    const transactionId = uuidv4();
    await pool.query(
      `INSERT INTO giverep_transactions (id, from_user_id, to_user_id, points, context)
       VALUES ($1, $2, $3, $4, $5)`,
      [transactionId, fromUserId, toUserId, points, context]
    );

    // Award points
    await this.addPoints(toUserId, points, 'giverep_received', fromUserId, transactionId);
    await this.incrementDailyCounter(fromUserId, 'givereps_sent');
    await this.incrementDailyCounter(toUserId, 'givereps_received');

    return {
      success: true,
      points,
      senderNewScore: fromReputation.score,
      receiverNewScore: toReputation.score + points
    };
  }

  /**
   * Calculate weight function for reputation
   */
  calculateWeight(targetScore) {
    if (targetScore < 100) {
      return 0.5; // Down-weight low-rep users
    } else if (targetScore < 500) {
      return 1.0; // Normal weight
    } else {
      return 1.5; // Up-weight high-rep users
    }
  }

  /**
   * Add points to user's reputation
   */
  async addPoints(userId, points, eventType, sourceUserId = null, refId = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update score
      const result = await client.query(
        `UPDATE reputation_scores
         SET score = LEAST(1000, GREATEST(0, score + $1))
         WHERE user_id = $2
         RETURNING score`,
        [points, userId]
      );

      const newScore = result.rows[0].score;

      // Record event
      await client.query(
        `INSERT INTO reputation_events (id, user_id, event_type, points_delta, score_after, source_user_id, ref_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [uuidv4(), userId, eventType, points, newScore, sourceUserId, refId]
      );

      await client.query('COMMIT');
      return newScore;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check for duplicate action (anti-spam)
   */
  async checkDuplicate(userId, eventType, targetUserId, refId) {
    const result = await pool.query(
      `SELECT 1 FROM reputation_dedup
       WHERE user_id = $1 AND event_type = $2 AND target_user_id = $3 AND ref_id = $4`,
      [userId, eventType, targetUserId, refId]
    );

    return result.rows.length > 0;
  }

  /**
   * Record deduplication entry
   */
  async recordDedup(userId, eventType, targetUserId, refId) {
    await pool.query(
      `INSERT INTO reputation_dedup (id, user_id, event_type, target_user_id, ref_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
      [uuidv4(), userId, eventType, targetUserId, refId]
    );
  }

  /**
   * Increment daily counter
   */
  async incrementDailyCounter(userId, counterName) {
    const columnMap = {
      claps_given: 'daily_claps_given',
      replies_given: 'daily_replies_given',
      givereps_sent: 'daily_givereps_sent',
      givereps_received: 'daily_givereps_received'
    };

    const column = columnMap[counterName];
    await pool.query(
      `UPDATE reputation_scores SET ${column} = ${column} + 1 WHERE user_id = $1`,
      [userId]
    );
  }

  /**
   * Get reputation history
   */
  async getReputationHistory(userId, limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT * FROM reputation_events
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const reputation = await this.getReputationScore(userId);

    return {
      events: result.rows,
      current_score: reputation.score
    };
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit = 100, offset = 0) {
    const result = await pool.query(
      `SELECT * FROM reputation_leaderboard
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows;
  }

  /**
   * Apply nightly decay
   */
  async applyDecay() {
    const DECAY_RATE = 0.0231; // 30-day half-life
    const MIN_SCORE = 50;

    const result = await pool.query(
      `SELECT user_id, score FROM reputation_scores
       WHERE score > $1`,
      [MIN_SCORE]
    );

    for (const user of result.rows) {
      const decay = Math.floor(user.score * DECAY_RATE);
      const newScore = Math.max(MIN_SCORE, user.score - decay);

      await this.addPoints(user.user_id, -decay, 'decay');
      await pool.query(
        `UPDATE reputation_scores SET last_decay_at = CURRENT_TIMESTAMP WHERE user_id = $1`,
        [user.user_id]
      );
    }

    return { processed: result.rows.length };
  }

  /**
   * Reset daily counters (run at midnight)
   */
  async resetDailyCounters() {
    await pool.query(
      `UPDATE reputation_scores
       SET daily_claps_given = 0,
           daily_replies_given = 0,
           daily_givereps_sent = 0,
           daily_givereps_received = 0`
    );
  }
}

module.exports = new ReputationService();
```

### Step 3: Create API Routes

Create `backend/routes/reputation.js`:

```javascript
const express = require('express');
const router = express.Router();
const reputationService = require('../services/reputationService');

/**
 * GET /api/snaps/reputation/:userId
 * Get user's reputation score
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const reputation = await reputationService.getReputationScore(userId);

    res.json({
      message: 'Reputation score retrieved',
      reputation
    });
  } catch (error) {
    console.error('Error fetching reputation:', error);
    res.status(500).json({ message: 'Failed to fetch reputation' });
  }
});

/**
 * GET /api/snaps/reputation/:userId/history
 * Get reputation event history
 */
router.get('/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const history = await reputationService.getReputationHistory(
      userId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      message: 'Reputation history retrieved',
      ...history
    });
  } catch (error) {
    console.error('Error fetching reputation history:', error);
    res.status(500).json({ message: 'Failed to fetch reputation history' });
  }
});

/**
 * POST /api/snaps/reputation/give
 * Give reputation to another user
 */
router.post('/give', async (req, res) => {
  try {
    const { from_user_id, to_user_id, points, context } = req.body;

    if (!from_user_id || !to_user_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await reputationService.giveReputation(
      from_user_id,
      to_user_id,
      context
    );

    if (!result.success) {
      return res.status(400).json({
        message: 'Failed to give reputation',
        reason: result.reason
      });
    }

    res.json({
      message: 'Reputation given successfully',
      event: {
        points: result.points,
        sender_new_score: result.senderNewScore,
        receiver_new_score: result.receiverNewScore
      }
    });
  } catch (error) {
    console.error('Error giving reputation:', error);
    res.status(500).json({ message: 'Failed to give reputation' });
  }
});

/**
 * GET /api/snaps/reputation/leaderboard
 * Get reputation leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const users = await reputationService.getLeaderboard(
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      message: 'Leaderboard retrieved',
      users
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
```

Register routes in `backend/server.js`:

```javascript
const reputationRoutes = require('./routes/reputation');
app.use('/api/snaps/reputation', reputationRoutes);
```

### Step 4: Integrate with Existing Actions

Update existing post interaction handlers to award reputation:

**In `backend/routes/posts.js`:**

```javascript
const reputationService = require('../services/reputationService');

// When user likes a post
router.post('/:postId/like', async (req, res) => {
  // ... existing like logic ...

  // Award reputation
  const postAuthorId = post.user_id;
  const likerId = req.body.likerId;

  await reputationService.awardClapPoints(likerId, postAuthorId, postId);

  // ... rest of response ...
});

// When user comments
router.post('/:postId/comment', async (req, res) => {
  // ... existing comment logic ...

  const postAuthorId = post.user_id;
  const commenterId = req.body.commenterId;

  await reputationService.awardReplyPoints(commenterId, postAuthorId, postId, commentId);

  // ... rest of response ...
});

// When user retweets
router.post('/:postId/retweet', async (req, res) => {
  // ... existing retweet logic ...

  const postAuthorId = post.user_id;
  const retweeterId = req.body.userId;

  await reputationService.awardRemixPoints(retweeterId, postAuthorId, postId);

  // ... rest of response ...
});
```

### Step 5: Update Feed Ranking

Update `backend/services/feedService.js` to include reputation in ranking:

```javascript
async getPersonalizedFeed(userId, limit, offset) {
  const query = `
    SELECT
      p.*,
      u.username,
      u.avatar_url,
      u.reputation_score as author_reputation,
      u.reputation_tier as author_reputation_tier,
      -- Calculate weighted score
      (
        p.like_count * 1.0 +
        p.comment_count * 2.0 +
        p.retweet_count * 3.0 +
        p.view_count * 0.1 +
        -- Reputation weight
        CASE
          WHEN u.reputation_score >= 500 THEN 20
          WHEN u.reputation_score >= 200 THEN 10
          WHEN u.reputation_score >= 100 THEN 5
          ELSE 0
        END +
        -- Recency boost
        EXTRACT(EPOCH FROM (NOW() - p.created_at)) / -3600.0
      ) as weighted_score
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.created_at > NOW() - INTERVAL '7 days'
    ORDER BY weighted_score DESC
    LIMIT $1 OFFSET $2
  `;

  const result = await pool.query(query, [limit, offset]);
  return result.rows;
}
```

### Step 6: Set Up Cron Jobs

Create `backend/jobs/reputationCron.js`:

```javascript
const cron = require('node-cron');
const reputationService = require('../services/reputationService');

// Run decay every night at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running nightly reputation decay...');
  try {
    const result = await reputationService.applyDecay();
    console.log(`Decay applied to ${result.processed} users`);
  } catch (error) {
    console.error('Error running decay:', error);
  }
});

// Reset daily counters at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Resetting daily reputation counters...');
  try {
    await reputationService.resetDailyCounters();
    console.log('Daily counters reset successfully');
  } catch (error) {
    console.error('Error resetting counters:', error);
  }
});

// Clean up old dedup entries (keep 7 days)
cron.schedule('0 3 * * *', async () => {
  console.log('Cleaning up old reputation dedup entries...');
  try {
    await pool.query(
      `DELETE FROM reputation_dedup WHERE created_at < NOW() - INTERVAL '7 days'`
    );
    console.log('Dedup cleanup completed');
  } catch (error) {
    console.error('Error cleaning dedup:', error);
  }
});

module.exports = { initCronJobs: () => console.log('Reputation cron jobs initialized') };
```

Start cron jobs in `backend/server.js`:

```javascript
require('./jobs/reputationCron').initCronJobs();
```

## Testing

### Test Reputation Award

```bash
# Like a post
curl -X POST http://localhost:3000/api/snaps/posts/123/like \
  -H "Content-Type: application/json" \
  -d '{"likerId": "user1"}'

# Check reputation
curl http://localhost:3000/api/snaps/reputation/user1
```

### Test Give Reputation

```bash
curl -X POST http://localhost:3000/api/snaps/reputation/give \
  -H "Content-Type: application/json" \
  -d '{
    "from_user_id": "user1",
    "to_user_id": "user2",
    "context": "Great post!"
  }'
```

### Test Leaderboard

```bash
curl http://localhost:3000/api/snaps/reputation/leaderboard?limit=10
```

## Monitoring

Add monitoring for:
- Average reputation score
- Daily reputation events
- Cap hit rates
- Decay impact
- Leaderboard turnover

See `REPUTATION_SYSTEM_DESIGN.md` Section 8 for full monitoring setup.

## Feature Flags

Use feature flags to gradually roll out:

```javascript
const FEATURE_FLAGS = {
  REPUTATION_AWARDS: process.env.ENABLE_REPUTATION_AWARDS === 'true',
  REPUTATION_RANKING: process.env.ENABLE_REPUTATION_RANKING === 'true',
  REPUTATION_DISPLAY: process.env.ENABLE_REPUTATION_DISPLAY === 'true'
};
```

Rollout phases:
1. **Phase 1**: Enable display only (existing scores)
2. **Phase 2**: Enable awards (start accumulating)
3. **Phase 3**: Enable feed ranking (affects visibility)

## Troubleshooting

### Reputation not updating
- Check database triggers are enabled
- Verify cron jobs are running
- Check for errors in reputation service logs

### Daily caps hit too quickly
- Adjust caps in `ReputationService.DAILY_CAPS`
- Monitor cap hit rates

### Feed ranking issues
- Verify reputation columns populated
- Check feed query performance
- Adjust weight multipliers

## Next Features

Future enhancements:
- Reputation history chart on profile
- Detailed reputation breakdown
- Achievement badges
- Reputation-gated features
- Community-specific reputation

## Resources

- Full design: `REPUTATION_SYSTEM_DESIGN.md`
- Migration: `backend/migrations/001_reputation_system.sql`
- Frontend components: `app/components/ReputationBadge.tsx`
