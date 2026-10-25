import { useState, useCallback } from 'react';
import { geminiService, TrendingTopic, RefinementType, GeneratedImage } from '../lib/gemini';

interface UseTrendingTopicsReturn {
  topics: TrendingTopic[];
  loading: boolean;
  error: string | null;
  fetchTrendingTopics: () => Promise<void>;
  generatePostContent: (topic: TrendingTopic) => Promise<string>;
  isGeneratingContent: boolean;
  refineContent: (content: string, refinementType: RefinementType) => Promise<string>;
  isRefiningContent: boolean;
  generateImage: (prompt: string, style?: string) => Promise<GeneratedImage>;
  generateImageFromContent: (content: string) => Promise<GeneratedImage>;
  isGeneratingImage: boolean;
}

export function useTrendingTopics(): UseTrendingTopicsReturn {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isRefiningContent, setIsRefiningContent] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const fetchTrendingTopics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const trendingTopics = await geminiService.getTrendingTopics();
      setTopics(trendingTopics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch trending topics';
      setError(errorMessage);
      console.error('Error fetching trending topics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const generatePostContent = useCallback(async (topic: TrendingTopic): Promise<string> => {
    setIsGeneratingContent(true);
    setError(null);

    try {
      const content = await geminiService.generatePostContent(topic);
      return content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate post content';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGeneratingContent(false);
    }
  }, []);

  const refineContent = useCallback(async (content: string, refinementType: RefinementType): Promise<string> => {
    setIsRefiningContent(true);
    setError(null);

    try {
      const refinedContent = await geminiService.refineContent(content, refinementType);
      return refinedContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refine content';
      setError(errorMessage);
      throw err;
    } finally {
      setIsRefiningContent(false);
    }
  }, []);

  const generateImage = useCallback(async (prompt: string, style: string = 'professional'): Promise<GeneratedImage> => {
    setIsGeneratingImage(true);
    setError(null);

    try {
      const image = await geminiService.generateImage(prompt, style);
      return image;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGeneratingImage(false);
    }
  }, []);

  const generateImageFromContent = useCallback(async (content: string): Promise<GeneratedImage> => {
    setIsGeneratingImage(true);
    setError(null);

    try {
      const image = await geminiService.generateImageFromContent(content);
      return image;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image from content';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGeneratingImage(false);
    }
  }, []);

  return {
    topics,
    loading,
    error,
    fetchTrendingTopics,
    generatePostContent,
    isGeneratingContent,
    refineContent,
    isRefiningContent,
    generateImage,
    generateImageFromContent,
    isGeneratingImage,
  };
}
