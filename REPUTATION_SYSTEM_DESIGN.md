# Clapo Reputation Score System - Technical Design Document

## Executive Summary

This document outlines the complete technical architecture for implementing a non-tradable Reputation Score system in Clapo that influences feed visibility and reply ranking. The system is designed to integrate seamlessly with the existing Next.js frontend and Node.js/Express backend (`server.blazeswap.io`).

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 Current Infrastructure Analysis

**Frontend Stack (Analyzed):**
- Next.js 14 with App Router
- TypeScript
- React Context API for state (`/app/Context/ApiProvider.tsx`)
- API Service Layer (`/app/lib/api.ts`)
- Session management via NextAuth (`/app/api/auth/[...nextauth]/route.ts`)

**Backend (Inferred from API calls):**
- Base URL: `https://server.blazeswap.io/api/snaps`
- RESTful API architecture
- Existing endpoints: `/posts`, `/users`, `/feed`, `/notifications`, etc.
- Database: Likely PostgreSQL (based on mature API patterns)

### 1.2 Reputation System Components

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ReputationContext (new)                        │   │
│  │  - Track user reputation state                  │   │
│  │  - Cache reputation scores                      │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Enhanced Feed Components                       │   │
│  │  - Apply rep-based ranking                      │   │
│  │  - Display rep badges (optional)                │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │ HTTPS/REST
                          ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Node.js/Express)                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Reputation Service (new)                       │   │
│  │  - Core scoring logic                           │   │
│  │  - Event processing                             │   │
│  │  - Anti-spam validation                         │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Enhanced Feed Service                          │   │
│  │  - Integrate rep into ranking                   │   │
│  │  - Apply weights                                │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Scheduled Jobs (new cron)                      │   │
│  │  - Nightly decay                                │   │
│  │  - Daily budget reset                           │   │
│  │  - Streak calculation                           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                  │
│  - users (extend with reputation fields)                 │
│  - reputation_events (new, append-only)                  │
│  - daily_actor_budgets (new)                            │
│  - user_streaks (new)                                   │
│  - content_feedback_stats (new, aggregates)             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   CACHE LAYER (Redis)                    │
│  - rep:{userId} → reputation score (TTL: 5min)          │
│  - dailybudget:{userId}:{dayKey} → remaining quotas     │
│  - clap:{giverId}:{contentId}:{dayKey} → dedup         │
│  - giverep:{endorserId}:{targetId}:{dayKey} → dedup    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. EXACT SCORING MATHEMATICS

### 2.1 Core Formula Components

**Actor Weight Function:**
```
w(u) = sqrt(max(rep(u), 1)) / sqrt(1000)

Where:
- rep(u) ∈ [0, 1000]
- New users start at BASELINE = 100
- Low-rep users contribute less (sqrt dampens)
```

**Worked Examples:**
```
rep = 100  → w = sqrt(100)/sqrt(1000) = 0.316
rep = 400  → w = sqrt(400)/sqrt(1000) = 0.632
rep = 900  → w = sqrt(900)/sqrt(1000) = 0.949
rep = 1    → w = sqrt(1)/sqrt(1000)   = 0.0316 (minimal)
```

### 2.2 Positive Delta Calculations

**A) Unique Clap (within rolling 24h)**
```typescript
// Uniqueness key: (giverId, contentId, dayKey)
// dayKey = YYYYMMDD in UTC
Δ_clap = CLAP_BASE * w(giver)

Example:
- giver.rep = 400 → w = 0.632
- Δ = 1.2 * 0.632 = 0.758 rep points to content author
```

**B) Reply with Crowd Confidence**
```typescript
// Only when thread has ≥ K unique participants in 24h
crowd_confidence(c) = min(1, unique_participants_24h / 10)
Δ_reply = REPLY_BASE * crowd_confidence(c)

Example:
- Thread has 5 unique participants
- confidence = min(1, 5/10) = 0.5
- Δ = 2.0 * 0.5 = 1.0 rep to original author
```

**C) Remix/Retweet**
```typescript
Δ_remix = REMIX_BASE * w(remixer)

Example:
- remixer.rep = 600 → w = 0.775
- Δ = 3.0 * 0.775 = 2.325 rep to original author
```

**D) Authority Drip (Quality Posting)**
```typescript
// Triggered on post creation if:
// - content.length > 50 chars
// - no recent violations
// - capped at CAP_AUTHORITY_DAY per user per day

Δ_authority = AUTHORITY_DRIP = 0.8 per post
```

**E) Community GiveRep**
```typescript
// Daily quota: Q_endorse = 5 per giver
// Uniqueness: (endorserId, targetUserId, dayKey)

Δ_giverep = GIVEREP_BASE * w(endorser)

Example:
- endorser.rep = 500 → w = 0.707
- Δ = 2.5 * 0.707 = 1.768 rep to target
```

### 2.3 Streak Multiplier

```typescript
// Applied ONLY to day's net POSITIVE gains at day close
// Calculated at 00:00 UTC

if (streak_days >= 3) {
  M_streak = min(1.0 + (0.02 * streak_days), 1.5)
  net_positive_gains_today *= M_streak
}

Example:
- User has 10-day streak
- Today earned 5 rep (net positive)
- M = min(1 + 0.2, 1.5) = 1.2
- Final today's gain = 5 * 1.2 = 6.0
```

### 2.4 Decay (Nightly)

```typescript
// Applied to portion above BASELINE at 00:00 UTC
// Half-life = 30 days → decay_factor = 0.9772

rep_new = BASELINE + (rep_old - BASELINE) * 0.9772

Example:
- rep_old = 600
- excess = 600 - 100 = 500
- rep_new = 100 + (500 * 0.9772) = 100 + 488.6 = 588.6
// Lost 11.4 rep due to decay
```

### 2.5 Caps & Clamps

**Per-Target Daily Caps:**
```typescript
CAP_CLAPS_DAY = 50        // Max claps one user can receive/day
CAP_REPLIES_DAY = 30       // Max reply boosts/day
CAP_GIVEREP_DAY = 15       // Max giverep endorsements received/day
CAP_AUTHORITY_DAY = 10     // Max authority drips/day
```

**Final Clamping:**
```typescript
rep_final = clamp(
  rep_before_clamp - penalty(u),
  0,
  1000
)
```

### 2.6 Tunable Constants Table

| Constant | Default | Description |
|----------|---------|-------------|
| `CLAP_BASE` | 1.2 | Base rep gain per unique clap |
| `REPLY_BASE` | 2.0 | Base rep gain for quality reply |
| `REMIX_BASE` | 3.0 | Base rep gain when content remixed |
| `AUTHORITY_DRIP` | 0.8 | Rep gain per quality post |
| `GIVEREP_BASE` | 2.5 | Base rep gain per endorsement |
| `CAP_CLAPS_DAY` | 50 | Max claps receivable per day |
| `CAP_REPLIES_DAY` | 30 | Max reply boosts per day |
| `CAP_GIVEREP_DAY` | 15 | Max endorsements receivable per day |
| `CAP_AUTHORITY_DAY` | 10 | Max authority drips per day |
| `K` (crowd threshold) | 3 | Min participants for crowd confidence |
| `Q_endorse` | 5 | Daily giverep quota per endorser |
| `HALF_LIFE_DAYS` | 30 | Decay half-life period |
| `BASELINE` | 100 | Starting reputation |

---

## 3. DATA MODEL DELTAS

### 3.1 Extend Existing `users` Table

```sql
-- Add to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  reputation DECIMAL(7,2) DEFAULT 100.00 NOT NULL,
  reputation_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  abuse_flags JSONB DEFAULT '{}',
  shadow_banned BOOLEAN DEFAULT FALSE,
  last_active_date DATE,
  streak_count INTEGER DEFAULT 0;

-- Indexes
CREATE INDEX idx_users_reputation ON users(reputation DESC);
CREATE INDEX idx_users_shadow_banned ON users(shadow_banned) WHERE shadow_banned = TRUE;
```

### 3.2 New `reputation_events` Table (Append-Only Audit)

```sql
CREATE TABLE reputation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delta DECIMAL(6,2) NOT NULL,
  reason VARCHAR(50) NOT NULL, -- ENUM in app layer
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT reason_check CHECK (reason IN (
    'CLAP', 'REPLY', 'REMIX', 'ACTIVITY', 'GIVEREP',
    'DECAY', 'PENALTY', 'BACKFILL', 'STREAK_BONUS'
  ))
);

-- Indexes
CREATE INDEX idx_reputation_events_user_id ON reputation_events(user_id, created_at DESC);
CREATE INDEX idx_reputation_events_reason ON reputation_events(reason);
CREATE INDEX idx_reputation_events_created_at ON reputation_events(created_at DESC);
```

**Metadata Examples:**
```json
// CLAP event
{
  "giver_id": "user123",
  "content_id": "post456",
  "giver_weight": 0.632,
  "day_key": "20250106"
}

// REPLY event
{
  "thread_id": "post789",
  "unique_participants": 5,
  "crowd_confidence": 0.5
}

// GIVEREP event
{
  "endorser_id": "user999",
  "endorser_weight": 0.707,
  "day_key": "20250106"
}
```

### 3.3 New `daily_actor_budgets` Table

```sql
CREATE TABLE daily_actor_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_key VARCHAR(8) NOT NULL, -- YYYYMMDD
  giverep_used INTEGER DEFAULT 0,
  influence_spent DECIMAL(6,2) DEFAULT 0,
  authority_drips_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, day_key)
);

-- Indexes
CREATE INDEX idx_daily_budgets_user_day ON daily_actor_budgets(user_id, day_key);
CREATE INDEX idx_daily_budgets_day_key ON daily_actor_budgets(day_key);
```

### 3.4 New `user_streaks` Table

```sql
CREATE TABLE user_streaks (
  user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  last_active_day_key VARCHAR(8) NOT NULL,
  streak_count INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_user_streaks_updated ON user_streaks(updated_at DESC);
```

### 3.5 New `content_feedback_stats` Table (Aggregates)

```sql
CREATE TABLE content_feedback_stats (
  content_id VARCHAR(255) PRIMARY KEY,
  unique_clappers INTEGER DEFAULT 0,
  unique_repliers INTEGER DEFAULT 0,
  unique_remixers INTEGER DEFAULT 0,
  total_weighted_claps DECIMAL(8,2) DEFAULT 0,
  last_computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- For fast lookups
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_content_feedback_created ON content_feedback_stats(created_at DESC);
```

### 3.6 Deduplication Tables (Alternative to Redis-only)

```sql
-- For audit/debugging; primary dedup is Redis
CREATE TABLE clap_dedup (
  giver_id VARCHAR(255) NOT NULL,
  content_id VARCHAR(255) NOT NULL,
  day_key VARCHAR(8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (giver_id, content_id, day_key)
);

CREATE TABLE giverep_dedup (
  endorser_id VARCHAR(255) NOT NULL,
  target_user_id VARCHAR(255) NOT NULL,
  day_key VARCHAR(8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (endorser_id, target_user_id, day_key)
);

-- Cleanup old dedup records (keep 7 days)
-- Run daily: DELETE FROM clap_dedup WHERE day_key < TO_CHAR(NOW() - INTERVAL '7 days', 'YYYYMMDD');
```

---

## 4. EVENT FLOW DIAGRAMS (Textual Sequences)

### 4.1 On Clap Event

```
1. User clicks "clap" on content
   └─> Frontend: POST /api/snaps/posts/{postId}/like
       Body: { userId: currentUserId }

2. Backend Reputation Service:
   a) Validate auth (userId matches session)
   b) Derive dayKey = format(new Date(), 'YYYYMMDD', { timeZone: 'UTC' })
   c) Check Redis: EXISTS clap:{giverId}:{contentId}:{dayKey}
      ├─> If EXISTS: return 409 "Already clapped today"
      └─> Else: continue

   d) Check shadowBanned(giver):
      ├─> If TRUE: w = 0, accept silently but apply Δ = 0
      └─> Else: w = sqrt(rep(giver)) / sqrt(1000)

   e) Get content author from DB
   f) Check daily cap for author:
      SELECT COUNT(*) FROM reputation_events
      WHERE user_id = author_id
        AND reason = 'CLAP'
        AND created_at >= DATE_TRUNC('day', NOW())
      ├─> If count >= CAP_CLAPS_DAY: log warning, skip rep gain
      └─> Else: continue

   g) Calculate Δ = CLAP_BASE * w

   h) BEGIN TRANSACTION
      - INSERT INTO clap_dedup (giver_id, content_id, day_key)
      - INSERT INTO reputation_events (user_id=author_id, delta=Δ, reason='CLAP', metadata)
      - UPDATE users SET reputation = reputation + Δ, reputation_updated_at = NOW()
        WHERE id = author_id
      - UPDATE content_feedback_stats SET unique_clappers++, total_weighted_claps += Δ
      - COMMIT

   i) Set Redis: SETEX clap:{giverId}:{contentId}:{dayKey} 86400 "1"

   j) Return 200 with updated like_count

3. Frontend updates UI optimistically
```

### 4.2 On Reply Event

```
1. User posts reply to thread
   └─> Frontend: POST /api/snaps/posts/{parentId}/comment
       Body: { commenterId, content }

2. Backend:
   a) Create comment record
   b) Get thread stats (last 24h):
      SELECT COUNT(DISTINCT user_id) as unique_participants
      FROM posts
      WHERE parent_post_id = {parentId}
        AND created_at >= NOW() - INTERVAL '24 hours'

   c) If unique_participants >= K (3):
      - crowd_confidence = min(1, unique_participants / 10)
      - Δ = REPLY_BASE * crowd_confidence

      d) Check daily cap for original author
      e) BEGIN TRANSACTION
         - INSERT INTO reputation_events (user_id=original_author, delta=Δ, reason='REPLY', metadata)
         - UPDATE users SET reputation = reputation + Δ WHERE id = original_author
         - COMMIT

   f) Return reply object

3. Async: Update content_feedback_stats
```

### 4.3 On Remix/Retweet Event

```
1. User retweets content
   └─> Frontend: POST /api/snaps/posts/{postId}/retweet
       Body: { userId: remixerId }

2. Backend:
   a) Validate (user hasn't already retweeted)
   b) Get original content author
   c) w = sqrt(rep(remixer)) / sqrt(1000)
   d) Δ = REMIX_BASE * w

   e) Check daily cap (CAP_REMIXES_DAY if exists, else no cap)
   f) BEGIN TRANSACTION
      - INSERT INTO retweets (...)
      - INSERT INTO reputation_events (user_id=original_author, delta=Δ, reason='REMIX', metadata)
      - UPDATE users SET reputation = reputation + Δ WHERE id = original_author
      - COMMIT

   g) Return retweet object
```

### 4.4 On GiveRep (Community Endorsement)

```
1. User endorses another user
   └─> Frontend: POST /api/snaps/users/{targetId}/giverep
       Body: { endorserId: currentUserId }

2. Backend GiveRep Endpoint:
   a) Validate auth
   b) dayKey = format(NOW(), 'YYYYMMDD', { timeZone: 'UTC' })
   c) Check Redis: EXISTS giverep:{endorserId}:{targetId}:{dayKey}
      ├─> If EXISTS: return 409 "Already endorsed today"
      └─> Else: continue

   d) Get/create daily_actor_budgets for endorser:
      SELECT giverep_used FROM daily_actor_budgets
      WHERE user_id = endorserId AND day_key = dayKey

      ├─> If giverep_used >= Q_endorse (5): return 429 "Daily quota exhausted"
      └─> Else: continue

   e) w = sqrt(rep(endorser)) / sqrt(1000)
   f) Δ = GIVEREP_BASE * w

   g) Check daily cap for target (CAP_GIVEREP_DAY = 15)

   h) BEGIN TRANSACTION
      - INSERT INTO giverep_dedup (endorser_id, target_user_id, day_key)
      - INSERT INTO reputation_events (user_id=targetId, delta=Δ, reason='GIVEREP', metadata)
      - UPDATE users SET reputation = reputation + Δ WHERE id = targetId
      - UPDATE daily_actor_budgets SET giverep_used = giverep_used + 1
        WHERE user_id = endorserId AND day_key = dayKey
      - COMMIT

   i) Set Redis: SETEX giverep:{endorserId}:{targetId}:{dayKey} 86400 "1"

   j) Return 200 with confirmation
```

### 4.5 Nightly Decay Job (Cron: 00:00 UTC)

```
1. Scheduled Task Trigger (node-cron or similar)
   └─> Run: POST /internal/cron/reputation-decay (auth: internal secret)

2. Decay Logic:
   a) FOR EACH user WHERE reputation > BASELINE:
      - excess = reputation - BASELINE
      - decayed_excess = excess * 0.9772
      - new_rep = BASELINE + decayed_excess
      - delta = new_rep - reputation (negative)

      b) INSERT INTO reputation_events (user_id, delta, reason='DECAY', metadata={})
      c) UPDATE users SET reputation = new_rep WHERE id = user_id

   d) Log summary: "Decayed {count} users, total rep reduced: {sum}"

3. Streak Multiplier Application (same job):
   a) FOR EACH user WHERE last_active_date = YESTERDAY:
      - Get net_positive_gains_today:
        SELECT SUM(delta) FROM reputation_events
        WHERE user_id = u.id
          AND created_at >= DATE_TRUNC('day', NOW() - INTERVAL '1 day')
          AND created_at < DATE_TRUNC('day', NOW())
          AND delta > 0
          AND reason IN ('CLAP', 'REPLY', 'REMIX', 'GIVEREP', 'ACTIVITY')

      b) If net_positive_gains_today > 0 AND streak_count >= 3:
         - M_streak = min(1.0 + (0.02 * streak_count), 1.5)
         - bonus = net_positive_gains_today * (M_streak - 1.0)
         - INSERT INTO reputation_events (user_id, delta=bonus, reason='STREAK_BONUS', metadata)
         - UPDATE users SET reputation = reputation + bonus

      c) Update streak:
         - If active yesterday: streak_count++
         - Else: streak_count = 0
         - UPDATE user_streaks

4. Return 200 with stats
```

### 4.6 Daily Budget Reset Job (Cron: 00:01 UTC)

```
1. Scheduled Task Trigger
   └─> Run: POST /internal/cron/reset-daily-budgets

2. Logic:
   a) yesterdayKey = format(NOW() - 1day, 'YYYYMMDD')
   b) DELETE FROM daily_actor_budgets WHERE day_key < yesterdayKey - 7 days
      // Keep 7 days for audit

   c) Redis bulk delete:
      - DEL pattern: dailybudget:*:{yesterdayKey}
      - DEL pattern: clap:*:*:{yesterdayKey}
      - DEL pattern: giverep:*:*:{yesterdayKey}

   d) Log: "Reset budgets for {count} users"

3. Return 200
```

### 4.7 Abuse Heuristic (Burst Detection)

```
// Trigger: On any rep-granting event

1. Check for suspicious patterns:
   a) Get recent events for target (last 10 min):
      SELECT giver_id, COUNT(*) as event_count
      FROM reputation_events
      WHERE user_id = target_id
        AND created_at >= NOW() - INTERVAL '10 minutes'
        AND reason IN ('CLAP', 'GIVEREP')
      GROUP BY giver_id
      HAVING COUNT(*) > 5

   b) If distinct_givers < 3 AND total_events > 15:
      - Mark as potential abuse
      - For each excessive event:
        * INSERT INTO reputation_events (delta=-Δ, reason='PENALTY', metadata={abuse_type: 'burst'})
        * UPDATE users SET reputation = reputation - Δ, abuse_flags = abuse_flags || {burst_detected: true}

      - Send alert to monitoring system
      - Optional: Auto shadow-ban if abuse_flags count > threshold

2. Rate Limiting (Application Layer):
   - Use Redis for IP-based rate limits
   - Max 10 rep-granting actions per user per minute
```

---

## 5. RANKING INTEGRATION

### 5.1 Feed Ranking Algorithm

**Location:** Create `/backend/services/feedRanking.ts` (or equivalent in your Node.js backend)

**Current Feed Endpoint:** `/api/snaps/feed/foryou` (from `app/lib/api.ts:374`)

**Enhanced Feed Score:**
```typescript
// backend/services/feedRanking.ts

interface FeedRankingConfig {
  alpha: number;  // Weight for clap engagement
  beta: number;   // Weight for reply engagement
  gamma: number;  // Weight for author reputation
  delta: number;  // Age penalty factor
  timeWindow: number; // Hours to consider "recent"
}

const DEFAULT_CONFIG: FeedRankingConfig = {
  alpha: 0.3,
  beta: 0.25,
  gamma: 0.35,
  delta: 0.1,
  timeWindow: 48
};

function calculateFeedScore(
  post: Post,
  authorRep: number,
  config: FeedRankingConfig = DEFAULT_CONFIG
): number {
  // Base engagement score
  const baseEngagement =
    (post.like_count * 1.0) +
    (post.comment_count * 2.0) +
    (post.retweet_count * 1.5);

  // Weighted clap score (sum of clapper weights)
  const weightedClaps = post.claps?.reduce((sum, clap) => {
    const clapperWeight = Math.sqrt(clap.user_rep || 100) / Math.sqrt(1000);
    return sum + clapperWeight;
  }, 0) || 0;

  // Reply crowd confidence
  const uniqueRepliers = post.unique_repliers || 0;
  const crowdConfidence = Math.min(1, uniqueRepliers / 10);
  const weightedReplies = post.comment_count * crowdConfidence;

  // Author reputation boost
  const authorBoost = Math.pow(authorRep, 0.35); // Diminishing returns

  // Age penalty
  const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
  const agePenalty = hoursOld > config.timeWindow ?
    (hoursOld - config.timeWindow) * 0.1 : 0;

  // Final score
  const score =
    (config.alpha * weightedClaps) +
    (config.beta * weightedReplies) +
    (config.gamma * authorBoost) -
    (config.delta * agePenalty);

  return Math.max(0, score);
}

// Usage in feed endpoint
export async function getPersonalizedFeed(
  userId: string,
  limit: number,
  offset: number
): Promise<Post[]> {
  // 1. Get candidate posts (existing logic)
  const posts = await db.getPosts(userId, limit * 3, offset);

  // 2. Enrich with reputation data (cached)
  const postsWithRep = await Promise.all(
    posts.map(async (post) => {
      const authorRep = await getAuthorReputation(post.user_id); // Cache hit
      const feedbackStats = await getContentFeedbackStats(post.id); // Aggregates

      return {
        ...post,
        author_reputation: authorRep,
        unique_repliers: feedbackStats.unique_repliers,
        weighted_claps: feedbackStats.total_weighted_claps
      };
    })
  );

  // 3. Calculate scores and sort
  const scoredPosts = postsWithRep.map(post => ({
    ...post,
    feed_score: calculateFeedScore(post, post.author_reputation)
  }));

  scoredPosts.sort((a, b) => b.feed_score - a.feed_score);

  // 4. Return top N
  return scoredPosts.slice(0, limit);
}
```

### 5.2 Reply Ordering Within Threads

**Location:** Modify `/backend/services/commentService.ts` (or equivalent)

**Enhanced Reply Score:**
```typescript
interface Reply {
  id: string;
  content: string;
  author_id: string;
  author_reputation: number;
  like_count: number;
  created_at: Date;
}

function calculateReplyScore(reply: Reply): number {
  // Engagement component (60%)
  const engagementScore =
    (reply.like_count * 1.0) +
    (Math.log10(reply.sub_replies_count || 1) * 0.5);

  // Weighted by unique likers
  const weightedEngagement = engagementScore; // Can enhance with liker weights

  // Reputation component (40%)
  const repScore = Math.pow(reply.author_reputation, 0.35);

  // Recency boost (small)
  const hoursOld = (Date.now() - new Date(reply.created_at).getTime()) / (1000 * 60 * 60);
  const recencyBoost = hoursOld < 2 ? 0.1 : 0;

  return (0.6 * weightedEngagement) + (0.4 * repScore) + recencyBoost;
}

// Usage
export async function getThreadReplies(postId: string): Promise<Reply[]> {
  const replies = await db.getComments(postId);

  // Enrich with author reputation
  const enrichedReplies = await Promise.all(
    replies.map(async (reply) => ({
      ...reply,
      author_reputation: await getAuthorReputation(reply.author_id)
    }))
  );

  // Sort by score
  enrichedReplies.sort((a, b) =>
    calculateReplyScore(b) - calculateReplyScore(a)
  );

  return enrichedReplies;
}
```

### 5.3 Caching Strategy

**Redis Cache Schema:**
```typescript
// backend/cache/reputationCache.ts

import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

const CACHE_TTL = {
  reputation: 300,        // 5 minutes
  feedbackStats: 600,     // 10 minutes
  dailyBudget: 86400      // 24 hours
};

export async function getAuthorReputation(userId: string): Promise<number> {
  const cacheKey = `rep:${userId}`;

  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return parseFloat(cached);
  }

  // Fetch from DB
  const user = await db.users.findOne({ where: { id: userId } });
  const rep = user?.reputation || 100;

  // Cache for 5 min
  await redis.setex(cacheKey, CACHE_TTL.reputation, rep.toString());

  return rep;
}

export async function invalidateReputationCache(userId: string): Promise<void> {
  await redis.del(`rep:${userId}`);
}

// Call invalidateReputationCache after any rep update
```

**Time Windows:**
- Recent engagement: Last 24-48h (configurable)
- Crowd confidence: Rolling 24h window
- Feed score calculation: Real-time with 5min rep cache

---

## 6. ANTI-SPAM & ABUSE CONTROLS

### 6.1 Database-Level Enforcement

**Uniqueness Constraints:**
```sql
-- Already defined in section 3.6
-- PRIMARY KEY (giver_id, content_id, day_key) on clap_dedup
-- PRIMARY KEY (endorser_id, target_user_id, day_key) on giverep_dedup
```

**Daily Caps (Application Layer):**
```typescript
// backend/services/reputationService.ts

async function checkDailyCap(
  userId: string,
  reason: ReputationReason,
  capLimit: number
): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  const count = await db.reputationEvents.count({
    where: {
      user_id: userId,
      reason: reason,
      created_at: {
        gte: new Date(today + 'T00:00:00Z')
      }
    }
  });

  return count < capLimit;
}

// Usage before granting rep
if (!await checkDailyCap(targetUserId, 'CLAP', CAP_CLAPS_DAY)) {
  return { error: 'Daily clap limit reached', code: 429 };
}
```

### 6.2 Redis-Based Deduplication

**Fast Uniqueness Checks:**
```typescript
async function isUniqueClap(
  giverId: string,
  contentId: string,
  dayKey: string
): Promise<boolean> {
  const key = `clap:${giverId}:${contentId}:${dayKey}`;
  const exists = await redis.exists(key);

  if (exists) {
    return false; // Already clapped today
  }

  // Mark as clapped (24h TTL)
  await redis.setex(key, 86400, '1');
  return true;
}
```

### 6.3 Burst Detection Heuristic

```typescript
// backend/services/abuseDetection.ts

interface BurstPattern {
  targetUserId: string;
  giverIds: Set<string>;
  eventCount: number;
  timeWindow: number; // minutes
}

async function detectBurstAbuse(targetUserId: string): Promise<boolean> {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const recentEvents = await db.reputationEvents.findAll({
    where: {
      user_id: targetUserId,
      created_at: { gte: tenMinutesAgo },
      reason: { in: ['CLAP', 'GIVEREP'] }
    }
  });

  const uniqueGivers = new Set(recentEvents.map(e => e.metadata.giver_id));

  // Red flag: Many events from few distinct users
  if (uniqueGivers.size <= 3 && recentEvents.length > 15) {
    await handleAbuseDetected(targetUserId, recentEvents);
    return true;
  }

  return false;
}

async function handleAbuseDetected(
  targetUserId: string,
  suspiciousEvents: ReputationEvent[]
): Promise<void> {
  // 1. Reverse suspicious gains
  const totalSuspiciousGain = suspiciousEvents.reduce((sum, e) => sum + e.delta, 0);

  await db.transaction(async (tx) => {
    await tx.reputationEvents.create({
      user_id: targetUserId,
      delta: -totalSuspiciousGain,
      reason: 'PENALTY',
      metadata: { abuse_type: 'burst_pattern', reversed_count: suspiciousEvents.length }
    });

    await tx.users.update({
      where: { id: targetUserId },
      data: {
        reputation: { decrement: totalSuspiciousGain },
        abuse_flags: { burst_detected: true, detected_at: new Date() }
      }
    });
  });

  // 2. Alert monitoring
  await sendAlert({
    type: 'REPUTATION_ABUSE',
    severity: 'HIGH',
    userId: targetUserId,
    details: `Burst pattern detected: ${suspiciousEvents.length} events from ${new Set(suspiciousEvents.map(e => e.metadata.giver_id)).size} users`
  });

  // 3. Optional: Auto shadow-ban
  const user = await db.users.findOne({ where: { id: targetUserId } });
  if (user.abuse_flags?.burst_detected_count > 2) {
    await db.users.update({
      where: { id: targetUserId },
      data: { shadow_banned: true }
    });
  }
}
```

### 6.4 Shadow Ban Implementation

```typescript
// backend/middleware/reputationMiddleware.ts

function calculateActorWeight(user: User): number {
  if (user.shadow_banned) {
    return 0; // Silent zero weight
  }

  return Math.sqrt(Math.max(user.reputation, 1)) / Math.sqrt(1000);
}

// All rep-granting functions use this:
const weight = calculateActorWeight(giver);
const delta = CLAP_BASE * weight; // Will be 0 if shadow banned

// Note: Shadow-banned users get 200 OK responses but zero impact
```

### 6.5 Rate Limiting (Application-Wide)

```typescript
// backend/middleware/rateLimiter.ts

import rateLimit from 'express-rate-limit';

export const reputationActionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Max 10 rep-granting actions per minute
  keyGenerator: (req) => req.user.id, // Per-user limit
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many reputation actions. Please slow down.',
      retryAfter: 60
    });
  }
});

// Apply to reputation routes
app.post('/posts/:id/like', reputationActionLimiter, handleLike);
app.post('/users/:id/giverep', reputationActionLimiter, handleGiveRep);
```

---

## 7. BACKFILL & MIGRATION PLAN

### 7.1 Database Migration Steps

```sql
-- migrations/001_add_reputation_system.sql

BEGIN;

-- Step 1: Add columns to users (with defaults for existing users)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reputation DECIMAL(7,2) DEFAULT 100.00,
  ADD COLUMN IF NOT EXISTS reputation_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS abuse_flags JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS shadow_banned BOOLEAN DEFAULT FALSE;

-- Step 2: Create new tables
CREATE TABLE IF NOT EXISTS reputation_events (...); -- Full schema from section 3.2
CREATE TABLE IF NOT EXISTS daily_actor_budgets (...); -- Section 3.3
CREATE TABLE IF NOT EXISTS user_streaks (...); -- Section 3.4
CREATE TABLE IF NOT EXISTS content_feedback_stats (...); -- Section 3.5
CREATE TABLE IF NOT EXISTS clap_dedup (...); -- Section 3.6
CREATE TABLE IF NOT EXISTS giverep_dedup (...);

-- Step 3: Create indexes
CREATE INDEX idx_users_reputation ON users(reputation DESC);
-- ... (all indexes from section 3)

COMMIT;
```

### 7.2 Backfill Initial Reputation (Phase 1)

**Strategy:** Calculate initial rep from last 30 days of organic activity

```typescript
// scripts/backfill-reputation.ts

import { db } from '../backend/database';

const LOOKBACK_DAYS = 30;
const BATCH_SIZE = 100;

async function backfillReputation() {
  console.log('Starting reputation backfill...');

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - LOOKBACK_DAYS);

  // Get all users
  const users = await db.users.findAll();

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (user) => {
      let initialRep = 100; // BASELINE

      // Calculate from historical likes (posts they authored)
      const likeEvents = await db.query(`
        SELECT l.user_id as giver_id, u.reputation as giver_rep, COUNT(*) as count
        FROM likes l
        JOIN users u ON l.user_id = u.id
        WHERE l.post_id IN (
          SELECT id FROM posts WHERE user_id = $1 AND created_at >= $2
        )
        GROUP BY l.user_id, u.reputation
      `, [user.id, cutoffDate]);

      const likeRep = likeEvents.rows.reduce((sum, e) => {
        const weight = Math.sqrt(e.giver_rep || 100) / Math.sqrt(1000);
        return sum + (1.2 * weight * Math.min(e.count, 5)); // Cap at 5 per giver
      }, 0);

      // Calculate from comments/replies
      const replyCount = await db.posts.count({
        where: {
          parent_post_id: { in: await getUserPostIds(user.id) },
          created_at: { gte: cutoffDate }
        }
      });
      const replyRep = Math.min(replyCount * 0.5, 20); // Cap at 20

      // Calculate from retweets
      const retweetCount = await db.retweets.count({
        where: {
          post_id: { in: await getUserPostIds(user.id) },
          created_at: { gte: cutoffDate }
        }
      });
      const retweetRep = Math.min(retweetCount * 1.0, 30);

      initialRep += likeRep + replyRep + retweetRep;
      initialRep = Math.min(initialRep, 500); // Cap initial backfill at 500

      // Update user and create backfill event
      await db.transaction(async (tx) => {
        await tx.users.update({
          where: { id: user.id },
          data: { reputation: initialRep, reputation_updated_at: new Date() }
        });

        await tx.reputationEvents.create({
          user_id: user.id,
          delta: initialRep - 100,
          reason: 'BACKFILL',
          metadata: { lookback_days: LOOKBACK_DAYS, method: 'historical_v1' }
        });
      });

      console.log(`Backfilled user ${user.id}: ${initialRep} rep`);
    }));
  }

  console.log('Backfill complete!');
}

// Run: node scripts/backfill-reputation.ts
```

### 7.3 Feature Flag Rollout (Phase 2-4)

```typescript
// backend/config/featureFlags.ts

export const REPUTATION_FLAGS = {
  // Phase 2: Enable accrual, low ranking impact
  accrual_enabled: process.env.REP_ACCRUAL_ENABLED === 'true',

  // Phase 3: Enable feed ranking with low weight
  affects_feed: process.env.REP_AFFECTS_FEED === 'true',
  feed_weight_gamma: parseFloat(process.env.REP_FEED_GAMMA || '0.1'), // Start low

  // Phase 4: Enable reply ranking
  affects_replies: process.env.REP_AFFECTS_REPLIES === 'true',

  // Admin override
  force_disable: process.env.REP_FORCE_DISABLE === 'true'
};

// Usage in code
if (REPUTATION_FLAGS.accrual_enabled && !REPUTATION_FLAGS.force_disable) {
  await grantReputation(userId, delta, reason);
}

if (REPUTATION_FLAGS.affects_feed) {
  feedScore += REPUTATION_FLAGS.feed_weight_gamma * authorRepBoost;
}
```

**Rollout Timeline:**

| Phase | Duration | Actions | Metrics to Watch |
|-------|----------|---------|------------------|
| **Phase 1: Backfill** | 1 day | Run backfill script, validate data | Verify no negative reps, distribution looks normal |
| **Phase 2: Accrual Only** | 1 week | Enable `accrual_enabled`, `feed_weight_gamma=0.05` | Monitor event creation rate, DB load, rep distribution |
| **Phase 3: Feed Impact** | 1 week | Increase `feed_weight_gamma` to 0.15 → 0.25 → 0.35 | Track feed engagement, user retention, complaints |
| **Phase 4: Reply Ranking** | Ongoing | Enable `affects_replies=true` | Monitor thread quality, reply engagement |

### 7.4 Read-After-Write Semantics

```typescript
// Ensure immediate consistency for user's own actions

async function likePost(postId: string, userId: string) {
  // 1. Grant reputation
  const { newReputation } = await grantReputation(authorId, delta, 'CLAP');

  // 2. Invalidate cache immediately
  await invalidateReputationCache(authorId);

  // 3. Return updated state
  return {
    success: true,
    new_like_count: post.like_count + 1,
    author_new_reputation: newReputation // For real-time UI update
  };
}
```

---

## 8. MONITORING & TELEMETRY

### 8.1 Key Metrics (DataDog/Grafana)

**Reputation Distribution:**
```typescript
// backend/metrics/reputationMetrics.ts

import StatsD from 'node-statsd';
const statsd = new StatsD({ host: 'localhost', port: 8125 });

// Emit every hour
cron.schedule('0 * * * *', async () => {
  const stats = await db.users.aggregate({
    _avg: { reputation: true },
    _min: { reputation: true },
    _max: { reputation: true },
    _count: true
  });

  // Percentiles
  const percentiles = await db.$queryRaw`
    SELECT
      PERCENTILE_CONT(0.10) WITHIN GROUP (ORDER BY reputation) as p10,
      PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY reputation) as p50,
      PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY reputation) as p90,
      PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY reputation) as p99
    FROM users
  `;

  statsd.gauge('reputation.avg', stats._avg.reputation);
  statsd.gauge('reputation.p10', percentiles[0].p10);
  statsd.gauge('reputation.p50', percentiles[0].p50);
  statsd.gauge('reputation.p90', percentiles[0].p90);
  statsd.gauge('reputation.p99', percentiles[0].p99);

  // Gini coefficient (inequality measure)
  const gini = await calculateGini();
  statsd.gauge('reputation.gini', gini);
});

// Gini coefficient calculation
async function calculateGini(): Promise<number> {
  const users = await db.users.findAll({
    select: { reputation: true },
    orderBy: { reputation: 'asc' }
  });

  const n = users.length;
  let numerator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (2 * (i + 1) - n - 1) * users[i].reputation;
  }

  const totalRep = users.reduce((sum, u) => sum + u.reputation, 0);
  return numerator / (n * totalRep);
}
```

**Event Metrics:**
```typescript
// Track event creation rates
statsd.increment('reputation.event.created', 1, { reason: 'CLAP' });
statsd.increment('reputation.event.created', 1, { reason: 'GIVEREP' });

// Track ignored events (caps/abuse)
statsd.increment('reputation.event.ignored', 1, {
  reason: 'daily_cap_exceeded',
  event_type: 'CLAP'
});

// Track abuse detections
statsd.increment('reputation.abuse.detected', 1, {
  abuse_type: 'burst_pattern'
});
```

**Growth Metrics:**
```typescript
// Daily gainers/losers
cron.schedule('0 0 * * *', async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const gainers = await db.users.count({
    where: {
      reputation_updated_at: { gte: yesterday },
      reputation: { gt: db.raw('reputation - 0.1') } // Gained rep
    }
  });

  statsd.gauge('reputation.daily.gainers', gainers);
});

// Time to milestone
const milestones = [200, 400, 600, 800, 1000];
for (const milestone of milestones) {
  const users = await db.users.findAll({
    where: {
      reputation: { gte: milestone, lt: milestone + 10 },
      created_at: { gte: new Date('2025-01-01') } // Since rep launch
    }
  });

  for (const user of users) {
    const daysToMilestone = daysBetween(user.created_at, new Date());
    statsd.histogram(`reputation.time_to_milestone.${milestone}`, daysToMilestone);
  }
}
```

### 8.2 Alerting Rules

```yaml
# prometheus/alerts/reputation.yml

groups:
  - name: reputation_alerts
    interval: 5m
    rules:
      - alert: ReputationSpikeDetected
        expr: rate(reputation_event_created_total{reason="GIVEREP"}[5m]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Unusual spike in GiveRep events"
          description: "{{ $value }} GiveRep events/sec (threshold: 10)"

      - alert: HighAbuseDetectionRate
        expr: rate(reputation_abuse_detected_total[1h]) > 5
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "High abuse detection rate"
          description: "{{ $value }} abuse patterns detected in last hour"

      - alert: ReputationDatabaseLag
        expr: (time() - reputation_db_last_update_timestamp) > 300
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Reputation DB updates lagging"
          description: "Last update was {{ $value }}s ago"

      - alert: ShadowBannedUsersHigh
        expr: count(users_shadow_banned == 1) > 100
        for: 30m
        labels:
          severity: warning
        annotations:
          summary: "Unusually high shadow-ban count"
          description: "{{ $value }} users currently shadow-banned"
```

### 8.3 Logging Strategy

```typescript
// backend/utils/reputationLogger.ts

import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'reputation-service' },
  transports: [
    new winston.transports.File({ filename: 'reputation-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'reputation-combined.log' }),
  ]
});

// Structured logging for audit
export function logReputationEvent(event: {
  type: 'GRANT' | 'PENALTY' | 'DECAY';
  userId: string;
  delta: number;
  reason: string;
  metadata?: any;
}) {
  logger.info('reputation_event', {
    ...event,
    timestamp: new Date().toISOString(),
    source: 'reputation_service'
  });
}

// Example usage
logReputationEvent({
  type: 'GRANT',
  userId: 'user123',
  delta: 1.5,
  reason: 'CLAP',
  metadata: { giver_id: 'user456', content_id: 'post789' }
});
```

---

## 9. TESTING STRATEGY

### 9.1 Unit Tests

```typescript
// backend/__tests__/reputation.test.ts

describe('Reputation Weight Calculation', () => {
  test('calculates weight correctly for various rep values', () => {
    expect(calculateWeight(100)).toBeCloseTo(0.316, 2);
    expect(calculateWeight(400)).toBeCloseTo(0.632, 2);
    expect(calculateWeight(900)).toBeCloseTo(0.949, 2);
    expect(calculateWeight(1)).toBeCloseTo(0.0316, 3);
  });

  test('shadow-banned user has zero weight', () => {
    const user = { reputation: 500, shadow_banned: true };
    expect(calculateActorWeight(user)).toBe(0);
  });
});

describe('Decay Function', () => {
  test('applies correct half-life decay', () => {
    const BASELINE = 100;
    const DECAY_FACTOR = 0.9772;

    const initial = 600;
    const expected = BASELINE + ((initial - BASELINE) * DECAY_FACTOR);

    expect(applyDecay(initial)).toBeCloseTo(expected, 2);
  });

  test('does not decay reputation below baseline', () => {
    expect(applyDecay(100)).toBe(100);
    expect(applyDecay(50)).toBe(50); // Already below, no decay
  });
});

describe('Streak Multiplier', () => {
  test('applies correct multiplier for streaks >= 3', () => {
    expect(calculateStreakMultiplier(2)).toBe(1.0); // No bonus
    expect(calculateStreakMultiplier(3)).toBe(1.06);
    expect(calculateStreakMultiplier(10)).toBe(1.2);
    expect(calculateStreakMultiplier(30)).toBe(1.5); // Capped
  });
});

describe('Daily Cap Enforcement', () => {
  test('blocks events when daily cap reached', async () => {
    const userId = 'user123';
    const reason = 'CLAP';
    const cap = 50;

    // Mock 50 existing events today
    jest.spyOn(db.reputationEvents, 'count').mockResolvedValue(50);

    const canGrant = await checkDailyCap(userId, reason, cap);
    expect(canGrant).toBe(false);
  });
});
```

### 9.2 Integration Tests

```typescript
// backend/__tests__/integration/reputation-flow.test.ts

describe('Clap Flow (End-to-End)', () => {
  let testGiver, testAuthor, testPost;

  beforeEach(async () => {
    testGiver = await createTestUser({ reputation: 400 });
    testAuthor = await createTestUser({ reputation: 100 });
    testPost = await createTestPost({ user_id: testAuthor.id });
  });

  test('grants reputation on unique clap', async () => {
    const response = await request(app)
      .post(`/api/snaps/posts/${testPost.id}/like`)
      .send({ userId: testGiver.id })
      .expect(200);

    // Verify author gained rep
    const updatedAuthor = await db.users.findOne({ where: { id: testAuthor.id } });
    const expectedDelta = 1.2 * (Math.sqrt(400) / Math.sqrt(1000));

    expect(updatedAuthor.reputation).toBeCloseTo(100 + expectedDelta, 2);

    // Verify event created
    const event = await db.reputationEvents.findOne({
      where: { user_id: testAuthor.id, reason: 'CLAP' }
    });
    expect(event).toBeTruthy();
    expect(event.metadata.giver_id).toBe(testGiver.id);
  });

  test('rejects duplicate clap on same day', async () => {
    // First clap
    await request(app)
      .post(`/api/snaps/posts/${testPost.id}/like`)
      .send({ userId: testGiver.id })
      .expect(200);

    // Second clap (same day)
    await request(app)
      .post(`/api/snaps/posts/${testPost.id}/like`)
      .send({ userId: testGiver.id })
      .expect(409); // Conflict
  });

  test('enforces daily cap', async () => {
    // Create 50 clap events for author today
    for (let i = 0; i < 50; i++) {
      const clapper = await createTestUser({ reputation: 200 });
      await db.reputationEvents.create({
        user_id: testAuthor.id,
        delta: 0.5,
        reason: 'CLAP',
        metadata: { giver_id: clapper.id }
      });
    }

    // 51st clap should be ignored
    const response = await request(app)
      .post(`/api/snaps/posts/${testPost.id}/like`)
      .send({ userId: testGiver.id })
      .expect(429); // Too Many Requests

    expect(response.body.error).toContain('daily cap');
  });
});

describe('GiveRep Flow', () => {
  test('enforces daily quota for endorser', async () => {
    const endorser = await createTestUser({ reputation: 500 });
    const targets = await Promise.all([...Array(6)].map(() => createTestUser()));

    // Use up quota (5)
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post(`/api/snaps/users/${targets[i].id}/giverep`)
        .send({ endorserId: endorser.id })
        .expect(200);
    }

    // 6th should fail
    await request(app)
      .post(`/api/snaps/users/${targets[5].id}/giverep`)
      .send({ endorserId: endorser.id })
      .expect(429);
  });
});
```

### 9.3 Property-Based Tests

```typescript
// backend/__tests__/property/reputation-invariants.test.ts

import fc from 'fast-check';

describe('Reputation System Invariants', () => {
  test('reputation always stays within [0, 1000]', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1000 }), // Initial rep
        fc.float({ min: -100, max: 100 }), // Delta
        (initialRep, delta) => {
          const finalRep = clampReputation(initialRep + delta);
          expect(finalRep).toBeGreaterThanOrEqual(0);
          expect(finalRep).toBeLessThanOrEqual(1000);
        }
      )
    );
  });

  test('weight function is monotonic (higher rep → higher weight)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1, max: 999 }),
        fc.float({ min: 1, max: 999 }),
        (rep1, rep2) => {
          if (rep1 < rep2) {
            expect(calculateWeight(rep1)).toBeLessThan(calculateWeight(rep2));
          }
        }
      )
    );
  });

  test('decay never increases reputation', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 100, max: 1000 }),
        (initialRep) => {
          const decayed = applyDecay(initialRep);
          expect(decayed).toBeLessThanOrEqual(initialRep);
        }
      )
    );
  });
});
```

### 9.4 Load Testing

```typescript
// backend/__tests__/load/reputation-load.test.ts

import { check } from 'k6';
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Sustained load
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% under 500ms
    http_req_failed: ['rate<0.01'],   // <1% errors
  },
};

export default function () {
  const userId = `load_user_${__VU}_${__ITER}`;
  const postId = `load_post_${Math.floor(Math.random() * 1000)}`;

  // Simulate clap
  const res = http.post(
    `${__ENV.API_URL}/api/snaps/posts/${postId}/like`,
    JSON.stringify({ userId }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(res, {
    'status is 200 or 409': (r) => [200, 409].includes(r.status),
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}

// Run: k6 run --env API_URL=https://server.blazeswap.io backend/__tests__/load/reputation-load.test.ts
```

---

## 10. TUNING PLAYBOOK

### 10.1 Configuration Management

```typescript
// backend/config/reputation.config.ts

export interface ReputationConfig {
  constants: {
    CLAP_BASE: number;
    REPLY_BASE: number;
    REMIX_BASE: number;
    AUTHORITY_DRIP: number;
    GIVEREP_BASE: number;
  };
  caps: {
    CAP_CLAPS_DAY: number;
    CAP_REPLIES_DAY: number;
    CAP_GIVEREP_DAY: number;
    CAP_AUTHORITY_DAY: number;
  };
  system: {
    K_CROWD_THRESHOLD: number;
    Q_ENDORSE_DAILY: number;
    HALF_LIFE_DAYS: number;
    BASELINE: number;
  };
  ranking: {
    alpha: number; // Clap weight in feed
    beta: number;  // Reply weight in feed
    gamma: number; // Author rep weight in feed
    delta: number; // Age penalty
  };
}

// Load from environment or config service
export const REPUTATION_CONFIG: ReputationConfig = {
  constants: {
    CLAP_BASE: parseFloat(process.env.REP_CLAP_BASE || '1.2'),
    REPLY_BASE: parseFloat(process.env.REP_REPLY_BASE || '2.0'),
    REMIX_BASE: parseFloat(process.env.REP_REMIX_BASE || '3.0'),
    AUTHORITY_DRIP: parseFloat(process.env.REP_AUTHORITY_DRIP || '0.8'),
    GIVEREP_BASE: parseFloat(process.env.REP_GIVEREP_BASE || '2.5'),
  },
  caps: {
    CAP_CLAPS_DAY: parseInt(process.env.REP_CAP_CLAPS_DAY || '50'),
    CAP_REPLIES_DAY: parseInt(process.env.REP_CAP_REPLIES_DAY || '30'),
    CAP_GIVEREP_DAY: parseInt(process.env.REP_CAP_GIVEREP_DAY || '15'),
    CAP_AUTHORITY_DAY: parseInt(process.env.REP_CAP_AUTHORITY_DAY || '10'),
  },
  system: {
    K_CROWD_THRESHOLD: parseInt(process.env.REP_K_THRESHOLD || '3'),
    Q_ENDORSE_DAILY: parseInt(process.env.REP_Q_ENDORSE || '5'),
    HALF_LIFE_DAYS: parseInt(process.env.REP_HALF_LIFE_DAYS || '30'),
    BASELINE: parseInt(process.env.REP_BASELINE || '100'),
  },
  ranking: {
    alpha: parseFloat(process.env.REP_RANKING_ALPHA || '0.3'),
    beta: parseFloat(process.env.REP_RANKING_BETA || '0.25'),
    gamma: parseFloat(process.env.REP_RANKING_GAMMA || '0.35'),
    delta: parseFloat(process.env.REP_RANKING_DELTA || '0.1'),
  },
};
```

### 10.2 Simulation Script

```typescript
// scripts/simulate-reputation-week.ts

interface SimulationConfig {
  numUsers: number;
  daysToSimulate: number;
  avgPostsPerUserPerDay: number;
  avgInteractionsPerPost: number;
}

async function simulateReputationWeek(config: SimulationConfig) {
  console.log('Starting reputation simulation...\n');

  // Create test users with varied initial rep
  const users = [...Array(config.numUsers)].map((_, i) => ({
    id: `sim_user_${i}`,
    reputation: 100 + (Math.random() * 200), // 100-300 initial
    posts: []
  }));

  const results: any[] = [];

  for (let day = 1; day <= config.daysToSimulate; day++) {
    console.log(`\n=== Day ${day} ===`);

    // Users create posts
    for (const user of users) {
      const postsToday = Math.floor(Math.random() * config.avgPostsPerUserPerDay);

      for (let p = 0; p < postsToday; p++) {
        const post = { id: `post_${user.id}_${day}_${p}`, author: user };
        user.posts.push(post);

        // Authority drip
        user.reputation += 0.8;

        // Simulate interactions
        const interactionCount = Math.floor(Math.random() * config.avgInteractionsPerPost);

        for (let i = 0; i < interactionCount; i++) {
          const actor = users[Math.floor(Math.random() * users.length)];
          if (actor.id === user.id) continue;

          const weight = Math.sqrt(actor.reputation) / Math.sqrt(1000);
          const delta = 1.2 * weight; // CLAP_BASE

          user.reputation += delta;
        }
      }
    }

    // Apply decay
    for (const user of users) {
      const excess = user.reputation - 100;
      if (excess > 0) {
        user.reputation = 100 + (excess * 0.9772);
      }
    }

    // Record distribution
    const repValues = users.map(u => u.reputation).sort((a, b) => a - b);
    const p50 = repValues[Math.floor(users.length * 0.5)];
    const p90 = repValues[Math.floor(users.length * 0.9)];

    results.push({
      day,
      avg: repValues.reduce((s, v) => s + v, 0) / users.length,
      p50,
      p90,
      max: repValues[repValues.length - 1]
    });

    console.log(`Avg rep: ${results[day - 1].avg.toFixed(1)}, P50: ${p50.toFixed(1)}, P90: ${p90.toFixed(1)}`);
  }

  // Output CSV
  console.log('\n\n=== Results (CSV) ===');
  console.log('day,avg,p50,p90,max');
  results.forEach(r => {
    console.log(`${r.day},${r.avg.toFixed(2)},${r.p50.toFixed(2)},${r.p90.toFixed(2)},${r.max.toFixed(2)}`);
  });

  // Gini coefficient
  const totalRep = users.reduce((s, u) => s + u.reputation, 0);
  let giniNumerator = 0;
  users.sort((a, b) => a.reputation - b.reputation);
  for (let i = 0; i < users.length; i++) {
    giniNumerator += (2 * (i + 1) - users.length - 1) * users[i].reputation;
  }
  const gini = giniNumerator / (users.length * totalRep);
  console.log(`\nGini Coefficient: ${gini.toFixed(3)} (0 = perfect equality, 1 = perfect inequality)`);
}

// Run: npm run simulate-reputation
simulateReputationWeek({
  numUsers: 1000,
  daysToSimulate: 7,
  avgPostsPerUserPerDay: 3,
  avgInteractionsPerPost: 10
});
```

### 10.3 Tuning Procedure

**Step 1: Establish Baseline**
```bash
# Before any changes
npm run simulate-reputation > baseline_results.csv
```

**Step 2: Adjust Constants**
```bash
# Example: Increase clap value
export REP_CLAP_BASE=1.5  # Was 1.2
npm run simulate-reputation > test_clap_1.5.csv
```

**Step 3: Compare Distributions**
```python
# scripts/compare_distributions.py

import pandas as pd
import matplotlib.pyplot as plt

baseline = pd.read_csv('baseline_results.csv')
test = pd.read_csv('test_clap_1.5.csv')

plt.figure(figsize=(12, 6))
plt.plot(baseline['day'], baseline['p90'], label='Baseline P90', marker='o')
plt.plot(test['day'], test['p90'], label='Test (CLAP=1.5) P90', marker='s')
plt.xlabel('Day')
plt.ylabel('P90 Reputation')
plt.legend()
plt.title('Reputation P90 Comparison')
plt.savefig('comparison.png')
print('Chart saved to comparison.png')
```

**Step 4: A/B Test in Production**
```typescript
// backend/services/reputationService.ts

const isTestGroup = (userId: string) => {
  return parseInt(userId.slice(-1), 16) % 10 < 3; // 30% test group
};

function getClapBase(userId: string): number {
  if (isTestGroup(userId)) {
    return parseFloat(process.env.REP_CLAP_BASE_TEST || '1.5');
  }
  return parseFloat(process.env.REP_CLAP_BASE || '1.2');
}
```

**Step 5: Monitor & Decide**
```sql
-- Compare groups after 1 week
SELECT
  CASE WHEN (id::text::bit(64)::bigint % 10) < 3 THEN 'test' ELSE 'control' END as group,
  AVG(reputation) as avg_rep,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY reputation) as p90_rep
FROM users
WHERE reputation_updated_at >= NOW() - INTERVAL '7 days'
GROUP BY group;
```

**Step 6: Gradual Rollout**
```bash
# If test succeeds, gradually increase adoption
export REP_CLAP_BASE=1.5
# Restart backend (blue-green deployment)

# Monitor for 24h, then commit if stable
```

### 10.4 Dashboard Configuration

```typescript
// backend/routes/admin/reputation-dashboard.ts

app.get('/admin/reputation/stats', requireAdmin, async (req, res) => {
  const [distribution, eventRates, abuseStats] = await Promise.all([
    db.$queryRaw`
      SELECT
        COUNT(*) as total_users,
        AVG(reputation) as avg_rep,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY reputation) as median_rep,
        PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY reputation) as p90_rep,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY reputation) as p99_rep
      FROM users
    `,

    db.$queryRaw`
      SELECT
        reason,
        COUNT(*) as event_count,
        SUM(delta) as total_delta
      FROM reputation_events
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY reason
    `,

    db.$queryRaw`
      SELECT
        COUNT(*) as abuse_events,
        SUM(delta) as total_penalties
      FROM reputation_events
      WHERE reason = 'PENALTY'
        AND created_at >= NOW() - INTERVAL '24 hours'
    `
  ]);

  res.json({
    distribution: distribution[0],
    eventRates,
    abuseStats: abuseStats[0],
    config: REPUTATION_CONFIG // Current settings
  });
});
```

---

## 11. IMPLEMENTATION CHECKLIST

### 11.1 Phase 1: Database Setup (PR #1)

- [ ] **Database Migration**
  - [ ] Create migration file `001_add_reputation_system.sql`
  - [ ] Add columns to `users` table
  - [ ] Create `reputation_events` table with indexes
  - [ ] Create `daily_actor_budgets` table
  - [ ] Create `user_streaks` table
  - [ ] Create `content_feedback_stats` table
  - [ ] Create deduplication tables (`clap_dedup`, `giverep_dedup`)
  - [ ] Run migration in staging environment
  - [ ] Validate schema with `DESCRIBE` queries

- [ ] **Backfill Script**
  - [ ] Write `scripts/backfill-reputation.ts`
  - [ ] Test on subset of users (100)
  - [ ] Validate output (no negative reps, distribution looks normal)
  - [ ] Run full backfill in staging
  - [ ] Create `BACKFILL` events in `reputation_events`

- [ ] **Testing**
  - [ ] Unit tests for SQL queries
  - [ ] Integration test: Verify migration rollback works
  - [ ] Load test: Measure query performance on large tables

### 11.2 Phase 2: Core Reputation Service (PR #2)

- [ ] **Reputation Service Implementation**
  - [ ] Create `backend/services/reputationService.ts`
  - [ ] Implement `calculateWeight(user)` function
  - [ ] Implement `grantReputation(userId, delta, reason, metadata)` function
  - [ ] Implement `applyDecay(reputation)` function
  - [ ] Implement `calculateStreakMultiplier(days)` function
  - [ ] Implement daily cap checking logic
  - [ ] Implement Redis deduplication (clap, giverep)

- [ ] **Event Handlers**
  - [ ] Modify `POST /posts/:id/like` to grant CLAP reputation
  - [ ] Modify `POST /posts/:id/comment` to grant REPLY reputation (with crowd logic)
  - [ ] Modify `POST /posts/:id/retweet` to grant REMIX reputation
  - [ ] Create new `POST /users/:id/giverep` endpoint
  - [ ] Modify `POST /posts` to grant AUTHORITY_DRIP (conditional)

- [ ] **Cache Layer**
  - [ ] Implement `getAuthorReputation(userId)` with Redis cache
  - [ ] Implement `invalidateReputationCache(userId)` after updates
  - [ ] Set up Redis key expiration (5min for rep, 24h for dedup)

- [ ] **Testing**
  - [ ] Unit tests for all core functions (see section 9.1)
  - [ ] Integration tests for each event flow (see section 9.2)
  - [ ] Property-based tests for invariants (see section 9.3)
  - [ ] Test shadow-ban enforcement (zero weight)

### 11.3 Phase 3: Cron Jobs & Automation (PR #3)

- [ ] **Nightly Decay Job**
  - [ ] Create `backend/jobs/nightly-decay.ts`
  - [ ] Implement decay logic (half-life 30 days)
  - [ ] Implement streak bonus application
  - [ ] Update `user_streaks` table
  - [ ] Add error handling and retry logic
  - [ ] Schedule with node-cron: `0 0 * * *` (00:00 UTC)

- [ ] **Daily Budget Reset Job**
  - [ ] Create `backend/jobs/reset-daily-budgets.ts`
  - [ ] Clean up old `daily_actor_budgets` records (>7 days)
  - [ ] Expire Redis dedup keys
  - [ ] Schedule with node-cron: `1 0 * * *` (00:01 UTC)

- [ ] **Monitoring Cron**
  - [ ] Create `backend/jobs/reputation-metrics.ts`
  - [ ] Emit distribution metrics (avg, p10, p50, p90, p99)
  - [ ] Calculate Gini coefficient
  - [ ] Track event rates, abuse stats
  - [ ] Schedule hourly: `0 * * * *`

- [ ] **Testing**
  - [ ] Test decay on synthetic data
  - [ ] Verify streak bonuses calculated correctly
  - [ ] Test budget reset clears Redis keys
  - [ ] Load test: Run decay on 10k users, measure time

### 11.4 Phase 4: Anti-Spam & Abuse (PR #4)

- [ ] **Abuse Detection**
  - [ ] Implement `detectBurstAbuse(targetUserId)` function
  - [ ] Create penalty event reversal logic
  - [ ] Implement shadow-ban auto-trigger (threshold: 3 burst detections)
  - [ ] Add monitoring alerts (section 8.2)

- [ ] **Rate Limiting**
  - [ ] Add rate limiter middleware (10 actions/min per user)
  - [ ] Apply to all rep-granting endpoints

- [ ] **Admin Tools**
  - [ ] Create `POST /admin/users/:id/shadow-ban` endpoint
  - [ ] Create `POST /admin/users/:id/reset-reputation` endpoint
  - [ ] Add audit logging for admin actions

- [ ] **Testing**
  - [ ] Simulate burst attack (20 claps in 1 min from 2 users)
  - [ ] Verify penalties applied correctly
  - [ ] Test shadow-ban user has zero weight
  - [ ] Integration test: Rate limiter blocks excessive requests

### 11.5 Phase 5: Feed & Reply Ranking (PR #5)

- [ ] **Feed Ranking Service**
  - [ ] Create `backend/services/feedRanking.ts`
  - [ ] Implement `calculateFeedScore(post, authorRep, config)`
  - [ ] Modify `GET /feed/foryou` to use enhanced ranking
  - [ ] Add feature flag: `REP_AFFECTS_FEED`
  - [ ] Start with `gamma=0.1`, gradually increase to `0.35`

- [ ] **Reply Ranking Service**
  - [ ] Create `backend/services/replyRanking.ts`
  - [ ] Implement `calculateReplyScore(reply, authorRep)`
  - [ ] Modify `GET /posts/:id/comments` to sort by rep-score
  - [ ] Add feature flag: `REP_AFFECTS_REPLIES`

- [ ] **Content Feedback Aggregates**
  - [ ] Background job to update `content_feedback_stats` table
  - [ ] Calculate `unique_clappers`, `unique_repliers`, `total_weighted_claps`
  - [ ] Cache aggregates (TTL: 10min)

- [ ] **Testing**
  - [ ] A/B test: Compare feed engagement with/without rep (30% test group)
  - [ ] Measure feed diversity (don't over-promote high-rep users)
  - [ ] Verify reply ordering prioritizes high-rep + high-engagement

### 11.6 Phase 6: Frontend Integration (PR #6)

- [ ] **Reputation Context**
  - [ ] Create `app/Context/ReputationContext.tsx`
  - [ ] Add state for user reputation scores
  - [ ] Implement cache (in-memory, 5min TTL)

- [ ] **API Service Updates**
  - [ ] Add `getReputation(userId)` to `app/lib/api.ts`
  - [ ] Add `giveReputation(targetUserId)` endpoint wrapper
  - [ ] Modify `likePost`, `retweetPost` to handle rep updates

- [ ] **UI Components** (Optional: Rep display)
  - [ ] Add reputation badge to user profiles (if visible)
  - [ ] Add "Give Rep" button (community endorsement)
  - [ ] Show reputation score in hover cards (if enabled)

- [ ] **Types**
  - [ ] Extend `User` type in `app/types/api.ts` with `reputation` field
  - [ ] Add `ReputationEvent` type
  - [ ] Add `GiveRepRequest`, `GiveRepResponse` types

- [ ] **Testing**
  - [ ] E2E test: Like a post, verify UI updates (if rep visible)
  - [ ] Test GiveRep button (daily quota enforcement)
  - [ ] Verify feed order changes with rep-based ranking

### 11.7 Phase 7: Monitoring & Tuning (PR #7)

- [ ] **Metrics & Dashboards**
  - [ ] Set up DataDog/Grafana dashboards (section 8.1)
  - [ ] Configure alerts (section 8.2)
  - [ ] Enable structured logging (section 8.3)

- [ ] **Admin Dashboard**
  - [ ] Create `GET /admin/reputation/stats` endpoint
  - [ ] Build simple frontend view (React/Next.js)
  - [ ] Display distribution, event rates, abuse stats
  - [ ] Add controls to adjust config constants

- [ ] **Simulation & Tuning**
  - [ ] Run `simulate-reputation-week.ts` script
  - [ ] Compare distributions with production data
  - [ ] A/B test constant adjustments (e.g., `CLAP_BASE=1.5`)
  - [ ] Document tuning results in playbook

- [ ] **Testing**
  - [ ] Load test: 1000 concurrent users for 10 min
  - [ ] Verify metrics emit correctly
  - [ ] Test alert triggers (manually spike abuse events)

---

## 12. EDGE CASES & SOLUTIONS

### 12.1 Deleted Content

**Problem:** User clapped post, post gets deleted, rep event orphaned

**Solution:**
```typescript
// Soft-delete posts, keep for 30 days
await db.posts.update({
  where: { id: postId },
  data: { deleted_at: new Date(), deleted_by: userId }
});

// Reputation events remain valid (historical record)
// No need to reverse past rep gains
```

### 12.2 Private Profiles

**Problem:** Private user's rep shouldn't influence public feed

**Solution:**
```typescript
// Filter out private users from feed ranking
const publicPosts = await db.posts.findAll({
  where: {
    user: { is_private: false }
  }
});

// Or: Apply zero weight to private users in ranking
const authorBoost = user.is_private ? 0 : Math.pow(user.reputation, 0.35);
```

### 12.3 Blocked Users

**Problem:** Blocked user claps victim's post

**Solution:**
```typescript
// Check block status before granting rep
const isBlocked = await db.blocks.findOne({
  where: {
    blocker_id: authorId,
    blocked_id: giverId
  }
});

if (isBlocked) {
  return { success: true, message: 'Like recorded' }; // Silent ignore
}
```

### 12.4 Moderation Actions

**Problem:** Moderator deletes spam post, should reverse rep gains

**Solution:**
```typescript
async function moderatePost(postId: string, action: 'delete' | 'flag') {
  const post = await db.posts.findOne({ where: { id: postId } });

  if (action === 'delete') {
    // Reverse all rep gains from this post
    const events = await db.reputationEvents.findAll({
      where: {
        metadata: { content_id: postId },
        reason: { in: ['CLAP', 'REPLY', 'REMIX'] }
      }
    });

    for (const event of events) {
      await grantReputation(event.user_id, -event.delta, 'PENALTY', {
        moderation_action: 'spam_removal',
        original_event_id: event.id
      });
    }

    // Delete post
    await db.posts.delete({ where: { id: postId } });
  }
}
```

### 12.5 Timezone Handling

**Problem:** dayKey calculation inconsistent across timezones

**Solution:**
```typescript
// Always use UTC for dayKey
function getDayKey(): string {
  return new Date().toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD in UTC
}

// Store all timestamps as UTC in DB (default TIMESTAMP behavior)
```

### 12.6 Clock Skew

**Problem:** Client clock ahead/behind, duplicate claps detected incorrectly

**Solution:**
```typescript
// Use server time exclusively
// Never trust client-provided timestamps for deduplication

const serverNow = new Date(); // Server time
const dayKey = getDayKey(); // Server-calculated

// Client timestamps only for display/sorting, not logic
```

### 12.7 Replayed Webhooks

**Problem:** External webhook triggers rep grant twice (e.g., payment confirmation)

**Solution:**
```typescript
// Idempotency keys
async function handleWebhook(payload: any, idempotencyKey: string) {
  const existing = await redis.get(`webhook:${idempotencyKey}`);
  if (existing) {
    return JSON.parse(existing); // Return cached response
  }

  const result = await processWebhook(payload);

  await redis.setex(`webhook:${idempotencyKey}`, 3600, JSON.stringify(result));
  return result;
}
```

### 12.8 Reputation Overflow

**Problem:** Extremely active user hits rep cap (1000) too easily

**Solution:**
```typescript
// Soft cap with diminishing returns above 800
function applySoftCap(delta: number, currentRep: number): number {
  if (currentRep >= 800) {
    const overage = currentRep - 800;
    const dampening = Math.exp(-overage / 200); // Exponential decay
    return delta * dampening;
  }
  return delta;
}

// Example:
// rep=850, delta=10 → delta*exp(-50/200) = 10*0.78 = 7.8
// rep=950, delta=10 → delta*exp(-150/200) = 10*0.47 = 4.7
```

---

## 13. MIGRATION FROM EXISTING KARMA (If Applicable)

**Check:** Does Clapo already have a `karma`, `score`, or `points` system?

```sql
-- Check existing columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name LIKE '%karma%' OR column_name LIKE '%score%' OR column_name LIKE '%point%';
```

**If YES:**

**Option A: Reuse & Extend (Minimal Diff)**
```sql
-- Rename existing karma to reputation
ALTER TABLE users RENAME COLUMN karma TO reputation;

-- Ensure type is correct (DECIMAL)
ALTER TABLE users ALTER COLUMN reputation TYPE DECIMAL(7,2);

-- Add missing columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS abuse_flags JSONB DEFAULT '{}';
-- ... (rest of schema)
```

**Option B: Parallel Run & Migrate**
```sql
-- Keep old karma, add new reputation
ALTER TABLE users ADD COLUMN reputation DECIMAL(7,2) DEFAULT 100.00;

-- Copy karma to reputation (one-time)
UPDATE users SET reputation = LEAST(karma * 0.5, 500); -- Scale down if karma > 1000

-- Phase out karma after 30 days
ALTER TABLE users DROP COLUMN karma;
```

**Recommendation:** Use Option A if existing karma is unused/minimal. Use Option B if karma is actively displayed in UI.

---

## 14. ROLLBACK PLAN

**Scenario:** Critical bug detected, need to disable reputation system

**Step 1: Immediate Disable (Feature Flag)**
```bash
# Set emergency flag
export REP_FORCE_DISABLE=true

# Restart backend (blue-green, zero downtime)
kubectl rollout restart deployment/backend
```

**Step 2: Revert Feed Ranking**
```typescript
// backend/services/feedRanking.ts

if (REPUTATION_FLAGS.force_disable) {
  // Fall back to old ranking (engagement-only)
  return posts.sort((a, b) => b.like_count - a.like_count);
}
```

**Step 3: Pause Accrual**
```typescript
// backend/services/reputationService.ts

export async function grantReputation(...) {
  if (REPUTATION_FLAGS.force_disable) {
    logger.warn('Reputation disabled, skipping grant');
    return;
  }
  // ... normal logic
}
```

**Step 4: Database Rollback (Nuclear Option)**
```sql
-- Only if data corruption detected
BEGIN;

-- Drop new tables
DROP TABLE IF EXISTS reputation_events;
DROP TABLE IF EXISTS daily_actor_budgets;
DROP TABLE IF EXISTS user_streaks;
DROP TABLE IF EXISTS content_feedback_stats;
DROP TABLE IF EXISTS clap_dedup;
DROP TABLE IF EXISTS giverep_dedup;

-- Remove columns from users
ALTER TABLE users DROP COLUMN IF EXISTS reputation;
ALTER TABLE users DROP COLUMN IF EXISTS reputation_updated_at;
ALTER TABLE users DROP COLUMN IF EXISTS abuse_flags;
ALTER TABLE users DROP COLUMN IF EXISTS shadow_banned;

COMMIT;
```

**Recovery Time Objective (RTO):** < 5 minutes (feature flag toggle)

---

## 15. SUCCESS METRICS (Post-Launch)

Track these KPIs to validate reputation system impact:

| Metric | Baseline (Pre-Rep) | Target (Post-Rep) | Measurement |
|--------|-------------------|-------------------|-------------|
| **Feed Engagement** | | | |
| - Avg time on feed | X min | X + 15% | Analytics |
| - Posts clicked | Y per session | Y + 20% | Analytics |
| - Comments per post | Z | Z + 10% | DB query |
| **Content Quality** | | | |
| - Spam reports | A per day | A - 30% | Moderation logs |
| - High-quality posts (mod score >8) | B per day | B + 25% | Manual review |
| **User Retention** | | | |
| - 7-day retention | C% | C + 5% | Analytics |
| - DAU/MAU ratio | D | D + 0.05 | Analytics |
| **Reputation Distribution** | | | |
| - Gini coefficient | N/A | < 0.6 | SQL query |
| - % users >400 rep | 0% | 20% | SQL query |

**Review Cadence:**
- Daily: Event rates, abuse detections
- Weekly: Distribution metrics, engagement lift
- Monthly: Retention, quality scores, Gini coefficient

---

## 16. REFERENCES & INTEGRATION POINTS

### 16.1 Existing Codebase Files to Modify

| File | Changes Needed |
|------|----------------|
| `/app/lib/api.ts` | Add `getReputation()`, `giveReputation()` methods |
| `/app/Context/ApiProvider.tsx` | Integrate ReputationContext |
| `/app/types/api.ts` | Add `reputation` to `UserProfile` interface |
| Backend API routes (inferred) | Add rep logic to `/posts/:id/like`, `/posts/:id/comment`, `/posts/:id/retweet` |

### 16.2 New Files to Create

**Backend:**
- `/backend/services/reputationService.ts`
- `/backend/services/feedRanking.ts`
- `/backend/services/replyRanking.ts`
- `/backend/services/abuseDetection.ts`
- `/backend/jobs/nightly-decay.ts`
- `/backend/jobs/reset-daily-budgets.ts`
- `/backend/jobs/reputation-metrics.ts`
- `/backend/cache/reputationCache.ts`
- `/backend/routes/reputation.ts` (new GiveRep endpoint)
- `/backend/routes/admin/reputation-dashboard.ts`

**Frontend:**
- `/app/Context/ReputationContext.tsx`
- `/app/components/GiveRepButton.tsx` (optional)
- `/app/components/ReputationBadge.tsx` (optional)

**Scripts:**
- `/scripts/backfill-reputation.ts`
- `/scripts/simulate-reputation-week.ts`
- `/scripts/compare_distributions.py`

**Database:**
- `/migrations/001_add_reputation_system.sql`

**Tests:**
- `/backend/__tests__/reputation.test.ts`
- `/backend/__tests__/integration/reputation-flow.test.ts`
- `/backend/__tests__/property/reputation-invariants.test.ts`
- `/backend/__tests__/load/reputation-load.test.ts`

### 16.3 External Dependencies

**Required Packages:**
```json
{
  "backend": {
    "node-cron": "^3.0.2",
    "ioredis": "^5.3.2",
    "express-rate-limit": "^6.7.0",
    "node-statsd": "^0.1.1",
    "winston": "^3.8.2"
  },
  "testing": {
    "fast-check": "^3.15.0",
    "k6": "^0.47.0"
  },
  "scripts": {
    "pandas": "1.5.3",
    "matplotlib": "3.7.1"
  }
}
```

---

## CONCLUSION

This design provides a **complete, production-ready blueprint** for integrating a non-tradable Reputation Score system into Clapo. The system is:

✅ **Mathematically Sound:** Exact formulas with tunable constants
✅ **Anti-Spam Hardened:** Caps, deduplication, burst detection, shadow-banning
✅ **Scalable:** Redis caching, indexed DB queries, background jobs
✅ **Observable:** Metrics, alerts, logs, admin dashboard
✅ **Testable:** Unit, integration, property, load tests
✅ **Rollback-Safe:** Feature flags, gradual rollout, migration plan
✅ **Edge-Case Aware:** Handles deleted content, blocks, timezones, replays

**Next Steps:**
1. Review & approve this design doc
2. Create GitHub issues from checklist (section 11)
3. Assign PRs to engineering team
4. Begin Phase 1: Database migration & backfill

**Estimated Timeline:** 6-8 weeks (7 PRs, 1 PR/week with testing)

---

**Document Version:** 1.0
**Last Updated:** 2025-01-06
**Author:** Senior Platform Engineer (via Claude Code)
**Status:** 📋 Ready for Review
