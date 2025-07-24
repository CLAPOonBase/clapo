"use client"

import { useState } from "react"
import { mockUsers, mockActivity } from "@/app/lib/mockdata"
import { User } from "@/app/types"
import { motion, AnimatePresence } from "framer-motion"
import { Search } from "lucide-react"

export function ExplorePage() {
  const [tab, setTab] = useState<"top" | "activity">("top")
  const [query, setQuery] = useState("")

  const filteredUsers: User[] = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.handle.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="text-white space-y-4"
    >
        <div className="flex justify-between items-center bg-dark-800 text-sm rounded-md">
            <Search className="text-secondary pl-2"/>
             <motion.input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search username"
        className="w-full bg-dark-800 text-white px-4 py-2 rounded outline-none"
      />
        </div>
 <div className="flex justify-around bg-dark-800 rounded-md p-2">
  {["top", "activity"].map((key) => (
    <button
      key={key}
      onClick={() => setTab(key as "top" | "activity")}
      className={`w-full py-2 font-semibold capitalize ${
        tab === key
          ? "text-white border-b-2 border-orange-500"
          : "text-gray-400 hover:text-white"
      }`}
    >
      {key}
    </button>
  ))}
</div>


     

      <div className="space-y-2 bg-dark-800 p-2 rounded-md">
        {tab === "top" &&
          (filteredUsers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-400"
            >
              No users found.
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className=" p-3 rounded flex justify-between items-center space-x-4"
                >
                  
                  <div className="flex">
                    <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full bg-black"
                  />
                    <div>
                        <div className="font-bold">{user.name}</div>
                    <div className="text-sm text-gray-400">{user.handle}</div>
                    </div>
                  </div>
                <div className="flex flex-col items-end">
                    <span> $355.00</span>
                    <span className="text-[8px] text-green-500"> $355.00</span>
                </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ))}

        {tab === "activity" && (
          <AnimatePresence>
            {mockActivity.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="bg-dark-800 p-3 rounded flex flex-col items-start "
              >
                <div className="flex justify-between w-full">
                    <img
                  src={activity.user.avatar}
                  alt={activity.user.name}
                  className="w-10 h-10 bg-black rounded-full"
                />
                 <img
                  src={activity.user.avatar}
                  alt={activity.user.name}
                  className="w-10 h-10 absolute ml-4 bg-black rounded-full"
                />
                  <div className="text-xs text-secondary">{activity.timestamp}</div>
                </div>
                <div className="w-ful">
                  <div className="text-sm w-full text-secondary py-2">
                    <span className="font-bold text-white">{activity.user.name}</span> sold{" "}
                    <span className="text-secondary">21 snaps of Twilight Sky</span> for{" "}
                    <span className="text-secondary">$200</span>
                  </div>
                
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}
