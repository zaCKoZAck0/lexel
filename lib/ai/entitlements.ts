import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  /**
   * List of available chat model IDs for the user type.
   * Leave unspecified to allow all models.
   */
  availableChatModelIds: Array<ChatModel['id']>;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 2000000,
    availableChatModelIds: ['gpt-5-nano'],
  },

  /*
   * For users with an account
  * Allow all models, but limit messages per day
   */
  regular: {
    maxMessagesPerDay: 10,
    availableChatModelIds: ['gpt-5-nano'],
  },

  /*
   * TODO: For users with an account and has their own API key
   */
};
