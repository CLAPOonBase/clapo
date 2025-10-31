# Privy Gas Sponsorship Setup Guide

This guide explains how to use Privy's native gas sponsorship feature in Clapo on Base Sepolia testnet.

## Prerequisites

✅ Gas sponsorship enabled in Privy Dashboard (COMPLETED)
✅ Base Sepolia configured in supported chains
✅ Privy App Secret updated in environment variables (COMPLETED)

## Configuration

### 1. Privy Provider Setup

The PrivyProvider is already configured in `app/components/Providers.tsx`:

```tsx
<PrivyProvider
  appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
  config={{
    appearance: {
      theme: 'dark',
      accentColor: '#6e54ff',
    },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
    },
    defaultChain: baseSepolia,
    supportedChains: [baseSepolia],
    loginMethods: ['email', 'wallet', 'google'],
  }}
>
```

### 2. Using Sponsored Transactions

Use the `useSponsoredTransaction` hook to send gas-free transactions:

```tsx
import { useSponsoredTransaction, encodeFunctionData } from '@/app/hooks/useSponsoredTransaction';

function MyComponent() {
  const { sendSponsoredTransaction } = useSponsoredTransaction();

  const createPost = async () => {
    // Encode the contract call
    const data = encodeFunctionData({
      abi: CONTRACT_ABI,
      functionName: 'createPost',
      args: [uuid, content, imageUrl, 0n, BigInt(quadraticDivisor)]
    });

    // Send with gas sponsorship
    const txHash = await sendSponsoredTransaction({
      to: '0xcaC4DF2Bd3723CEA847e1AE07F37Fb4B33c6Cb61',
      data,
      value: 0n
    });

    console.log('Transaction sent:', txHash);
  };

  return <button onClick={createPost}>Create Post (Gas Free!)</button>;
}
```

## How It Works

1. **User Initiates Transaction**: User clicks a button to perform an action
2. **Transaction Prepared**: Your app encodes the transaction data
3. **Privy Sponsors Gas**: When `sponsor: true` is passed, Privy's paymaster covers gas fees
4. **Transaction Executed**: Transaction executes on-chain without user paying gas

## Benefits Over Custom Implementation

### Before (Custom Sponsorship):
- ❌ Complex server-side transaction signing
- ❌ Sponsor's address recorded as creator (not user's)
- ❌ Requires maintaining sponsor wallet private keys
- ❌ Security risks with private key exposure
- ❌ Needs custom meta-transaction pattern

### After (Privy Native Sponsorship):
- ✅ Simple one-line configuration (`sponsor: true`)
- ✅ User's address recorded as creator (correct attribution)
- ✅ No private key management needed
- ✅ Privy handles security and infrastructure
- ✅ Built-in rate limiting and fraud protection

## Migration Path

### Current Implementation
The existing `/api/sponsor-transaction` endpoint can be deprecated in favor of the new Privy-based approach.

### Gradual Migration
1. **Phase 1**: Add `useSponsoredTransaction` hook (✅ DONE)
2. **Phase 2**: Update post creation to use new hook
3. **Phase 3**: Update token trading to use new hook
4. **Phase 4**: Remove old `/api/sponsor-transaction` endpoint

## Security Features

Privy's gas sponsorship includes:
- ✅ Per-user rate limiting
- ✅ Per-wallet spending caps
- ✅ Anomaly detection
- ✅ Automatic fraud prevention
- ✅ Real-time monitoring

## Testing

### Test on Base Sepolia
1. Create a new post with gas sponsorship
2. Check transaction on BaseScan Sepolia
3. Verify user's address is the creator (not sponsor's)
4. Confirm user paid $0 in gas fees

### Example Test
```tsx
// In your component
const testSponsoredTransaction = async () => {
  try {
    const txHash = await sendSponsoredTransaction({
      to: '0xcaC4DF2Bd3723CEA847e1AE07F37Fb4B33c6Cb61',
      data: encodedData
    });
    console.log('✅ Success:', txHash);
  } catch (error) {
    console.error('❌ Failed:', error);
  }
};
```

## Troubleshooting

### Transaction Fails
- Verify gas sponsorship is enabled in Privy Dashboard for Base Sepolia
- Check that user has an embedded wallet created through Privy
- Ensure transaction parameters are valid

### User Not Recorded as Creator
- Make sure you're using Privy's native sponsorship (`sponsor: true`)
- Don't use the old `/api/sponsor-transaction` endpoint
- Verify the user's wallet is sending the transaction (not a sponsor wallet)

## Resources

- [Privy Gas Sponsorship Docs](https://docs.privy.io/wallets/gas-and-asset-management/gas/setup)
- [Base Sepolia Explorer](https://sepolia.basescan.org/)
- [Privy Dashboard](https://dashboard.privy.io/)

## Next Steps

1. ✅ Hook created (`useSponsoredTransaction`)
2. ⏳ Update post creation to use sponsored transactions
3. ⏳ Update token trading to use sponsored transactions
4. ⏳ Test thoroughly on Base Sepolia
5. ⏳ Deploy to production
