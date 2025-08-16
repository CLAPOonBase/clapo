"use client"
import { useEffect, useState } from 'react';
import { X, Bell, Heart, MessageCircle, UserPlus, AtSign, RefreshCw, Bookmark, Users, CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'notification';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  notificationData?: {
    type: string;
    fromUser?: string;
    content?: string;
    avatar?: string;
  };
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  notificationData
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    if (notificationData) {
      switch (notificationData.type) {
        case 'like':
          return <Heart className="w-5 h-5 text-red-500" />;
        case 'comment':
          return <MessageCircle className="w-5 h-5 text-blue-500" />;
        case 'follow':
          return <UserPlus className="w-5 h-5 text-green-500" />;
        case 'mention':
          return <AtSign className="w-5 h-5 text-purple-500" />;
        case 'retweet':
          return <RefreshCw className="w-5 h-5 text-green-500" />;
        case 'bookmark':
          return <Bookmark className="w-5 h-5 text-yellow-500" />;
        case 'dm':
          return <MessageCircle className="w-5 h-5 text-blue-500" />;
        case 'community_message':
          return <Users className="w-5 h-5 text-purple-500" />;
        default:
          return <Bell className="w-5 h-5 text-blue-500" />;
      }
    }

    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getToastStyles = () => {
    const baseStyles = "flex items-start space-x-3 p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform";
    
    if (notificationData) {
      return `${baseStyles} bg-slate-800 border-blue-500 text-white`;
    }

    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-500 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-500 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800`;
      default:
        return `${baseStyles} bg-slate-50 border-slate-500 text-slate-800`;
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`${getToastStyles()} toast-enter ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">{title}</h4>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {message && (
          <p className="text-sm text-gray-600">{message}</p>
        )}
        
        {notificationData && (
          <div className="mt-2 flex items-center space-x-2">
            {notificationData.avatar && (
              <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {notificationData.fromUser?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <span className="text-xs text-slate-300">
              {notificationData.fromUser && `${notificationData.fromUser}: `}
              {notificationData.content || 'New notification'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toast; 