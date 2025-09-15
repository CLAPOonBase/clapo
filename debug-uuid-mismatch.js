#!/usr/bin/env node

/**
 * Debug UUID Mismatch Script
 * Checks what UUID the frontend would generate vs what exists on contract
 */

const { ethers } = require('ethers');

// Contract configuration
const CREATOR_TOKEN_ADDRESS = '0xED2752fD59d1514d905A3f11CbF99CdDFe6d69a8';
const MONAD_RPC_URL = 'https://testnet-rpc.monad.xyz';

// Contract ABI
const CONTRACT_ABI = [
  "function doesUuidExist(string memory uuid) external view returns (bool)",
  "function getCreatorByUuid(string memory uuid) external view returns (tuple(uint256 creatorId, string uuid, string name, string imageUrl, string description, address creatorAddress, uint256 createdAt, bool exists))"
];

// Simulate the frontend UUID generation
function generateCreatorTokenUUID(userId) {
  return userId.toString();
}

async function debugUuidMismatch() {
  console.log('🔍 Debug UUID Mismatch');
  console.log('=====================');
  
  try {
    // Connect to Monad testnet
    const provider = new ethers.JsonRpcProvider(MONAD_RPC_URL);
    const contract = new ethers.Contract(CREATOR_TOKEN_ADDRESS, CONTRACT_ABI, provider);
    
    // Test different possible user IDs
    const possibleUserIds = [
      '3c585066-ccba-475d-8c32-9e6a8997c503', // The one we know exists
      'Pradeep42050388', // The username shown in UI
      'pradeep1234', // The creator name from our test
      '42050388', // Part of the username
      'Pradeep', // Just the name part
    ];
    
    console.log('\n🧪 Testing different possible user IDs...');
    console.log('==========================================');
    
    for (const userId of possibleUserIds) {
      const generatedUuid = generateCreatorTokenUUID(userId);
      console.log(`\n🔍 Testing User ID: "${userId}"`);
      console.log(`   Generated UUID: "${generatedUuid}"`);
      
      try {
        const exists = await contract.doesUuidExist(generatedUuid);
        console.log(`   Exists on contract: ${exists ? '✅ YES' : '❌ NO'}`);
        
        if (exists) {
          try {
            const creator = await contract.getCreatorByUuid(generatedUuid);
            console.log(`   Creator Name: ${creator.name}`);
            console.log(`   Creator Address: ${creator.creatorAddress}`);
            console.log(`   🎉 FOUND MATCHING CREATOR TOKEN!`);
          } catch (error) {
            console.log(`   ❌ Error getting creator data: ${error.message}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error checking existence: ${error.message}`);
      }
    }
    
    console.log('\n💡 Frontend Debugging:');
    console.log('=====================');
    console.log('1. Check browser console for "CreatorTokenDisplay: Component props and generated UUID"');
    console.log('2. Compare the userId and tokenUuid values');
    console.log('3. Make sure the userId matches one of the working UUIDs above');
    console.log('4. If userId is different, check how it\'s being passed from the parent component');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugUuidMismatch().catch(console.error);
