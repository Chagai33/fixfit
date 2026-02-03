import { useAuth, AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import TraineeView from './components/TraineeView';

const AppContent = () => {
  const { user, loading } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const traineeId = urlParams.get('trainee');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">טוען...</p>
        </div>
      </div>
    );
  }

  // Public trainee link
  if (traineeId) {
    return <TraineeView traineeId={traineeId} />;
  }

  // Requires authentication
  if (!user) {
    return <Login />;
  }

  return <AdminPanel />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
