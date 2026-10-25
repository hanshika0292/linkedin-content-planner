import React, { createContext, useContext, useReducer } from 'react';
import { ViewMode, PostFilter } from '../types';
import { usePosts } from '../hooks/usePosts';
import { useCategories } from '../hooks/useCategories';

interface AppState {
  currentView: ViewMode;
  selectedDate: string;
  postFilter: PostFilter;
}

type AppAction =
  | { type: 'SET_VIEW'; payload: ViewMode }
  | { type: 'SET_SELECTED_DATE'; payload: string }
  | { type: 'SET_POST_FILTER'; payload: PostFilter };

const initialState: AppState = {
  currentView: 'dashboard',
  selectedDate: new Date().toISOString().split('T')[0],
  postFilter: 'draft',
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  posts: ReturnType<typeof usePosts>;
  categories: ReturnType<typeof useCategories>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_POST_FILTER':
      return { ...state, postFilter: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const posts = usePosts();
  const categories = useCategories();

  return (
    <AppContext.Provider value={{ state, dispatch, posts, categories }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}