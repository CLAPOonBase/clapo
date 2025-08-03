"use client"

import { useState, ChangeEvent, useEffect } from "react"
import { User, Post } from "@/app/types"
import { motion } from "framer-motion"
import { Ellipsis, PencilIcon } from "lucide-react"
import { useSession } from "next-auth/react"

type Props = {
  user?: User
  posts: Post[]
}

type Tab = "Threads" | "Ticket Holding" | "Stats"

export function ProfilePage({ user, posts }: Props) {
  const { data: session } = useSession()

  const currentUser = session?.dbUser
    ? {
        name: session.dbUser.username,
        handle: `@${session.dbUser.username}`,
        bio: session.dbUser.bio || "No bio available",
        avatar: session.dbUser.avatarUrl || "https://robohash.org/default.png",
        cover: "/default-cover.jpg",
        holdings: 0,
      }
    : user
    ? {
        name: user.name,
        handle: `@${user.handle}`,
        bio: user.bio || "No bio available",
        avatar: user.avatar || "https://robohash.org/default.png",
        cover: "/default-cover.jpg",
        holdings: 0,
      }
    : {
        name: "User",
        handle: "@user",
        bio: "No bio available",
        avatar: "https://robohash.org/default.png",
        cover: "/default-cover.jpg",
        holdings: 0,
      }

  const [avatar, setAvatar] = useState(currentUser.avatar)
  const [cover, setCover] = useState(currentUser.cover)
  const [activeTab, setActiveTab] = useState<Tab>("Threads")

  useEffect(() => {
    if (session?.dbUser?.avatarUrl) {
      setAvatar(session.dbUser.avatarUrl)
    }
  }, [session?.dbUser?.avatarUrl])

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setAvatar(URL.createObjectURL(file))
  }

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setCover(URL.createObjectURL(file))
  }

  return (
    <div className="text-white bg-dark-800 rounded-md">
      <div className="relative h-48 w-full">
        <img
          src={cover}
          alt="Cover"
          className="w-full h-full object-cover bg-black rounded-md"
        />
        <label className="absolute top-2 right-2 bg-dark-800 rounded-md text-xs px-2 py-1 cursor-pointer hover:bg-dark-700">
          Edit Cover
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="hidden"
          />
        </label>
      </div>

      <div className="relative px-4 -mt-14 flex items-end space-x-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <img
            src={avatar}
            alt={currentUser.name}
            className="w-24 h-24 rounded-full border-4 border-dark-900 object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://robohash.org/default.png"
            }}
          />
          <label className="absolute bottom-0 left-0 bg-white text-black p-2 rounded-full cursor-pointer">
            <PencilIcon className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </motion.div>

        <div className="flex-1 flex justify-between items-end">
          <div className="flex gap-2">
            <button className="text-[#E4761B] bg-white rounded px-3 py-1 text-xs font-bold hover:text-white hover:bg-[#E4761B] transition">
              Buy Ticket
            </button>
            <button className="bg-[#23272B] text-primary rounded px-3 py-1 text-xs font-bold">
              Edit Profile
            </button>
            <Ellipsis className="text-gray-400 hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold">{currentUser.name}</h2>
        <p className="text-gray-400 text-sm">{currentUser.handle}</p>
        <p className="text-gray-400 text-xs mt-1">{currentUser.bio}</p>
      </div>

      <div className="mt-6">
        <div className="flex justify-around space-x-4 bg-dark-800 p-2 border-b border-secondary">
          {["Threads", "Ticket Holding", "Stats"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={`pb-2 font-semibold ${
                activeTab === tab
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === "Threads" && (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-dark-800 p-4 rounded">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>{post.author}</span>
                    <span>{post.time}</span>
                  </div>
                  <p>{post.content}</p>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      className="mt-2 rounded-lg w-full max-h-60 object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "Ticket Holding" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-dark-800 p-4 rounded">
                <div className="flex items-center space-x-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold">{currentUser.name}</p>
                    <p className="text-xs text-gray-400">{currentUser.handle}</p>
                  </div>
                </div>
                <span className="text-green-400 font-semibold">
                  {currentUser.holdings} Holding
                </span>
              </div>
            </div>
          )}

          {activeTab === "Stats" && (
            <div className="bg-dark-800 p-6 rounded space-y-4 text-secondary">
              <div className="grid grid-cols-2 gap-2 text-center text-sm font-semibold">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="border rounded-md border-secondary p-4"
                  >
                    <div>Creator Fee</div>
                    <div>7%</div>
                  </div>
                ))}
              </div>
              <button className="w-full border-secondary border text-black py-2 rounded hover:text-white transition">
                <div>Creator Fee</div>
                <div>7%</div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
