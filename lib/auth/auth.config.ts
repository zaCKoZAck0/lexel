import { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';

export default {
  session: { strategy: 'jwt' },
  providers: [GitHub],
} as NextAuthConfig;
