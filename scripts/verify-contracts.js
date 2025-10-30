const { ethers } = require('ethers');

// Base Sepolia RPC
const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');

// Contract addresses from your config
const contracts = {
  'PostToken': '0xcaC4DF2Bd3723CEA847e1AE07F37Fb4B33c6Cb61',
  'CreatorToken': '0xDfd05ed372C5eD9f7aaD54A5A2d5A5c94a99f5fb',
  'MockUSDC': '0xCADCa295a223E3DA821a243520df8e2a302C9840',
  'RewardPool': '0x07056D9a61A7894BD2c8494EDB0a78451F1fA7c8',
  'OpinioMarket': '0xF9A911bD8f2e2beCC18781ed467653bb2F515de5'
};

async function verifyContracts() {
  console.log('🔍 Verifying contracts on Base Sepolia...\n');

  for (const [name, address] of Object.entries(contracts)) {
    try {
      const code = await provider.getCode(address);
      const exists = code !== '0x' && code !== '0x0';

      if (exists) {
        console.log(`✅ ${name}: ${address} - CONTRACT EXISTS`);
      } else {
        console.log(`❌ ${name}: ${address} - NO CONTRACT FOUND`);
      }
    } catch (error) {
      console.log(`❌ ${name}: ${address} - ERROR: ${error.message}`);
    }
  }

  console.log('\n🔗 View on BaseScan:');
  for (const [name, address] of Object.entries(contracts)) {
    console.log(`${name}: https://sepolia.basescan.org/address/${address}`);
  }
}

verifyContracts().catch(console.error);
