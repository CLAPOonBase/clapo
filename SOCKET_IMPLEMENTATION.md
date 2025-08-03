# Socket Implementation for Real-Time Messaging

## Overview
This implementation adds real-time messaging functionality to the snaps section using Socket.IO.

## Files Created/Modified

### 1. Socket Hook (`app/hooks/useSocket.ts`)
- Manages WebSocket connection to the backend
- Handles connection/disconnection events
- Returns socket instance for use in components

### 2. Message Utilities (`app/utils/socketMessages.ts`)
- `sendDmMessage()`: Sends direct messages via socket
- `sendCommunityMessage()`: Sends community messages via socket
- Includes error handling and success callbacks

### 3. Message Listener (`app/hooks/useMessageListener.ts`)
- Listens for real-time message updates
- Manages state for DM and community messages
- Filters messages by thread/community ID

### 4. Updated MessagePage Component
- Integrated socket functionality
- Added connection status indicator
- Combines API messages with real-time socket messages
- Fallback to API when socket is not available

## Features

### ✅ Real-Time Features
1. **Instant Message Delivery**: Messages appear immediately when sent
2. **Live Updates**: All connected clients see new messages instantly
3. **Database Persistence**: Messages are saved to database
4. **No Page Refresh**: Messages appear without reloading

### 🔄 How It Works
1. **Send Message**: `socket.emit('send_dm_message', data)`
2. **Backend Saves**: Message saved to database
3. **Backend Broadcasts**: `server.emit('new_dm_message', data)`
4. **Frontend Receives**: `socket.on('new_dm_message', callback)`
5. **UI Updates**: Message appears instantly in chat

## Usage

### In Components
```typescript
import { useSocket } from '../hooks/useSocket'
import { useMessageListener } from '../hooks/useMessageListener'
import { sendDmMessage, sendCommunityMessage } from '../utils/socketMessages'

const ChatComponent = () => {
  const socket = useSocket()
  const { dmMessages, communityMessages } = useMessageListener()
  
  const handleSendMessage = (content: string) => {
    if (socket) {
      sendDmMessage(socket, threadId, content, userId)
    }
  }
}
```

### Connection Status
The UI shows a green dot when connected and red when disconnected.

## Backend Requirements
Your backend needs to handle these socket events:
- `send_dm_message`
- `send_community_message`
- `new_dm_message` (broadcast)
- `new_community_message` (broadcast)

## Dependencies
- `socket.io-client`: ^4.8.1 (installed)

## Notes
- Falls back to API calls when socket is not available
- Messages are sorted by timestamp
- Connection status is visible in the UI
- Real-time messages are combined with existing API messages 