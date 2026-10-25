export interface Post {
  id: string;
  content: string;
  category: string;
  scheduledDate?: string;
  status: 'draft' | 'scheduled' | 'published';
  createdAt: string;
  updatedAt: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    alt?: string;
    isAiGenerated?: boolean;
    aiPrompt?: string;
    aiStyle?: string;
  };
  refinementHistory?: {
    originalContent?: string;
    refinementType?: string;
    refinedAt?: string;
  }[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export type ViewMode = 'dashboard' | 'calendar' | 'posts';

export type PostFilter = 'all' | 'draft' | 'scheduled' | 'published';