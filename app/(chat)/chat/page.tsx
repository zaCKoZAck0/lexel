import { allModelsForProviders, getModelDetails } from '@/lib/models';
import { Chat } from '@/features/chat';
import { generateId } from 'ai';
import { getByUserId } from '@/lib/api/server/services/user-preferences';
import { auth } from '@/lib/auth/auth';
import { getAllAvailableProvidersForUserId } from '@/lib/api/server/services/api-keys';
import { ProviderId } from '@/lib/models/providers';

export default async function Page() {
  const id = generateId();
  const session = await auth();
  const preferences = await getByUserId(session?.user?.id || '');
  const availableProviders = (await getAllAvailableProvidersForUserId(
    session?.user?.id || '',
  )) as ProviderId[];
  const availableModels = allModelsForProviders(availableProviders);
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
      availableModels={availableModels}
    />
  );
}
