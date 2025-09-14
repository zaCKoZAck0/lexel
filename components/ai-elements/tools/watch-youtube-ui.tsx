import { YouTubeEmbed } from '@/components/ui/youtube-embed';
import { Skeleton } from '@/components/ui/skeleton';
import { extractVideoId } from '@/lib/utils/utils';

interface Subtitle {
  start: string;
  dur: string;
  text: string;
}

interface Input {
  url: string;
}

interface Output {
  title: string;
  description: string;
  subtitles: Subtitle[];
}

export interface ToolWatchYoutube {
  type: 'tool-watchYoutube';
  toolCallId: string;
  state: 'output-available' | 'input-available';
  input: Input;
  output?: Output;
}

export function WatchYoutubeUI({ part }: { part: ToolWatchYoutube }) {
  if (part.state !== 'output-available') {
    return (
      <div className="mb-4 md:px-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="aspect-video w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 md:px-6">
      <YouTubeEmbed
        videoId={extractVideoId(part.input.url) || ''}
        title={part.output?.title || 'Loading Video...'}
      />
    </div>
  );
}
