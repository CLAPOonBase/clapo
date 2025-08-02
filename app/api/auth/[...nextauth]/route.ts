import NextAuth, { NextAuthOptions } from 'next-auth'
import TwitterProvider from 'next-auth/providers/twitter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { apiService } from '../../../lib/api'

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          const response = await apiService.login({
            username: credentials.username,
            password: credentials.password
          })

          if (response.user) {
            return {
              id: response.user.id,
              name: response.user.username,
              email: response.user.email,
              image: response.user.avatarUrl,
              dbUser: response.user,
              provider: 'credentials'
            }
          }
          return null
        } catch (error) {
          console.error('Login error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === 'twitter' && user) {
        token.provider = 'twitter'
        token.twitterData = user
        token.needsPasswordSetup = true
      }
      
      if (user?.dbUser) {
        token.dbUser = user.dbUser
        token.provider = user.provider
      }
      
      return token
    },
    async session({ session, token }) {
      if (token.dbUser) {
        session.dbUser = token.dbUser as any
        session.provider = token.provider as any
        session.needsPasswordSetup = token.needsPasswordSetup as any
        session.twitterData = token.twitterData as any
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here",
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
