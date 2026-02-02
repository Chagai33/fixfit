import { useAuth } from './contexts/AuthContext';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ScheduleView from './components/ScheduleView';
import { useState } from 'react';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [view, setView] = useState<'dashboard' | 'schedule'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-t-2 border-action rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* View Switcher Overlay - Fixed z-index and positioning for RTL/LTR */}
      <div className="fixed top-24 start-8 z-[500] flex flex-col gap-3 pointer-events-auto">
        <button
          onClick={(e) => {
            e.preventDefault();
            setView('dashboard');
          }}
          className={`w-12 h-12 flex items-center justify-center rounded-full border shadow-lg transition-all cursor-pointer active:scale-90 ${view === 'dashboard' ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-border-standard hover:bg-surface-soft'
            }`}
          aria-label="Dashboard"
          title="Dashboard"
        >
          <span className="text-xl">🏠</span>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            setView('schedule');
          }}
          className={`w-12 h-12 flex items-center justify-center rounded-full border shadow-lg transition-all cursor-pointer active:scale-90 ${view === 'schedule' ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-border-standard hover:bg-surface-soft'
            }`}
          aria-label="Schedule"
          title="Schedule"
        >
          <span className="text-xl">📅</span>
        </button>
      </div>

      {/* Main View Container */}
      <div className="relative z-10">
        {view === 'dashboard' ? <Dashboard /> : <ScheduleView />}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
