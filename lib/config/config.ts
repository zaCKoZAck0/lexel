export const API_BASE_URL = '/api';

export const URLS = {
  /**
   * URL for the user profile page, for authenticated users
   */
  userProfile: '/settings/account',
  /**
   * Default redirect URL after login
   */
  defaultRedirect: '/chat',
  // Where to send unauthenticated users by default
  root: '/auth',
  publicRoutes: [] as string[],
};
