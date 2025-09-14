import { tool } from 'ai';
import { z } from 'zod';
import { getVideoDetails, VideoDetails } from 'youtube-caption-extractor';
import { AppError } from '../api/server/errors';
import { extractVideoId } from '../utils/utils';

const fetchVideoDetails = async (
  videoID: string,
  lang = 'en',
): Promise<VideoDetails> => {
  try {
    const details: VideoDetails = await getVideoDetails({ videoID, lang });
    return details;
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
};

export const watchYoutube = tool({
  description: 'Watch a YouTube video and extract its contents.',
  inputSchema: z.object({
    url: z
      .url()
      .regex(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
      )
      .describe('The URL of the YouTube video to watch'),
  }),
  execute: async ({ url }) => {
    const videoId = extractVideoId(url);
    if (!videoId) throw new AppError(`Invalid youtube url: ${url}`);
    return fetchVideoDetails(videoId);
  },
});
