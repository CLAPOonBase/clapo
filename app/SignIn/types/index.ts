export type FlowState =
  | "initial"
  | "choice"
  | "name-username"
  | "displayname"
  | "topics"
  | "follow"
  | "avatar"
  | "bio"
  | "creator-share"
  | "success";

export type AccountType = 'individual' | 'community';

export interface FormData {
  name: string;
  username: string;
  displayName: string;
  topics: string[];
  following: string[];
  avatarFile: File | null;
  avatarPreview: string;
  bio: string;
  enableCreatorShare: boolean;
}

export interface SuggestedUser {
  username: string;
  name: string;
  avatar: string;
  followers: string;
}

export interface CommunityType {
  id: string;
  name: string;
  description: string;
}
