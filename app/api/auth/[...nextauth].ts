import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import type { AuthOptions } from "next-auth";

declare module "next-auth" {
  interface Session {
    access_token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
  ],
callbacks: {
  async jwt({ token, account }) {
    if (account?.provider === "twitter") {
      token.access_token = account.access_token ?? undefined;
    }
    return token;
  },
  async session({ session, token }) {
    session.access_token = token.access_token ?? undefined;
    return session;
  },
}
,
  debug: true,
  logger: {
    error(code, metadata) {
      console.error("❌ NextAuth Error:", code, metadata);
    },
    warn(code) {
      console.warn("⚠️ NextAuth Warning:", code);
    },
    debug(code, metadata) {
      console.debug("🐞 NextAuth Debug:", code, metadata);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export const runtime = "nodejs"; // required: disable edge runtime
export { handler as GET, handler as POST };
