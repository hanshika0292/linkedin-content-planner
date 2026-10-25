import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          content: string;
          category: string;
          scheduled_date: string | null;
          status: 'draft' | 'scheduled' | 'published';
          created_at: string;
          updated_at: string;
          media_type: 'image' | 'video' | null;
          media_url: string | null;
          media_alt: string | null;
          user_id: string;
        };
        Insert: {
          id?: string;
          content: string;
          category: string;
          scheduled_date?: string | null;
          status?: 'draft' | 'scheduled' | 'published';
          created_at?: string;
          updated_at?: string;
          media_type?: 'image' | 'video' | null;
          media_url?: string | null;
          media_alt?: string | null;
          user_id: string;
        };
        Update: {
          id?: string;
          content?: string;
          category?: string;
          scheduled_date?: string | null;
          status?: 'draft' | 'scheduled' | 'published';
          created_at?: string;
          updated_at?: string;
          media_type?: 'image' | 'video' | null;
          media_url?: string | null;
          media_alt?: string | null;
          user_id?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          color: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
};