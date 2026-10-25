import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Category } from '../types';
import { useAuth } from './useAuth';

const defaultCategories: Omit<Category, 'id'>[] = [
  { name: 'Product Updates', color: '#10B981' },
  { name: 'Marketing', color: '#F59E0B' },
  { name: 'Thought Leadership', color: '#8B5CF6' },
  { name: 'Company News', color: '#EF4444' },
];

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCategories = async () => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data.length === 0) {
        // Create default categories for new users
        await createDefaultCategories();
      } else {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCategories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(
          defaultCategories.map(cat => ({
            ...cat,
            user_id: user.id,
          }))
        )
        .select();

      if (error) throw error;
      setCategories(data);
    } catch (error) {
      console.error('Error creating default categories:', error);
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          color: categoryData.color,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newCategory: Category = {
        id: data.id,
        name: data.name,
        color: data.color,
      };

      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  return {
    categories,
    loading,
    addCategory,
    refetch: fetchCategories,
  };
}