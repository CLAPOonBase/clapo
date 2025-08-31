// Browser console script to create Pradeep's market
// Run this in the browser console when you're on the Opinio page with wallet connected

async function createPradeepMarketFromBrowser() {
  try {
    console.log("🚀 Starting market creation...");
    
    // Check if we're on the right page and have access to the contract functions
    if (typeof window === 'undefined') {
      throw new Error("This script must be run in a browser console");
    }

    // Try to access the OpinioContext or contract functions
    // We'll use the same approach as the frontend
    const { ethers } = window;
    if (!ethers) {
      console.log("❌ Ethers not found. Make sure you're on the Opinio page.");
      return;
    }

    // Contract details (same as in opinioContract.ts)
    const OPINIO_MARKET_ADDRESS = "0xDfd05ed372C5eD9f7aaD54A5A2d5A5c94a99f5fb";
    const OPINIO_MARKET_ABI = [
      "function createMarket(string memory title, string memory description, string memory category, string[] memory tags, uint256 endDate, uint8 marketType, uint256 initialLiquidity, uint256 minLiquidity, uint256 maxMarketSize) external returns (uint256)"
    ];

    // Get provider and signer
    if (!window.ethereum) {
      throw new Error("No wallet detected. Please connect your wallet first.");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(OPINIO_MARKET_ADDRESS, OPINIO_MARKET_ABI, signer);

    console.log("📝 Contract connected:", OPINIO_MARKET_ADDRESS);
    console.log("👤 Signer address:", await signer.getAddress());

    // Market parameters
    const title = "Should Pradeep get a bike cleaning lube kit or Manforce lube?";
    const description = "Help Pradeep decide between practical bike maintenance or personal care products. Vote for the better choice!";
    const category = "Lifestyle";
    const tags = ["lifestyle", "decision", "products", "pradeep"];
    
    // End date: 2 days from now
    const currentTime = Math.floor(Date.now() / 1000);
    const twoDaysInSeconds = 2 * 24 * 60 * 60;
    const endDate = currentTime + twoDaysInSeconds;
    
    const marketType = 0; // BINARY
    const initialLiquidity = ethers.parseUnits("100", 6); // 100 USDC
    const minLiquidity = ethers.parseUnits("50", 6);      // 50 USDC  
    const maxMarketSize = ethers.parseUnits("10000", 6);  // 10,000 USDC

    console.log("📊 Market Details:");
    console.log("Title:", title);
    console.log("Description:", description);
    console.log("Category:", category);
    console.log("Tags:", tags);
    console.log("End Date:", new Date(endDate * 1000).toLocaleString());
    console.log("Market Type:", marketType);
    console.log("Initial Liquidity:", "100 USDC");

    // Create the market
    console.log("🔄 Submitting transaction...");
    
    const tx = await contract.createMarket(
      title,
      description,
      category,
      tags,
      endDate,
      marketType,
      initialLiquidity,
      minLiquidity,
      maxMarketSize,
      { 
        gasLimit: 800000,
        // Add some extra gas price for faster confirmation
        gasPrice: ethers.parseUnits("100", "gwei")
      }
    );

    console.log("📝 Transaction submitted:", tx.hash);
    console.log("⏳ Waiting for confirmation...");

    const receipt = await tx.wait();
    
    console.log("✅ Market created successfully!");
    console.log("🧾 Transaction Receipt:");
    console.log("  - Block Number:", receipt.blockNumber);
    console.log("  - Gas Used:", receipt.gasUsed.toString());
    console.log("  - Transaction Hash:", receipt.hash);

    // Try to get the market ID from the event
    try {
      const marketCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed && parsed.name === 'MarketCreated';
        } catch (e) {
          return false;
        }
      });

      if (marketCreatedEvent) {
        const parsed = contract.interface.parseLog(marketCreatedEvent);
        console.log("🆔 New Market ID:", parsed.args.marketId.toString());
        console.log("🎉 Market successfully created! Refresh the page to see it in the markets list.");
      }
    } catch (e) {
      console.log("ℹ️  Market created but couldn't parse event. Refresh the page to see the new market.");
    }

    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    };

  } catch (error) {
    console.error("❌ Error creating market:", error);
    
    if (error.code === 'CALL_EXCEPTION') {
      console.log("💡 This might be because:");
      console.log("  - You're not a verified creator");
      console.log("  - Insufficient USDC balance");
      console.log("  - Network issues");
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Instructions
console.log(`
🎯 INSTRUCTIONS TO CREATE PRADEEP'S MARKET:

1. Make sure you're on the Opinio page (/opinio)
2. Connect your wallet with the private key
3. Make sure you have some MONAD for gas fees
4. Run this command in the console:

   createPradeepMarketFromBrowser()

5. Approve the transaction in your wallet
6. Wait for confirmation
7. Refresh the page to see the new market!

Ready to create the market? Run: createPradeepMarketFromBrowser()
`);

// Make the function available globally
window.createPradeepMarketFromBrowser = createPradeepMarketFromBrowser;


