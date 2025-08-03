import { Socket } from 'socket.io-client';

export const sendDmMessage = (socket: Socket, threadId: string, content: string, userId: string, username?: string, avatar?: string) => {
  const tempMessage = {
    id: `temp-${Date.now()}`,
    content,
    senderId: userId,
    createdAt: new Date().toISOString(),
    threadId,
    sender_username: username || 'You',
    sender_avatar: avatar,
  };

  socket.emit('send_dm_message', { userId, content, threadId }, (response: any) => {
    if (response.success) {
      console.log('✅ DM sent successfully');
    } else {
      console.error('❌ Failed to send DM:', response.message);
    }
  });

  return tempMessage;
};

export const sendCommunityMessage = (socket: Socket, communityId: string, content: string, userId: string, username?: string, avatar?: string) => {
  const tempMessage = {
    id: `temp-${Date.now()}`,
    content,
    senderId: userId,
    createdAt: new Date().toISOString(),
    communityId,
    sender_username: username || 'You',
    sender_avatar: avatar,
  };

  socket.emit('send_community_message', { userId, content, communityId }, (response: any) => {
    if (response.success) {
      console.log('✅ Community message sent successfully');
    } else {
      console.error('❌ Failed to send community message:', response.message);
    }
  });

  return tempMessage;
}; 