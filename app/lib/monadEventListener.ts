/**
 * Monad Blockchain Event Listener Service
 *
 * This service listens to buy/sell events from the Monad contract
 * Contract Address: 0xdb61267b2b233A47bf56F551528CCB93f9788C6a
 *
 * NOTE: This is a frontend reference implementation.
 * For production, implement this on your backend server.
 */

import { ethers } from 'ethers';

// Contract ABI - You need to update this with your actual contract ABI
const CONTRACT_ABI = [
  // Buy event
  "event TokenPurchased(address indexed buyer, string indexed tokenUuid, uint256 amount, uint256 pricePerToken, uint256 totalCost, bool isFreebie)",

  // Sell event
  "event TokenSold(address indexed seller, string indexed tokenUuid, uint256 amount, uint256 pricePerToken, uint256 totalProceeds)",

  // You can add more events from your contract here
];

export interface BlockchainEvent {
  eventName: string;
  userAddress: string;
  tokenUuid: string;
  amount: number;
  pricePerToken: number;
  totalValue: number;
  isFreebie?: boolean;
  txHash: string;
  blockNumber: number;
  timestamp: number;
}

export class MonadEventListener {
  private provider: ethers.providers.Provider;
  private contract: ethers.Contract;
  private contractAddress: string = '0xdb61267b2b233A47bf56F551528CCB93f9788C6a';

  constructor(rpcUrl: string) {
    // Initialize provider for Monad network
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    // Initialize contract
    this.contract = new ethers.Contract(
      this.contractAddress,
      CONTRACT_ABI,
      this.provider
    );
  }

  /**
   * Start listening to buy/sell events
   */
  async startListening(onEvent: (event: BlockchainEvent) => void) {
    console.log(`🎧 Starting to listen to events from ${this.contractAddress}`);

    // Listen to TokenPurchased events (Buy)
    this.contract.on('TokenPurchased', async (buyer, tokenUuid, amount, pricePerToken, totalCost, isFreebie, event) => {
      try {
        const block = await this.provider.getBlock(event.blockNumber);

        const blockchainEvent: BlockchainEvent = {
          eventName: 'TokenPurchased',
          userAddress: buyer,
          tokenUuid: tokenUuid,
          amount: Number(amount),
          pricePerToken: Number(ethers.utils.formatEther(pricePerToken)),
          totalValue: Number(ethers.utils.formatEther(totalCost)),
          isFreebie: isFreebie,
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: block.timestamp,
        };

        console.log('📈 Buy Event:', blockchainEvent);
        onEvent(blockchainEvent);
      } catch (error) {
        console.error('Error processing TokenPurchased event:', error);
      }
    });

    // Listen to TokenSold events (Sell)
    this.contract.on('TokenSold', async (seller, tokenUuid, amount, pricePerToken, totalProceeds, event) => {
      try {
        const block = await this.provider.getBlock(event.blockNumber);

        const blockchainEvent: BlockchainEvent = {
          eventName: 'TokenSold',
          userAddress: seller,
          tokenUuid: tokenUuid,
          amount: Number(amount),
          pricePerToken: Number(ethers.utils.formatEther(pricePerToken)),
          totalValue: Number(ethers.utils.formatEther(totalProceeds)),
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: block.timestamp,
        };

        console.log('📉 Sell Event:', blockchainEvent);
        onEvent(blockchainEvent);
      } catch (error) {
        console.error('Error processing TokenSold event:', error);
      }
    });
  }

  /**
   * Stop listening to events
   */
  stopListening() {
    this.contract.removeAllListeners();
    console.log('🛑 Stopped listening to events');
  }

  /**
   * Fetch historical events from a specific block range
   */
  async getHistoricalEvents(fromBlock: number, toBlock: number | 'latest'): Promise<BlockchainEvent[]> {
    const events: BlockchainEvent[] = [];

    try {
      // Get TokenPurchased events
      const buyFilter = this.contract.filters.TokenPurchased();
      const buyEvents = await this.contract.queryFilter(buyFilter, fromBlock, toBlock);

      for (const event of buyEvents) {
        const block = await this.provider.getBlock(event.blockNumber);
        const parsedEvent = this.contract.interface.parseLog(event);

        events.push({
          eventName: 'TokenPurchased',
          userAddress: parsedEvent.args.buyer,
          tokenUuid: parsedEvent.args.tokenUuid,
          amount: Number(parsedEvent.args.amount),
          pricePerToken: Number(ethers.utils.formatEther(parsedEvent.args.pricePerToken)),
          totalValue: Number(ethers.utils.formatEther(parsedEvent.args.totalCost)),
          isFreebie: parsedEvent.args.isFreebie,
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: block.timestamp,
        });
      }

      // Get TokenSold events
      const sellFilter = this.contract.filters.TokenSold();
      const sellEvents = await this.contract.queryFilter(sellFilter, fromBlock, toBlock);

      for (const event of sellEvents) {
        const block = await this.provider.getBlock(event.blockNumber);
        const parsedEvent = this.contract.interface.parseLog(event);

        events.push({
          eventName: 'TokenSold',
          userAddress: parsedEvent.args.seller,
          tokenUuid: parsedEvent.args.tokenUuid,
          amount: Number(parsedEvent.args.amount),
          pricePerToken: Number(ethers.utils.formatEther(parsedEvent.args.pricePerToken)),
          totalValue: Number(ethers.utils.formatEther(parsedEvent.args.totalProceeds)),
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: block.timestamp,
        });
      }

      // Sort by block number (newest first)
      return events.sort((a, b) => b.blockNumber - a.blockNumber);
    } catch (error) {
      console.error('Error fetching historical events:', error);
      return [];
    }
  }

  /**
   * Get current block number
   */
  async getCurrentBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }
}

/**
 * Example usage (for backend implementation):
 *
 * // Initialize the listener
 * const listener = new MonadEventListener(process.env.MONAD_RPC_URL);
 *
 * // Start listening and save events to database
 * listener.startListening(async (event) => {
 *   // Save to database
 *   await saveEventToDatabase(event);
 *
 *   // Optionally: Trigger real-time updates via WebSocket
 *   broadcastToClients(event);
 * });
 *
 * // Or fetch historical events
 * const historicalEvents = await listener.getHistoricalEvents(1000000, 'latest');
 * for (const event of historicalEvents) {
 *   await saveEventToDatabase(event);
 * }
 */
