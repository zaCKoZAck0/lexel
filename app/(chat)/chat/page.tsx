import { getModelDetails } from '@/lib/models/models';
import { Chat } from '@/features/chat';
import { generateId } from 'ai';
import { getByUserId } from '@/lib/api/server/services/user-preferences';
import { auth } from '@/lib/auth/auth';

export default async function Page() {
  const id = generateId();
  const session = await auth();
  const preferences = await getByUserId(session?.user?.id || '');
  const favoriteModels = preferences
    ? (
        preferences.favoriteModels.map(model => getModelDetails(model)) ?? []
      ).filter(model => !!model)
    : [];
  return (
    <Chat
      chatId={id}
      initialMessages={[]}
      favoriteModels={favoriteModels}
      availableModels={[]}
    />
  );
}
