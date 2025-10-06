-- Migration: Reputation System
-- Description: Create tables and indexes for the reputation system
-- Date: 2025-01-15

-- ============================================================================
-- 1. CREATE REPUTATION_SCORES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reputation_scores (
    user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 100 CHECK (score >= 0 AND score <= 1000),
    tier VARCHAR(20) NOT NULL DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond')),
    daily_claps_given INTEGER NOT NULL DEFAULT 0,
    daily_replies_given INTEGER NOT NULL DEFAULT 0,
    daily_givereps_sent INTEGER NOT NULL DEFAULT 0,
    daily_givereps_received INTEGER NOT NULL DEFAULT 0,
    last_decay_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    streak_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for reputation_scores
CREATE INDEX idx_reputation_scores_score ON reputation_scores(score DESC);
CREATE INDEX idx_reputation_scores_tier ON reputation_scores(tier);
CREATE INDEX idx_reputation_scores_last_decay ON reputation_scores(last_decay_at);

-- ============================================================================
-- 2. CREATE REPUTATION_EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reputation_events (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('clap', 'reply', 'remix', 'giverep_sent', 'giverep_received', 'decay')),
    points_delta INTEGER NOT NULL,
    score_after INTEGER NOT NULL,
    source_user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    ref_id VARCHAR(255),
    context TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for reputation_events
CREATE INDEX idx_reputation_events_user_id ON reputation_events(user_id, created_at DESC);
CREATE INDEX idx_reputation_events_type ON reputation_events(event_type);
CREATE INDEX idx_reputation_events_source_user ON reputation_events(source_user_id);
CREATE INDEX idx_reputation_events_created_at ON reputation_events(created_at DESC);

-- ============================================================================
-- 3. CREATE GIVEREP_TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS giverep_transactions (
    id VARCHAR(255) PRIMARY KEY,
    from_user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL CHECK (points > 0),
    context TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT no_self_giverep CHECK (from_user_id != to_user_id)
);

-- Create indexes for giverep_transactions
CREATE INDEX idx_giverep_from_user ON giverep_transactions(from_user_id, created_at DESC);
CREATE INDEX idx_giverep_to_user ON giverep_transactions(to_user_id, created_at DESC);
CREATE INDEX idx_giverep_created_at ON giverep_transactions(created_at DESC);

-- ============================================================================
-- 4. CREATE REPUTATION_DEDUP TABLE (for anti-spam)
-- ============================================================================
CREATE TABLE IF NOT EXISTS reputation_dedup (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    target_user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    ref_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_reputation_action UNIQUE (user_id, event_type, target_user_id, ref_id)
);

-- Create indexes for reputation_dedup
CREATE INDEX idx_reputation_dedup_user ON reputation_dedup(user_id, event_type, created_at DESC);
CREATE INDEX idx_reputation_dedup_cleanup ON reputation_dedup(created_at);

-- ============================================================================
-- 5. ADD REPUTATION COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add reputation columns to users table (if not exists)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS reputation_tier VARCHAR(20) DEFAULT 'Bronze';

-- Create index on users reputation
CREATE INDEX IF NOT EXISTS idx_users_reputation ON users(reputation_score DESC);

-- Add reputation columns to posts table (if not exists)
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS author_reputation INTEGER,
ADD COLUMN IF NOT EXISTS author_reputation_tier VARCHAR(20);

-- Create index on posts author reputation
CREATE INDEX IF NOT EXISTS idx_posts_author_reputation ON posts(author_reputation DESC);

-- ============================================================================
-- 6. CREATE TRIGGER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reputation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reputation_scores
DROP TRIGGER IF EXISTS reputation_scores_updated_at ON reputation_scores;
CREATE TRIGGER reputation_scores_updated_at
    BEFORE UPDATE ON reputation_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_reputation_updated_at();

-- Function to update tier based on score
CREATE OR REPLACE FUNCTION update_reputation_tier()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.score >= 800 THEN
        NEW.tier = 'Diamond';
    ELSIF NEW.score >= 600 THEN
        NEW.tier = 'Platinum';
    ELSIF NEW.score >= 400 THEN
        NEW.tier = 'Gold';
    ELSIF NEW.score >= 200 THEN
        NEW.tier = 'Silver';
    ELSE
        NEW.tier = 'Bronze';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update tier
DROP TRIGGER IF EXISTS reputation_tier_update ON reputation_scores;
CREATE TRIGGER reputation_tier_update
    BEFORE INSERT OR UPDATE OF score ON reputation_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_reputation_tier();

-- Function to sync reputation to users table
CREATE OR REPLACE FUNCTION sync_reputation_to_users()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET reputation_score = NEW.score,
        reputation_tier = NEW.tier
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync to users table
DROP TRIGGER IF EXISTS sync_reputation_to_users_trigger ON reputation_scores;
CREATE TRIGGER sync_reputation_to_users_trigger
    AFTER INSERT OR UPDATE ON reputation_scores
    FOR EACH ROW
    EXECUTE FUNCTION sync_reputation_to_users();

-- ============================================================================
-- 7. INITIALIZE REPUTATION SCORES FOR EXISTING USERS
-- ============================================================================

-- Insert initial reputation scores for all existing users
INSERT INTO reputation_scores (user_id, score, tier)
SELECT id, 100, 'Bronze'
FROM users
WHERE id NOT IN (SELECT user_id FROM reputation_scores)
ON CONFLICT (user_id) DO NOTHING;

-- Update users table with initial reputation
UPDATE users u
SET reputation_score = rs.score,
    reputation_tier = rs.tier
FROM reputation_scores rs
WHERE u.id = rs.user_id;

-- ============================================================================
-- 8. CREATE VIEWS FOR REPORTING
-- ============================================================================

-- Leaderboard view
CREATE OR REPLACE VIEW reputation_leaderboard AS
SELECT
    u.id as user_id,
    u.username,
    u.avatar_url,
    rs.score,
    rs.tier,
    rs.streak_days,
    ROW_NUMBER() OVER (ORDER BY rs.score DESC, rs.streak_days DESC) as rank
FROM reputation_scores rs
JOIN users u ON rs.user_id = u.id
ORDER BY rs.score DESC, rs.streak_days DESC;

-- User reputation summary view
CREATE OR REPLACE VIEW user_reputation_summary AS
SELECT
    rs.user_id,
    rs.score,
    rs.tier,
    rs.streak_days,
    COUNT(DISTINCT CASE WHEN re.event_type = 'clap' THEN re.id END) as total_claps_given,
    COUNT(DISTINCT CASE WHEN re.event_type = 'reply' THEN re.id END) as total_replies_given,
    COUNT(DISTINCT CASE WHEN re.event_type = 'giverep_sent' THEN re.id END) as total_givereps_sent,
    COUNT(DISTINCT CASE WHEN re.event_type = 'giverep_received' THEN re.id END) as total_givereps_received,
    SUM(CASE WHEN re.event_type != 'decay' THEN re.points_delta ELSE 0 END) as total_points_earned,
    SUM(CASE WHEN re.event_type = 'decay' THEN re.points_delta ELSE 0 END) as total_points_decayed
FROM reputation_scores rs
LEFT JOIN reputation_events re ON rs.user_id = re.user_id
GROUP BY rs.user_id, rs.score, rs.tier, rs.streak_days;

-- ============================================================================
-- ROLLBACK SCRIPT (for emergencies)
-- ============================================================================
-- To rollback this migration, run:
--
-- DROP VIEW IF EXISTS user_reputation_summary;
-- DROP VIEW IF EXISTS reputation_leaderboard;
-- DROP TRIGGER IF EXISTS sync_reputation_to_users_trigger ON reputation_scores;
-- DROP TRIGGER IF EXISTS reputation_tier_update ON reputation_scores;
-- DROP TRIGGER IF EXISTS reputation_scores_updated_at ON reputation_scores;
-- DROP FUNCTION IF EXISTS sync_reputation_to_users();
-- DROP FUNCTION IF EXISTS update_reputation_tier();
-- DROP FUNCTION IF EXISTS update_reputation_updated_at();
-- DROP TABLE IF EXISTS reputation_dedup CASCADE;
-- DROP TABLE IF EXISTS giverep_transactions CASCADE;
-- DROP TABLE IF EXISTS reputation_events CASCADE;
-- DROP TABLE IF EXISTS reputation_scores CASCADE;
-- ALTER TABLE posts DROP COLUMN IF EXISTS author_reputation_tier;
-- ALTER TABLE posts DROP COLUMN IF EXISTS author_reputation;
-- ALTER TABLE users DROP COLUMN IF EXISTS reputation_tier;
-- ALTER TABLE users DROP COLUMN IF EXISTS reputation_score;
