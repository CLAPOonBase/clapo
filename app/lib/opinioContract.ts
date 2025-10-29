import { Contract, ethers } from "ethers";


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
  "function getMarket(uint256 marketId) external view returns (tuple(uint256 marketId, address creator, string title, string description, string category, string[] tags, uint256 endDate, uint256 totalLiquidity, uint256 totalShares, uint8 status, uint8 marketType, uint256 currentRate, uint256 cutBasisPoints, uint256 totalVotes, uint256 createdAt, bool isActive, uint256 minLiquidity, uint256 maxMarketSize, uint256 totalLongShares, uint256 totalShortShares, uint256 totalLongVolume, uint256 totalShortVolume, uint256 currentLongPrice, uint256 currentShortPrice))",
  "function getMarketOptions(uint256 marketId) external view returns (tuple(uint256 optionId, string optionText, uint256 totalShares, uint256 currentPrice, bool isWinning, uint256 totalVotes)[])",
  "function getUserShares(uint256 marketId, address user) external view returns (tuple(uint256 marketId, address user, uint256 amount, uint256 price, uint256 timestamp, bool isLong, uint256 optionId))",
  "function getMarketVotes(uint256 marketId) external view returns (tuple(uint256 voteId, uint256 marketId, address user, uint256 prediction, uint256 confidence, uint256 amount, uint256 createdAt)[])",
  "function getUserPortfolio(address user) external view returns (tuple(address user, uint256 totalValue, uint256 totalProfitLoss, uint256 totalInvested, uint256[] activeMarketIds))",
  "function getMarketProbability(uint256 marketId) external view returns (uint256 yesPercentage, uint256 noPercentage)",
  "function getMarketPositions(uint256 marketId) external view returns (uint256 totalLongShares, uint256 totalShortShares, uint256 totalLongVolume, uint256 totalShortVolume, uint256 longPercentage, uint256 shortPercentage)",
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
  "function verifiedCreators(address) external view returns (bool)",
  "function getCurrentPrice(uint256 marketId, uint256 optionId) external view returns (uint256)",
  "function calculateOptionPrice(uint256 marketId, uint256 optionId) external view returns (uint256)",
  "function getMarketProbability(uint256 marketId) external view returns (uint256 yesPercentage, uint256 noPercentage)",
  "function getMarketPositions(uint256 marketId) external view returns (uint256 totalLongShares, uint256 totalShortShares, uint256 totalLongVolume, uint256 totalShortVolume, uint256 longPercentage, uint256 shortPercentage)",
  "event MarketCreated(uint256 indexed marketId, address indexed creator, string title, uint8 marketType)",
  "event SharesBought(uint256 indexed marketId, address indexed user, uint256 shares, uint256 amount, uint256 price, bool isLong)",
  "event SharesSold(uint256 indexed marketId, address indexed user, uint256 shares, uint256 proceeds, uint256 price, bool isLong)",
  "event PriceUpdated(uint256 indexed marketId, uint256 longPrice, uint256 shortPrice)"
];


const MOCK_USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
  "function totalSupply() external view returns (uint256)",
  "function mint(address to, uint256 amount) external"
];


const OPINIO_MARKET_ADDRESS = "0xF9A911bD8f2e2beCC18781ed467653bb2F515de5";
const MOCK_USDC_ADDRESS = "0xCADCa295a223E3DA821a243520df8e2a302C9840";


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
  status: ethers.BigNumberish;
  marketType: ethers.BigNumberish;
  currentRate: ethers.BigNumberish;
  cutBasisPoints: ethers.BigNumberish;
  totalVotes: ethers.BigNumberish;
  createdAt: ethers.BigNumberish;
  isActive: boolean;
  minLiquidity: ethers.BigNumberish;
  maxMarketSize: ethers.BigNumberish;
  totalLongShares: ethers.BigNumberish;
  totalShortShares: ethers.BigNumberish;
  totalLongVolume: ethers.BigNumberish;
  totalShortVolume: ethers.BigNumberish;
  currentLongPrice: ethers.BigNumberish;
  currentShortPrice: ethers.BigNumberish;
}

export interface OptionData {
  optionId: ethers.BigNumberish;
  optionText: string;
  totalShares: ethers.BigNumberish;
  currentPrice: ethers.BigNumberish;
  isWinning: boolean;
  totalVotes: ethers.BigNumberish;
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

export interface PortfolioData {
  user: string;
  totalValue: ethers.BigNumberish;
  totalProfitLoss: ethers.BigNumberish;
  totalInvested: ethers.BigNumberish;
  activeMarketIds: ethers.BigNumberish[];
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

export interface TransactionResult {
  hash: string;
  blockNumber: number;
  gasUsed: string;
}

export interface USDCStatus {
  balance: ethers.BigNumberish;
  allowance: ethers.BigNumberish;
  decimals: number;
  name: string;
  symbol: string;
  totalSupply: ethers.BigNumberish;
}

export class OpinioContractService {
  private opinioContract: any;
  private usdcContract: any;
  private signer: ethers.Signer | null = null;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.opinioContract = new Contract(OPINIO_MARKET_ADDRESS, OPINIO_MARKET_ABI, provider);
    this.usdcContract = new Contract(MOCK_USDC_ADDRESS, MOCK_USDC_ABI, provider);
    this.signer = signer || null;
    
    if (signer) {
      this.opinioContract = this.opinioContract.connect(signer);
      this.usdcContract = this.usdcContract.connect(signer);
    }
  }

  async connect(signer: ethers.Signer) {
    this.signer = signer;
    this.opinioContract = this.opinioContract.connect(signer);
    this.usdcContract = this.usdcContract.connect(signer);
  }

  async createMarket(
    title: string,
    description: string,
    category: string,
    tags: string[],
    endDate: number,
    marketType: number,
    initialLiquidity: number,
    minLiquidity: number,
    maxMarketSize: number
  ): Promise<TransactionResult> {
    try {
      const decimals = await this.usdcContract.decimals();
      const liquidityAmount = ethers.parseUnits(initialLiquidity.toString(), decimals);
      const minLiquidityAmount = ethers.parseUnits(minLiquidity.toString(), decimals);
      const maxMarketSizeAmount = ethers.parseUnits(maxMarketSize.toString(), decimals);
      

      const endDateTimestamp = endDate;
      
      const tx = await this.opinioContract.createMarket(
        title,
        description,
        category,
        tags,
        endDateTimestamp,
        marketType,
        liquidityAmount,
        minLiquidityAmount,
        maxMarketSizeAmount
      );
      
      const receipt = await tx.wait();
      
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
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
      
      const tx = await this.usdcContract.approve(this.opinioContract.target, usdcAmount);
      const receipt = await tx.wait();
      
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
      
      if (!this.signer) {
        throw new Error('Signer not initialized');
      }
      const userAddress = await this.signer.getAddress();
      const currentAllowance = await this.usdcContract.allowance(userAddress, this.opinioContract.target);
      
      if (currentAllowance < usdcAmount) {
        const approveAmount = ethers.parseUnits("1000", decimals);
        const approveTx = await this.usdcContract.approve(this.opinioContract.target, approveAmount);
        await approveTx.wait();
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

  async sellShares(marketId: number, sharesToSell: number, isLong: boolean, optionId: number): Promise<TransactionResult> {
    try {
      const decimals = await this.usdcContract.decimals();
      const sharesAmount = ethers.parseUnits(sharesToSell.toString(), decimals);
      
      const tx = await this.opinioContract.sellShares(marketId, sharesAmount, isLong, optionId);
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
        maxMarketSize: data[17],
        totalLongShares: data[18],
        totalShortShares: data[19],
        totalLongVolume: data[20],
        totalShortVolume: data[21],
        currentLongPrice: data[22],
        currentShortPrice: data[23]
      };
    } catch (error) {
      throw new Error(`Failed to get market: ${error}`);
    }
  }

  async getMarketOptions(marketId: number): Promise<OptionData[]> {
    try {
      const options = await this.opinioContract.getMarketOptions(marketId);
      return options.map((option: any) => ({
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

  async getUserShares(marketId: number, userAddress: string): Promise<any> {
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

  async getMarketVotes(marketId: number): Promise<VoteData[]> {
    try {
      const votes = await this.opinioContract.getMarketVotes(marketId);
      return votes.map((vote: any) => ({
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

  async getUserPortfolio(userAddress: string): Promise<PortfolioData> {
    try {
      const data = await this.opinioContract.getUserPortfolio(userAddress);
      return {
        user: data[0],
        totalValue: data[1],
        totalProfitLoss: data[2],
        totalInvested: data[3],
        activeMarketIds: data[4]
      };
    } catch (error) {
      throw new Error(`Failed to get user portfolio: ${error}`);
    }
  }

  async getMarketCount(): Promise<number> {
    try {
      const count = await this.opinioContract.getMarketCount();
      return Number(count);
    } catch (error) {
      throw new Error(`Failed to get market count: ${error}`);
    }
  }

  async getVoteCount(): Promise<number> {
    try {
      const count = await this.opinioContract.getVoteCount();
      return Number(count);
    } catch (error) {
      throw new Error(`Failed to get vote count: ${error}`);
    }
  }

  async getCurrentPrice(marketId: number, optionId: number): Promise<number> {
    try {
      const price = await this.opinioContract.getCurrentPrice(marketId, optionId);
      return Number(price) / 1e6;
    } catch (error) {
      throw new Error(`Failed to get current price: ${error}`);
    }
  }

  async getMarketProbability(marketId: number): Promise<{ yesPercentage: number; noPercentage: number }> {
    try {
      const [yesPercentage, noPercentage] = await this.opinioContract.getMarketProbability(marketId);
      return {
        yesPercentage: Number(yesPercentage),
        noPercentage: Number(noPercentage)
      };
    } catch (error) {
      throw new Error(`Failed to get market probability: ${error}`);
    }
  }

  async getMarketPositions(marketId: number): Promise<{
    totalLongShares: number;
    totalShortShares: number;
    totalLongVolume: number;
    totalShortVolume: number;
    longPercentage: number;
    shortPercentage: number;
  }> {
    try {
      const data = await this.opinioContract.getMarketPositions(marketId);
      return {
        totalLongShares: Number(data[0]) / 1e6,
        totalShortShares: Number(data[1]) / 1e6,
        totalLongVolume: Number(data[2]) / 1e6,
        totalShortVolume: Number(data[3]) / 1e6,
        longPercentage: Number(data[4]),
        shortPercentage: Number(data[5])
      };
    } catch (error) {
      throw new Error(`Failed to get market positions: ${error}`);
    }
  }

  async getMarketProbabilities(marketId: number): Promise<{yesPercent: number, noPercent: number, source: string} | null> {
    if (!this.opinioContract) {
      throw new Error("Contract not initialized");
    }

    try {
      console.log(`📊 Getting probabilities for market ${marketId} using new contract functions`);


      try {
        const [yesPercentage, noPercentage] = await this.opinioContract.getMarketProbability(marketId);
        const yesPercent = Number(yesPercentage);
        const noPercent = Number(noPercentage);
        
        console.log(`✅ Contract probability calculation: YES ${yesPercent}%, NO ${noPercent}%`);
        

        try {
          const positions = await this.opinioContract.getMarketPositions(marketId);
          const totalLongShares = Number(positions[0]) / 1e6;
          const totalShortShares = Number(positions[1]) / 1e6;
          const longPercentage = Number(positions[4]);
          const shortPercentage = Number(positions[5]);
          
          console.log(`📈 Position breakdown: ${totalLongShares.toFixed(2)} LONG (${longPercentage}%), ${totalShortShares.toFixed(2)} SHORT (${shortPercentage}%)`);
        } catch (positionError) {
          console.log('⚠️ Could not get position details:', positionError.message);
        }
        
        return { 
          yesPercent, 
          noPercent, 
          source: 'Real-time Contract Calculation' 
        };
      } catch (probabilityError) {
        console.log('⚠️ Could not get contract probability:', probabilityError.message);
      }


      const market = await this.opinioContract.getMarket(marketId);
      console.log(`📊 Market type: ${market.marketType}, currentRate: ${Number(market.currentRate)}`);

      if (market.marketType === 1) { // WITH_OPTIONS
        const options = await this.opinioContract.getMarketOptions(marketId);
        if (options && options.length >= 2) {
          const yesShares = Number(options[0].totalShares) / 1e6;
          const noShares = Number(options[1].totalShares) / 1e6;
          const totalShares = yesShares + noShares;
          
          if (totalShares > 0) {
            const yesPercent = (yesShares / totalShares) * 100;
            const noPercent = (noShares / totalShares) * 100;
            console.log(`✅ WITH_OPTIONS fallback: YES ${yesPercent.toFixed(1)}%, NO ${noPercent.toFixed(1)}%`);
            return { yesPercent, noPercent, source: 'Option Shares Distribution' };
          }
        }
      }


      const currentRate = Number(market.currentRate);
      if (currentRate > 0) {
        const yesPercent = currentRate / 10;
        const noPercent = 100 - yesPercent;
        console.log(`✅ CurrentRate fallback: ${currentRate} -> YES ${yesPercent.toFixed(1)}%, NO ${noPercent.toFixed(1)}%`);
        return { yesPercent, noPercent, source: 'Market Rate Fallback' };
      }

      return null;
    } catch (error) {
      console.error('❌ Error getting market probabilities:', error);
      return null;
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
      

      if (portfolio.activeMarketIds.length === 0) {
        console.log('ℹ️ No active market IDs found in portfolio');
        return positions;
      }
      

      if (portfolio.user === '0x0000000000000000000000000000000000000000') {
        console.log('⚠️ Portfolio user is zero address - contract portfolio not properly initialized');
        console.log('📊 But we have activeMarketIds, so we can still process positions');
      }
      
      for (const marketIdBigInt of portfolio.activeMarketIds) {
        const marketId = Number(marketIdBigInt);
        console.log(`🔍 Processing market ${marketId}...`);
        
        try {
          const market = await this.getMarket(marketId);
          

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
          

          if (!option) {
            console.log(`📝 Market ${marketId} has no options - creating default Yes/No option`);
            option = {
              optionId: userShares.optionId,
              optionText: userShares.isLong ? "Yes" : "No",
              totalShares: 0n,
              currentPrice: userShares.price,
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
            const totalInvested = Number(userShares.amount) / 1e6;
            const avgPrice = Number(userShares.price) / 1e6;
            const shares = totalInvested / avgPrice;
            
            let currentPrice;
            if (market.marketType === 0) {
              currentPrice = userShares.isLong 
                ? Number(market.currentLongPrice) / 1e6 
                : Number(market.currentShortPrice) / 1e6;
            } else {
              currentPrice = Number(option.currentPrice) / 1e6;
            }
            
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
      

      for (const marketIdBigInt of portfolio.activeMarketIds) {
        const marketId = Number(marketIdBigInt);
        try {
          console.log(`🗳️ Processing votes for market ${marketId}...`);
          
          const market = await this.getMarket(marketId);
          const marketVotes = await this.getMarketVotes(marketId);
          
          console.log(`🗳️ Market ${marketId} (${market.title}) has ${marketVotes.length} total votes`);
          

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
              isActive: true
            });
          }
        } catch (error) {
          console.warn(`❌ Failed to get votes for market ${marketId}:`, error);
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
      throw new Error(`Failed to get user trading summary: ${error}`);
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
      
      if (!this.signer) {
        throw new Error('Signer not initialized');
      }
      const userAddress = await this.signer.getAddress();
      const tx = await this.usdcContract.mint(userAddress, usdcAmount);
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

  async getAllMarkets(): Promise<MarketData[]> {
    try {
      const marketCount = await this.getMarketCount();
      const markets: MarketData[] = [];
      
      for (let i = 1; i <= marketCount; i++) {
        try {
          const market = await this.getMarket(i);
          if (market.title && market.title.trim() !== '') {
            markets.push(market);
          }
        } catch (error) {
          console.warn(`Failed to get market ${i}:`, error);
        }
      }
      
      return markets;
    } catch (error) {
      throw new Error(`Failed to get all markets: ${error}`);
    }
  }

  async getUSDCStatus(userAddress: string): Promise<USDCStatus> {
    try {
      const [balance, allowance, decimals, symbol, name, totalSupply] = await Promise.all([
        this.usdcContract.balanceOf(userAddress),
        this.usdcContract.allowance(userAddress, this.opinioContract.target),
        this.usdcContract.decimals(),
        this.usdcContract.symbol(),
        this.usdcContract.name(),
        this.usdcContract.totalSupply()
      ]);
      
      return {
        balance,
        allowance,
        decimals: Number(decimals),
        name,
        symbol,
        totalSupply
      };
    } catch (error) {
      throw new Error(`Failed to get USDC status: ${error}`);
    }
  }
}
