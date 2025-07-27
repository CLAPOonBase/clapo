"use client";
import { MapPin, Mic, Search, Send, Smile, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { mockUsers } from "@/app/lib/mockdata";

const mockCommunities = [
  {
    id: 1,
    name: "Dev Group",
    image: "https://robohash.org/devgroup.png?size=50x50",
    avatar: "https://robohash.org/devgroupavatar.png?size=50x50",
    messages: [
      { from: "arpit", text: "Hello devs!", time: "8:45 PM" },
      { from: "me", text: "Hi everyone!", time: "8:46 PM" },
      { from: "raj", text: "What's the latest update?", time: "8:48 PM" },
    ],
  },
];

export default function UserChatFeed() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(1); // Default to first user
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"user" | "community">("user");
  const [search, setSearch] = useState("");
  const [showChat, setShowChat] = useState(false); // For mobile chat view

  const selectedUser = mockUsers.find((u) => u.id === selectedUserId);
  const selectedCommunity = mockCommunities.find((c) => c.id === selectedCommunityId);

  const handleChatSelect = (type: "user" | "community", id: number) => {
    if (type === "user") {
      setSelectedUserId(id);
      setSelectedCommunityId(null);
    } else {
      setSelectedCommunityId(id);
      setSelectedUserId(null);
    }
    setActiveTab(type);
    setShowChat(true);
  };

  const getActiveChats = () => {
    const chats = [];
    if (activeTab === "user") {
      chats.push(...mockUsers.map(user => ({ ...user, type: "user" })));
    } else {
      chats.push(...mockCommunities.map(community => ({ ...community, type: "community" })));
    }
    return chats;
  };

  return (
    <div className="flex h-[90vh] rounded-md overflow-hidden text-white">
      <div className="md:hidden absolute top-0 left-0 right-0 m-4 z-10">
        <div className="flex space-x-3 overflow-x-auto mt-14">
          {getActiveChats().map((chat) => (
            <div
              key={`${chat.type}-${chat.id}`}
              onClick={() => handleChatSelect(chat.type as "user" | "community", chat.id)}
              className="flex-shrink-0 flex flex-col items-center cursor-pointer"
            >
              <div className={`w-16 h-16 rounded-full border-2 p-1 ${
                (chat.type === "user" && selectedUserId === chat.id) ||
                (chat.type === "community" && selectedCommunityId === chat.id)
                  ? "border-orange-500"
                  : "border-gray-600"
              }`}>
                <img 
                  src={chat.avatar || `https://robohash.org/${chat.name || chat.name}.png?size=50x50`} 
                  className="w-full h-full rounded-full object-cover" 
                  alt={chat.name || chat.name}
                />
              </div>
              <span className="text-xs mt-1 text-center max-w-[60px] truncate">
                {chat.name || chat.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={`${showChat ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 bg-dark-800 p-4 rounded-md flex-col ${showChat ? '' : 'mt-24 md:mt-0'}`}>
        {/* Back button for mobile */}
        {showChat && (
          <button
            onClick={() => setShowChat(false)}
            className="md:hidden flex items-center text-orange-500 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to chats
          </button>
        )}

        <span className="text-lg font-semibold mb-4">Messages</span>

        <div className="flex my-4 w-full p-2 rounded-md bg-transparent border border-gray-600 text-white mb-4">
          <Search className="text-gray-400"/>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none ml-2 w-full"
          />
        </div>
    
        {/* Tabs */}
        <div className="flex  justify-around space-x-8 bg-dark-800 rounded-md p-2 mb-4">
          {["user", "community"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab as "user" | "community");
                setSelectedUserId(tab === "user" ? 1 : null);
                setSelectedCommunityId(tab === "community" ? 1 : null);
              }}
              className={`pb-2 font-semibold capitalize transition-colors w-full ${
                activeTab === tab
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="overflow-y-auto space-y-3">
          {activeTab === "user" &&
            mockUsers
              .filter((user) =>
                user.handle.toLowerCase().includes(search.toLowerCase())
              )
              .map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setSelectedCommunityId(null);
                    setShowChat(true);
                  }}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                    selectedUserId === user.id ? "bg-gray-700" : "hover:bg-dark-800"
                  }`}
                >
                  <img src={user.avatar} className="w-10 h-10 rounded-full" alt={user.handle} />
                  <div>
                    <div className="font-medium">{user.handle}</div>
                    <div className="text-xs text-gray-400">
                      {user.status === "active" ? "Active Now" : "Last seen 2 min"}
                    </div>
                  </div>
                </div>
              ))}

          {activeTab === "community" &&
            mockCommunities
              .filter((com) =>
                com.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((community) => (
                <div
                  key={community.id}
                  onClick={() => {
                    setSelectedCommunityId(community.id);
                    setSelectedUserId(null);
                    setShowChat(true);
                  }}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                    selectedCommunityId === community.id
                      ? "bg-gray-700"
                      : "hover:bg-dark-800"
                  }`}
                >
                  <img src={community.image} className="w-10 h-10 rounded-full" alt={community.name} />
                  <div>
                    <div className="font-medium">{community.name}</div>
                    <div className="text-xs text-gray-400">
                      {new Set(community.messages.map((m) => m.from)).size > 1
                        ? "Multiple people messaging"
                        : "1 person active"}
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Chat Panel */}
      <div className={`${showChat ? 'flex' : 'hidden md:flex'} w-full md:w-2/3 py-4 flex-col justify-between bg-dark-800 mx-0 md:mx-4 rounded-md ${showChat ? 'mt-24 md:mt-0' : ''}`}>
        {/* Mobile back button in chat header */}
        {showChat && (selectedUser || selectedCommunity) && (
          <div className="md:hidden flex items-center px-4 pb-4 border-b border-gray-600 mb-4">
            <button
              onClick={() => setShowChat(false)}
              className="text-orange-500 mr-3"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src={(selectedUser?.avatar || selectedCommunity?.image) || "https://robohash.org/default.png?size=50x50"}
              className="w-8 h-8 rounded-full mr-3"
              alt="chat"
            />
            <div>
              <div className="font-medium text-sm">
                {selectedUser?.handle || selectedCommunity?.name}
              </div>
              {selectedUser && (
                <div className="text-xs text-gray-400">
                  {selectedUser.status === "active" ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    "Last seen 2 min"
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="overflow-y-auto flex-1 space-y-3 px-2">
          {activeTab === "user" && selectedUser ? (
            <>
              {/* Desktop header */}
              <h2 className="hidden md:flex items-center text-sm font-semibold border-b pb-2 mb-4 px-2 border-gray-600">
                <img
                  src={selectedUser.avatar || "https://robohash.org/jay.png?size=50x50"}
                  className="w-10 h-10 rounded-full bg-gray-600 mr-2"
                  alt="user"
                />
                <div className="flex flex-col"> 
                  {selectedUser.handle}
                  <span className="text-[8px] text-gray-400">
                    {selectedUser.status === "active"
                      ? <span className="text-green-600">Active</span>
                      : "Last seen 2 min"}
                  </span>
                </div>
              </h2>
              {(selectedUser.messages ?? []).map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end space-x-2 ${
                    msg.from === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.from !== "me" && (
                    <img
                      src={selectedUser.avatar || "https://robohash.org/jay.png?size=50x50"}
                      className="w-8 h-8 rounded-full"
                      alt="user"
                    />
                  )}
                  <div className="flex flex-col max-w-xs">
                    <div
                      className={`px-2 py-1 text-[12px] rounded-lg ${
                        msg.from === "me"
                          ? "bg-orange-500 text-white self-end"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-xs text-gray-400 mt-1">
                      {msg.time || "Just now"}
                    </span>
                  </div>
                </div>
              ))}
            </>
          ) : activeTab === "community" && selectedCommunity ? (
            <>
              <h2 className="hidden md:block text-lg font-semibold mb-4">
                {selectedCommunity.name}
              </h2>
              {selectedCommunity.messages.map((msg, i) => (
                <div key={i} className={`flex items-end space-x-2 ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                  {msg.from !== "me" && (
                    <img
                      src={`https://robohash.org/${msg.from}.png?size=50x50`}
                      className="w-8 h-8 rounded-full"
                      alt="avatar"
                    />
                  )}
                  <div className="flex flex-col max-w-xs">
                    <div className="text-xs text-gray-400 mb-1">{msg.from}</div>
                    <div
                      className={`px-3 py-2 rounded-lg ${
                        msg.from === "me"
                          ? "bg-orange-500 text-white self-end"
                          : "bg-gray-700 text-white self-start"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-xs text-gray-400 mt-1">
                      {msg.time || "Just now"}
                    </span>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-gray-400 text-center mt-8">Select a chat to start messaging</div>
          )}
        </div>

  {(selectedUser || selectedCommunity) && (
        <div className={`
          mx-2 p-2 md:px-3 md:mx-4 mt-2 flex items-center gap-2 md:gap-3
           transition-all duration-200 ease-in-out rounded-2xl
          bg-gray-800/50 backdrop-blur-sm
        `}>
          {/* Mic Button */}
          <button className="text-gray-400 hover:text-blue-400 transition-colors duration-200 shrink-0 p-1 hover:bg-gray-700 rounded-lg">
            <Mic size={18} className="md:w-5 md:h-5" />
          </button>

          {/* Input Field */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type a message..."
              className="
                w-full px-3 py-2 md:py-2.5 rounded-xl
                bg-transparent placeholder:text-gray-500 text-white 
                text-sm md:text-base outline-none
                transition-all duration-200
              "
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <button className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 p-1 hover:bg-gray-700 rounded-lg">
              <MapPin size={18} className="md:w-5 md:h-5" />
            </button>
            
            <button className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 p-1 hover:bg-gray-700 rounded-lg">
              <Smile size={18} className="md:w-5 md:h-5" />
            </button>
            
            <button 
             
            >
              <Send size={16} className="md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}