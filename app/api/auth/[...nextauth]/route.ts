// NOTE: This NextAuth route is kept for backward compatibility with credential-based logins.
// New users should authenticate using Privy (see /SignIn page).
import NextAuth from 'next-auth'
import { authOptions } from '../../../lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
