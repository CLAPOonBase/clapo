import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { apiService } from './api'

// NOTE: This NextAuth configuration is kept for backward compatibility
// with existing credential-based logins. New users should use Privy authentication.
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<any> {
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
              image: (response.user as any).avatarUrl,
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
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.dbUser) {
        token.dbUser = user.dbUser
        token.provider = user.provider
      }

      return token
    },
    async session({ session, token }) {
      if (token.dbUser) {
        session.dbUser = token.dbUser
        session.provider = token.provider as string
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









