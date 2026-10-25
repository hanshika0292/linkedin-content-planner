import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Post } from '../types';
import { useAuth } from './useAuth';

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async () => {
    if (!user) {
      setPosts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedPosts: Post[] = data.map(post => ({
        id: post.id,
        content: post.content,
        category: post.category,
        scheduledDate: post.scheduled_date,
        status: post.status,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        media: post.media_url ? {
          type: post.media_type!,
          url: post.media_url,
          alt: post.media_alt || undefined,
        } : undefined,
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPost = async (postData: Omit<Post, 'id'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content: postData.content,
          category: postData.category,
          scheduled_date: postData.scheduledDate,
          status: postData.status,
          created_at: postData.createdAt,
          updated_at: postData.updatedAt,
          media_type: postData.media?.type || null,
          media_url: postData.media?.url || null,
          media_alt: postData.media?.alt || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newPost: Post = {
        id: data.id,
        content: data.content,
        category: data.category,
        scheduledDate: data.scheduled_date,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        media: data.media_url ? {
          type: data.media_type!,
          url: data.media_url,
          alt: data.media_alt || undefined,
        } : undefined,
      };

      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (error) {
      console.error('Error adding post:', error);
      return null;
    }
  };

  const updatePost = async (post: Post) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          content: post.content,
          category: post.category,
          scheduled_date: post.scheduledDate,
          status: post.status,
          updated_at: post.updatedAt,
          media_type: post.media?.type || null,
          media_url: post.media?.url || null,
          media_alt: post.media?.alt || null,
        })
        .eq('id', post.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedPost: Post = {
        id: data.id,
        content: data.content,
        category: data.category,
        scheduledDate: data.scheduled_date,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        media: data.media_url ? {
          type: data.media_type!,
          url: data.media_url,
          alt: data.media_alt || undefined,
        } : undefined,
      };

      setPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
      return updatedPost;
    } catch (error) {
      console.error('Error updating post:', error);
      return null;
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== postId));
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  return {
    posts,
    loading,
    addPost,
    updatePost,
    deletePost,
    refetch: fetchPosts,
  };
}