import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiService } from "../../../lib/api";

export const authOptions = {
  providers: [
    TwitterProvider({
      clientId: 'cEFKT3pRTUpvMFFVVDZGVVR3YWI6MTpjaQ', 
      clientSecret: 'I2OMfbLwHhT_nM6kXGxIQo44110i7PWUjPl7-coP_TINQz1UTd',
      version: "2.0",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const response = await apiService.login({
            username: credentials.username,
            password: credentials.password
          });
          
          return {
            id: response.user.id,
            name: response.user.username,
            email: response.user.email,
            dbUserId: response.user.id,
            dbUser: response.user
          };
        } catch (error) {
          console.error("Login failed:", error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: any, account: any, profile?: any }) {
      console.log('🔍 NextAuth signIn callback triggered');
      console.log('🔍 Account data:', {
        provider: account?.provider,
        hasAccessToken: !!account?.access_token,
        accessTokenLength: account?.access_token?.length || 0
      });
      console.log('🔍 Profile data:', {
        id: profile?.id,
        username: profile?.username,
        screen_name: profile?.screen_name,
        name: profile?.name,
        description: profile?.description,
        profile_image_url: profile?.profile_image_url,
        profile_image_url_https: profile?.profile_image_url_https
      });
      
      if (account?.provider === "twitter" && profile) {
        try {
          const twitterData = {
            username: (profile.screen_name || profile.username || profile.name || user.name || `user_${Date.now()}`).replace(/\s+/g, '_').toLowerCase(),
            email: profile.email || `${(profile.screen_name || profile.username || profile.name || user.name || `user_${Date.now()}`).replace(/\s+/g, '').toLowerCase()}@twitter.com`,
            bio: profile.description || profile.bio || "Twitter user",
            avatarUrl: profile.profile_image_url_https || profile.profile_image_url || profile.profile_image_url_400x400 || user.image || "https://robohash.org/default.png",
          };

          console.log('🔍 Processed Twitter data for session:', twitterData);
          console.log('🔍 Access token being stored:', account.access_token ? 'EXISTS' : 'MISSING');

          user.twitterData = twitterData;
          user.needsPasswordSetup = true;
          user.provider = 'twitter';
          user.dbUserId = null;
          user.dbUser = null;
          user.access_token = account.access_token;
          
          return true;
        } catch (error) {
          console.error("Failed to process Twitter data:", error);
          return true;
        }
      }
      
      if (account?.provider === "credentials" && user) {
        user.dbUserId = user.id;
        user.dbUser = {
          id: user.id,
          username: user.name,
          email: user.email,
          bio: "",
          avatarUrl: "",
          createdAt: new Date().toISOString()
        };
        user.needsPasswordSetup = false;
        user.provider = 'credentials';
      }
      
      return true;
    },
    async jwt({ token, user, account, trigger, session }: { token: any, user?: any, account?: any, trigger?: any, session?: any }) {
      if (account && user) {
        token.dbUserId = user.dbUserId;
        token.dbUser = user.dbUser;
        token.twitterData = user.twitterData;
        token.needsPasswordSetup = user.needsPasswordSetup;
        token.provider = user.provider;
        token.access_token = user.access_token;
      }
      
      if (trigger === "update" && session) {
        token.dbUserId = session.dbUserId;
        token.dbUser = session.dbUser;
        token.twitterData = session.twitterData;
        token.needsPasswordSetup = session.needsPasswordSetup;
        token.provider = session.provider;
        token.access_token = session.access_token;
      }
      
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (token?.dbUserId) {
        session.dbUserId = token.dbUserId;
        session.dbUser = token.dbUser;
      }
      
      if (token?.twitterData) {
        session.twitterData = token.twitterData;
      }
      
      if (token?.needsPasswordSetup !== undefined) {
        session.needsPasswordSetup = token.needsPasswordSetup;
      }
      
      if (token?.provider) {
        session.provider = token.provider;
      }
      
      if (token?.access_token) {
        session.access_token = token.access_token;
      }
      
      return session;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }: { user: any, account: any, profile?: any, isNewUser?: boolean }) {
      if (account?.provider === "twitter" && isNewUser) {
        console.log("🎉 New user signed in via Twitter:", {
          username: user.dbUser?.username,
          email: user.dbUser?.email,
          avatarUrl: user.dbUser?.avatarUrl,
          bio: user.dbUser?.bio,
          needsPasswordSetup: user.needsPasswordSetup,
        });
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
