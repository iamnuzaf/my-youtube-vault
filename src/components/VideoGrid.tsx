import { useVideos } from '@/context/VideoContext';
import { VideoCard } from './VideoCard';
import { Video } from 'lucide-react';

export function VideoGrid() {
  const { videos, selectedCategory } = useVideos();
  
  const filteredVideos = selectedCategory 
    ? videos.filter(v => v.categoryId === selectedCategory)
    : videos;

  if (filteredVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Video className="h-16 w-16 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No videos yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first YouTube video using the form above
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredVideos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
