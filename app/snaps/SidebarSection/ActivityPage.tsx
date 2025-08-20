/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { ActivityItem } from "@/app/types";
import ActivityFeed from "../Sections/ActivityFeed"

const ActivityPage = () => {
     const mockActivity: ActivityItem[] = [
      {
        id: 1,
        type: "like",
        timestamp: "2 hours ago",
        user: {
            id:1,
          name: "Alice",
          handle: "@alice123",
          avatar: "https://robohash.org/alice.png?size=50x50",
          bio: "Building things with code and coffee ☕",
        },
      },
      {
        id: 2,
        type: "retweet",
        timestamp: "3 hours ago",
        user: {
            id:2,
          name: "Bob",
          handle: "@bobdev",
          avatar: "https://robohash.org/bob.png?size=50x50",
          bio: "React wizard and open source junkie",
        },
      },
      {
        id: 3,
        type: "follow",
        timestamp: "5 hours ago",
        user: {
            id:1,
          name: "Charlie",
          handle: "@charliex",
          avatar: "https://robohash.org/charlie.png?size=50x50",
          bio: "Design meets frontend — UI/UX lover",
        },
      },
    ];
  return <div className="">
    <ActivityFeed items={mockActivity} />
  </div>
}

export default ActivityPage