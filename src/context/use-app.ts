import { createContext, useContext } from 'react';
import type { Dispatch } from 'react';
import type { ViewMode, PostFilter } from '../types';
import type { usePosts } from '../hooks/usePosts';
import type { useCategories } from '../hooks/useCategories';

export interface AppState {
  currentView: ViewMode;
  selectedDate: string;
  postFilter: PostFilter;
}

export type AppAction =
  | { type: 'SET_VIEW'; payload: ViewMode }
  | { type: 'SET_SELECTED_DATE'; payload: string }
  | { type: 'SET_POST_FILTER'; payload: PostFilter };

export interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  posts: ReturnType<typeof usePosts>;
  categories: ReturnType<typeof useCategories>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
