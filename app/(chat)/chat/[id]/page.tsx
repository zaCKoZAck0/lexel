import { Chat } from '@/features/chat';
import { auth } from '@/lib/auth/auth';
import { allModelsForProviders, getModelDetails } from '@/lib/models';
import { getChatByIdWithMessages } from '@/lib/api/server/services/chat';
import { getByUserId } from '@/lib/api/server/services/user-preferences';
import { getAllAvailableProvidersForUserId } from '@/lib/api/server/services/api-keys';
import { convertToUIMessages } from '@/lib/utils/utils';
import { ProviderId } from '@/lib/models/providers';
import { notFound } from 'next/navigation';

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const awaitedParams = await params;
  const session = await auth();

  const chat = await getChatByIdWithMessages(awaitedParams.id);

  if (!chat || chat.userId !== session?.user?.id) {
    return notFound();
  }

  const uiMessages = convertToUIMessages(chat.messages);

  const preferences = await getByUserId(session?.user?.id || '');
  const favoriteModels = preferences
    ? (
        preferences.favoriteModels.map(model => getModelDetails(model)) ?? []
      ).filter(model => !!model)
    : [];

  const availableProviders = (await getAllAvailableProvidersForUserId(
    session?.user?.id || '',
  )) as ProviderId[];
  const availableModels = allModelsForProviders(availableProviders);

  return (
    <Chat
      chatId={chat.id}
      initialMessages={uiMessages}
      favoriteModels={favoriteModels}
      availableModels={availableModels}
    />
  );
}
