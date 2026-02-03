import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../api/firebaseConfig";
import { Tv, Maximize, CheckCircle2, Circle } from "lucide-react";

const TVDisplayTab = () => {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedMap, setCompletedMap] = useState<Map<string, Set<number>>>(new Map());

  useEffect(() => {
    loadWorkouts();
    const interval = setInterval(loadWorkouts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadWorkouts = async () => {
    try {
      const snap = await getDocs(collection(db, "workouts"));
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((w: any) => !w.traineeName?.includes('#'))
        .slice(0, 4);
      setWorkouts(data);
      
      // Initialize completed sets
      const map = new Map();
      data.forEach((w: any) => {
        map.set(w.id, new Set(w.completedIndices || []));
      });
      setCompletedMap(map);
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleExercise = async (workoutId: string, exerciseIdx: number) => {
    const completed = completedMap.get(workoutId) || new Set();
    const newCompleted = new Set(completed);
    
    if (newCompleted.has(exerciseIdx)) {
      newCompleted.delete(exerciseIdx);
    } else {
      newCompleted.add(exerciseIdx);
    }
    
    setCompletedMap(new Map(completedMap.set(workoutId, newCompleted)));
    
    // Save to Firebase
    try {
      const workout = workouts.find(w => w.id === workoutId);
      const total = workout?.exercises?.length || 1;
      const percentage = Math.round((newCompleted.size / total) * 100);
      
      await updateDoc(doc(db, "workouts", workoutId), {
        completedIndices: Array.from(newCompleted),
        completionPercentage: percentage,
        status: percentage === 100 ? 'completed' : percentage > 0 ? 'partially_completed' : 'pending'
      });
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  if (loading) return <div className="text-center py-20">טוען...</div>;

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Tv size={24} className="text-sky-500" />
            <div>
              <h2 className="text-2xl font-black text-slate-900">תצוגת טלוויזיה</h2>
              <p className="text-sm text-slate-600">סימון ביצוע אימונים - 4 מתאמנים במקביל</p>
            </div>
          </div>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-sky-200 hover:shadow-xl hover:scale-105 transition-all"
          >
            <Maximize size={20} />
            מסך מלא
          </button>
        </div>
      </div>

      {/* TV Display Grid */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6">
        <div className="grid grid-cols-2 gap-6 min-h-[700px]">
          {workouts.map((w, idx) => {
            const completed = completedMap.get(w.id) || new Set();
            const progress = Math.round((completed.size / (w.exercises?.length || 1)) * 100);
            
            return (
              <div key={w.id} className="bg-slate-800/80 backdrop-blur border-2 border-slate-700 rounded-2xl p-6 flex flex-col">
                {/* Header */}
                <div className="pb-4 mb-4 border-b border-slate-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-3xl font-black text-white mb-1">{w.traineeName}</h3>
                      <p className="text-xl text-cyan-400">{w.type}</p>
                    </div>
                    <div className="w-14 h-14 rounded-full border-4 border-cyan-500 flex items-center justify-center">
                      <span className="text-2xl font-black text-white">{idx + 1}</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{progress}% הושלם</p>
                </div>

                {/* Exercises */}
                <div className="flex-1 overflow-auto space-y-2 scrollbar-hide">
                  {w.exercises?.map((ex: any, i: number) => {
                    const isCompleted = completed.has(i);
                    return (
                      <button
                        key={i}
                        onClick={() => toggleExercise(w.id, i)}
                        className={`w-full text-right border-2 rounded-xl p-3 transition-all ${
                          isCompleted
                            ? 'bg-green-900/30 border-green-600'
                            : 'bg-slate-800 border-slate-700 hover:border-cyan-500'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {isCompleted ? (
                            <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle size={20} className="text-slate-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                              {ex.isSuperSet && (
                                <span className="text-[9px] px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded font-bold">SUPER-SET</span>
                              )}
                            </div>
                            {ex.isSuperSet && ex.superSetExercises ? (
                              <div className="space-y-0.5 mb-2">
                                {ex.superSetExercises.map((name: string, j: number) => (
                                  <p key={j} className={`text-sm font-medium ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                                    • {name}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className={`text-sm font-bold mb-2 ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                                {ex.altName || ex.name}
                              </p>
                            )}
                            <div className="flex gap-4 text-xs text-slate-400">
                              <span>{ex.sets} סטים</span>
                              <span>{ex.reps} חזרות</span>
                              {ex.weight && <span className="text-cyan-400 font-medium">{ex.weight}</span>}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {/* Fill empty slots */}
          {Array.from({ length: Math.max(0, 4 - workouts.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="border-2 border-dashed border-slate-700 rounded-2xl flex items-center justify-center">
              <p className="text-slate-600 text-lg font-medium">ריק</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4">
        <p className="text-sm text-slate-700">
          💡 <strong>טיפ:</strong> לחץ על תרגיל כדי לסמן אותו כ"בוצע". השינויים נשמרים אוטומטית ב-Firebase.
        </p>
      </div>
    </div>
  );
};

export default TVDisplayTab;
