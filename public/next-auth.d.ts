// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user?: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
    dbUser?: {
      id: string
      username: string
      email: string
      bio: string
      avatar_url: string
      createdAt: string
    }
    provider?: string
    needsPasswordSetup?: boolean
    twitterData?: {
      username: string
      email: string
      bio: string
      avatarUrl: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    dbUser?: {
      id: string
      username: string
      email: string
      bio: string
      avatar_url: string
      createdAt: string
    }
    provider?: string
    needsPasswordSetup?: boolean
    twitterData?: {
      username: string
      email: string
      bio: string
      avatarUrl: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    dbUser?: {
      id: string
      username: string
      email: string
      bio: string
      avatar_url: string
      createdAt: string
    }
    provider?: string
    needsPasswordSetup?: boolean
    twitterData?: {
      username: string
      email: string
      bio: string
      avatarUrl: string
    }
  }
}
