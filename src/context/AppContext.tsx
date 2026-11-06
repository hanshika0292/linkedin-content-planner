import React, { useReducer } from 'react';
import { usePosts } from '../hooks/usePosts';
import { useCategories } from '../hooks/useCategories';
import { AppContext, type AppAction, type AppState } from './use-app';

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

const initialState: AppState = {
  currentView: 'dashboard',
  selectedDate: new Date().toISOString().split('T')[0],
  postFilter: 'draft',
};

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
