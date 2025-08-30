import { signIn } from '@/lib/auth/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GitHubIcon } from '@/components/icons/github-icon';
import Galaxy from '@/components/ui/galaxy';
import { cn } from '@/lib/utils/utils';

interface LoginPageProps {
  className?: string;
  redirectTo?: string;
}

export function LoginPage({ className, redirectTo = '/' }: LoginPageProps) {
  const handleSignIn = async () => {
    'use server';
    await signIn('github', { redirectTo });
  };

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center relative w-full h-full',
        className,
      )}
    >
      <Galaxy />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-card/75 backdrop-blur-md">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Welcome</CardTitle>
              <CardDescription className="text-lg">
                Sign in to continue to your account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button onClick={handleSignIn} size="lg" className="w-full">
                <GitHubIcon size={20} />
                Continue with GitHub
              </Button>

              <p className="text-xs text-muted-foreground/80 text-center">
                Secure authentication via GitHub
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              By signing in, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
