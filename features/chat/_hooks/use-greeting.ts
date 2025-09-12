import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { getGreetingText } from '@/lib/utils/ui-text';

export function useGreeting() {
  const { data: session } = useSession();

  const greetingText = useMemo(() => {
    return getGreetingText(session?.user?.name);
  }, [session?.user?.name]);

  return {
    session,
    greetingText,
  };
}
