'use client'

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react'
import { apiService } from '../lib/api'
import type { MessageThread, ThreadMessage, SendMessageRequest, AddParticipantRequest } from '../types/api'

// Action types
type MessageAction =
  | { type: 'SET_MESSAGE_THREADS'; payload: MessageThread[] }
  | { type: 'ADD_MESSAGE_THREAD'; payload: MessageThread }
  | { type: 'SET_THREAD_MESSAGES'; payload: { threadId: string; messages: ThreadMessage[] } }
  | { type: 'ADD_THREAD_MESSAGE'; payload: { threadId: string; message: ThreadMessage } }

// State interface
interface MessageState {
  messageThreads: MessageThread[]
  threadMessages: Record<string, ThreadMessage[]>
}

// Initial state
const initialState: MessageState = {
  messageThreads: [],
  threadMessages: {}
}

// Reducer
function messageReducer(state: MessageState, action: MessageAction): MessageState {
  switch (action.type) {
    case 'SET_MESSAGE_THREADS':
      return {
        ...state,
        messageThreads: action.payload
      }
    case 'ADD_MESSAGE_THREAD':
      return {
        ...state,
        messageThreads: [...state.messageThreads, action.payload]
      }
    case 'SET_THREAD_MESSAGES':
      return {
        ...state,
        threadMessages: {
          ...state.threadMessages,
          [action.payload.threadId]: action.payload.messages
        }
      }
    case 'ADD_THREAD_MESSAGE':
      return {
        ...state,
        threadMessages: {
          ...state.threadMessages,
          [action.payload.threadId]: [
            ...(state.threadMessages[action.payload.threadId] || []),
            action.payload.message
          ]
        }
      }
    default:
      return state
  }
}

// Context
interface MessageContextType {
  state: MessageState
  getMessageThreads: (userId: string) => Promise<void>
  getThreadMessages: (threadId: string) => Promise<void>
  sendMessage: (threadId: string, data: SendMessageRequest) => Promise<void>
  addParticipantToThread: (threadId: string, data: AddParticipantRequest) => Promise<any>
  markMessageAsRead: (messageId: string) => Promise<void>
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

// Provider component
export function MessageProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(messageReducer, initialState)

  const getMessageThreads = useCallback(async (userId: string) => {
    try {
      const response = await apiService.getMessageThreads(userId) as any
      dispatch({ type: 'SET_MESSAGE_THREADS', payload: response.threads })
    } catch (error) {
      console.error('Failed to fetch message threads:', error)
    }
  }, [])

  const getThreadMessages = useCallback(async (threadId: string) => {
    try {
      const response = await apiService.getThreadMessages(threadId) as any
      dispatch({ type: 'SET_THREAD_MESSAGES', payload: { threadId, messages: response.messages } })
    } catch (error) {
      console.error('Failed to fetch thread messages:', error)
    }
  }, [])

  const sendMessage = useCallback(async (threadId: string, data: SendMessageRequest) => {
    try {
      const response = await apiService.sendMessage(threadId, data) as any
      dispatch({ type: 'ADD_THREAD_MESSAGE', payload: { threadId, message: response.messageData } })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }, [])

  const addParticipantToThread = useCallback(async (threadId: string, data: AddParticipantRequest) => {
    try {
      const response = await apiService.addParticipantToThread(threadId, data)
      return response
    } catch (error) {
      console.error('Failed to add participant to thread:', error)
      throw error
    }
  }, [])

  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      await apiService.markMessageAsRead(messageId)
    } catch (error) {
      console.error('Failed to mark message as read:', error)
    }
  }, [])

  const value: MessageContextType = {
    state,
    getMessageThreads,
    getThreadMessages,
    sendMessage,
    addParticipantToThread,
    markMessageAsRead,
  }

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  )
}

export function useMessage() {
  const context = useContext(MessageContext)
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider')
  }
  return context
}
