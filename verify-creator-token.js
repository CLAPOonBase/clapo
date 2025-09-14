#!/usr/bin/env node

/**
 * Creator Token Verification Script
 * Tests the checkCreatorExists function with various UUIDs
 */

const { ethers } = require('ethers');

// Contract configuration
const CREATOR_TOKEN_ADDRESS = '0xED2752fD59d1514d905A3f11CbF99CdDFe6d69a8';
const MONAD_RPC_URL = 'https://testnet-rpc.monad.xyz';

// Contract ABI for doesUuidExist function
const CONTRACT_ABI = [
  "function doesUuidExist(string memory uuid) external view returns (bool)"
];

async function verifyCreatorToken() {
  console.log('🔍 Creator Token Verification Script');
  console.log('=====================================');
  
  try {
    // Connect to Monad testnet
    console.log('🌐 Connecting to Monad testnet...');
    const provider = new ethers.JsonRpcProvider(MONAD_RPC_URL);
    
    // Get network info
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Create contract instance
    const contract = new ethers.Contract(CREATOR_TOKEN_ADDRESS, CONTRACT_ABI, provider);
    console.log(`📄 Contract address: ${CREATOR_TOKEN_ADDRESS}`);
    
    // Test UUIDs to check
    const testUuids = [
      'creator-mfk2z72o-3c585066-ccba-475d-8c32-9e6a8997c503-whwzbrrq1', // From your error
      'creator-test-123',
      'creator-user-456',
      'creator-demo-789',
      'creator-1',
      'creator-2',
      'creator-3'
    ];
    
    console.log('\n🧪 Testing UUID existence checks...');
    console.log('=====================================');
    
    for (const uuid of testUuids) {
      try {
        console.log(`\n🔍 Checking UUID: ${uuid}`);
        const exists = await contract.doesUuidExist(uuid);
        console.log(`   Result: ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
        
        if (exists) {
          console.log(`   🎉 Creator token found for UUID: ${uuid}`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking UUID: ${error.message}`);
        
        if (error.message?.includes('missing revert data')) {
          console.log('   💡 This might indicate a network connection issue');
        }
      }
    }
    
    // Test with a very long UUID (edge case)
    console.log('\n🧪 Testing edge cases...');
    console.log('========================');
    
    const longUuid = 'creator-' + 'a'.repeat(100);
    try {
      console.log(`🔍 Testing very long UUID (${longUuid.length} chars)...`);
      const exists = await contract.doesUuidExist(longUuid);
      console.log(`   Result: ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    } catch (error) {
      console.log(`   ❌ Error with long UUID: ${error.message}`);
    }
    
    // Test with empty string
    try {
      console.log(`🔍 Testing empty string UUID...`);
      const exists = await contract.doesUuidExist('');
      console.log(`   Result: ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    } catch (error) {
      console.log(`   ❌ Error with empty UUID: ${error.message}`);
    }
    
    console.log('\n✅ Verification completed!');
    console.log('\n💡 If you see "missing revert data" errors, it might indicate:');
    console.log('   - Network connection issues');
    console.log('   - Contract not deployed at the specified address');
    console.log('   - RPC endpoint issues');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check if Monad testnet RPC is accessible');
    console.error('   2. Verify contract address is correct');
    console.error('   3. Ensure contract is deployed and not paused');
  }
}

// Run the verification
verifyCreatorToken().catch(console.error);
