import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell, Mail, Lock, ArrowLeft } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError('אימייל או סיסמה שגויים');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-sky-300">
            <Dumbbell size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-black text-slate-900 mb-3">
            Fix<span className="text-sky-500">Fit</span>
          </h1>
          <p className="text-slate-600 text-lg">סטודיו בוטיק לאימונים אישיים</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">כניסה למערכת</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Mail size={16} />
                אימייל
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all text-lg"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Lock size={16} />
                סיסמה
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all text-lg"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-sm font-medium text-red-700 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-sky-200 hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  כניסה
                  <ArrowLeft size={20} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2026 FixFit Training System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
