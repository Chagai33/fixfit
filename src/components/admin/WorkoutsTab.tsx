import { useState, useMemo } from "react";
import { useWorkouts } from "../../hooks/useWorkouts";
import WorkoutDetailModal from "./WorkoutDetailModal";
import { Copy, Check, Play, Users as UsersIcon, TrendingUp } from "lucide-react";

const WorkoutsTab = () => {
  const { workouts, loading } = useWorkouts();
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const groupedByTrainee = useMemo(() => {
    const groups = new Map();
    workouts.forEach(w => {
      if (!groups.has(w.traineeId)) {
        groups.set(w.traineeId, {
          traineeId: w.traineeId,
          traineeName: w.traineeName,
          workouts: []
        });
      }
      groups.get(w.traineeId).workouts.push(w);
    });
    return Array.from(groups.values()).filter(g =>
      g.traineeName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [workouts, searchTerm]);

  const stats = useMemo(() => ({
    totalTrainees: new Set(workouts.map(w => w.traineeId)).size,
    totalPrograms: workouts.length,
    avgPerTrainee: workouts.length / new Set(workouts.map(w => w.traineeId)).size || 0
  }), [workouts]);

  const copyLink = (traineeId: string) => {
    const link = `${window.location.origin}/?trainee=${traineeId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(traineeId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-black text-slate-900 mb-2">תוכניות אימון</h2>
        <p className="text-slate-600">ניהול ומעקב אחר כל תוכניות האימון</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
              <UsersIcon size={24} className="text-sky-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">מתאמנים פעילים</p>
              <p className="text-3xl font-black text-slate-900">{stats.totalTrainees}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
              <Play size={24} className="text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">תוכניות פעילות</p>
              <p className="text-3xl font-black text-slate-900">{stats.totalPrograms}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">ממוצע למתאמן</p>
              <p className="text-3xl font-black text-slate-900">{stats.avgPerTrainee.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          type="search"
          placeholder="חיפוש מתאמן..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all text-lg"
        />
      </div>

      {/* Workouts List */}
      <div className="space-y-4">
        {groupedByTrainee.map(group => (
          <div key={group.traineeId} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-sky-50 to-cyan-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{group.traineeName}</h3>
                  <p className="text-slate-600">{group.workouts.length} תוכניות אימון</p>
                </div>
                <button
                  onClick={() => copyLink(group.traineeId)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-sky-50 border border-sky-200 rounded-xl transition-colors font-medium text-sky-700 hover:text-sky-800 shadow-sm"
                >
                  {copiedId === group.traineeId ? (
                    <><Check size={18} className="text-green-600" /> הועתק!</>
                  ) : (
                    <><Copy size={18} /> העתק לינק</>
                  )}
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {group.workouts.map(w => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWorkout(w)}
                    className="text-right p-5 border-2 border-slate-200 rounded-xl hover:border-sky-500 hover:shadow-md transition-all group bg-gradient-to-br from-white to-slate-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-black text-xl text-slate-900 group-hover:text-sky-600 transition-colors">{w.type}</span>
                      <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                        {w.exercises?.length || 0} תרגילים
                      </span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 transition-all"
                        style={{ width: `${w.completionPercentage || 0}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <WorkoutDetailModal 
          workout={selectedWorkout} 
          onClose={() => setSelectedWorkout(null)} 
        />
      )}
    </div>
  );
};

export default WorkoutsTab;
