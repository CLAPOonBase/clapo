# Smart Contract Integration Guide

This document explains how to use the integrated smart contract functionality in your Clapo application.

## Overview

The smart contract integration provides a complete interface to interact with prediction market smart contracts, including:
- Market creation and management
- Trading (buying YES/NO shares)
- Market resolution
- Fee withdrawal
- Whitelist management
- USDC integration

## Files Created

### 1. Core Smart Contract Service (`app/lib/smartContract.ts`)
- `SmartContractService` class with all contract functions
- TypeScript interfaces for type safety
- Error handling and transaction management
- USDC approval and balance checking

### 2. React Hook (`app/lib/useSmartContract.ts`)
- `useSmartContract` hook for React components
- State management for contract operations
- Loading states and error handling
- Easy-to-use function wrappers

### 3. Configuration (`app/lib/config.ts`)
- Centralized configuration management
- Environment variable validation
- Contract addresses and settings

### 4. Demo Component (`app/components/SmartContractDemo.tsx`)
- Complete demo interface for testing all functions
- User-friendly forms and buttons
- Real-time status updates

### 5. Integration Component (`app/components/SmartContractIntegration.tsx`)
- Focused component for embedding in existing pages
- Auto-initialization support
- Trading interface integration

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in your project root with:

```bash
# RPC URL for the blockchain network
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Private key for the wallet (keep secure!)
PRIVATE_KEY=your_private_key_here
```

### 2. Install Dependencies
The `ethers` package is already included in your `package.json`.

### 3. Initialize Smart Contract
```typescript
import { useSmartContract } from '../lib/useSmartContract';

const { initializeContract, isInitialized } = useSmartContract();

// Initialize with your credentials
await initializeContract(rpcUrl, privateKey);
```

## Usage Examples

### Basic Trading
```typescript
import { useSmartContract } from '../lib/useSmartContract';

function TradingComponent() {
  const { buyShares, isInitialized, isLoading } = useSmartContract();
  
  const handleTrade = async () => {
    if (isInitialized) {
      const result = await buyShares(1, true, 10); // Market ID 1, YES, 10 USDC
      console.log('Trade executed:', result);
    }
  };
  
  return (
    <button onClick={handleTrade} disabled={!isInitialized || isLoading}>
      Buy YES Shares
    </button>
  );
}
```

### Market Management
```typescript
const { createMarket, getMarketDetails, resolveMarket } = useSmartContract();

// Create a new market
const result = await createMarket("Will Bitcoin reach $100k in 2024?");
console.log('Market created with ID:', result.marketId);

// Get market details
const details = await getMarketDetails(1);
console.log('Market details:', details);

// Resolve market
await resolveMarket(1, true); // Market ID 1, YES wins
```

### USDC Management
```typescript
const { checkUSDCStatus } = useSmartContract();

const status = await checkUSDCStatus();
console.log('USDC Balance:', status.balance);
console.log('Allowance:', status.allowance);
```

## Available Functions

### Market Operations
- `createMarket(description: string)` - Create a new prediction market
- `getMarketCount()` - Get total number of markets
- `getMarketDetails(id: number)` - Get detailed market information
- `resolveMarket(marketId: number, side: boolean)` - Resolve a market

### Trading Operations
- `buyShares(marketId: number, side: boolean, usdcAmount: number)` - Buy YES/NO shares
- `getPrices(marketId: number)` - Get current market prices
- `claimReward(marketId: number)` - Claim rewards from resolved markets

### Admin Operations
- `addCreatorToWhitelist(address: string)` - Add creator to whitelist
- `withdrawFees(marketId: number)` - Withdraw fees from a market
- `isWhitelisted(address: string)` - Check whitelist status

### Utility Functions
- `checkUSDCStatus()` - Check USDC balance and allowance
- `getWalletAddress()` - Get connected wallet address

## Integration with Existing Pages

### Add to Opinio Page
```typescript
import SmartContractIntegration from '../components/SmartContractIntegration';

// In your opinio page component
<SmartContractIntegration 
  marketId={1}
  onTradeExecuted={(result) => console.log('Trade executed:', result)}
  onError={(error) => console.error('Error:', error)}
/>
```

### Add to Any Page
```typescript
import { useSmartContract } from '../lib/useSmartContract';

function MyPage() {
  const { 
    isInitialized, 
    buyShares, 
    isLoading 
  } = useSmartContract();
  
  // Your component logic here
}
```

## Demo Page

Visit `/smart-contract-demo` to see a complete demonstration of all functions.

## Security Considerations

1. **Never commit private keys to version control**
2. **Use environment variables for sensitive data**
3. **Consider using wallet connectors (MetaMask) for production**
4. **Validate all user inputs before sending to contracts**
5. **Handle transaction failures gracefully**

## Error Handling

The integration includes comprehensive error handling:
- Network errors
- Contract errors
- User input validation
- Transaction failures
- Insufficient balances/allowances

## Testing

1. Use the demo page to test all functions
2. Test with small amounts first
3. Verify transactions on blockchain explorer
4. Test error scenarios (insufficient balance, etc.)

## Troubleshooting

### Common Issues

1. **"Smart contract not initialized"**
   - Check RPC URL and private key
   - Ensure environment variables are set

2. **"Insufficient USDC balance"**
   - Check your wallet has enough USDC
   - Verify you're on the correct network

3. **"Transaction failed"**
   - Check gas fees
   - Verify contract addresses
   - Check network congestion

4. **"Allowance too low"**
   - The contract will automatically request USDC approval
   - Approve the requested amount

### Debug Mode
Enable console logging to see detailed transaction information:
```typescript
// All functions include console.log statements for debugging
```

## Next Steps

1. **Production Deployment**
   - Use secure key management
   - Implement wallet connectors
   - Add transaction monitoring

2. **Advanced Features**
   - Batch operations
   - Gas optimization
   - Transaction queuing

3. **User Experience**
   - Transaction notifications
   - Progress indicators
   - Error recovery flows

## Support

For issues or questions:
1. Check the console for error messages
2. Verify environment variables
3. Test with the demo page
4. Review transaction logs on blockchain explorer
