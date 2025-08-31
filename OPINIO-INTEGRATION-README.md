# 🚀 Opinio Smart Contract Integration

## Overview
The Opinio section has been fully integrated with the deployed smart contracts on Monad Testnet. Users can now create prediction markets, trade shares, and interact with real blockchain data.

## 🔗 Deployed Contracts
- **OpinioMarket**: `0xDfd05ed372C5eD9f7aaD54A5A2d5A5c94a99f5fb`
- **MockUSDC**: `0xcaC4DF2Bd3723CEA847e1AE07F37Fb4B33c6Cb61`
- **Network**: Monad Testnet (Chain ID: 10143)
- **Current Markets**: 5 active prediction markets

## 🛠️ Features Implemented

### 1. Wallet Connection
- Connect to Monad Testnet using private key
- View wallet address, network info, and USDC balance
- Secure private key input with show/hide toggle

### 2. Market Creation
- Create prediction markets with questions and descriptions
- Support for binary (Yes/No) and multi-option markets
- Set end dates and add custom options
- Automatic market ID assignment

### 3. Market Trading
- Buy and sell shares in prediction markets
- Real-time market data from blockchain
- USDC integration for all transactions
- Automatic approval handling

### 4. Portfolio Management
- View real USDC balance from smart contract
- Track market positions and trading history
- Real-time portfolio updates

### 5. Market Discovery
- Browse all created markets on blockchain
- View market details, options, and statistics
- Interactive trading interface for each market

## 🔧 Technical Implementation

### Smart Contract Integration
- **File**: `app/lib/opinioContract.ts`
- **Service Class**: `OpinioContractService`
- **Functions**: Market creation, trading, voting, liquidity management

### React Hook
- **File**: `app/hooks/useOpinioContract.ts`
- **Hook**: `useOpinioContract()`
- **Features**: State management, error handling, loading states

### Components
- **OpinioWalletConnect**: Wallet connection interface
- **OpinioTrading**: Trading interface for markets
- **Updated Pages**: CreateMarketPage, MainVoting, MyPortfolioPage

## 🚀 How to Use

### 0. Test Markets Available
The platform currently has 5 active prediction markets:
- **Bitcoin $100k**: Will Bitcoin reach $100k by end of year?
- **Ethereum 2.0**: Will Ethereum 2.0 launch in Q4 2025?
- **AI Jobs**: Will AI replace 50% of jobs by 2030?
- **Renewable Energy**: Will renewable energy be 80% of global power by 2035?
- **SpaceX Mars**: Will SpaceX land on Mars in 2026?

### 1. Connect Wallet
1. Navigate to Opinio section
2. Click "Connect to Monad Testnet"
3. Enter RPC URL: `https://testnet-rpc.monad.xyz`
4. Enter your private key
5. Click "Connect Wallet"

### 2. Create a Market
1. Go to "Create Market" page
2. Select question type (No Options or With Options)
3. Enter market question and description
4. Set end date
5. Add options if needed
6. Click "CREATE MARKET"

### 3. Trade Markets
1. Browse markets on main page
2. Click "TRADE MARKET" on any market
3. Select option and trade type (Buy/Sell)
4. Enter amount
5. Click "Buy Shares" or "Sell Shares"

### 4. View Portfolio
1. Go to "My Portfolio" page
2. View real-time USDC balance
3. Track profit/loss and trading history

## 🔒 Security Features
- Private key never stored in localStorage
- Secure wallet connection
- Transaction confirmation alerts
- Error handling and validation

## 🌐 Network Configuration
- **RPC URL**: `https://testnet-rpc.monad.xyz`
- **Chain ID**: 10143
- **Currency**: MONAD (for gas fees)
- **Tokens**: MockUSDC for trading

## 📱 User Experience
- Responsive design for all screen sizes
- Loading states and error messages
- Smooth animations and transitions
- Intuitive trading interface

## 🚨 Important Notes
- **Never share your private key**
- Testnet tokens have no real value
- Gas fees are paid in MONAD
- Markets are permanent once created
- All transactions are on-chain

## 🔮 Future Enhancements
- Market resolution interface
- Advanced trading features
- Liquidity provision
- Governance mechanisms
- Mobile app integration

## 🐛 Troubleshooting
- Ensure you have MONAD for gas fees
- Check RPC URL connectivity
- Verify private key format
- Clear browser cache if needed
- Check console for error details

## 📞 Support
For technical issues or questions about the integration, check the console logs and ensure all dependencies are properly installed.
