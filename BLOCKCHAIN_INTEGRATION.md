# Blockchain Event Listener Integration

This document explains how to integrate blockchain buy/sell events from the Monad contract into the activity feed.

## Contract Information
- **Network**: Monad
- **Contract Address**: `0xdb61267b2b233A47bf56F551528CCB93f9788C6a`
- **Purpose**: Track buy/sell events for post tokens

## Overview

The activity feed is already implemented on the frontend and displays buy/sell activities. To populate it with real blockchain data, you need to:

1. Set up the event listener on your backend
2. Process events and save them to your database
3. Serve them via the existing API endpoints

## Frontend (Already Implemented ✅)

The frontend components are ready:
- `app/snaps/Sections/ActivityFeed.tsx` - Displays activities
- `app/hooks/useActivityFeed.ts` - Fetches activities from API
- `app/lib/tokenApi.ts` - API client with endpoints:
  - `GET /activity-feed/recent?limit=20` - Get recent activity
  - `GET /activity-feed/user/{address}?limit=20` - Get user-specific activity

## Backend Integration (To Be Implemented)

### Step 1: Install Dependencies

```bash
npm install ethers
# or
yarn add ethers
```

### Step 2: Set Up Environment Variables

Add to your backend `.env` file:

```env
# Monad RPC URL
MONAD_RPC_URL=https://your-monad-rpc-url.com

# Contract address
CONTRACT_ADDRESS=0xdb61267b2b233A47bf56F551528CCB93f9788C6a

# Database connection (if not already set)
DATABASE_URL=your_database_connection_string
```

### Step 3: Create Database Tables

You need tables to store activities:

```sql
-- Activity Feed table
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- 'post_token' or 'creator_token'
  action VARCHAR(50) NOT NULL, -- 'bought', 'sold', 'claimed_freebie'
  user_address VARCHAR(42) NOT NULL,
  username VARCHAR(255),
  token_name VARCHAR(255),
  creator_name VARCHAR(255),
  token_uuid VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL,
  price_per_token DECIMAL(20, 8) NOT NULL,
  total_cost DECIMAL(20, 8) NOT NULL,
  is_freebie BOOLEAN DEFAULT FALSE,
  tx_hash VARCHAR(66),
  block_number INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_created_at (created_at DESC),
  INDEX idx_user_address (user_address),
  INDEX idx_token_uuid (token_uuid)
);
```

### Step 4: Implement Backend Event Listener

Create a file `backend/services/monadListener.ts`:

```typescript
import { MonadEventListener, BlockchainEvent } from '../../app/lib/monadEventListener';
import { db } from '../database'; // Your database instance

class ActivityFeedService {
  private listener: MonadEventListener;

  constructor() {
    const rpcUrl = process.env.MONAD_RPC_URL;
    if (!rpcUrl) {
      throw new Error('MONAD_RPC_URL not set in environment');
    }
    this.listener = new MonadEventListener(rpcUrl);
  }

  /**
   * Process blockchain event and save to database
   */
  async processEvent(event: BlockchainEvent) {
    try {
      // Fetch additional data (username, token name, etc.)
      const username = await this.getUsernameFromAddress(event.userAddress);
      const tokenInfo = await this.getTokenInfo(event.tokenUuid);

      // Determine action
      const action = event.eventName === 'TokenPurchased'
        ? (event.isFreebie ? 'claimed_freebie' : 'bought')
        : 'sold';

      // Save to database
      await db.query(`
        INSERT INTO activity_feed (
          type, action, user_address, username, token_name,
          creator_name, token_uuid, amount, price_per_token,
          total_cost, is_freebie, tx_hash, block_number, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        tokenInfo.type, // 'post_token' or 'creator_token'
        action,
        event.userAddress,
        username,
        tokenInfo.name,
        tokenInfo.creatorName,
        event.tokenUuid,
        event.amount,
        event.pricePerToken,
        event.totalValue,
        event.isFreebie || false,
        event.txHash,
        event.blockNumber,
        new Date(event.timestamp * 1000)
      ]);

      console.log(`✅ Saved ${action} activity for ${username}`);
    } catch (error) {
      console.error('Error processing event:', error);
    }
  }

  /**
   * Get username from wallet address
   */
  async getUsernameFromAddress(address: string): Promise<string> {
    const result = await db.query(
      'SELECT username FROM users WHERE wallet_address = $1',
      [address.toLowerCase()]
    );
    return result.rows[0]?.username || address.slice(0, 6) + '...' + address.slice(-4);
  }

  /**
   * Get token information
   */
  async getTokenInfo(tokenUuid: string): Promise<{
    type: string;
    name: string;
    creatorName: string;
  }> {
    // Try post_tokens first
    let result = await db.query(
      'SELECT content as name, creator_address FROM post_tokens WHERE uuid = $1',
      [tokenUuid]
    );

    if (result.rows.length > 0) {
      const creatorName = await this.getUsernameFromAddress(result.rows[0].creator_address);
      return {
        type: 'post_token',
        name: result.rows[0].name.slice(0, 50) + '...',
        creatorName
      };
    }

    // Try creator_tokens
    result = await db.query(
      'SELECT name, creator_address FROM creator_tokens WHERE uuid = $1',
      [tokenUuid]
    );

    if (result.rows.length > 0) {
      const creatorName = await this.getUsernameFromAddress(result.rows[0].creator_address);
      return {
        type: 'creator_token',
        name: result.rows[0].name,
        creatorName
      };
    }

    return {
      type: 'post_token',
      name: 'Unknown',
      creatorName: 'Unknown'
    };
  }

  /**
   * Start listening to events
   */
  async start() {
    console.log('🚀 Starting Monad event listener...');

    await this.listener.startListening(async (event) => {
      await this.processEvent(event);
    });

    console.log('✅ Monad event listener started successfully');
  }

  /**
   * Sync historical events
   */
  async syncHistoricalEvents(fromBlock: number) {
    console.log(`📜 Syncing historical events from block ${fromBlock}...`);

    const events = await this.listener.getHistoricalEvents(fromBlock, 'latest');
    console.log(`Found ${events.length} historical events`);

    for (const event of events) {
      await this.processEvent(event);
    }

    console.log('✅ Historical sync completed');
  }
}

export const activityFeedService = new ActivityFeedService();

// Start the listener when the backend starts
activityFeedService.start().catch(console.error);
```

### Step 5: Implement API Endpoints

Your backend should have these endpoints (update if needed):

```typescript
// GET /api/activity-feed/recent
app.get('/api/activity-feed/recent', async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;

  try {
    const result = await db.query(`
      SELECT * FROM activity_feed
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

// GET /api/activity-feed/user/:address
app.get('/api/activity-feed/user/:address', async (req, res) => {
  const { address } = req.params;
  const limit = parseInt(req.query.limit as string) || 20;

  try {
    const result = await db.query(`
      SELECT * FROM activity_feed
      WHERE user_address = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [address.toLowerCase(), limit]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});
```

## Testing

### 1. Test Event Listener

```typescript
// In your backend code
import { MonadEventListener } from './monadListener';

const listener = new MonadEventListener(process.env.MONAD_RPC_URL!);

// Listen for events
listener.startListening((event) => {
  console.log('Event received:', event);
});

// Or fetch historical events
const events = await listener.getHistoricalEvents(1000000, 'latest');
console.log('Historical events:', events);
```

### 2. Test Frontend Display

Once the backend is running and events are being saved:

1. Navigate to the app
2. Look at the **Recent Activity** section in the sidebar
3. You should see buy/sell activities appearing

## Deployment

1. Deploy the backend with the event listener running
2. Ensure the RPC URL is correctly configured for Monad network
3. The listener will automatically start processing events
4. The frontend will automatically display the activities

## Troubleshooting

### Events not showing up?
- Check if the backend is running
- Verify the RPC URL is correct
- Check database connection
- Look at backend logs for errors

### Old events missing?
- Run the historical sync:
  ```typescript
  await activityFeedService.syncHistoricalEvents(startBlock);
  ```

### Performance issues?
- Add database indexes on `created_at`, `user_address`, `token_uuid`
- Implement caching for frequently accessed activities
- Use pagination for large datasets

## Next Steps

- [ ] Set up Monad RPC connection
- [ ] Create database tables
- [ ] Implement backend event listener
- [ ] Test with real transactions
- [ ] Deploy to production
