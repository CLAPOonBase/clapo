// Test complete messaging flow
const API_BASE = 'https://server.blazeswap.io/api/snaps';

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Messaging Flow...\n');
  
  try {
    // 1. Create direct message thread
    console.log('1. Creating direct message thread...');
    const createResponse = await fetch(`${API_BASE}/messages/direct-thread`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId1: '9121f363-364e-4705-aed5-2836daccd283',
        userId2: 'c7132a5d-04e3-4b30-94cb-fe3ffad92cd0'
      })
    });
    
    const createData = await createResponse.json();
    console.log('✅ Direct thread created:', createData);
    
    if (createData.thread) {
      const threadId = createData.thread.id;
      
      // 2. Get message threads
      console.log('\n2. Getting message threads...');
      const threadsResponse = await fetch(`${API_BASE}/message-threads?userId=9121f363-364e-4705-aed5-2836daccd283&limit=50&offset=0`);
      const threadsData = await threadsResponse.json();
      console.log('✅ Threads retrieved:', threadsData);
      
      // 3. Send a message
      console.log('\n3. Sending message...');
      const messageResponse = await fetch(`${API_BASE}/messages/thread/${threadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: '9121f363-364e-4705-aed5-2836daccd283',
          content: 'Hello! This is a test message.'
        })
      });
      
      const messageData = await messageResponse.json();
      console.log('✅ Message sent:', messageData);
      
      // 4. Get messages from thread
      console.log('\n4. Getting messages from thread...');
      const getMessagesResponse = await fetch(`${API_BASE}/message-threads/${threadId}/messages?limit=50&offset=0`);
      const getMessagesData = await getMessagesResponse.json();
      console.log('✅ Messages retrieved:', getMessagesData);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testCompleteFlow(); 