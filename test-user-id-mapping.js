#!/usr/bin/env node

/**
 * Test User ID Mapping Script
 * Helps identify the correct user ID to use for creator token lookup
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

async function testUserIdMapping() {
  console.log('🔍 Test User ID Mapping');
  console.log('======================');
  
  try {
    // Connect to Monad testnet
    const provider = new ethers.JsonRpcProvider(MONAD_RPC_URL);
    const contract = new ethers.Contract(CREATOR_TOKEN_ADDRESS, CONTRACT_ABI, provider);
    
    // We know this UUID exists
    const knownWorkingUuid = '3c585066-ccba-475d-8c32-9e6a8997c503';
    
    console.log('\n✅ Known Working Creator Token:');
    console.log('===============================');
    
    try {
      const creator = await contract.getCreatorByUuid(knownWorkingUuid);
      console.log(`UUID: ${creator.uuid}`);
      console.log(`Name: ${creator.name}`);
      console.log(`Creator Address: ${creator.creatorAddress}`);
      console.log(`Created At: ${new Date(Number(creator.createdAt) * 1000).toISOString()}`);
    } catch (error) {
      console.log(`❌ Error getting creator data: ${error.message}`);
    }
    
    console.log('\n💡 Solution Options:');
    console.log('===================');
    console.log('1. **Frontend Fix**: Update the frontend to use the correct user ID');
    console.log('2. **Database Fix**: Update the user record to have the correct ID');
    console.log('3. **Contract Fix**: Create a new token with the current user ID');
    console.log('4. **Temporary Fix**: Hardcode the working UUID for testing');
    
    console.log('\n🔧 Recommended Approach:');
    console.log('========================');
    console.log('1. Check what session.dbUser.id contains in the browser console');
    console.log('2. If it\'s different from "3c585066-ccba-475d-8c32-9e6a8997c503":');
    console.log('   - Either update the user record in the database');
    console.log('   - Or create a new creator token with the current user ID');
    console.log('3. If they match, check for network/connection issues');
    
    console.log('\n🧪 Test Commands:');
    console.log('=================');
    console.log('1. Check browser console for "ProfilePage: Checking creator token with"');
    console.log('2. Compare sessionDbUserId with "3c585066-ccba-475d-8c32-9e6a8997c503"');
    console.log('3. If different, that\'s the root cause of the issue');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUserIdMapping().catch(console.error);
