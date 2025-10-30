# Gas Sponsorship - Quick Start Guide

## 🎯 What Was Implemented

Your app now has **Privy Gas Sponsorship** integrated! When users create posts on-chain, the sponsor account automatically covers gas fees.

## ✅ What's Been Done

1. ✅ Installed `@privy-io/server-auth` and `viem` packages
2. ✅ Created `/app/api/sponsor-transaction/route.ts` - Backend API for gas sponsorship
3. ✅ Created `/app/lib/gasSponsorship.ts` - Helper functions
4. ✅ Updated `/app/hooks/usePostToken.ts` - Integrated sponsorship logic
5. ✅ Updated `/app/snaps/Sections/SnapComposer.tsx` - Passes Privy user ID
6. ✅ Updated `/app/components/Providers.tsx` - Enhanced Privy configuration
7. ✅ Updated `.env` - Added PRIVY_APP_SECRET placeholder

## 🔑 Required Configuration

### Step 1: Add Privy App Secret

Update your `.env` file:

```bash
# Find this in: https://dashboard.privy.io → Settings → Basics → Show App Secret
PRIVY_APP_SECRET=your_actual_privy_app_secret_here
```

### Step 2: Fund Sponsor Wallet

The wallet with private key in `.env` (`PRIVATE_KEY=0xb7a9...`) needs Base Sepolia ETH:

1. Get Base Sepolia ETH: https://www.coinbase.com/faucets/base-sepolia-faucet
2. Send to your sponsor wallet address
3. Recommended: Keep at least 0.1 ETH for gas

### Step 3: Configure Privy Dashboard

Go to https://dashboard.privy.io:

1. **Settings → Embedded Wallets**: Enable "Create embedded wallet on login"
2. **Settings → Allowed origins**: Add your domains:
   - Development: `http://localhost:3000`
   - Production: `https://server.blazeswap.io`

## 🚀 How to Use

### For Users

1. **Log in** with Privy (email, Google, or wallet)
2. **Create a post** with on-chain data
3. **Gas is automatically sponsored!** No wallet prompt for gas
4. See success message: "🎉 Snap posted and token created with sponsored gas!"

### Testing It Works

1. Start dev server: `npm run dev`
2. Log in to your app
3. Create a post
4. Check console for:
   ```
   💰 Attempting gas sponsorship via backend API...
   ✅ Gas sponsorship successful!
   🎉 Post token created with sponsored gas!
   ```

## 🔍 How It Works

```
User creates post
    ↓
App requests sponsorship → /api/sponsor-transaction
    ↓
Backend verifies user via Privy
    ↓
Sponsor wallet pays gas & sends transaction
    ↓
Transaction confirmed on Base Sepolia
    ↓
Success! User sees "Gas sponsored" message
```

## 💡 Fallback Mechanism

If gas sponsorship fails for any reason:
- App automatically falls back to user-paid gas
- User's wallet prompts for transaction approval
- Post still gets created successfully

## ⚠️ Important Notes

### Contract Creator Issue

The current implementation has a limitation: the sponsor wallet sends the transaction, so the contract records the **sponsor as the creator**, not the user.

**For production, you should**:
1. Modify the contract to accept a `creator` parameter, OR
2. Use account abstraction with a paymaster service (recommended), OR
3. Implement meta-transactions (EIP-2771)

### Security Best Practices

1. ✅ Never commit `PRIVY_APP_SECRET` to git
2. ✅ Keep sponsor wallet funded but not overfunded
3. ✅ Monitor sponsor wallet balance regularly
4. ✅ Set up alerts for low balance
5. ✅ Consider rate limiting for production

## 📊 Cost Estimates

- **Per post**: ~150,000 gas (~$0.01 at 1 gwei)
- **100 posts/day**: ~$1/day
- **Monthly (moderate use)**: ~$30/month

## 🐛 Troubleshooting

### "User verification failed"
→ Check `PRIVY_APP_SECRET` in `.env`

### "Insufficient funds for gas"
→ Fund sponsor wallet with Base Sepolia ETH

### Gas sponsorship fails, falls back to user-paid
→ Check server logs and verify environment variables

### Build errors
→ Run `npm install` to ensure all dependencies are installed

## 📂 Files Modified/Created

```
✅ /app/api/sponsor-transaction/route.ts       (NEW)
✅ /app/lib/gasSponsorship.ts                  (NEW)
✅ /app/hooks/usePostToken.ts                  (MODIFIED)
✅ /app/snaps/Sections/SnapComposer.tsx        (MODIFIED)
✅ /app/components/Providers.tsx               (MODIFIED)
✅ /.env                                        (MODIFIED)
✅ /package.json                                (UPDATED)
```

## 🔗 Useful Links

- **Privy Dashboard**: https://dashboard.privy.io
- **Privy Docs**: https://docs.privy.io
- **Base Sepolia Faucet**: https://www.coinbase.com/faucets/base-sepolia-faucet
- **Base Sepolia Explorer**: https://sepolia.basescan.org
- **Full Setup Guide**: See `PRIVY_GAS_SPONSORSHIP_SETUP.md`

## ✨ Next Steps

1. ⚠️ **CRITICAL**: Add your actual `PRIVY_APP_SECRET` to `.env`
2. 💰 Fund the sponsor wallet with Base Sepolia ETH
3. 🧪 Test post creation with gas sponsorship
4. 📊 Monitor sponsor wallet balance
5. 🚀 Deploy to production!

## 🎉 Success Checklist

- [ ] `PRIVY_APP_SECRET` added to `.env`
- [ ] Sponsor wallet funded with ETH
- [ ] Privy dashboard configured (origins added)
- [ ] Tested post creation locally
- [ ] Verified transaction on Base Sepolia Explorer
- [ ] Set up balance monitoring
- [ ] Deployed to production

---

**Need help?** Check `PRIVY_GAS_SPONSORSHIP_SETUP.md` for detailed documentation.

**Ready to go live?** Just complete the configuration steps above! 🚀
