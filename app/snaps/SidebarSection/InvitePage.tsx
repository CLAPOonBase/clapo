'use client'

import React, { useState, useEffect } from 'react'
import { X, Copy, Share, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

interface InviteCode {
  id: string
  code: string
  isUsed: boolean
  usedBy?: string
  usedAt?: Date
}

export default function InvitePage() {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([])
  const [totalCodes] = useState(50)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Generate invite codes on component mount
  useEffect(() => {
    const generateCodes = () => {
      const codes: InviteCode[] = []
      for (let i = 0; i < totalCodes; i++) {
        codes.push({
          id: `invite-${i + 1}`,
          code: generateRandomCode(),
          isUsed: i < 3, // First 3 codes are used (as shown in screenshot)
          usedBy: i < 3 ? `user${i + 1}@example.com` : undefined,
          usedAt: i < 3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined
        })
      }
      return codes
    }

    setInviteCodes(generateCodes())
  }, [totalCodes])

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const handleShareCode = (code: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Clapo with my invite code',
        text: `Use my invite code to join Clapo: ${code}`,
        url: `${window.location.origin}/signup?invite=${code}`
      })
    } else {
      // Fallback: copy to clipboard
      handleCopyCode(`Join Clapo with my invite code: ${code} - ${window.location.origin}/signup?invite=${code}`)
    }
  }

  const usedCodes = inviteCodes.filter(code => code.isUsed).length
  const availableCodes = totalCodes - usedCodes

  return (
    <div className="w-full text-white">
      {/* Content */}
      <div className="p-4 md:p-6">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black border-2 border-gray-700/70 rounded-xl p-6 mb-6 shadow-custom"
        >
          <h2 className="text-xl font-semibold text-white mb-2">
            You have {availableCodes} invites as an early user!
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            So far {usedCodes} have been used.
          </p>
          <p className="text-gray-300 text-sm">
            Invite friends to use Clapo with the below invitation codes.
            You'll earn extra points when they sign up.
          </p>
        </motion.div>

        {/* Invite Codes List */}
        <div className="space-y-3">
          {inviteCodes.map((invite, index) => (
            <motion.div
              key={invite.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`
                flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200
                ${invite.isUsed
                  ? 'bg-black/30 border-gray-700/50 opacity-60'
                  : 'bg-black border-gray-700/70 hover:border-[#6E54FF]/50 hover:bg-[#1A1A1A]'
                }
              `}
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="font-mono text-base tracking-wider">
                  {invite.isUsed ? (
                    <span className="line-through text-gray-500">{invite.code}</span>
                  ) : (
                    <span className="text-white">{invite.code}</span>
                  )}
                </div>
                {invite.isUsed && (
                  <span className="text-xs font-medium text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
                    Used
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyCode(invite.code)}
                  disabled={invite.isUsed}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${invite.isUsed
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }
                  `}
                  title="Copy code"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleShareCode(invite.code)}
                  disabled={invite.isUsed}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${invite.isUsed
                      ? 'bg-gray-700/30 text-gray-600 cursor-not-allowed'
                      : ''
                    }
                  `}
                  style={!invite.isUsed ? {
                    backgroundColor: "#6E54FF",
                    boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                  } : {}}
                >
                  <div className="flex items-center space-x-2">
                    <Share className="w-4 h-4" />
                    <span>Share</span>
                  </div>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Copy Success Message */}
        {copiedCode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#6E54FF] text-white px-6 py-3 rounded-xl text-sm font-medium shadow-lg border-2 border-gray-700/70"
            style={{
              boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
            }}
          >
            Code copied to clipboard!
          </motion.div>
        )}
      </div>
    </div>
  )
}