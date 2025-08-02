// Test messaging APIs
const API_BASE = 'https://server.blazeswap.io/api/snaps';

async function testMessaging() {
  console.log('🧪 Testing Messaging APIs...\n');
  
  try {
    // 1. Create a thread
    console.log('1. Creating thread...');
    const createResponse = await fetch(`${API_BASE}/messages/thread`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creatorId: '9121f363-364e-4705-aed5-2836daccd283',
        name: 'Test Chat 3',
        isGroup: false
      })
    });
    
    const createData = await createResponse.json();
    console.log('✅ Thread created:', createData);
    
    if (createData.thread) {
      const threadId = createData.thread.id;
      
      // 2. Add participant
      console.log('\n2. Adding participant...');
      const participantResponse = await fetch(`${API_BASE}/message-threads/${threadId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: threadId,
          userId: 'c7132a5d-04e3-4b30-94cb-fe3ffad92cd0'
        })
      });
      
      const participantData = await participantResponse.json();
      console.log('✅ Participant added:', participantData);
      
      // 3. Get threads
      console.log('\n3. Getting threads...');
      const threadsResponse = await fetch(`${API_BASE}/messages/thread?userId=9121f363-364e-4705-aed5-2836daccd283&limit=20&offset=0`);
      const threadsData = await threadsResponse.json();
      console.log('✅ Threads retrieved:', threadsData);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testMessaging(); 