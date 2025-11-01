import type { SuggestedUser, CommunityType } from './index';

export const TOPICS = [
  "Technology", "Design", "Business", "Art", "Music",
  "Gaming", "Sports", "Fashion", "Food", "Travel",
  "Science", "Education", "Health", "Finance", "Web3"
];

export const SUGGESTED_USERS: SuggestedUser[] = [
  { username: "alex_dev", name: "Alex Chen", avatar: "👨‍💻", followers: "12.5K" },
  { username: "sarah_design", name: "Sarah Miller", avatar: "🎨", followers: "8.3K" },
  { username: "tech_guru", name: "Mike Johnson", avatar: "🚀", followers: "25.1K" },
  { username: "crypto_queen", name: "Emma Davis", avatar: "💎", followers: "15.7K" }
];

export const COMMUNITY_TYPES: CommunityType[] = [
  { id: "open", name: "Open", description: "Anyone can join and post" },
  { id: "closed", name: "Closed", description: "Anyone can join, admin approval for posts" },
  { id: "private", name: "Private", description: "Invite-only community" }
];

export const INITIAL_FORM_DATA = {
  name: "",
  username: "",
  displayName: "",
  topics: [] as string[],
  following: [] as string[],
  avatarFile: null as File | null,
  avatarPreview: "" as string,
  bio: "",
  enableCreatorShare: false
};
