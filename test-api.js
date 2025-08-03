// Test script for messaging APIs
const API_BASE = 'https://server.blazeswap.io/api/snaps';

async function testCreateThread() {
  console.log('🧪 Testing Create Message Thread API...');
  
  try {
    const response = await fetch(`${API_BASE}/message-threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creatorId: 'test-user-123',
        name: 'Test Chat',
        isGroup: false
      }),
    });
    
    const data = await response.json();
    console.log('📝 Response Status:', response.status);
    console.log('📝 Response Data:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ Error testing create thread:', error);
    return null;
  }
}

async function testGetThreads() {
  console.log('\n🧪 Testing Get Message Threads API...');
  
  try {
    const response = await fetch(`${API_BASE}/message-threads?userId=test-user-123&limit=20&offset=0`);
    const data = await response.json();
    console.log('📝 Response Status:', response.status);
    console.log('📝 Response Data:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ Error testing get threads:', error);
    return null;
  }
}

async function testGetUsers() {
  console.log('\n🧪 Testing Get Users API...');
  
  try {
    const response = await fetch(`${API_BASE}/users/search?q=`);
    const data = await response.json();
    console.log('📝 Response Status:', response.status);
    console.log('📝 Response Data:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ Error testing get users:', error);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  await testGetUsers();
  await testCreateThread();
  await testGetThreads();
  
  console.log('\n✅ API Tests Complete!');
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests();
} 