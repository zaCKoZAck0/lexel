import { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';

export default {
  session: {
    strategy: 'jwt',
  },
  pages: {
    error: '/auth',
    signIn: '/auth',
    signOut: '/auth',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth }) {
      const isAuthenticated = !!auth?.user;
      return isAuthenticated;
    },
  },
  providers: [GitHub],
} as NextAuthConfig;
