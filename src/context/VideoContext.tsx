import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Video, Category, VideoContextType } from '@/types/video';

const VideoContext = createContext<VideoContextType | undefined>(undefined);

const VIDEOS_KEY = 'youtube-manager-videos';
const CATEGORIES_KEY = 'youtube-manager-categories';

const defaultCategories: Category[] = [
  { id: '1', name: 'Music', color: '340 82% 52%' },
  { id: '2', name: 'Education', color: '200 98% 39%' },
  { id: '3', name: 'Entertainment', color: '262 83% 58%' },
];

export function VideoProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const storedVideos = localStorage.getItem(VIDEOS_KEY);
    const storedCategories = localStorage.getItem(CATEGORIES_KEY);
    
    if (storedVideos) {
      setVideos(JSON.parse(storedVideos));
    }
    
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    } else {
      setCategories(defaultCategories);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
    }
  }, []);

  useEffect(() => {
    if (videos.length > 0 || localStorage.getItem(VIDEOS_KEY)) {
      localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos));
    }
  }, [videos]);

  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    }
  }, [categories]);

  const addVideo = (video: Omit<Video, 'id' | 'createdAt'>) => {
    const newVideo: Video = {
      ...video,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setVideos(prev => [newVideo, ...prev]);
  };

  const deleteVideo = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const addCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name,
      color,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, name: string, color: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name, color } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setVideos(prev => prev.map(v => v.categoryId === id ? { ...v, categoryId: null } : v));
    if (selectedCategory === id) {
      setSelectedCategory(null);
    }
  };

  return (
    <VideoContext.Provider value={{
      videos,
      categories,
      selectedCategory,
      addVideo,
      deleteVideo,
      addCategory,
      updateCategory,
      deleteCategory,
      setSelectedCategory,
    }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideos() {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideos must be used within a VideoProvider');
  }
  return context;
}
