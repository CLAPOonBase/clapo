// Script to create Pradeep's lube market
// You can run this in the browser console when connected to the Opinio frontend

async function createPradeepMarket() {
  // Market details
  const marketData = {
    title: "Should Pradeep get a bike cleaning lube kit or Manforce lube?",
    description: "Help Pradeep decide between practical bike maintenance or personal care products. Vote for the better choice!",
    category: "Lifestyle",
    tags: ["lifestyle", "decision", "products", "pradeep"],
    // End date: 2 days from now
    endDate: Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60), // 2 days in seconds
    marketType: 0, // BINARY
    initialLiquidity: 100, // 100 USDC
    minLiquidity: 50,      // 50 USDC
    maxMarketSize: 10000   // 10,000 USDC
  };

  console.log("Creating market:", marketData.title);
  console.log("End date:", new Date(marketData.endDate * 1000).toLocaleString());
  
  // This would be called from the frontend's createMarket function
  // You'll need to paste this into the browser console when on the Opinio page
  return marketData;
}

// Instructions for manual creation:
console.log(`
🎯 TO CREATE THE MARKET MANUALLY:

1. Go to the Opinio section in your app
2. Connect your wallet with the private key
3. Go to "Create Market" section
4. Fill in these details:

   Title: "Should Pradeep get a bike cleaning lube kit or Manforce lube?"
   
   Description: "Help Pradeep decide between practical bike maintenance or personal care products. Vote for the better choice!"
   
   Category: "Lifestyle"
   
   End Date: Set to 2 days from now
   
5. Submit the transaction

The market will be active for 2 days and show up in the Explore Markets section!
`);

createPradeepMarket();



