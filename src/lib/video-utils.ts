export type VideoPlatform = 'youtube' | 'facebook' | 'unknown';

// YouTube patterns
const youtubePatterns = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  /youtube\.com\/shorts\/([^&\n?#]+)/,
];

// Facebook patterns
const facebookPatterns = [
  /facebook\.com\/.*\/videos\/(\d+)/,
  /facebook\.com\/watch\/?\?v=(\d+)/,
  /fb\.watch\/([^/?]+)/,
  /facebook\.com\/reel\/(\d+)/,
];

export function detectPlatform(url: string): VideoPlatform {
  for (const pattern of youtubePatterns) {
    if (pattern.test(url)) return 'youtube';
  }
  for (const pattern of facebookPatterns) {
    if (pattern.test(url)) return 'facebook';
  }
  return 'unknown';
}

export function extractVideoId(url: string): string | null {
  // Try YouTube patterns
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  // Try Facebook patterns
  for (const pattern of facebookPatterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export function isValidVideoUrl(url: string): boolean {
  return detectPlatform(url) !== 'unknown';
}

// Legacy function for backwards compatibility
export function isValidYouTubeUrl(url: string): boolean {
  return detectPlatform(url) === 'youtube';
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

// Get thumbnail for any platform
export function getThumbnail(url: string, platform: VideoPlatform, videoId: string | null): string {
  if (platform === 'youtube' && videoId) {
    return getYouTubeThumbnail(videoId);
  }
  // Facebook doesn't provide easy thumbnail access, use a placeholder
  return '/placeholder.svg';
}

// Fetch metadata for different platforms
export async function fetchVideoMetadata(url: string): Promise<{
  title: string;
  channelName: string;
  channelUrl: string;
  thumbnail: string;
} | null> {
  const platform = detectPlatform(url);
  
  if (platform === 'youtube') {
    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      );
      if (response.ok) {
        const data = await response.json();
        const videoId = extractVideoId(url);
        return {
          title: data.title || '',
          channelName: data.author_name || '',
          channelUrl: data.author_url || '',
          thumbnail: videoId ? getYouTubeThumbnail(videoId) : '',
        };
      }
    } catch (error) {
      console.error('Failed to fetch YouTube metadata:', error);
    }
  }
  
  if (platform === 'facebook') {
    // Facebook oEmbed requires an access token, so we return partial data
    // The user will need to enter the title manually
    return {
      title: '',
      channelName: '',
      channelUrl: '',
      thumbnail: '/placeholder.svg',
    };
  }
  
  return null;
}
