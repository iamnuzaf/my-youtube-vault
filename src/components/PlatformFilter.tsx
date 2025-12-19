import { useVideos } from '@/context/VideoContext';
import { Button } from '@/components/ui/button';
import { Youtube, Facebook, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { detectPlatform, VideoPlatform } from '@/lib/video-utils';

export function PlatformFilter() {
  const { videos, selectedPlatform, setSelectedPlatform } = useVideos();

  const getPlatformCount = (platform: VideoPlatform | null) => {
    if (platform === null) return videos.length;
    return videos.filter(v => detectPlatform(v.url) === platform).length;
  };

  const platforms: { id: VideoPlatform | null; label: string; icon: React.ReactNode; color: string }[] = [
    { id: null, label: 'All', icon: <Video className="h-4 w-4" />, color: '' },
    { id: 'youtube', label: 'YouTube', icon: <Youtube className="h-4 w-4" />, color: '0 100% 50%' },
    { id: 'facebook', label: 'Facebook', icon: <Facebook className="h-4 w-4" />, color: '220 100% 50%' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((platform) => {
        const count = getPlatformCount(platform.id);
        const isSelected = selectedPlatform === platform.id;
        
        return (
          <Button
            key={platform.id ?? 'all'}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPlatform(isSelected && platform.id !== null ? null : platform.id)}
            className={cn(
              'rounded-full gap-2 transition-all',
              isSelected && platform.id === 'youtube' && 'bg-red-500 hover:bg-red-600 border-red-500',
              isSelected && platform.id === 'facebook' && 'bg-blue-600 hover:bg-blue-700 border-blue-600',
            )}
          >
            {platform.icon}
            {platform.label} ({count})
          </Button>
        );
      })}
    </div>
  );
}
