import React, { useReducer } from 'react';
import { usePosts } from '../hooks/usePosts';
import { useCategories } from '../hooks/useCategories';
import { getTodayKey } from '../utils/date-utils';
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

function createInitialState(): AppState {
  return {
    currentView: 'dashboard',
    // Today in the browser's time zone (not UTC), so the calendar opens on the right day.
    selectedDate: getTodayKey(),
    postFilter: 'draft',
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState);
  const posts = usePosts();
  const categories = useCategories();

  return (
    <AppContext.Provider value={{ state, dispatch, posts, categories }}>
      {children}
    </AppContext.Provider>
  );
}
