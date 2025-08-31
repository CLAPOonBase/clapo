const { ethers } = require("ethers");

// Contract addresses and ABI
const OPINIO_MARKET_ADDRESS = "0xDfd05ed372C5eD9f7aaD54A5A2d5A5c94a99f5fb";
const RPC_URL = "https://testnet-rpc.monad.xyz";
const USER_ADDRESS = "0x8B59a4c14fa19BfF570616f641887FDd4e54aec0";

// OpinioMarket Contract ABI - Key functions only
const OPINIO_MARKET_ABI = [
  "function getMarket(uint256 marketId) external view returns (tuple(uint256 marketId, address creator, string title, string description, string category, string[] tags, uint256 endDate, uint256 totalLiquidity, uint256 totalShares, uint8 status, uint8 marketType, uint256 currentRate, uint256 cutBasisPoints, uint256 totalVotes, uint256 createdAt, bool isActive, uint256 minLiquidity, uint256 maxMarketSize))",
  "function getMarketVotes(uint256 marketId) external view returns (tuple(uint256 voteId, uint256 marketId, address user, uint256 prediction, uint256 confidence, uint256 amount, uint256 createdAt)[])",
  "function getUserShares(uint256 marketId, address user) external view returns (tuple(uint256 marketId, address user, uint256 amount, uint256 price, uint256 timestamp, bool isLong, uint256 optionId))",
  "function getUserPortfolio(address user) external view returns (tuple(address user, uint256 totalValue, uint256 totalProfitLoss, uint256 totalInvested, uint256[] activeMarketIds))",
  "function getMarketCount() external view returns (uint256)",
  "function getVoteCount() external view returns (uint256)"
];

async function getAllUserData() {
  try {
    console.log("🔗 Connecting to Monad Testnet...");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(OPINIO_MARKET_ADDRESS, OPINIO_MARKET_ABI, provider);

    console.log(`📊 Fetching data for user: ${USER_ADDRESS}`);
    console.log("=" * 80);

    // Get market count
    const marketCount = await contract.getMarketCount();
    console.log(`📈 Total markets in contract: ${marketCount.toString()}`);

    // Get user portfolio
    let portfolio;
    try {
      portfolio = await contract.getUserPortfolio(USER_ADDRESS);
      console.log(`💼 Portfolio data:`, {
        user: portfolio[0],
        totalValue: ethers.formatUnits(portfolio[1], 6),
        totalProfitLoss: ethers.formatUnits(portfolio[2], 6),
        totalInvested: ethers.formatUnits(portfolio[3], 6),
        activeMarketIds: portfolio[4].map(id => id.toString())
      });
    } catch (error) {
      console.error("❌ Failed to get portfolio:", error.message);
      portfolio = [USER_ADDRESS, 0n, 0n, 0n, []];
    }

    console.log("\n🗳️ SEARCHING FOR ALL VOTES...");
    console.log("=" * 50);

    let allUserVotes = [];
    let allUserTrades = [];

    // Check all markets for votes and trades
    for (let marketId = 0; marketId < Number(marketCount); marketId++) {
      try {
        console.log(`\n🔍 Checking market ${marketId}...`);
        
        // Get market info
        let market;
        try {
          market = await contract.getMarket(marketId);
          if (!market[2] || market[2].trim() === '') {
            console.log(`⚠️ Market ${marketId} has no title, skipping...`);
            continue;
          }
          console.log(`📝 Market ${marketId}: "${market[2]}"`);
        } catch (error) {
          console.log(`⚠️ Market ${marketId} doesn't exist, skipping...`);
          continue;
        }

        // Check for votes in this market
        try {
          const marketVotes = await contract.getMarketVotes(marketId);
          const userVotes = marketVotes.filter(vote => 
            vote[2].toLowerCase() === USER_ADDRESS.toLowerCase()
          );
          
          if (userVotes.length > 0) {
            console.log(`🗳️ Found ${userVotes.length} vote(s) in market ${marketId}`);
            userVotes.forEach(vote => {
              allUserVotes.push({
                marketId: marketId,
                marketTitle: market[2],
                voteId: vote[0].toString(),
                prediction: vote[3].toString(),
                confidence: vote[4].toString(),
                amount: ethers.formatUnits(vote[5], 6),
                createdAt: new Date(Number(vote[6]) * 1000).toLocaleString()
              });
            });
          }
        } catch (error) {
          console.log(`⚠️ Failed to get votes for market ${marketId}:`, error.message);
        }

        // Check for trades/positions in this market
        try {
          const userShares = await contract.getUserShares(marketId, USER_ADDRESS);
          if (Number(userShares[2]) > 0) { // if amount > 0
            console.log(`📊 Found position in market ${marketId}`);
            allUserTrades.push({
              marketId: marketId,
              marketTitle: market[2],
              marketIdFromShare: userShares[0].toString(),
              user: userShares[1],
              amount: ethers.formatUnits(userShares[2], 6),
              price: ethers.formatUnits(userShares[3], 6),
              createdAt: new Date(Number(userShares[4]) * 1000).toLocaleString(),
              isLong: userShares[5],
              optionId: userShares[6].toString()
            });
          }
        } catch (error) {
          console.log(`⚠️ Failed to get shares for market ${marketId}:`, error.message);
        }

      } catch (error) {
        console.log(`❌ Error processing market ${marketId}:`, error.message);
      }
    }

    // Print results
    console.log("\n" + "=" * 80);
    console.log("📊 FINAL RESULTS");
    console.log("=" * 80);

    console.log(`\n🗳️ TOTAL VOTES FOUND: ${allUserVotes.length}`);
    if (allUserVotes.length > 0) {
      console.log("─".repeat(80));
      allUserVotes.forEach((vote, index) => {
        console.log(`Vote ${index + 1}:`);
        console.log(`  Market: ${vote.marketTitle} (ID: ${vote.marketId})`);
        console.log(`  Prediction: Option ${vote.prediction}`);
        console.log(`  Confidence: ${vote.confidence}%`);
        console.log(`  Amount: $${vote.amount}`);
        console.log(`  Date: ${vote.createdAt}`);
        console.log(`  Vote ID: ${vote.voteId}`);
        console.log("");
      });
    }

    console.log(`\n📊 TOTAL TRADES/POSITIONS FOUND: ${allUserTrades.length}`);
    if (allUserTrades.length > 0) {
      console.log("─".repeat(80));
      allUserTrades.forEach((trade, index) => {
        console.log(`Trade ${index + 1}:`);
        console.log(`  Market: ${trade.marketTitle} (ID: ${trade.marketId})`);
        console.log(`  Option ID: ${trade.optionId}`);
        console.log(`  Amount: ${trade.amount}`);
        console.log(`  Price: $${trade.price}`);
        console.log(`  Total Invested: $${(parseFloat(trade.amount) * parseFloat(trade.price)).toFixed(2)}`);
        console.log(`  Position: ${trade.isLong ? 'LONG' : 'SHORT'}`);
        console.log(`  Date: ${trade.createdAt}`);
        console.log(`  User: ${trade.user}`);
        console.log("");
      });
    }

    console.log("\n📈 SUMMARY:");
    console.log(`  Total Votes: ${allUserVotes.length}`);
    console.log(`  Total Trades: ${allUserTrades.length}`);
    console.log(`  Total Markets Checked: ${marketCount.toString()}`);

    return {
      votes: allUserVotes,
      trades: allUserTrades,
      portfolio: portfolio
    };

  } catch (error) {
    console.error("❌ Script failed:", error);
  }
}

// Run the script
getAllUserData().then(() => {
  console.log("\n✅ Script completed!");
  process.exit(0);
}).catch(error => {
  console.error("💥 Script crashed:", error);
  process.exit(1);
});
