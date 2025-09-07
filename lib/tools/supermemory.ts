import { supermemoryTools } from '@supermemory/ai-sdk';
import { tool } from 'ai';
import { z } from 'zod';

export function createMemoryTools(userId: string) {
  const tools = supermemoryTools(process.env.SUPERMEMORY_API_KEY!, {
    containerTags: [userId],
  });

  const searchMemories = tool({
    description:
      'Retrieve previously stored information that may help answer the current user query.',
    inputSchema: z.object({
      informationToGet: z.string(),
      includeFullDocs: z.boolean().optional().default(false),
      limit: z.number().optional().default(10),
    }),
    execute: async (input, options) => {
      if (!tools.searchMemories || !tools.searchMemories.execute) {
        return {
          success: false,
          error: 'searchMemories tool is not available',
        };
      }
      try {
        return await tools.searchMemories.execute(input, options);
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  });

  const addMemory = tool({
    description:
      'Save important details from the user. Only save facts, preferences, personal information or context that will be useful later.',
    inputSchema: z.object({
      memory: z.string(),
    }),
    execute: async (input, options) => {
      if (!tools.addMemory || !tools.addMemory.execute) {
        return {
          success: false,
          error: 'addMemory tool is not available',
        };
      }
      return await tools.addMemory.execute(input, options);
    },
  });

  return {
    searchMemories,
    addMemory,
  };
}
