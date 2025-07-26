"use client";
import { LocateIcon, Mic, Search, Send,  Smile } from "lucide-react";
import { useState } from "react";

const mockUsers = [
  {
    id: 1,
    username: "arpit",
    status: "active",
    image: "https://robohash.org/arpit.png?size=50x50",
    messages: [
      { from: "me", text: "Hey Arpit, how are you?", time: "9:00 PM" },
      { from: "arpit", text: "Doing great! You?", time: "9:01 PM" },
    ],
  },
  {
    id: 2,
    username: "raj",
    status: "inactive",
    image: "https://robohash.org/raj.png?size=50x50",
    messages: [
      { from: "me", text: "Hi Raj!", time: "8:55 PM" },
      { from: "raj", text: "Just saw your message.", time: "8:57 PM" },
    ],
  },
];
const mockCommunities = [
  {
    id: 1,
    name: "Dev Group",
    image: "https://robohash.org/devgroup.png?size=50x50",
    messages: [
      { from: "arpit", text: "Hello devs!", time: "8:45 PM" },
      { from: "me", text: "Hi everyone!", time: "8:46 PM" },
      { from: "raj", text: "What's the latest update?", time: "8:48 PM" },
    ],
  },
];


export default function UserChatFeed() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"user" | "community">("user");
  const [search, setSearch] = useState("");

  const selectedUser = mockUsers.find((u) => u.id === selectedUserId);
  const selectedCommunity = mockCommunities.find((c) => c.id === selectedCommunityId);



  return (
    <div className="flex h-[90vh] rounded-md overflow-hidden text-white ">
      {/* Sidebar */}
      <div className="w-1/3 bg-dark-800 p-4 rounded-md flex flex-col">
        {/* Tabs */}
     
    <span className="">Messages</span>

        <div className="flex my-4 w-full p-2 rounded-md bg-transparent border border-secondary text-white mb-4">
            <Search className="text-secondary"/>
            <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none ml-2 w-full"
            />
        </div>
    
        {/* Tabs */}
<div className="flex justify-around space-x-8 bg-dark-800 rounded-md p-2 mb-4">
  {["user", "community"].map((tab) => (
    <button
      key={tab}
     onClick={() => {
  setActiveTab(tab as "user" | "community");
  setSelectedUserId(null);
}}
     className={`pb-2 font-semibold capitalize transition-colors w-full ${
  activeTab === tab
    ? "text-orange-500 border-b-2 border-orange-500"
    : "text-secondary hover:text-white"
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
                user.username.toLowerCase().includes(search.toLowerCase())
              )
              .map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                    selectedUserId === user.id ? "bg-gray-700" : "hover:bg-gray-800"
                  }`}
                >
                  <img src={user.image} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-xs text-secondary">
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
                  onClick={() => setSelectedCommunityId(community.id)}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                    selectedCommunityId === community.id
                      ? "bg-gray-700"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <img src={community.image} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-medium">{community.name}</div>
                    <div className="text-xs text-secondary">
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
      <div className="w-2/3 py-4 flex flex-col justify-between bg-dark-800 mx-4 rounded-md">
        <div className="overflow-y-auto flex-1 space-y-3">
          {activeTab === "user" && selectedUser ? (
            <>
              <h2 className="flex items-center text-sm font-semibold border-b pb-2 mb-4 px-2 border-secondary">
<img
      src={selectedUser.image || "https://robohash.org/jay.png?size=50x50"}
      className="w-10 h-10 rounded-full bg-secondary mr-2"
      alt="user"
    />
                <div className="flex flex-col rounded-full"> 
     {selectedUser.username}
                <span className="text-[8px] text-secondary">
                  {selectedUser.status === "active"
                    ? <span className="text-green-600">Active</span>
                    : "Last seen 2 min"}
                </span>
    </div>
   
              </h2>
              {selectedUser.messages.map((msg, i) => (
              <div
  key={i}
  className={`flex items-end space-x-2 ${
    msg.from === "me" ? "justify-end" : "justify-start"
  }`}
>
  {msg.from !== "me" && (
    <img
      src={selectedUser.image || "https://robohash.org/jay.png?size=50x50"}
      className="w-8 h-8 rounded-full"
      alt="user"
    />
  )}
  <div className="flex flex-col max-w-xs">
    <div
      className={`px-3 py-2 rounded-lg ${
        msg.from === "me"
          ? " text-white self-end"
          : " text-white"
      }`}
    >
      {msg.text}
    </div>
    <span className="text-xs text-secondary mt-1">
      {msg.time || "Just now"}
    </span>
  </div>
</div>

              ))}
            </>
          ) : activeTab === "community" && selectedCommunity ? (
            <>
              <h2 className="text-lg font-semibold mb-4">
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
    <div className="text-xs text-secondary mb-1">{msg.from}</div>
    <div
      className={`px-3 py-2 rounded-lg ${
        msg.from === "me"
          ? " text-white self-end"
          : " text-white self-start"
      }`}
    >
      {msg.text}
    </div>
    <span className="text-xs text-secondary mt-1">
      {msg.time || "Just now"}
    </span>
  </div>
</div>

              ))}
            </>
          ) : (
            <div className="text-secondary">Select a chat to start messaging</div>
          )}
        </div>

        {/* Chat Input */}
        {(selectedUser || selectedCommunity) && (
          <div className="mx-4 flex items-center space-x-2 border border-secondary p-1 px-2 rounded-full">
            <Mic className="text-secondary"/>
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-md bg-transparent placeholder:text-secondary text-white text-sm outline-none"
            />
            <button className="px-4 py-2 text-secondary flex space-x-4">

                <LocateIcon/>
                <Smile className=""/>
             <Send className=""/>
            </button>
          </div>
        )}
      </div>
    </div>
   
  );
}
