
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Dashboard from './components/document/Dashboard';
import DocumentEditor from './components/document/DocumentEditor';
import { useSettings } from './hooks/useSettings';
import Spinner from './components/ui/Spinner';
import { WifiOff, RefreshCw } from 'lucide-react';
import Button from './components/ui/Button';

function App() {
  const { settings, isI18nLoading, i18nError } = useSettings();

  React.useEffect(() => {
    if (settings?.language) {
      document.documentElement.lang = settings.language;
    }
  }, [settings?.language]);
  
  React.useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
  }, [settings.theme]);

  if (isI18nLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-950">
        <Spinner size="lg" text="Loading application..." />
      </div>
    );
  }

  if (i18nError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 dark:bg-gray-950 text-center p-6">
        <div className="w-16 h-16 flex items-center justify-center bg-red-100 dark:bg-red-500/10 rounded-full mb-4">
            <WifiOff className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-red-200">Failed to Load Application</h1>
        <p className="mt-2 max-w-md text-red-700 dark:text-red-300">
            Could not load language files. This can happen due to network issues or a problem with the application deployment.
        </p>
        <Button variant="secondary" onClick={() => window.location.reload()} className="mt-8">
            <RefreshCw size={16} className="mr-2" />
            Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-950">
      <Header />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/document/:id" element={<DocumentEditor />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;