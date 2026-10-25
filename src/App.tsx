import React from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/AuthForm';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar';
import { Posts } from './components/Posts';

function AppContent() {
  const { state } = useApp();

  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <Calendar />;
      case 'posts':
        return <Posts />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {renderCurrentView()}
      </main>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;