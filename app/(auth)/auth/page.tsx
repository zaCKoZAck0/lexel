import { auth } from '@/lib/auth/auth';
import { URLS } from '@/lib/config/config';
import { redirect } from 'next/navigation';
import { LoginPage } from '@/components/auth/login-page';

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const session = await auth();
  if (session) {
    redirect(URLS.userProfile);
  }

  const { redirect: redirectParam } = await searchParams;

  // Sanitize and validate redirect parameter, default to "/"
  const redirectTo =
    redirectParam && redirectParam.startsWith('/')
      ? redirectParam
      : URLS.defaultRedirect;

  return <LoginPage redirectTo={redirectTo} />;
}
