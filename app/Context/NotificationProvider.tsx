'use client'

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react'
import { apiService } from '../lib/api'
import { ApiNotification, ApiActivity } from '../types'
// impport EnhancedNotification from '../types/EnhancedNotification'
import { useAuth } from './AuthProvider'
import { EnhancedNotification } from '../types/api'

// Action types
type NotificationAction =
  | { type: 'SET_NOTIFICATIONS'; payload: ApiNotification[] }
  | { type: 'SET_ENHANCED_NOTIFICATIONS'; payload: EnhancedNotification[] }
  | { type: 'SET_ACTIVITIES'; payload: ApiActivity[] }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<ApiNotification> } }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }

// State interface
interface NotificationState {
  notifications: ApiNotification[]
  enhancedNotifications: EnhancedNotification[]
  activities: ApiActivity[]
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  enhancedNotifications: [],
  activities: []
}

// Reducer
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload
      }
    case 'SET_ENHANCED_NOTIFICATIONS':
      return {
        ...state,
        enhancedNotifications: action.payload
      }
    case 'SET_ACTIVITIES':
      return {
        ...state,
        activities: action.payload
      }
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id ? { ...notification, ...action.payload.updates } : notification
        )
      }
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, isRead: true }))
      }
    default:
      return state
  }
}

// Context
interface NotificationContextType {
  state: NotificationState
  fetchNotifications: (userId?: string) => Promise<void>
  fetchEnhancedNotifications: (userId?: string) => Promise<void>
  fetchActivities: (userId?: string) => Promise<void>
  getUnreadNotificationCount: (userId?: string) => Promise<number>
  markNotificationAsRead: (notificationId: string) => Promise<ApiNotification>
  markAllNotificationsAsRead: (userId?: string) => Promise<number>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Provider component
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState)
  const { getCurrentUserId } = useAuth()

  const fetchNotifications = useCallback(async (userId?: string) => {
    const targetUserId = userId || getCurrentUserId()
    if (!targetUserId) return

    try {
      const response = await apiService.getNotifications(targetUserId)
      const formattedNotifications = (response.notifications || []).map((n: any) => ({
        id: n.id,
        userId: n.userId ?? n.user_id ?? '',
        refId: n.refId ?? n.ref_id ?? '',
        fromUserId: n.fromUserId ?? n.from_user_id ?? '',
        isRead: n.isRead ?? n.is_read ?? false,
        createdAt: n.createdAt ?? n.created_at ?? new Date().toISOString(),
        // preserve any other properties from the original object
        ...n
      })) as ApiNotification[]
      dispatch({ type: 'SET_NOTIFICATIONS', payload: formattedNotifications })
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }, [getCurrentUserId])

  const fetchEnhancedNotifications = useCallback(async (userId?: string) => {
    const targetUserId = userId || getCurrentUserId()
    if (!targetUserId) return

    try {
      const response = await apiService.getEnhancedNotifications(targetUserId)
      dispatch({ type: 'SET_ENHANCED_NOTIFICATIONS', payload: response.notifications })
    } catch (error) {
      console.error('Failed to fetch enhanced notifications:', error)
    }
  }, [getCurrentUserId])

  const getUnreadNotificationCount = useCallback(async (userId?: string) => {
    const targetUserId = userId || getCurrentUserId()
    if (!targetUserId) return 0

    try {
      const response = await apiService.getUnreadNotificationCount(targetUserId)
      return response.unreadCount
    } catch (error) {
      console.error('Failed to fetch unread notification count:', error)
      return 0
    }
  }, [getCurrentUserId])

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await apiService.markNotificationAsRead(notificationId)
      dispatch({
        type: 'UPDATE_NOTIFICATION',
        payload: { id: notificationId, updates: { isRead: true } }
      })
      return response.notification
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  }, [])

  const markAllNotificationsAsRead = useCallback(async (userId?: string) => {
    const targetUserId = userId || getCurrentUserId()
    if (!targetUserId) return 0

    try {
      const response = await apiService.markAllNotificationsAsRead(targetUserId)
      dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })
      return response.updatedCount
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  }, [getCurrentUserId])

  const fetchActivities = useCallback(async (userId?: string) => {
    const targetUserId = userId || getCurrentUserId()
    if (!targetUserId) return

    try {
      const response = await apiService.getActivities(targetUserId)
      dispatch({ type: 'SET_ACTIVITIES', payload: response.activities })
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    }
  }, [getCurrentUserId])

  const value: NotificationContextType = {
    state,
    fetchNotifications,
    fetchEnhancedNotifications,
    fetchActivities,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
