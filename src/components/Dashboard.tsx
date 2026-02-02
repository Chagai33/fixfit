import { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useWorkouts, type Workout } from "../hooks/useWorkouts";
import WorkoutView from "./WorkoutView";
import {
  Users,
  Dumbbell,
  TrendingUp,
  Calendar,
  ChevronRight,
  Search,
  LogOut,
  Bell,
  Plus,
  AlertCircle
} from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { workouts, loading, error } = useWorkouts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const isAdmin = useMemo(() =>
    user?.email === "fixfit10@gmail.com" || user?.email === "chagai33@gmail.com",
    [user]);

  const stats = useMemo(() => {
    if (!workouts.length) return { totalTrainees: 0, activeWorkouts: 0, weeklyVolume: "0kg" };
    const uniqueTrainees = new Set(workouts.map(w => w.traineeId)).size;
    return {
      totalTrainees: uniqueTrainees,
      activeWorkouts: workouts.length,
      weeklyVolume: "1,250kg"
    };
  }, [workouts]);

  const filteredWorkouts = useMemo(() => {
    return workouts.filter(w =>
      w.traineeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [workouts, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full mb-4"></div>
          <p className="text-gray-400">Fixed-Fit Loading...</p>
        </div>
      </div>
    );
  }

  if (selectedWorkout) {
    return <WorkoutView workout={selectedWorkout} onBack={() => setSelectedWorkout(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30" dir="rtl">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Dumbbell className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">FixFit</h1>
              <p className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold">
                {isAdmin ? 'Trainer Pro' : 'Trainee Hub'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
            </button>
            <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium">{user?.displayName}</p>
                <p className="text-[10px] text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5 group"
              >
                <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8 relative">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {isAdmin ? (
          <>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  placeholder="חפש מתאמן או סוג אימון..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all text-right"
                />
              </div>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                <Plus className="w-4 h-4" />
                מתאמן חדש
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1 space-y-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Users className="w-12 h-12" />
                  </div>
                  <p className="text-gray-400 text-sm mb-1">סה"כ מתאמנים</p>
                  <h3 className="text-4xl font-black">{stats.totalTrainees}</h3>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Calendar className="w-12 h-12" />
                  </div>
                  <p className="text-gray-400 text-sm mb-1">תוכניות פעילות</p>
                  <h3 className="text-4xl font-black">{stats.activeWorkouts}</h3>
                </div>
              </div>

              <div className="md:col-span-3 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h2 className="text-lg font-bold">מעקב מתאמנים</h2>
                  <p className="text-sm text-gray-400">{filteredWorkouts.length} תוצאות</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 lg:grid lg:grid-cols-2 lg:gap-4 space-y-3 lg:space-y-0">
                  {filteredWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      onClick={() => setSelectedWorkout(workout)}
                      className="group relative bg-[#121212] border border-white/5 hover:border-blue-500/50 p-4 rounded-2xl transition-all cursor-pointer hover:shadow-2xl hover:shadow-blue-900/10"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center text-xs font-bold ring-2 ring-transparent group-hover:ring-blue-500/20 transition-all">
                            {workout.traineeName?.substring(0, 2)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-100 group-hover:text-blue-400 transition-colors">{workout.traineeName}</h4>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{workout.type}</p>
                          </div>
                        </div>
                        <div className="text-[10px] px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/5">
                          {workout.exercises?.length || 0} תרגילים
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold transition-colors">
                          צפה בתוכנית
                        </button>
                        <div className="w-10 h-10 flex items-center justify-center bg-blue-600/10 hover:bg-blue-600 group-hover:text-white text-blue-400 rounded-lg transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredWorkouts.length === 0 && (
                    <div className="col-span-2 py-20 text-center">
                      <p className="text-gray-500 italic">לא נמצאו מתאמנים.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-black mb-4 flex items-center gap-3">
              <Dumbbell className="w-8 h-8 text-blue-500" />
              האימונים שלי
            </h2>
            <div className="grid gap-4">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => setSelectedWorkout(workout)}
                  className="group bg-[#121212] border border-white/5 p-6 rounded-3xl hover:border-blue-500/50 transition-all cursor-pointer flex justify-between items-center hover:bg-[#1a1a1a]"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1 group-hover:text-blue-400 transition-colors">{workout.type}</h3>
                    <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                      <span>{workout.exercises?.length || 0} תרגילים</span>
                      <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                      <span className="text-blue-400">התחל אימון</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white text-blue-500 transition-all">
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </div>
                </div>
              ))}
              {workouts.length === 0 && (
                <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Dumbbell className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500 font-medium">לא הוקצו לך תוכניות אימון עדיין.</p>
                  <p className="text-xs text-gray-600 mt-1">צור קשר עם המאמן שלך לקבלת תוכנית.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="pt-12 pb-6 text-center text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold">
          © 2026 FixFit Pro Platform • Aesthetic Fitness Tracking
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
