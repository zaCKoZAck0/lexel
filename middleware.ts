import NextAuth from 'next-auth';
import authConfig from '@/lib/auth/auth.config';
import { URLS } from '@/lib/config/config';

const { auth } = NextAuth(authConfig);

export default auth(req => {
  const { nextUrl } = req;

  const isAuthenticated = !!req.auth;

  // Resolve the sign-in page from config (fallback to URLS.root)
  const signInPage = authConfig.pages?.signIn ?? URLS.root ?? '/auth';

  // Allow requests for Next.js static assets and auth internals to pass through
  const path = nextUrl.pathname;
  if (
    path.startsWith('/_next/') ||
    path.startsWith('/api/auth') ||
    path === '/favicon.ico'
  ) {
    return; // no redirect
  }

  if (isAuthenticated) {
    // If an authenticated user hits the sign-in page, send them to defaultRedirect
    if (path === signInPage)
      return Response.redirect(new URL(URLS.defaultRedirect, nextUrl));
    return; // allow access
  }

  // Unauthenticated: don't redirect if already on the sign-in page (to avoid loop)
  if (path === signInPage) return; // allow showing the sign-in page

  // Redirect unauthenticated users to the sign-in page with callbackUrl
  const signInUrl = nextUrl.clone();
  signInUrl.pathname = signInPage;
  signInUrl.searchParams.set('callbackUrl', nextUrl.href);
  return Response.redirect(signInUrl);
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
