// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    access_token?: string
    dbUser?: {
      id: string
      username: string
      bio?: string
      avatarUrl?: string
      holdings?: number
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string
    dbUser?: {
      id: string
      username: string
      bio?: string
      avatarUrl?: string
      holdings?: number
    }
  }
}
