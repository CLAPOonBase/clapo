import { Contract, ethers } from "ethers";

// OpinioMarket Contract ABI - Updated to match actual contract
const OPINIO_MARKET_ABI = [
  "function createMarket(string memory title, string memory description, string memory category, string[] memory tags, uint256 endDate, uint8 marketType, uint256 initialLiquidity, uint256 minLiquidity, uint256 maxMarketSize) external returns (uint256)",
  "function addMarketOption(uint256 marketId, string memory optionText) external",
  "function castVote(uint256 marketId, uint256 prediction, uint256 confidence, uint256 amount) external",
  "function buyShares(uint256 marketId, uint256 amount, bool isLong, uint256 optionId) external",
  "function sellShares(uint256 marketId, uint256 amount, bool isLong, uint256 optionId) external",
  "function addLiquidity(uint256 marketId, uint256 amount) external",
  "function removeLiquidity(uint256 marketId, uint256 amount) external",
  "function resolveMarket(uint256 marketId, uint256 outcome) external",
  "function claimWinnings(uint256 marketId) external",
  "function getMarket(uint256 marketId) external view returns (tuple(uint256 marketId, address creator, string title, string description, string category, string[] tags, uint256 endDate, uint256 totalLiquidity, uint256 totalShares, uint8 status, uint8 marketType, uint256 currentRate, uint256 cutBasisPoints, uint256 totalVotes, uint256 createdAt, bool isActive, uint256 minLiquidity, uint256 maxMarketSize))",
  "function getMarketOptions(uint256 marketId) external view returns (tuple(uint256 optionId, string optionText, uint256 totalShares, uint256 currentPrice, bool isWinning, uint256 totalVotes)[])",
  "function getUserShares(uint256 marketId, address user) external view returns (tuple(uint256 marketId, address user, uint256 amount, uint256 price, uint256 timestamp, bool isLong, uint256 optionId))",
  "function getMarketVotes(uint256 marketId) external view returns (tuple(uint256 voteId, uint256 marketId, address user, uint256 prediction, uint256 confidence, uint256 amount, uint256 createdAt)[])",
  "function getUserPortfolio(address user) external view returns (tuple(address user, uint256 totalValue, uint256 totalProfitLoss, uint256 totalInvested, uint256[] activeMarketIds))",
  "function getMarketCount() external view returns (uint256)",
  "function getVoteCount() external view returns (uint256)",
  "function tradingFee() external view returns (uint256)",
  "function liquidityFee() external view returns (uint256)",
  "function platformFee() external view returns (uint256)",
  "function creatorFee() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function addModerator(address moderator) external",
  "function removeModerator(address moderator) external",
  "function verifyCreator(address creator) external",
  "function setFees(uint256 _tradingFee, uint256 _liquidityFee, uint256 _platformFee, uint256 _creatorFee) external",
  "function emergencyPause() external",
  "function emergencyUnpause() external",
  "function withdrawFees() external",
  "function verifiedCreators(address) external view returns (bool)"
];

// MockUSDC Contract ABI
const MOCK_USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function mint(address to, uint256 amount) external",
  "function burn(uint256 amount) external",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function totalSupply() external view returns (uint256)"
];

// Contract addresses from Monad testnet deployment
const OPINIO_MARKET_ADDRESS = "0xDfd05ed372C5eD9f7aaD54A5A2d5A5c94a99f5fb";
const MOCK_USDC_ADDRESS = "0xcaC4DF2Bd3723CEA847e1AE07F37Fb4B33c6Cb61";

// Types
export interface MarketData {
  marketId: ethers.BigNumberish;
  creator: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  endDate: ethers.BigNumberish;
  totalLiquidity: ethers.BigNumberish;
  totalShares: ethers.BigNumberish;
  status: number;
  marketType: number;
  currentRate: ethers.BigNumberish;
  cutBasisPoints: ethers.BigNumberish;
  totalVotes: ethers.BigNumberish;
  createdAt: ethers.BigNumberish;
  isActive: boolean;
  minLiquidity: ethers.BigNumberish;
  maxMarketSize: ethers.BigNumberish;
}

export interface OptionData {
  optionId: ethers.BigNumberish;
  optionText: string;
  totalShares: ethers.BigNumberish;
  currentPrice: ethers.BigNumberish;
  isWinning: boolean;
  totalVotes: ethers.BigNumberish;
}

export interface PortfolioData {
  user: string;
  totalValue: ethers.BigNumberish;
  totalProfitLoss: ethers.BigNumberish;
  totalInvested: ethers.BigNumberish;
  activeMarketIds: ethers.BigNumberish[];
}

export interface UserSharesData {
  marketId: ethers.BigNumberish;
  user: string;
  amount: ethers.BigNumberish;
  price: ethers.BigNumberish;
  timestamp: ethers.BigNumberish;
  isLong: boolean;
  optionId: ethers.BigNumberish;
}

export interface UserPosition {
  marketId: string;
  marketTitle: string;
  optionText: string;
  shares: string;
  avgPrice: string;
  totalInvested: string;
  currentValue: string;
  profitLoss: string;
  profitLossPercentage: string;
  isLong: boolean;
  createdAt: string;
}

export interface UserTrade {
  marketId: string;
  marketTitle: string;
  optionText: string;
  tradeType: 'BUY' | 'SELL';
  amount: string;
  price: string;
  value: string;
  isLong: boolean;
  timestamp: string;
  transactionHash?: string;
}

export interface UserVote {
  marketId: string;
  marketTitle: string;
  prediction: string;
  confidence: string;
  amount: string;
  timestamp: string;
  isActive: boolean;
}

export interface VoteData {
  voteId: ethers.BigNumberish;
  marketId: ethers.BigNumberish;
  user: string;
  prediction: ethers.BigNumberish;
  confidence: ethers.BigNumberish;
  amount: ethers.BigNumberish;
  createdAt: ethers.BigNumberish;
}

export interface USDCStatus {
  balance: ethers.BigNumberish;
  allowance: ethers.BigNumberish;
  decimals: number;
  name: string;
  symbol: string;
  totalSupply: ethers.BigNumberish;
}

export interface TransactionResult {
  hash: string;
  blockNumber: number;
  gasUsed: string;
}

export class OpinioContractService {
  private provider: ethers.JsonRpcProvider | ethers.BrowserProvider;
  private wallet?: ethers.Wallet;
  private signer: ethers.Signer;
  private opinioContract: Contract;
  private usdcContract: Contract;

  constructor(rpcUrl: string, privateKey?: string, browserProvider?: ethers.BrowserProvider, browserSigner?: ethers.Signer) {
    if (browserProvider && browserSigner) {
      // MetaMask mode
      this.provider = browserProvider;
      this.signer = browserSigner;
      this.opinioContract = new Contract(OPINIO_MARKET_ADDRESS, OPINIO_MARKET_ABI, this.signer);
      this.usdcContract = new Contract(MOCK_USDC_ADDRESS, MOCK_USDC_ABI, this.signer);
    } else if (privateKey) {
      // Private key mode (fallback)
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.signer = this.wallet;
      this.opinioContract = new Contract(OPINIO_MARKET_ADDRESS, OPINIO_MARKET_ABI, this.wallet);
      this.usdcContract = new Contract(MOCK_USDC_ADDRESS, MOCK_USDC_ABI, this.wallet);
    } else {
      throw new Error('Either browserProvider+browserSigner or privateKey must be provided');
    }
  }

  async getWalletAddress(): Promise<string> {
    return await this.signer.getAddress();
  }

  async getNetworkInfo(): Promise<{ chainId: number; name: string }> {
    try {
      const network = await this.provider.getNetwork();
      return {
        chainId: Number(network.chainId),
        name: network.name
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw new Error(`Failed to get network info: ${error}`);
    }
  }

  async checkUSDCStatus(): Promise<USDCStatus> {
    try {
      // First validate we're on the right network
      const network = await this.provider.getNetwork();
      console.log('🌐 Current network for USDC check:', { chainId: Number(network.chainId), name: network.name });
      
      if (Number(network.chainId) !== 10143) {
        console.warn('⚠️ Not on Monad Testnet, USDC contract may not exist');
      }

      const userAddress = await this.signer.getAddress();
      console.log('👤 Checking USDC status for address:', userAddress);
      console.log('💰 USDC contract address:', MOCK_USDC_ADDRESS);
      
      // Check if contract exists by trying to get code
      const contractCode = await this.provider.getCode(MOCK_USDC_ADDRESS);
      if (contractCode === '0x') {
        console.warn('⚠️ USDC contract not found at address:', MOCK_USDC_ADDRESS);
        // Return default values if contract doesn't exist
        return {
          balance: 0n,
          allowance: 0n,
          decimals: 6n,
          name: 'Mock USDC',
          symbol: 'USDC',
          totalSupply: 0n
        };
      }

      console.log('✅ USDC contract found, fetching status...');
      
      const [balance, allowance, decimals, name, symbol, totalSupply] = await Promise.all([
        this.usdcContract.balanceOf(userAddress).catch(e => {
          console.warn('Failed to get USDC balance:', e.message);
          return 0n;
        }),
        this.usdcContract.allowance(userAddress, this.opinioContract.target).catch(e => {
          console.warn('Failed to get USDC allowance:', e.message);
          return 0n;
        }),
        this.usdcContract.decimals().catch(e => {
          console.warn('Failed to get USDC decimals:', e.message);
          return 6n;
        }),
        this.usdcContract.name().catch(e => {
          console.warn('Failed to get USDC name:', e.message);
          return 'Mock USDC';
        }),
        this.usdcContract.symbol().catch(e => {
          console.warn('Failed to get USDC symbol:', e.message);
          return 'USDC';
        }),
        this.usdcContract.totalSupply().catch(e => {
          console.warn('Failed to get USDC total supply:', e.message);
          return 0n;
        })
      ]);

      console.log('💰 USDC status retrieved:', { balance: balance.toString(), allowance: allowance.toString(), decimals: decimals.toString() });
      return { balance, allowance, decimals, name, symbol, totalSupply };
    } catch (error) {
      console.error('❌ USDC status check failed:', error);
      // Return default values instead of throwing
      return {
        balance: 0n,
        allowance: 0n,
        decimals: 6n,
        name: 'Mock USDC',
        symbol: 'USDC',
        totalSupply: 0n
      };
    }
  }

  async createMarket(
    title: string, 
    description: string, 
    category: string = "General",
    tags: string[] = ["NEW"],
    endDate: number, 
    marketType: number = 0, 
    initialLiquidity: number = 0,
    minLiquidity: number = 0,
    maxMarketSize: number = 1000000
  ): Promise<{ marketId: string; transaction: TransactionResult }> {
    try {
      const marketId = await this.opinioContract.createMarket.staticCall(
        title, 
        description, 
        category,
        tags,
        endDate, 
        marketType, 
        initialLiquidity,
        minLiquidity,
        maxMarketSize
      );

      const tx = await this.opinioContract.createMarket(
        title, 
        description, 
        category,
        tags,
        endDate, 
        marketType, 
        initialLiquidity,
        minLiquidity,
        maxMarketSize
      );

      const receipt = await tx.wait();
      
      return {
        marketId: marketId.toString(),
        transaction: {
          hash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        }
      };
    } catch (error) {
      throw new Error(`Failed to create market: ${error}`);
    }
  }

  async addMarketOption(marketId: number, optionText: string): Promise<TransactionResult> {
    try {
      const tx = await this.opinioContract.addMarketOption(marketId, optionText);
      const receipt = await tx.wait();
      
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to add market option: ${error}`);
    }
  }

  async castVote(marketId: number, prediction: number, confidence: number, amount: number): Promise<TransactionResult> {
    try {
      const decimals = await this.usdcContract.decimals();
      const usdcAmount = ethers.parseUnits(amount.toString(), decimals);
      
      const tx = await this.opinioContract.castVote(marketId, prediction, confidence, usdcAmount);
      const receipt = await tx.wait();
      
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to cast vote: ${error}`);
    }
  }

  async approveUSDC(amount: number): Promise<TransactionResult> {
    try {
      const decimals = await this.usdcContract.decimals();
      const usdcAmount = ethers.parseUnits(amount.toString(), decimals);
      
      console.log(`🔓 Approving ${amount} USDC for spending...`);
      const tx = await this.usdcContract.approve(this.opinioContract.target, usdcAmount);
      const receipt = await tx.wait();
      
      console.log(`✅ USDC approval successful: ${receipt.hash}`);
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to approve USDC: ${error}`);
    }
  }

  async buyShares(marketId: number, amount: number, isLong: boolean, optionId: number): Promise<TransactionResult> {
    try {
      const decimals = await this.usdcContract.decimals();
      const usdcAmount = ethers.parseUnits(amount.toString(), decimals);
      
      // Check allowance and auto-approve if needed
      const userAddress = await this.wallet.getAddress();
      const currentAllowance = await this.usdcContract.allowance(userAddress, this.opinioContract.target);
      
      if (currentAllowance < usdcAmount) {
        console.log("🔓 Insufficient allowance, auto-approving USDC...");
        
        // Approve a larger amount (1000 USDC) to avoid frequent approvals
        const approveAmount = ethers.parseUnits("1000", decimals);
        const approveTx = await this.usdcContract.approve(this.opinioContract.target, approveAmount);
        
        console.log("📝 Approval transaction sent:", approveTx.hash);
        await approveTx.wait();
        console.log("✅ USDC approval confirmed!");
      }
      
      const tx = await this.opinioContract.buyShares(marketId, usdcAmount, isLong, optionId);
      const receipt = await tx.wait();
      
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to buy shares: ${error}`);
    }
  }

  async sellShares(marketId: number, amount: number, isLong: boolean, optionId: number): Promise<TransactionResult> {
    try {
      const decimals = await this.usdcContract.decimals();
      const usdcAmount = ethers.parseUnits(amount.toString(), decimals);
      
      const tx = await this.opinioContract.sellShares(marketId, usdcAmount, isLong, optionId);
      const receipt = await tx.wait();
      
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to sell shares: ${error}`);
    }
  }





  async getMarket(marketId: number): Promise<MarketData> {
    try {
      const data = await this.opinioContract.getMarket(marketId);
      return {
        marketId: data[0],
        creator: data[1],
        title: data[2],
        description: data[3],
        category: data[4],
        tags: data[5],
        endDate: data[6],
        totalLiquidity: data[7],
        totalShares: data[8],
        status: data[9],
        marketType: data[10],
        currentRate: data[11],
        cutBasisPoints: data[12],
        totalVotes: data[13],
        createdAt: data[14],
        isActive: data[15],
        minLiquidity: data[16],
        maxMarketSize: data[17]
      };
    } catch (error) {
      throw new Error(`Failed to get market: ${error}`);
    }
  }

  async getOption(marketId: number, optionId: number): Promise<OptionData> {
    try {
      const data = await this.opinioContract.getOption(marketId, optionId);
      return {
        optionId: data[0],
        optionText: data[1],
        totalShares: data[2],
        currentPrice: data[3],
        isWinning: data[4],
        totalVotes: data[5]
      };
    } catch (error) {
      throw new Error(`Failed to get option: ${error}`);
    }
  }

  async getUserPortfolio(userAddress: string): Promise<PortfolioData> {
    try {
      console.log(`🔍 Getting portfolio for address: ${userAddress}`);
      const data = await this.opinioContract.getUserPortfolio(userAddress);
      console.log(`✅ Portfolio data received:`, {
        user: data[0],
        totalValue: data[1].toString(),
        totalProfitLoss: data[2].toString(),
        totalInvested: data[3].toString(),
        activeMarketIds: data[4] ? data[4].map(id => id.toString()) : []
      });
      
      return {
        user: data[0],
        totalValue: data[1],
        totalProfitLoss: data[2],
        totalInvested: data[3],
        activeMarketIds: data[4] || []
      };
    } catch (error) {
      console.error(`❌ getUserPortfolio failed for ${userAddress}:`, error);
      // Return a default empty portfolio instead of throwing
      return {
        user: userAddress,
        totalValue: 0n,
        totalProfitLoss: 0n,
        totalInvested: 0n,
        activeMarketIds: []
      };
    }
  }

  async getUserShares(marketId: number, userAddress: string): Promise<UserSharesData> {
    try {
      const data = await this.opinioContract.getUserShares(marketId, userAddress);
      return {
        marketId: data[0],
        user: data[1],
        amount: data[2],
        price: data[3],
        timestamp: data[4],
        isLong: data[5],
        optionId: data[6]
      };
    } catch (error) {
      throw new Error(`Failed to get user shares: ${error}`);
    }
  }

  async getMarketOptions(marketId: number): Promise<OptionData[]> {
    try {
      const data = await this.opinioContract.getMarketOptions(marketId);
      return data.map((option: any) => ({
        optionId: option[0],
        optionText: option[1],
        totalShares: option[2],
        currentPrice: option[3],
        isWinning: option[4],
        totalVotes: option[5]
      }));
    } catch (error) {
      throw new Error(`Failed to get market options: ${error}`);
    }
  }

  async getMarketVotes(marketId: number): Promise<VoteData[]> {
    try {
      const data = await this.opinioContract.getMarketVotes(marketId);
      return data.map((vote: any) => ({
        voteId: vote[0],
        marketId: vote[1],
        user: vote[2],
        prediction: vote[3],
        confidence: vote[4],
        amount: vote[5],
        createdAt: vote[6]
      }));
    } catch (error) {
      throw new Error(`Failed to get market votes: ${error}`);
    }
  }

  async getUserPositions(userAddress: string): Promise<UserPosition[]> {
    try {
      const portfolio = await this.getUserPortfolio(userAddress);
      const positions: UserPosition[] = [];
      
      console.log('🔍 getUserPositions - Portfolio:', {
        user: portfolio.user,
        expectedUser: userAddress,
        activeMarketIds: portfolio.activeMarketIds.map(id => id.toString()),
        totalValue: portfolio.totalValue.toString(),
        totalInvested: portfolio.totalInvested.toString()
      });
      
      // Only filter if we have market IDs to process
      if (portfolio.activeMarketIds.length === 0) {
        console.log('ℹ️ No active market IDs found in portfolio');
        return positions;
      }
      
      // Check if portfolio user is zero address (contract issue)
      if (portfolio.user === '0x0000000000000000000000000000000000000000') {
        console.log('⚠️ Portfolio user is zero address - contract portfolio not properly initialized');
        console.log('📊 But we have activeMarketIds, so we can still process positions');
      }
      
      for (const marketIdBigInt of portfolio.activeMarketIds) {
        const marketId = Number(marketIdBigInt);
        console.log(`🔍 Processing market ${marketId}...`);
        
        try {
          const market = await this.getMarket(marketId);
          
          // Check if market has valid data
          if (!market.title || market.title.trim() === '') {
            console.warn(`⚠️ Market ${marketId} has empty title, skipping...`);
            continue;
          }
          
          const userShares = await this.getUserShares(marketId, userAddress);
          const options = await this.getMarketOptions(marketId);
          
          console.log(`📊 Market ${marketId} data:`, {
            title: market.title,
            userShares: {
              amount: userShares.amount.toString(),
              price: userShares.price.toString(),
              optionId: userShares.optionId.toString(),
              isLong: userShares.isLong
            },
            optionsCount: options.length
          });
          
          let option = options.find(opt => Number(opt.optionId) === Number(userShares.optionId));
          
          // Handle NO_OPTIONS markets (simple Yes/No) where options array is empty
          if (!option && options.length === 0) {
            console.log(`📝 Market ${marketId} has no options - creating default Yes/No option`);
            option = {
              optionId: userShares.optionId,
              optionText: userShares.isLong ? "Yes" : "No",
              totalShares: 0n,
              currentPrice: 500000n, // Default 0.5 price
              isWinning: false,
              totalVotes: 0n
            };
          }
          
          console.log(`🎯 Found/created option for ${marketId}:`, option ? {
            optionId: option.optionId.toString(),
            optionText: option.optionText,
            currentPrice: option.currentPrice.toString()
          } : 'NOT FOUND');
          
          if (option && Number(userShares.amount) > 0) {
            const shares = Number(userShares.amount) / 1e6; // Convert from wei to actual shares
            const avgPrice = Number(userShares.price) / 1e6; // Convert from wei
            const totalInvested = shares * avgPrice; // Calculate total invested from shares * price
            const currentPrice = Number(option.currentPrice) / 1e6;
            const currentValue = shares * currentPrice;
            const profitLoss = currentValue - totalInvested;
            const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
            
            positions.push({
              marketId: marketId.toString(),
              marketTitle: market.title,
              optionText: option.optionText,
              shares: shares.toString(),
              avgPrice: avgPrice.toFixed(6),
              totalInvested: totalInvested.toFixed(2),
              currentValue: currentValue.toFixed(2),
              profitLoss: profitLoss.toFixed(2),
              profitLossPercentage: profitLossPercentage.toFixed(2),
              isLong: userShares.isLong,
              createdAt: new Date(Number(userShares.timestamp) * 1000).toLocaleDateString()
            });
          }
        } catch (error) {
          console.warn(`❌ Failed to get position for market ${marketId}:`, error);
        }
      }
      
      console.log(`✅ getUserPositions returning ${positions.length} positions:`, positions);
      return positions;
    } catch (error) {
      console.error('❌ getUserPositions error:', error);
      throw new Error(`Failed to get user positions: ${error}`);
    }
  }

  async getUserVotes(userAddress: string): Promise<UserVote[]> {
    try {
      const portfolio = await this.getUserPortfolio(userAddress);
      const votes: UserVote[] = [];
      
      console.log(`🗳️ getUserVotes - Portfolio active markets:`, portfolio.activeMarketIds.map(id => id.toString()));
      
      // Get votes from all markets the user has participated in
      for (const marketIdBigInt of portfolio.activeMarketIds) {
        const marketId = Number(marketIdBigInt);
        try {
          console.log(`🗳️ Processing votes for market ${marketId}...`);
          
          const market = await this.getMarket(marketId);
          const marketVotes = await this.getMarketVotes(marketId);
          
          console.log(`🗳️ Market ${marketId} (${market.title}) has ${marketVotes.length} total votes`);
          
          // Filter votes by user
          const userVotesForMarket = marketVotes.filter(vote => 
            vote.user.toLowerCase() === userAddress.toLowerCase()
          );
          
          for (const vote of userVotesForMarket) {
            votes.push({
              marketId: marketId.toString(),
              marketTitle: market.title,
              prediction: Number(vote.prediction).toString(),
              confidence: Number(vote.confidence).toString(),
              amount: (Number(vote.amount) / 1e6).toFixed(2),
              timestamp: new Date(Number(vote.createdAt) * 1000).toLocaleDateString(),
              isActive: true // Votes are generally active unless market is resolved
            });
          }
        } catch (error) {
          console.warn(`Failed to get votes for market ${marketId}:`, error);
        }
      }
      
      return votes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      throw new Error(`Failed to get user votes: ${error}`);
    }
  }

  async getUserTradingSummary(userAddress: string): Promise<{
    totalTrades: number;
    totalVolume: string;
    totalProfitLoss: string;
    winRate: string;
    avgTradeSize: string;
    positions: UserPosition[];
    votes: UserVote[];
  }> {
    try {
      const [positions, votes, portfolio] = await Promise.all([
        this.getUserPositions(userAddress),
        this.getUserVotes(userAddress),
        this.getUserPortfolio(userAddress)
      ]);
      
      const totalTrades = positions.length + votes.length;
      const totalVolume = positions.reduce((sum, pos) => sum + parseFloat(pos.totalInvested), 0);
      const totalProfitLoss = parseFloat(portfolio.totalProfitLoss.toString()) / 1e6;
      
      const profitablePositions = positions.filter(pos => parseFloat(pos.profitLoss) > 0).length;
      const winRate = positions.length > 0 ? (profitablePositions / positions.length) * 100 : 0;
      const avgTradeSize = totalTrades > 0 ? totalVolume / totalTrades : 0;
      
      return {
        totalTrades,
        totalVolume: totalVolume.toFixed(2),
        totalProfitLoss: totalProfitLoss.toFixed(2),
        winRate: winRate.toFixed(1),
        avgTradeSize: avgTradeSize.toFixed(2),
        positions,
        votes
      };
    } catch (error) {
      throw new Error(`Failed to get trading summary: ${error}`);
    }
  }

  async addLiquidity(marketId: number, amount: number): Promise<TransactionResult> {
    try {
      const decimals = await this.usdcContract.decimals();
      const usdcAmount = ethers.parseUnits(amount.toString(), decimals);
      
      const tx = await this.opinioContract.addLiquidity(marketId, usdcAmount);
      const receipt = await tx.wait();
      
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to add liquidity: ${error}`);
    }
  }

  async removeLiquidity(marketId: number, amount: number): Promise<TransactionResult> {
    try {
      const decimals = await this.usdcContract.decimals();
      const usdcAmount = ethers.parseUnits(amount.toString(), decimals);
      
      const tx = await this.opinioContract.removeLiquidity(marketId, usdcAmount);
      const receipt = await tx.wait();
      
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to remove liquidity: ${error}`);
    }
  }

  async claimWinnings(marketId: number): Promise<TransactionResult> {
    try {
      const tx = await this.opinioContract.claimWinnings(marketId);
      const receipt = await tx.wait();
      
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to claim winnings: ${error}`);
    }
  }

  async getMarketCount(): Promise<string> {
    try {
      const count = await this.opinioContract.getMarketCount();
      return count.toString();
    } catch (error) {
      throw new Error(`Failed to get market count: ${error}`);
    }
  }

  async marketExists(marketId: number): Promise<boolean> {
    try {
      const marketCount = Number(await this.getMarketCount());
      if (marketId >= marketCount) {
        return false;
      }
      
      // Try to get basic market info to verify it exists and has data
      const market = await this.getMarket(marketId);
      return market.title && market.title.trim() !== '';
    } catch (error) {
      console.warn(`Market ${marketId} check failed:`, error);
      return false;
    }
  }

  async getVoteCount(): Promise<string> {
    try {
      const count = await this.opinioContract.getVoteCount();
      return count.toString();
    } catch (error) {
      throw new Error(`Failed to get vote count: ${error}`);
    }
  }

  async getTradingFee(): Promise<string> {
    try {
      const fee = await this.opinioContract.tradingFee();
      return fee.toString();
    } catch (error) {
      throw new Error(`Failed to get trading fee: ${error}`);
    }
  }

  async getLiquidityFee(): Promise<string> {
    try {
      const fee = await this.opinioContract.liquidityFee();
      return fee.toString();
    } catch (error) {
      throw new Error(`Failed to get liquidity fee: ${error}`);
    }
  }

  async getOwner(): Promise<string> {
    try {
      return await this.opinioContract.owner();
    } catch (error) {
      throw new Error(`Failed to get owner: ${error}`);
    }
  }

  async mintUSDC(amount: number): Promise<TransactionResult> {
    try {
      const decimals = await this.usdcContract.decimals();
      const usdcAmount = ethers.parseUnits(amount.toString(), decimals);
      
      const tx = await this.usdcContract.mint(await this.signer.getAddress(), usdcAmount);
      const receipt = await tx.wait();
      
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to mint USDC: ${error}`);
    }
  }
}

// Create a singleton instance
let opinioContractService: OpinioContractService | null = null;

export const initializeOpinioContract = (rpcUrl: string, privateKey: string) => {
  opinioContractService = new OpinioContractService(rpcUrl, privateKey);
  return opinioContractService;
};

export const initializeOpinioContractWithMetaMask = (browserProvider: ethers.BrowserProvider, browserSigner: ethers.Signer) => {
  opinioContractService = new OpinioContractService('', undefined, browserProvider, browserSigner);
  return opinioContractService;
};

export const getOpinioContractService = (): OpinioContractService => {
  if (!opinioContractService) {
    throw new Error("Opinio contract service not initialized. Call initializeOpinioContract or initializeOpinioContractWithMetaMask first.");
  }
  return opinioContractService;
};
