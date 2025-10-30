# Privy Gas Sponsorship Setup Guide

This guide explains how to configure and use the Privy Gas Sponsorship feature in your app. When enabled, the sponsor account automatically covers gas fees for post creation transactions.

## 🎯 Overview

The gas sponsorship system allows your app to cover gas costs for users when they create posts on-chain. This provides a better user experience by removing the need for users to pay for gas.

### How It Works

1. **User creates a post** in the app (via SnapComposer)
2. **Frontend requests sponsorship** by calling `/api/sponsor-transaction`
3. **Backend verifies the user** via Privy authentication
4. **Sponsor wallet pays gas** and sends the transaction
5. **Transaction confirmation** is returned to the user
6. **Fallback mechanism**: If sponsorship fails, user pays for gas as normal

## 📋 Prerequisites

- Privy account with API access
- Sponsor wallet with ETH on Base Sepolia (for gas fees)
- Node.js and npm installed
- Next.js 15+ application

## 🔧 Installation

The required dependencies have already been installed:

```bash
npm install @privy-io/server-auth viem
```

## ⚙️ Configuration

### 1. Get Your Privy Credentials

Go to [Privy Dashboard](https://dashboard.privy.io) and retrieve:

- **App ID**: Found in Settings → Basics (already in .env as `NEXT_PUBLIC_PRIVY_APP_ID`)
- **App Secret**: Found in Settings → Basics → Show App Secret

### 2. Set Up Environment Variables

Update your `.env` file with the following:

```bash
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=cmgalr0ez00cpjr0c7qpxgmxb
PRIVY_APP_SECRET=your_privy_app_secret_here  # ⚠️ ADD THIS FROM PRIVY DASHBOARD

# Sponsor Wallet (pays for gas)
PRIVATE_KEY=0xb7a9ad8f2badaeaaf759a989004ea489653643a926250dcd681e0b3754a8ced4

# Base Sepolia Configuration
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

⚠️ **IMPORTANT**: Replace `your_privy_app_secret_here` with your actual Privy App Secret from the dashboard.

### 3. Fund the Sponsor Wallet

The sponsor wallet (`PRIVATE_KEY` in .env) needs ETH on Base Sepolia to pay for gas:

1. **Get the sponsor wallet address**:
   ```bash
   # The address for the private key in .env is:
   # 0x... (you can derive this from the private key)
   ```

2. **Fund it with Base Sepolia ETH**:
   - Use [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-sepolia-faucet)
   - Or bridge from Ethereum Sepolia using [Base Bridge](https://bridge.base.org/)
   - Recommended: Keep at least 0.1 ETH for gas fees

### 4. Configure Privy Dashboard

In your [Privy Dashboard](https://dashboard.privy.io):

1. Go to **Settings → Embedded Wallets**
2. Ensure **Create embedded wallet on login** is enabled
3. Add your domain to **Allowed origins**:
   - For development: `http://localhost:3000`
   - For production: `https://server.blazeswap.io`

## 🚀 Usage

### How Users Experience Gas Sponsorship

1. **User logs in** with Privy (email, wallet, or Google)
2. **User creates a post** with on-chain data
3. **Gas is automatically sponsored** - no wallet prompt for gas payment!
4. **Success notification** shows the transaction was sponsored

### Code Integration

The gas sponsorship is automatically integrated into the post creation flow:

```typescript
// In SnapComposer.tsx - already integrated
const tokenTxHash = await createPostToken(
  postUuid,
  content.trim(),
  mediaUrl || '',
  quadraticDivisor,
  privyUser?.id,        // Privy user ID for verification
  true                   // Enable gas sponsorship
)
```

### API Endpoint

The sponsorship API is available at:

```
POST /api/sponsor-transaction
```

**Request body:**
```json
{
  "userAddress": "0x...",
  "uuid": "post-uuid-here",
  "content": "Post content",
  "imageUrl": "https://...",
  "quadraticDivisor": 1,
  "privyUserId": "privy-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "0x...",
  "sponsorAddress": "0x...",
  "message": "Transaction sponsored successfully"
}
```

## 🧪 Testing

### Test the Gas Sponsorship

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Log in** to the app with Privy

3. **Create a post** with on-chain data

4. **Check the console** for gas sponsorship logs:
   ```
   💰 Attempting gas sponsorship via backend API...
   ✅ Gas sponsorship successful! 0x...
   🎉 Post token created with sponsored gas!
   ```

5. **Verify on blockchain**:
   - Go to [Base Sepolia Explorer](https://sepolia.basescan.org/)
   - Search for the transaction hash
   - Confirm the "From" address is the sponsor wallet

### Fallback Testing

To test the fallback mechanism (user pays for gas):

1. **Temporarily disable sponsorship**:
   ```typescript
   // In SnapComposer.tsx
   const tokenTxHash = await createPostToken(
     postUuid,
     content.trim(),
     mediaUrl || '',
     quadraticDivisor,
     privyUser?.id,
     false  // Disable sponsorship
   )
   ```

2. **Create a post** - user should be prompted to pay for gas

3. **Re-enable sponsorship** by setting it back to `true`

## 🔍 Monitoring

### Check Sponsor Wallet Balance

```bash
# Using cast (from foundry)
cast balance 0xYOUR_SPONSOR_ADDRESS --rpc-url https://sepolia.base.org

# Or check on Base Sepolia Explorer
https://sepolia.basescan.org/address/0xYOUR_SPONSOR_ADDRESS
```

### View Transaction History

Check the sponsor wallet's transactions on [Base Sepolia Explorer](https://sepolia.basescan.org/) to monitor gas spending.

### Logs

Check your server logs for sponsorship activity:

```
🎫 Gas sponsorship request received: { userAddress, uuid, ... }
✅ Privy user verified: privy:...
💰 Sponsor account: 0x...
⛽ Gas estimate: 150000
📤 Sending sponsored transaction...
✅ Transaction sent: 0x...
```

## 🛡️ Security Considerations

### Important Security Notes

1. **Privy App Secret**: Never commit to git, keep it secret
2. **Sponsor Private Key**: Rotate regularly, monitor balance
3. **User Verification**: The API verifies users via Privy before sponsoring
4. **Rate Limiting**: Consider adding rate limits to prevent abuse
5. **Cost Monitoring**: Set up alerts when sponsor wallet balance is low

### Production Recommendations

1. **Use a dedicated sponsor wallet** separate from other funds
2. **Set up balance alerts** to refill when low
3. **Implement rate limiting** per user/IP
4. **Add cost caps** per user/day
5. **Monitor for unusual activity** in logs
6. **Use environment-specific secrets** for dev/staging/production

## 📊 Cost Analysis

### Gas Cost Estimates (Base Sepolia)

- **Post Creation**: ~150,000 gas (~$0.01 at 1 gwei)
- **Daily estimate**: For 100 posts/day = ~$1/day
- **Monthly estimate**: ~$30/month for moderate usage

### Optimization Tips

1. **Batch transactions** where possible
2. **Use gas-efficient contract methods**
3. **Monitor gas prices** and adjust
4. **Consider Layer 2 solutions** for scaling

## 🐛 Troubleshooting

### Common Issues

#### "User verification failed"
- **Cause**: Invalid Privy user ID or App Secret
- **Solution**: Check PRIVY_APP_SECRET in .env matches dashboard

#### "Insufficient funds for gas"
- **Cause**: Sponsor wallet is empty
- **Solution**: Fund the sponsor wallet with Base Sepolia ETH

#### "Transaction will fail"
- **Cause**: Contract error or invalid parameters
- **Solution**: Check contract state, UUID uniqueness, and parameters

#### Gas sponsorship fails, falls back to user-paid
- **Cause**: Backend error or configuration issue
- **Solution**: Check server logs, verify environment variables

### Debug Mode

Enable verbose logging:

```typescript
// In usePostToken.ts
console.log('🔍 Debug info:', {
  hasPrivyUserId: !!privyUserId,
  useGasSponsorship,
  sponsorWallet: process.env.PRIVATE_KEY?.substring(0, 10) + '...',
});
```

## 📚 Architecture

### System Flow

```
User creates post
    ↓
SnapComposer.tsx → createPostToken()
    ↓
usePostToken.ts → Attempts gas sponsorship
    ↓
POST /api/sponsor-transaction
    ↓
Backend verifies user via Privy
    ↓
Sponsor wallet signs & sends transaction
    ↓
Transaction confirmed on Base Sepolia
    ↓
Success notification to user
```

### Files Created/Modified

1. **`/app/api/sponsor-transaction/route.ts`** - Gas sponsorship API endpoint
2. **`/app/lib/gasSponsorship.ts`** - Helper functions for sponsorship
3. **`/app/hooks/usePostToken.ts`** - Updated with sponsorship logic
4. **`/app/snaps/Sections/SnapComposer.tsx`** - Integrated sponsorship
5. **`/app/components/Providers.tsx`** - Updated Privy configuration
6. **`.env`** - Added PRIVY_APP_SECRET

## 🚨 Important Notes

### Contract Creator Issue

⚠️ **IMPORTANT**: The current implementation has the sponsor wallet send the transaction, which means the contract records the sponsor as the creator, NOT the user.

**For production**, you should implement one of these solutions:

1. **Modify the contract** to accept a `creator` parameter:
   ```solidity
   function createPost(
     address creator,
     string memory uuid,
     ...
   ) external
   ```

2. **Use account abstraction** with a paymaster service (recommended)

3. **Use meta-transactions** with EIP-2771 forwarder pattern

4. **Use Privy's Smart Wallets** with built-in paymaster support

### Next Steps for Production

1. Implement proper creator address handling
2. Add rate limiting middleware
3. Set up monitoring and alerts
4. Implement cost controls
5. Add analytics for gas usage

## 📞 Support

For issues or questions:

1. Check [Privy Documentation](https://docs.privy.io)
2. Review [Base Documentation](https://docs.base.org)
3. Check the server logs for errors
4. Verify all environment variables are set correctly

## 🎉 Success!

If everything is configured correctly, users should see:

```
🎉 Snap posted and token created with sponsored gas! TX: 0x1234567...
```

Congratulations! Your gas sponsorship is now live! 🚀
