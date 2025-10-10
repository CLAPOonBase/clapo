"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bookmark } from "lucide-react"

export default function PostTrade() {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [amount, setAmount] = useState(1)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setPosition({ x: rect.left + rect.width / 2, y: rect.top })
    setIsOpen(true)
  }

  const increment = () => setAmount((prev) => prev + 1)
  const decrement = () => setAmount((prev) => (prev > 1 ? prev - 1 : 1))

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleClick}
        className="flex bg-green-500 rounded-md py-1 px-2 items-center space-x-2 text-white hover:text-purple-500 transition-colors"
      >
        <Bookmark className="w-5 h-5" />
        <span className="text-sm hidden md:block font-medium">1234</span>
      </button>

      {/* Floating Buy/Sell Trade Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute z-50"
       
          >
            <div className="bg-white rounded-2xl shadow-lg p-4 w-64 border border-gray-200">
              <h3 className="text-base font-semibold mb-3 text-center">Trade</h3>

              {/* Amount Counter */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={decrement}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-lg"
                >
                  –
                </button>
                <span className="text-lg font-semibold">{amount}</span>
                <button
                  onClick={increment}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-lg"
                >
                  +
                </button>
              </div>

              {/* Buy & Sell Buttons */}
              <div className="flex gap-3">
                <button
                  className="flex-1 bg-green-500 text-white rounded-xl py-2 hover:bg-green-600 transition"
                  onClick={() => {
                    console.log("Buy", amount)
                    setIsOpen(false)
                  }}
                >
                  Buy
                </button>
                <button
                  className="flex-1 bg-red-500 text-white rounded-xl py-2 hover:bg-red-600 transition"
                  onClick={() => {
                    console.log("Sell", amount)
                    setIsOpen(false)
                  }}
                >
                  Sell
                </button>
              </div>

              {/* Cancel */}
              <button
                className="mt-3 text-xs text-gray-500 hover:underline w-full"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
