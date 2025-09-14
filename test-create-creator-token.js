#!/usr/bin/env node

/**
 * Test Creator Token Creation Script
 * Tests creating a creator token with the correct UUID format
 */

const { ethers } = require('ethers');

// Contract configuration
const CREATOR_TOKEN_ADDRESS = '0xED2752fD59d1514d905A3f11CbF99CdDFe6d69a8';
const MONAD_RPC_URL = 'https://testnet-rpc.monad.xyz';

// Contract ABI for createCreator function
const CONTRACT_ABI = [
  "function createCreator(string memory uuid, string memory name, string memory imageUrl, string memory description, uint256 _freebieCount, uint256 _quadraticDivisor) external returns (string memory)",
  "function doesUuidExist(string memory uuid) external view returns (bool)",
  "function getCreatorByUuid(string memory uuid) external view returns (tuple(uint256 creatorId, string uuid, string name, string imageUrl, string description, address creatorAddress, uint256 createdAt, bool exists))"
];

async function testCreateCreatorToken() {
  console.log('🧪 Test Creator Token Creation');
  console.log('==============================');
  
  try {
    // Connect to Monad testnet
    console.log('🌐 Connecting to Monad testnet...');
    const provider = new ethers.JsonRpcProvider(MONAD_RPC_URL);
    
    // Get network info
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Create contract instance (read-only for testing)
    const contract = new ethers.Contract(CREATOR_TOKEN_ADDRESS, CONTRACT_ABI, provider);
    console.log(`📄 Contract address: ${CREATOR_TOKEN_ADDRESS}`);
    
    // Test UUIDs - these should be actual user IDs from your backend
    const testUuids = [
      '3c585066-ccba-475d-8c32-9e6a8997c503', // Example user ID from backend
      'test-user-123', // Test user ID
      'demo-creator-456' // Demo user ID
    ];
    
    console.log('\n🔍 Checking existing creator tokens...');
    console.log('=====================================');
    
    for (const uuid of testUuids) {
      try {
        console.log(`\n🔍 Checking UUID: ${uuid}`);
        const exists = await contract.doesUuidExist(uuid);
        console.log(`   Result: ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
        
        if (exists) {
          try {
            const creator = await contract.getCreatorByUuid(uuid);
            console.log(`   Creator Name: ${creator.name}`);
            console.log(`   Creator Address: ${creator.creatorAddress}`);
            console.log(`   Created At: ${new Date(Number(creator.createdAt) * 1000).toISOString()}`);
            console.log(`   Description: ${creator.description}`);
          } catch (error) {
            console.log(`   ❌ Error getting creator data: ${error.message}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error checking UUID: ${error.message}`);
      }
    }
    
    console.log('\n📋 Test Parameters for Token Creation:');
    console.log('=====================================');
    console.log('UUID: [User ID from backend API response]');
    console.log('Name: [Creator name from profile]');
    console.log('Image URL: [Avatar URL from profile]');
    console.log('Description: [Creator description]');
    console.log('Freebie Count: 100');
    console.log('Quadratic Divisor: 1');
    
    console.log('\n💡 To create a creator token:');
    console.log('   1. Use the frontend "Create Creator Token" button');
    console.log('   2. The UUID is the user ID directly from session.dbUser.id');
    console.log('   3. No UUID generation - just use the backend user ID as-is');
    console.log('   4. Frontend uses: generateCreatorTokenUUID(session?.dbUser?.id)');
    console.log('   5. Example: User ID "3c585066-ccba-475d-8c32-9e6a8997c503" becomes UUID "3c585066-ccba-475d-8c32-9e6a8997c503"');
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCreateCreatorToken().catch(console.error);
