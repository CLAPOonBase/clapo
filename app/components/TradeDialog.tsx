import React, { useState } from "react"
import { motion } from "framer-motion"

interface TradeDialogProps {
  type: "buy" | "sell"
  isOpen: boolean
  onClose: () => void
  avatar: string
  username: string
  balance: number
  owned: number
}

const TradeDialog: React.FC<TradeDialogProps> = ({
  type,
  isOpen,
  onClose,
  avatar,
  username,
  balance,
  owned,
}) => {
  const [amount, setAmount] = useState(1)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0D1117] rounded-2xl p-6 w-[90%] max-w-md text-white shadow-lg"
      >
        {/* Heading */}
        <h2 className="text-xl font-bold mb-4">
          {type === "buy" ? "Buy Ticket" : "Sell Ticket"}
        </h2>

        {/* User Info */}
        <div className="flex items-center space-x-3 mb-6">
          <img src={avatar} alt={username} className="w-12 h-12 rounded-full" />
          <div>
            <div className="font-semibold">@{username}</div>
            <div className="text-sm text-gray-400">
              Balance: ${balance.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">You own: {owned}</div>
          </div>
        </div>

        {/* Amount Controls */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setAmount((a) => Math.max(1, a - 1))}
            className="w-10 h-10 flex items-center justify-center bg-black rounded-full text-xl"
          >
            -
          </button>
          <span className="text-2xl font-bold">{amount}</span>
          <button
            onClick={() => setAmount((a) => a + 1)}
            className="w-10 h-10 flex items-center justify-center bg-black rounded-full text-xl"
          >
            +
          </button>
        </div>

        {/* Confirm Button */}
        <button
          className={`w-full py-3 rounded-xl font-semibold ${
            type === "buy"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
          onClick={() => {
            console.log(`${type} ${amount}`)
            onClose()
          }}
        >
          {type === "buy" ? "Confirm Purchase" : "Confirm Sell"}
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </motion.div>
    </div>
  )
}

export default TradeDialog
