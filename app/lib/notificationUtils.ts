import { Notification } from '../types/api';

export interface EnhancedNotificationData {
  type: 'like' | 'retweet' | 'follow' | 'comment' | 'mention';
  actor_id: string;
  actor_username: string;
  actor_avatar_url?: string;
  post_id?: string;
  post_content_preview?: string;
  post_media_url?: string;
  comment_content?: string;
  mention_context?: string;
  content: string;
}

export const createEnhancedNotification = (
  userId: string,
  data: EnhancedNotificationData
): Omit<Notification, 'id' | 'created_at' | 'is_read'> => {
  return {
    user_id: userId,
    type: data.type,
    content: data.content,
    related_id: data.actor_id,
    actor_id: data.actor_id,
    actor_username: data.actor_username,
    actor_avatar_url: data.actor_avatar_url,
    post_id: data.post_id,
    post_content_preview: data.post_content_preview,
    post_media_url: data.post_media_url,
    comment_content: data.comment_content,
    mention_context: data.mention_context,
  };
};

export const generateNotificationContent = (
  type: string,
  actorUsername: string,
  postContent?: string,
  commentContent?: string
): string => {
  const actorName = actorUsername || 'Someone';
  
  switch (type) {
    case 'like':
      return `${actorName} liked your post`;
    case 'comment':
      return `${actorName} commented on your post`;
    case 'follow':
      return `${actorName} started following you`;
    case 'mention':
      return `${actorName} mentioned you in a comment`;
    case 'retweet':
      return `${actorName} retweeted your post`;
    default:
      return `${actorName} interacted with your content`;
  }
};

export const truncatePostContent = (content: string, maxLength: number = 100): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
};

export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
      return '❤️';
    case 'comment':
      return '💬';
    case 'follow':
      return '👥';
    case 'mention':
      return '📢';
    case 'retweet':
      return '🔄';
    default:
      return '🔔';
  }
};

export const getNotificationColor = (type: string) => {
  switch (type) {
    case 'like':
      return 'border-l-red-500 bg-red-500/10';
    case 'comment':
      return 'border-l-blue-500 bg-blue-500/10';
    case 'follow':
      return 'border-l-green-500 bg-green-500/10';
    case 'mention':
      return 'border-l-purple-500 bg-purple-500/10';
    case 'retweet':
      return 'border-l-green-500 bg-green-500/10';
    default:
      return 'border-l-gray-500 bg-gray-500/10';
  }
};




