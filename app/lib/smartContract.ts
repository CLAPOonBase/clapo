import { Contract, ethers } from "ethers";

// Contract ABI
const CONTRACT_ABI = [
  "function addCreatorToWhitelist(address creator)",
  "function createMarket(string calldata description) public returns (uint256)",
  "function buy(uint256 marketId, bool yes, uint256 usdcAmount)",
  "function resolveMarket(uint256 marketId, bool yesWins)",
  "function claim(uint256 marketId)",
  "function withdrawFees(uint256 marketId)",
  
  // View functions
  "function getPrices(uint256 marketId) public view returns (uint256 priceYes, uint256 priceNo)",
  "function whitelistedCreators(address wallet) public returns (bool)",
  "function marketCount() public view returns (uint256)",
  "function markets(uint256 id) view returns (string description,uint8 result,bool resolved,uint256 totalYes,uint256 totalNo, uint256 feeAccrued, address createdBy)"
];

// USDC ABI
const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

// Contract addresses
const CONTRACT_ADDRESS = "0xb2B2f164Fb38a861eA80C6B2df4F645a7d4cF85a";
const USDC_CONTRACT_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

// Types
export interface MarketData {
  description: string;
  result: number;
  resolved: boolean;
  totalYes: ethers.BigNumberish;
  totalNo: ethers.BigNumberish;
  feeAccrued: ethers.BigNumberish;
  createdBy: string;
}

export interface PriceData {
  priceYes: ethers.BigNumberish;
  priceNo: ethers.BigNumberish;
}

export interface USDCStatus {
  balance: ethers.BigNumberish;
  allowance: ethers.BigNumberish;
  decimals: number;
}

export interface TransactionResult {
  hash: string;
  blockNumber: number;
  gasUsed: string;
}

export class SmartContractService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: Contract;
  private usdcContract: Contract;

  constructor(rpcUrl: string, privateKey: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet);
    this.usdcContract = new Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, this.wallet);
  }

  // Get wallet address
  async getWalletAddress(): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    return await this.wallet.getAddress();
  }

  // Get current network info
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

  // Check USDC status
  async checkUSDCStatus(): Promise<USDCStatus> {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not initialized');
      }
      const userAddress = await this.wallet.getAddress();
      console.log('Checking USDC status for address:', userAddress);
      console.log('USDC contract address:', USDC_CONTRACT_ADDRESS);
      
      // First check if the USDC contract exists
      const code = await this.provider.getCode(USDC_CONTRACT_ADDRESS);
      if (code === '0x') {
        throw new Error(`USDC contract not found at address ${USDC_CONTRACT_ADDRESS}. This might be the wrong network or contract address.`);
      }
      console.log('USDC contract code found, length:', code.length);
      
      // Check if user address is valid
      if (!userAddress || userAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('Invalid wallet address');
      }
      
      // Try to get decimals first
      let decimals;
      try {
        decimals = await this.usdcContract.decimals();
        console.log('USDC decimals:', decimals);
      } catch (decimalsError) {
        console.error('Failed to get USDC decimals:', decimalsError);
        throw new Error(`Failed to get USDC decimals: ${decimalsError}`);
      }
      
      // Try to get balance
      let balance;
      try {
        balance = await this.usdcContract.balanceOf(userAddress);
        console.log('USDC balance raw:', balance.toString());
      } catch (balanceError) {
        console.error('Failed to get USDC balance:', balanceError);
        throw new Error(`Failed to get USDC balance: ${balanceError}`);
      }
      
      // Try to get allowance
      let allowance;
      try {
        allowance = await this.usdcContract.allowance(userAddress, this.contract.target);
        console.log('USDC allowance raw:', allowance.toString());
      } catch (allowanceError) {
        console.error('Failed to get USDC allowance:', allowanceError);
        throw new Error(`Failed to get USDC allowance: ${allowanceError}`);
      }

      return { balance, allowance, decimals };
    } catch (error) {
      console.error('Detailed USDC status error:', error);
      throw new Error(`Failed to check USDC status: ${error}`);
    }
  }

  // Buy shares
  async buyShares(marketId: number, side: boolean, usdcAmountInDollars: number = 10): Promise<TransactionResult> {
    try {
      console.log(`Attempting to buy ${usdcAmountInDollars} USDC worth of shares (side: ${side ? 'YES' : 'NO'})`);
      
      const decimals = await this.usdcContract.decimals();
      const usdcAmount = ethers.parseUnits(usdcAmountInDollars.toString(), decimals);
      
      if (!this.wallet) {
        throw new Error('Wallet not initialized');
      }
      const userAddress = await this.wallet.getAddress();
      const balance = await this.usdcContract.balanceOf(userAddress);

      if (balance < usdcAmount) {
        throw new Error(`Insufficient USDC balance. You have ${ethers.formatUnits(balance, decimals)} USDC, need ${usdcAmountInDollars} USDC`);
      }

      const currentAllowance = await this.usdcContract.allowance(userAddress, this.contract.target);
      
      if (currentAllowance < usdcAmount) {
        console.log("Insufficient allowance, approving USDC...");
        
        const approveAmount = ethers.parseUnits("1000", decimals); // Approve 1000 USDC
        const approveTx = await this.usdcContract.approve(this.contract.target, approveAmount);
        
        console.log("Approval transaction sent:", approveTx.hash);
        await approveTx.wait();
        console.log("USDC approval confirmed!");
      }

      console.log("Calling buy function...");
      const tx = await this.contract.buy(marketId, side, usdcAmount);
      
      console.log("Buy transaction sent successfully!!", tx.hash);
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

  // Get market prices
  async getPrices(marketId: number): Promise<PriceData> {
    try {
      const data = await this.contract.getPrices(marketId);
      return {
        priceYes: data[0],
        priceNo: data[1]
      };
    } catch (error) {
      throw new Error(`Failed to get prices: ${error}`);
    }
  }

  // Create market
  async createMarket(description: string): Promise<{ marketId: string; transaction: TransactionResult }> {
    try {
      // First simulate the call to get the return value
      const marketId = await this.contract.createMarket.staticCall(description);
      console.log("Market ID will be:", marketId.toString());

      // Create the market
      const tx = await this.contract.createMarket(description);
      console.log("Transaction hash:", tx.hash);

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

  // Get market count
  async getMarketCount(): Promise<string> {
    try {
      const count = await this.contract.marketCount();
      return count.toString();
    } catch (error) {
      throw new Error(`Failed to get market count: ${error}`);
    }
  }

  // Get market details
  async getMarketDetails(id: number): Promise<MarketData> {
    try {
      const data = await this.contract.markets(id);
      return {
        description: data[0],
        result: data[1],
        resolved: data[2],
        totalYes: data[3],
        totalNo: data[4],
        feeAccrued: data[5],
        createdBy: data[6]
      };
    } catch (error) {
      throw new Error(`Failed to get market details: ${error}`);
    }
  }

  // Add creator to whitelist
  async addCreatorToWhitelist(address: string): Promise<TransactionResult> {
    try {
      const tx = await this.contract.addCreatorToWhitelist(address);
      console.log("Transaction sent:", tx.hash);
      
      const receipt = await tx.wait();
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to add creator to whitelist: ${error}`);
    }
  }

  // Resolve market
  async resolveMarket(marketId: number, side: boolean): Promise<TransactionResult> {
    try {
      const tx = await this.contract.resolveMarket(marketId, side);
      console.log("Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to resolve market: ${error}`);
    }
  }

  // Claim reward
  async claimReward(marketId: number): Promise<TransactionResult> {
    try {
      const tx = await this.contract.claim(marketId);
      console.log("Claim transaction sent:", tx.hash);

      const receipt = await tx.wait();
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to claim reward: ${error}`);
    }
  }

  // Withdraw fees
  async withdrawFees(marketId: number): Promise<TransactionResult> {
    try {
      const tx = await this.contract.withdrawFees(marketId);
      console.log("Withdraw fees transaction sent:", tx.hash);

      const receipt = await tx.wait();
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to withdraw fees: ${error}`);
    }
  }

  // Check if address is whitelisted
  async isWhitelisted(address: string): Promise<boolean> {
    try {
      return await this.contract.whitelistedCreators(address);
    } catch (error) {
      throw new Error(`Failed to check whitelist status: ${error}`);
    }
  }
}

// Create a singleton instance (you'll need to initialize this with your RPC URL and private key)
let smartContractService: SmartContractService | null = null;

export const initializeSmartContract = (rpcUrl: string, privateKey: string) => {
  smartContractService = new SmartContractService(rpcUrl, privateKey);
  return smartContractService;
};

export const getSmartContractService = (): SmartContractService => {
  if (!smartContractService) {
    throw new Error("Smart contract service not initialized. Call initializeSmartContract first.");
  }
  return smartContractService;
};
