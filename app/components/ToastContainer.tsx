"use client"
import { useState, useEffect } from 'react';
import Toast, { ToastProps } from './Toast';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'notification';
  title: string;
  message?: string;
  duration?: number;
  notificationData?: {
    type: string;
    fromUser?: string;
    content?: string;
    avatar?: string;
  };
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (toastData: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastData = { ...toastData, id };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Expose addToast method globally
  useEffect(() => {
    (window as any).showToast = addToast;
    (window as any).showNotificationToast = (notificationData: any) => {
      addToast({
        type: 'notification',
        title: 'New Notification',
        notificationData
      });
    };
    
    return () => {
      delete (window as any).showToast;
      delete (window as any).showNotificationToast;
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

// Utility functions to show toasts
export const showToast = (toastData: Omit<ToastData, 'id'>) => {
  if (typeof window !== 'undefined' && (window as any).showToast) {
    (window as any).showToast(toastData);
  }
};

export const showNotificationToast = (notificationData: any) => {
  if (typeof window !== 'undefined' && (window as any).showNotificationToast) {
    (window as any).showNotificationToast(notificationData);
  }
};

export const showSuccessToast = (title: string, message?: string) => {
  showToast({ type: 'success', title, message });
};

export const showErrorToast = (title: string, message?: string) => {
  showToast({ type: 'error', title, message });
};

export const showInfoToast = (title: string, message?: string) => {
  showToast({ type: 'info', title, message });
};

export const showWarningToast = (title: string, message?: string) => {
  showToast({ type: 'warning', title, message });
};
