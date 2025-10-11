import { NextAuthOptions } from 'next-auth'
import TwitterProvider from 'next-auth/providers/twitter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { apiService } from './api'

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
    async signIn({ user, account, profile }) {
      if (account?.provider === 'twitter' && user) {
        const twitterUsername = (profile as any)?.data?.username || user.name;

        try {
          if (twitterUsername) {
            const searchResponse = await apiService.searchUsers(twitterUsername, 1, 0);

            if (searchResponse.users.length === 0) {
              try {
                const directResponse = await fetch(`http://server.blazeswap.io/api/snaps/users/search?q=${encodeURIComponent(twitterUsername)}&limit=10&offset=0`);
                const directData = await directResponse.json();

                if (directData.users && directData.users.length > 0) {
                  const existingUser = directData.users.find(u => u.username === twitterUsername);
                  if (existingUser) {
                    user.dbUser = {
                      id: existingUser.id,
                      username: existingUser.username,
                      email: existingUser.email,
                      bio: existingUser.bio,
                      avatar_url: existingUser.avatar_url || '',
                      createdAt: existingUser.created_at
                    };
                    user.provider = 'twitter';
                    user.needsPasswordSetup = false;
                    return true;
                  }
                }
              } catch (directError) {
                console.error('Direct fetch failed:', directError);
              }
            }

            const existingUser = searchResponse.users.find(u =>
              u.username === twitterUsername
            );

            if (existingUser) {
              user.dbUser = {
                id: existingUser.id,
                username: existingUser.username,
                email: existingUser.email,
                bio: existingUser.bio,
                avatar_url: existingUser.avatar_url || '',
                createdAt: existingUser.created_at
              };
              user.provider = 'twitter';
              user.needsPasswordSetup = false;
              return true;
            } else {
              // User doesn't exist - auto-create account with random password
              console.log('🔍 Creating new account for Twitter user:', twitterUsername);
              try {
                // Generate a secure random password
                const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);

                const signupData = {
                  username: twitterUsername,
                  email: user.email || `${twitterUsername}@twitter.clapo.app`,
                  password: randomPassword,
                  bio: (profile as any)?.data?.description || (profile as any)?.description || 'Twitter user on Clapo',
                  avatarUrl: user.image || (profile as any)?.data?.profile_image_url || ''
                };

                console.log('🔍 Attempting to create account with:', {
                  username: signupData.username,
                  email: signupData.email,
                  bio: signupData.bio,
                  hasAvatar: !!signupData.avatarUrl
                });

                const signupResponse = await apiService.signup(signupData);

                if (signupResponse && signupResponse.user && signupResponse.user.id) {
                  console.log('✅ Successfully created account:', signupResponse.user.id);

                  // Fetch complete user profile
                  try {
                    const profileResponse = await apiService.getUserProfile(signupResponse.user.id);
                    user.dbUser = profileResponse.profile;
                  } catch (profileError) {
                    console.error('Failed to fetch profile, using signup data:', profileError);
                    user.dbUser = signupResponse.user;
                  }

                  user.provider = 'twitter';
                  user.needsPasswordSetup = false;
                  return true;
                } else {
                  console.error('❌ Signup response missing user data');
                  throw new Error('Failed to create user account');
                }
              } catch (signupError) {
                console.error('❌ Failed to auto-create account:', signupError);
                // Fallback to old flow if auto-creation fails
                user.provider = 'twitter';
                user.needsPasswordSetup = true;
                user.twitterData = {
                  username: twitterUsername,
                  email: user.email || `${twitterUsername}@twitter.com`,
                  bio: (profile as any)?.description || '',
                  avatarUrl: user.image || ''
                };
                return true;
              }
            }
          } else {
            user.provider = 'twitter';
            user.needsPasswordSetup = true;
            return true;
          }
        } catch (error) {
          console.error('Error in Twitter sign-in:', error);
          user.provider = 'twitter';
          user.needsPasswordSetup = true;
          user.twitterData = {
            username: twitterUsername || user.name || '',
            email: user.email || `${twitterUsername || user.name || 'user'}@twitter.com`,
            bio: (profile as any)?.description || '',
            avatarUrl: user.image || ''
          };
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === 'twitter' && user) {
        token.provider = 'twitter'
        token.twitterData = user.twitterData
        token.needsPasswordSetup = user.needsPasswordSetup
        
        if (user.dbUser) {
          token.dbUser = user.dbUser
        }
      }
      
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
        session.needsPasswordSetup = token.needsPasswordSetup as boolean
        session.twitterData = token.twitterData
      } else if (token.provider === 'twitter' && token.needsPasswordSetup) {
        session.provider = token.provider as string
        session.needsPasswordSetup = token.needsPasswordSetup as boolean
        session.twitterData = token.twitterData
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









