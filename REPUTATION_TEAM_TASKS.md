# Reputation System - Team Task Assignments

This document outlines all remaining tasks to complete the Reputation System implementation, organized by team.

---

## 📊 Current Status

### ✅ COMPLETED (Frontend)
- Type definitions for reputation data structures
- API service methods for all reputation endpoints
- ReputationBadge UI component (5 tiers with icons)
- Integration in user profiles
- Integration in post cards
- Database migration script
- Backend implementation guide
- Complete technical design document

### 🔄 REMAINING WORK
All backend implementation and deployment tasks

---

## 🎯 Backend Team Tasks

### Priority 1: Database Setup (Est: 2-4 hours)

**Task B1: Run Database Migration**
- **File**: `backend/migrations/001_reputation_system.sql`
- **Action**:
  ```bash
  psql -d clapo_database -f backend/migrations/001_reputation_system.sql
  ```
- **Verify**:
  ```sql
  -- Check tables created
  \dt reputation*

  -- Check all users have initial reputation
  SELECT COUNT(*) FROM reputation_scores;
  SELECT COUNT(*) FROM users;
  -- Both should match
  ```
- **Rollback Plan**: Script includes full rollback SQL at bottom
- **Owner**: Database Admin / Backend Lead
- **Priority**: CRITICAL - Must be done first

---

### Priority 2: Core Service Implementation (Est: 8-12 hours)

**Task B2: Create Reputation Service**
- **File**: `backend/services/reputationService.js`
- **Action**: Copy complete service code from `REPUTATION_IMPLEMENTATION_GUIDE.md` Section "Step 2"
- **Methods to Implement**:
  - `getReputationScore(userId)` - Fetch user reputation
  - `initializeReputation(userId)` - Create reputation for new user
  - `awardClapPoints(userId, targetUserId, postId)` - Award points for likes
  - `awardReplyPoints(userId, targetUserId, postId, replyId)` - Award points for comments
  - `awardRemixPoints(userId, targetUserId, postId)` - Award points for retweets
  - `giveReputation(fromUserId, toUserId, context)` - Direct reputation transfer
  - `calculateWeight(targetScore)` - Weight function for point calculations
  - `addPoints(userId, points, eventType, ...)` - Core point addition logic
  - `checkDuplicate(...)` - Anti-spam deduplication
  - `recordDedup(...)` - Record deduplication entry
  - `incrementDailyCounter(userId, counterName)` - Update daily caps
  - `getReputationHistory(userId, limit, offset)` - Fetch event history
  - `getLeaderboard(limit, offset)` - Get top users
  - `applyDecay()` - Nightly decay function
  - `resetDailyCounters()` - Reset caps at midnight
- **Testing**: Write unit tests for each method
- **Owner**: Senior Backend Developer
- **Priority**: HIGH

**Task B3: Create API Routes**
- **File**: `backend/routes/reputation.js`
- **Action**: Copy route code from `REPUTATION_IMPLEMENTATION_GUIDE.md` Section "Step 3"
- **Endpoints to Create**:
  - `GET /api/snaps/reputation/:userId` - Get user reputation
  - `GET /api/snaps/reputation/:userId/history` - Get reputation history
  - `POST /api/snaps/reputation/give` - Give reputation to another user
  - `GET /api/snaps/reputation/leaderboard` - Get leaderboard
- **Register Routes**: Add to `backend/server.js`:
  ```javascript
  const reputationRoutes = require('./routes/reputation');
  app.use('/api/snaps/reputation', reputationRoutes);
  ```
- **Testing**: Test each endpoint with Postman/curl
- **Owner**: Backend Developer
- **Priority**: HIGH

---

### Priority 3: Integration with Existing Features (Est: 4-6 hours)

**Task B4: Integrate Reputation Awards in Post Interactions**
- **Files to Modify**:
  - `backend/routes/posts.js`
  - Or wherever like/comment/retweet handlers exist
- **Changes Required**:

  **In Like/Clap Handler**:
  ```javascript
  const reputationService = require('../services/reputationService');

  router.post('/:postId/like', async (req, res) => {
    // ... existing like logic ...

    // NEW: Award reputation
    const postAuthorId = post.user_id;
    const likerId = req.body.likerId;

    await reputationService.awardClapPoints(likerId, postAuthorId, postId);

    // ... rest of response ...
  });
  ```

  **In Comment/Reply Handler**:
  ```javascript
  router.post('/:postId/comment', async (req, res) => {
    // ... existing comment logic ...

    // NEW: Award reputation
    const postAuthorId = post.user_id;
    const commenterId = req.body.commenterId;

    await reputationService.awardReplyPoints(
      commenterId,
      postAuthorId,
      postId,
      commentId
    );

    // ... rest of response ...
  });
  ```

  **In Retweet/Remix Handler**:
  ```javascript
  router.post('/:postId/retweet', async (req, res) => {
    // ... existing retweet logic ...

    // NEW: Award reputation
    const postAuthorId = post.user_id;
    const retweeterId = req.body.userId;

    await reputationService.awardRemixPoints(retweeterId, postAuthorId, postId);

    // ... rest of response ...
  });
  ```

- **Testing**:
  - Like a post, verify reputation increases
  - Comment on a post, verify reputation increases
  - Check daily caps work correctly
- **Owner**: Backend Developer
- **Priority**: HIGH

**Task B5: Update User Profile Endpoint**
- **File**: `backend/routes/users.js` (or profile route file)
- **Action**: Ensure profile endpoint returns reputation fields
- **Required Changes**:
  ```javascript
  router.get('/:userId/profile/posts', async (req, res) => {
    const query = `
      SELECT
        u.*,
        u.reputation_score,  -- NEW
        u.reputation_tier,   -- NEW
        -- ... other fields ...
      FROM users u
      WHERE u.id = $1
    `;
    // ... rest of logic ...
  });
  ```
- **Testing**: Fetch user profile, verify reputation_score and reputation_tier in response
- **Owner**: Backend Developer
- **Priority**: HIGH

**Task B6: Update Feed Query to Include Reputation**
- **File**: `backend/routes/feed.js` or `backend/services/feedService.js`
- **Action**: Add reputation fields to post queries
- **Required Changes**:
  ```javascript
  async getPersonalizedFeed(userId, limit, offset) {
    const query = `
      SELECT
        p.*,
        u.username,
        u.avatar_url,
        u.reputation_score as author_reputation,      -- NEW
        u.reputation_tier as author_reputation_tier,  -- NEW
        -- Calculate weighted score with reputation boost
        (
          p.like_count * 1.0 +
          p.comment_count * 2.0 +
          p.retweet_count * 3.0 +
          p.view_count * 0.1 +
          -- NEW: Reputation weight
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
- **Testing**:
  - Fetch feed, verify reputation fields present
  - High-rep users should rank higher
- **Owner**: Backend Developer
- **Priority**: MEDIUM

---

### Priority 4: Automated Jobs (Est: 2-3 hours)

**Task B7: Set Up Cron Jobs**
- **File**: `backend/jobs/reputationCron.js` (create new)
- **Action**: Copy cron job code from `REPUTATION_IMPLEMENTATION_GUIDE.md` Section "Step 6"
- **Dependencies**:
  ```bash
  npm install node-cron
  ```
- **Jobs to Implement**:
  1. **Nightly Decay** (2 AM daily)
     - Applies 2.31% decay to all users above 50 points
     - Records decay events
  2. **Daily Counter Reset** (Midnight daily)
     - Resets all daily_* columns to 0
  3. **Dedup Cleanup** (3 AM daily)
     - Removes dedup entries older than 7 days
- **Activation**: Add to `backend/server.js`:
  ```javascript
  require('./jobs/reputationCron').initCronJobs();
  ```
- **Testing**:
  - Manually trigger decay function
  - Verify counters reset correctly
- **Owner**: Backend Developer / DevOps
- **Priority**: MEDIUM

---

### Priority 5: Testing & Validation (Est: 4-6 hours)

**Task B8: Integration Testing**
- **Test Scenarios**:

  **Reputation Awards**:
  ```bash
  # Test like awards reputation
  curl -X POST http://localhost:3000/api/snaps/posts/123/like \
    -H "Content-Type: application/json" \
    -d '{"likerId": "user1"}'

  # Check reputation increased
  curl http://localhost:3000/api/snaps/reputation/user1
  # Should show score > 100
  ```

  **Daily Caps**:
  - Like 51 posts in a row
  - Verify 51st like doesn't award points
  - Check daily_claps_given = 50

  **Give Reputation**:
  ```bash
  curl -X POST http://localhost:3000/api/snaps/reputation/give \
    -H "Content-Type: application/json" \
    -d '{
      "from_user_id": "user1",
      "to_user_id": "user2",
      "context": "Great post!"
    }'
  ```

  **Leaderboard**:
  ```bash
  curl http://localhost:3000/api/snaps/reputation/leaderboard?limit=10
  ```

  **History**:
  ```bash
  curl http://localhost:3000/api/snaps/reputation/user1/history?limit=20
  ```

- **Performance Testing**:
  - Test feed query performance with reputation ranking
  - Ensure < 100ms response time
  - Add database indexes if needed

- **Edge Cases**:
  - Self-like (should not award)
  - Duplicate likes (should not re-award)
  - Negative scores (should floor at 0)
  - Scores > 1000 (should cap at 1000)

- **Owner**: QA Engineer + Backend Developer
- **Priority**: HIGH

**Task B9: Load Testing**
- **Tool**: Use k6, Artillery, or similar
- **Scenarios**:
  - 1000 concurrent users liking posts
  - 100 reputation queries per second
  - Decay job on 100k users
- **Metrics**:
  - Response time < 200ms (p95)
  - Error rate < 0.1%
  - Database CPU < 70%
- **Owner**: DevOps / Performance Engineer
- **Priority**: MEDIUM

---

## 🎨 Frontend Team Tasks

### Task F1: Handle Missing Reputation Gracefully (Est: 1 hour)

**Status**: Already implemented, just needs verification

- **Action**: Verify reputation badges only show when data exists
- **Files**:
  - `app/snaps/profile/[userId]/UserProfileClient.tsx`
  - `app/snaps/Sections/SnapCard.tsx`
- **Current Implementation**:
  ```tsx
  {userProfile.reputation_score !== undefined && (
    <ReputationBadge ... />
  )}
  ```
- **Testing**:
  - Test with mock data without reputation fields
  - Verify no errors, badges simply don't render
- **Owner**: Frontend Developer
- **Priority**: LOW (already done)

---

## 📱 DevOps Team Tasks

### Task D1: Environment Variables (Est: 30 min)

**Add Feature Flags**
- **File**: `.env` or environment config
- **Variables**:
  ```bash
  # Reputation System Feature Flags
  ENABLE_REPUTATION_AWARDS=true
  ENABLE_REPUTATION_RANKING=true
  ENABLE_REPUTATION_DISPLAY=true

  # Reputation Configuration
  REPUTATION_DECAY_ENABLED=true
  REPUTATION_DAILY_CAP_CLAPS=50
  REPUTATION_DAILY_CAP_REPLIES=20
  REPUTATION_DAILY_CAP_GIVEREPS=3
  ```
- **Rollout Plan**:
  - **Week 1**: Enable display only
  - **Week 2**: Enable awards (accumulation starts)
  - **Week 3**: Enable ranking (affects feed)
- **Owner**: DevOps Lead
- **Priority**: MEDIUM

### Task D2: Database Backup Before Migration (Est: 30 min)

**Action**: Take full database snapshot
```bash
pg_dump clapo_database > backup_pre_reputation_$(date +%Y%m%d).sql
```
- **Verify**: Backup file created and not empty
- **Store**: In secure backup location
- **Owner**: Database Admin
- **Priority**: CRITICAL (before Task B1)

### Task D3: Monitoring Setup (Est: 2-3 hours)

**Metrics to Track**:
- Average reputation score (Gauge)
- Reputation events per hour (Counter)
- Daily cap hit rate (Gauge)
- Decay job duration (Histogram)
- API endpoint response times (Histogram)

**Alerts to Configure**:
- Reputation score average drops > 20% in 24h
- Daily cap hit rate > 80%
- API error rate > 1%
- Decay job fails
- Database reputation queries > 500ms

**Tools**:
- Use existing monitoring (Prometheus, Datadog, CloudWatch, etc.)
- Add custom metrics in reputation service

**Owner**: DevOps / SRE
**Priority**: MEDIUM

### Task D4: Database Indexes Verification (Est: 1 hour)

**Action**: Verify all indexes created by migration
```sql
-- Check reputation indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename LIKE 'reputation%';

-- Should see:
-- idx_reputation_scores_score
-- idx_reputation_scores_tier
-- idx_reputation_scores_last_decay
-- idx_reputation_events_user_id
-- idx_reputation_events_type
-- ... (and more)
```

**Performance Check**:
```sql
EXPLAIN ANALYZE
SELECT * FROM reputation_scores
ORDER BY score DESC
LIMIT 100;
-- Should use index scan, not sequential scan
```

**Owner**: Database Admin
**Priority**: MEDIUM

---

## 📊 Product/QA Team Tasks

### Task Q1: Acceptance Testing (Est: 4-6 hours)

**Test Cases**:

1. **User Profile Display**
   - ✓ Reputation badge shows next to username
   - ✓ Correct tier icon and color
   - ✓ Score displays correctly
   - ✓ Badge updates when reputation changes

2. **Post Cards**
   - ✓ Reputation badge on each post author
   - ✓ Tier icon displays (without score)
   - ✓ Consistent styling across feed

3. **Reputation Earning**
   - ✓ Like a post → reputation increases
   - ✓ Comment on post → reputation increases
   - ✓ Retweet post → reputation increases
   - ✓ Correct point values awarded

4. **Daily Caps**
   - ✓ Hit daily like cap → no more points awarded
   - ✓ Next day → caps reset, can earn again

5. **Give Reputation**
   - ✓ Can send reputation to another user
   - ✓ Cannot send to self
   - ✓ Daily limit enforced

6. **Leaderboard**
   - ✓ Shows top users by reputation
   - ✓ Correct ordering
   - ✓ Updates in real-time

7. **Feed Ranking**
   - ✓ High-reputation users appear higher in feed
   - ✓ Quality content gets visibility boost

**Owner**: QA Lead + Product Manager
**Priority**: HIGH

### Task Q2: User Documentation (Est: 2-3 hours)

**Create User-Facing Documentation**:
- What is reputation?
- How do I earn reputation?
- What are the tiers?
- How does reputation affect my experience?
- FAQ section

**Locations**:
- Help center article
- In-app tooltip/modal
- Announcement post

**Owner**: Product Manager / Technical Writer
**Priority**: MEDIUM

---

## 🚀 Deployment Checklist

### Phase 1: Staging Deployment (Week 1)

- [ ] **D2**: Database backup
- [ ] **B1**: Run migration on staging
- [ ] **B2**: Deploy reputation service
- [ ] **B3**: Deploy API routes
- [ ] **B4**: Deploy integration with posts
- [ ] **B5**: Deploy profile updates
- [ ] **B6**: Deploy feed updates
- [ ] **B7**: Set up cron jobs
- [ ] **D1**: Configure feature flags (display only)
- [ ] **D3**: Set up monitoring
- [ ] **Q1**: Run acceptance tests
- [ ] **Smoke Test**: Manual verification

### Phase 2: Production Rollout (Week 2)

- [ ] **D2**: Production database backup
- [ ] **B1**: Run migration on production
- [ ] **Deploy**: All backend code to production
- [ ] **D1**: Enable reputation display
- [ ] **Q1**: Verify in production
- [ ] **Monitor**: Watch metrics for 24h

### Phase 3: Enable Awards (Week 3)

- [ ] **D1**: Enable reputation awards
- [ ] **Monitor**: Award frequency and distribution
- [ ] **Q1**: User feedback collection

### Phase 4: Enable Ranking (Week 4)

- [ ] **D1**: Enable reputation ranking
- [ ] **Monitor**: Feed quality metrics
- [ ] **Q1**: A/B test results
- [ ] **Tune**: Adjust weights if needed

---

## 📋 Team Summary

### Backend Team (Senior Dev + 2 Devs)
- **Estimated**: 20-30 hours total
- **Tasks**: B1-B9
- **Critical Path**: B1 → B2 → B3 → B4 → Testing

### Frontend Team (1 Dev)
- **Estimated**: 1 hour
- **Tasks**: F1
- **Status**: Mostly complete

### DevOps Team (1 Engineer)
- **Estimated**: 6-8 hours
- **Tasks**: D1-D4
- **Critical Path**: D2 → B1

### QA Team (1 QA + Product Manager)
- **Estimated**: 8-10 hours
- **Tasks**: Q1-Q2
- **Starts**: After B8 complete

---

## 🎯 Critical Path

```
Day 1:
  D2 (Backup) → B1 (Migration) → B2 (Service) → B3 (Routes)

Day 2-3:
  B4 (Integration) → B5 (Profile) → B6 (Feed) → B7 (Cron)

Day 4:
  B8 (Testing) → Q1 (Acceptance) → D3 (Monitoring)

Day 5:
  Staging Deployment → Verification → Production Deployment
```

**Total Timeline**: 5-7 business days

---

## 📞 Contacts & Resources

- **Technical Design**: `REPUTATION_SYSTEM_DESIGN.md`
- **Implementation Guide**: `REPUTATION_IMPLEMENTATION_GUIDE.md`
- **Database Migration**: `backend/migrations/001_reputation_system.sql`
- **Frontend Components**: `app/components/ReputationBadge.tsx`

**Questions?**
- Backend questions → Backend Lead
- Database questions → Database Admin
- Product questions → Product Manager
- Deployment questions → DevOps Lead

---

## 🔧 Troubleshooting Quick Reference

### Migration Fails
```bash
# Rollback
psql -d clapo_database -c "BEGIN; [paste rollback SQL from migration]; COMMIT;"

# Restore from backup
psql -d clapo_database < backup_pre_reputation_YYYYMMDD.sql
```

### Reputation Not Updating
1. Check database triggers enabled
2. Verify cron jobs running
3. Check reputation service logs

### Performance Issues
1. Verify indexes created (D4)
2. Check query execution plans
3. Add Redis caching if needed

### Daily Caps Not Working
1. Check midnight cron job running
2. Verify timezone settings
3. Check daily_* columns in database

---

**Last Updated**: 2025-01-15
**Version**: 1.0
**Status**: Ready for Implementation
