"use client"
import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
}

export default function TestChat() {
  const [socket1, setSocket1] = useState<Socket | null>(null)
  const [socket2, setSocket2] = useState<Socket | null>(null)
  const [isConnected1, setIsConnected1] = useState(false)
  const [isConnected2, setIsConnected2] = useState(false)
  const [messages1, setMessages1] = useState<Message[]>([])
  const [messages2, setMessages2] = useState<Message[]>([])
  const [messageInput1, setMessageInput1] = useState('')
  const [messageInput2, setMessageInput2] = useState('')
  const messagesEndRef1 = useRef<HTMLDivElement>(null)
  const messagesEndRef2 = useRef<HTMLDivElement>(null)
  
  const threadId = 'd13d4f59-b9bf-4b91-9bf4-438b2c9d7cb1'
  const userId1 = '9121f363-364e-4705-aed5-2836daccd283' // utkarsh1446
  const userId2 = '1ac140ab-1371-4388-a735-79e0f5747d40' // arpit_singh

  // Load existing messages when page loads
  const loadExistingMessages = async () => {
    try {
      const response = await fetch(`https://server.blazeswap.io/api/snaps/message-threads/${threadId}/messages?limit=50&offset=0`)
      const data = await response.json()
      
      if (data.messages && Array.isArray(data.messages)) {
        setMessages1(data.messages)
        setMessages2(data.messages)
      }
    } catch (error) {
      console.error('Failed to load existing messages:', error)
      addSystemMessage('Failed to load existing messages', 1)
      addSystemMessage('Failed to load existing messages', 2)
    }
  }

  // Initialize socket connections
  useEffect(() => {
    // Socket 1 for User 1
    const newSocket1 = io('https://server.blazeswap.io')
    
    newSocket1.on('connect', () => {
      console.log('✅ User 1 connected to socket server')
      setIsConnected1(true)
      loadExistingMessages()
    })
    
    newSocket1.on('disconnect', () => {
      console.log('❌ User 1 disconnected from socket server')
      setIsConnected1(false)
    })
    
    // Listen for new DM messages for User 1
    newSocket1.on('new_dm_message', (data) => {
      console.log('📨 New DM received for User 1:', data)
      
      const message = data.message || data
      const isOwnMessage = message.sender_id === userId1 || data.senderId === userId1
      
      if (!isOwnMessage) {
        setMessages1(prev => [...prev, message])
      }
    })
    
    // Socket 2 for User 2
    const newSocket2 = io('https://server.blazeswap.io')
    
    newSocket2.on('connect', () => {
      console.log('✅ User 2 connected to socket server')
      setIsConnected2(true)
    })
    
    newSocket2.on('disconnect', () => {
      console.log('❌ User 2 disconnected from socket server')
      setIsConnected2(false)
    })
    
    // Listen for new DM messages for User 2
    newSocket2.on('new_dm_message', (data) => {
      console.log('📨 New DM received for User 2:', data)
      
      const message = data.message || data
      const isOwnMessage = message.sender_id === userId2 || data.senderId === userId2
      
      if (!isOwnMessage) {
        setMessages2(prev => [...prev, message])
      }
    })
    
    setSocket1(newSocket1)
    setSocket2(newSocket2)
    
    return () => {
      newSocket1.disconnect()
      newSocket2.disconnect()
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef1.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages1])

  useEffect(() => {
    messagesEndRef2.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages2])

  const sendMessage = (userNum: 1 | 2) => {
    const content = userNum === 1 ? messageInput1.trim() : messageInput2.trim()
    const socket = userNum === 1 ? socket1 : socket2
    const userId = userNum === 1 ? userId1 : userId2
    const setMessages = userNum === 1 ? setMessages1 : setMessages2
    const setMessageInput = userNum === 1 ? setMessageInput1 : setMessageInput2
    
    if (!content || !socket) return

    // Add message to local state immediately
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      sender_id: userId,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempMessage])
    setMessageInput('')

    socket.emit('send_dm_message', { 
      userId, 
      content, 
      threadId 
    }, (response: any) => {
      if (response.success) {
        console.log(`✅ Message sent successfully from User ${userNum}`)
      } else {
        console.error(`❌ Failed to send message from User ${userNum}:`, response.message)
        addSystemMessage(`Failed to send message: ${response.message}`, userNum)
        // Remove the temp message if sending failed
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      }
    })
  }

  const handleKeyPress = (event: React.KeyboardEvent, userNum: 1 | 2) => {
    if (event.key === 'Enter') {
      sendMessage(userNum)
    }
  }

  const addSystemMessage = (content: string, userNum: 1 | 2) => {
    const systemMessage: Message = {
      id: `system-${Date.now()}`,
      content,
      sender_id: 'system',
      created_at: new Date().toISOString()
    }
    const setMessages = userNum === 1 ? setMessages1 : setMessages2
    setMessages(prev => [...prev, systemMessage])
  }

  return (
    <div className="max-w-7xl mx-auto p-5 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User 1 Chat */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 text-center">
            <h2 className="text-xl font-bold">💬 utkarsh1446 Chat</h2>
          </div>
          
          {/* Connection Status */}
          <div className={`text-center p-3 mb-3 rounded font-bold ${
            isConnected1 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isConnected1 ? '✅ Connected - Ready to chat!' : '❌ Disconnected'}
          </div>
          
          {/* Thread Info */}
          <div className="bg-gray-100 p-3 border-b border-gray-200 text-xs text-gray-600">
            <div><strong>Thread ID:</strong> {threadId}</div>
            <div><strong>Thread Name:</strong> utkarsh1446 ↔ arpit_singh</div>
            <div><strong>User ID:</strong> {userId1}</div>
            <div><strong>Username:</strong> utkarsh1446</div>
          </div>
          
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 bg-gray-50">
            {messages1.map((message, index) => {
              const isOwnMessage = message.sender_id === userId1
              const isSystemMessage = message.sender_id === 'system'
              
              return (
                <div
                  key={message.id || index}
                  className={`mb-3 p-3 rounded-2xl max-w-[70%] break-words ${
                    isSystemMessage
                      ? 'bg-gray-200 text-gray-600 italic mx-auto'
                      : isOwnMessage
                      ? 'bg-blue-600 text-white ml-auto rounded-br-md'
                      : 'bg-gray-200 text-gray-800 mr-auto rounded-bl-md'
                  }`}
                >
                  <div>{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef1} />
          </div>
          
          {/* Input Area */}
          <div className="flex p-4 bg-white border-t border-gray-200">
            <input
              type="text"
              value={messageInput1}
              onChange={(e) => setMessageInput1(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 1)}
              placeholder="Type your message here..."
              className="flex-1 p-3 border border-gray-300 rounded-full mr-3 focus:outline-none focus:border-blue-600"
            />
            <button
              onClick={() => sendMessage(1)}
              disabled={!messageInput1.trim()}
              className="px-5 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>

        {/* User 2 Chat */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-green-600 text-white p-4 text-center">
            <h2 className="text-xl font-bold">💬 arpit_singh Chat</h2>
          </div>
          
          {/* Connection Status */}
          <div className={`text-center p-3 mb-3 rounded font-bold ${
            isConnected2 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isConnected2 ? '✅ Connected - Ready to chat!' : '❌ Disconnected'}
          </div>
          
          {/* Thread Info */}
          <div className="bg-gray-100 p-3 border-b border-gray-200 text-xs text-gray-600">
            <div><strong>Thread ID:</strong> {threadId}</div>
            <div><strong>Thread Name:</strong> utkarsh1446 ↔ arpit_singh</div>
            <div><strong>User ID:</strong> {userId2}</div>
            <div><strong>Username:</strong> arpit_singh</div>
          </div>
          
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 bg-gray-50">
            {messages2.map((message, index) => {
              const isOwnMessage = message.sender_id === userId2
              const isSystemMessage = message.sender_id === 'system'
              
              return (
                <div
                  key={message.id || index}
                  className={`mb-3 p-3 rounded-2xl max-w-[70%] break-words ${
                    isSystemMessage
                      ? 'bg-gray-200 text-gray-600 italic mx-auto'
                      : isOwnMessage
                      ? 'bg-green-600 text-white ml-auto rounded-br-md'
                      : 'bg-gray-200 text-gray-800 mr-auto rounded-bl-md'
                  }`}
                >
                  <div>{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef2} />
          </div>
          
          {/* Input Area */}
          <div className="flex p-4 bg-white border-t border-gray-200">
            <input
              type="text"
              value={messageInput2}
              onChange={(e) => setMessageInput2(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 2)}
              placeholder="Type your message here..."
              className="flex-1 p-3 border border-gray-300 rounded-full mr-3 focus:outline-none focus:border-green-600"
            />
            <button
              onClick={() => sendMessage(2)}
              disabled={!messageInput2.trim()}
              className="px-5 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 