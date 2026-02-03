import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../api/firebaseConfig";
import { ArrowRight, Dumbbell, CheckCircle2, Circle } from "lucide-react";

const TraineeView = ({ traineeId }: { traineeId: string }) => {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadWorkouts();
  }, [traineeId]);

  const loadWorkouts = async () => {
    try {
      const q = query(collection(db, "workouts"), where("traineeId", "==", traineeId));
      const snap = await getDocs(q);
      setWorkouts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  };

  const toggleExercise = (idx: number) => {
    const next = new Set(completed);
    next.has(idx) ? next.delete(idx) : next.add(idx);
    setCompleted(next);
  };

  const progress = selected ? Math.round((completed.size / (selected.exercises?.length || 1)) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-cyan-50">
        <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 to-cyan-50 p-8">
        <div className="bg-white rounded-3xl p-12 text-center shadow-xl max-w-md">
          <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-6">
            <Dumbbell size={40} className="text-sky-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">אין תוכניות אימון</h2>
          <p className="text-slate-600">פנה למאמן שלך להוספת תוכנית אימון</p>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50" dir="rtl">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
            <button 
              onClick={() => { setSelected(null); setCompleted(new Set()); }}
              className="flex items-center gap-2 text-slate-600 hover:text-sky-600 transition-colors mb-4 font-medium"
            >
              <ArrowRight size={20} />
              חזרה לתוכניות
            </button>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-2">{selected.type}</h1>
                <p className="text-slate-600 text-lg">{selected.traineeName}</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-500 mb-1">התקדמות</p>
                <p className="text-5xl font-black text-sky-600">{progress}%</p>
              </div>
            </div>
            
            <div className="mt-4 h-3 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24">
          <div className="space-y-3">
            {selected.exercises?.map((ex: any, idx: number) => (
              <div
                key={idx}
                onClick={() => toggleExercise(idx)}
                className={`border-2 rounded-2xl p-5 sm:p-6 cursor-pointer transition-all ${
                  completed.has(idx)
                    ? 'bg-green-50 border-green-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-sky-400 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 mt-1">
                    {completed.has(idx) ? (
                      <CheckCircle2 size={28} className="text-green-600" />
                    ) : (
                      <Circle size={28} className="text-slate-300" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-slate-400">#{idx + 1}</span>
                      {ex.isSuperSet && (
                        <span className="text-xs px-2.5 py-1 bg-sky-500 text-white rounded-lg font-bold">סופר-סט</span>
                      )}
                    </div>

                    {ex.isSuperSet && ex.superSetExercises ? (
                      <div className="space-y-1 mb-3">
                        {ex.superSetExercises.map((name: string, i: number) => (
                          <h3 key={i} className={`text-xl font-bold ${completed.has(idx) ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            • {name}
                          </h3>
                        ))}
                      </div>
                    ) : (
                      <h3 className={`text-2xl font-bold mb-3 ${completed.has(idx) ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {ex.altName || ex.name}
                      </h3>
                    )}

                    <div className="flex flex-wrap gap-6 text-sm sm:text-base">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium">סטים:</span>
                        <span className="font-black text-slate-900 text-lg">{ex.sets}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium">חזרות:</span>
                        <span className="font-black text-slate-900 text-lg">{ex.reps}</span>
                      </div>
                      {ex.weight && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">משקל:</span>
                          <span className="font-black text-sky-600 text-lg">
                            {ex.weight.includes('|') ? ex.weight.split('|').join(' / ') : ex.weight}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Summary - Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 shadow-2xl">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500 font-medium">השלמת אימון</p>
                <p className="text-2xl font-black text-slate-900">{completed.size} מתוך {selected.exercises?.length || 0}</p>
              </div>
              <div className="text-left">
                <div className={`text-6xl font-black ${progress === 100 ? 'text-green-600' : 'text-sky-600'}`}>
                  {progress}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 p-4 sm:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center sm:text-right">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 mb-3">
            התוכניות שלי
          </h1>
          <p className="text-xl sm:text-2xl text-slate-600">{workouts[0]?.traineeName}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map(w => (
            <button
              key={w.id}
              onClick={() => setSelected(w)}
              className="bg-white border-2 border-slate-200 rounded-3xl p-8 hover:border-sky-500 hover:shadow-2xl transition-all text-right group"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Dumbbell size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">{w.type}</h3>
              <p className="text-slate-500 font-medium">{w.exercises?.length || 0} תרגילים</p>
              {w.completionPercentage > 0 && (
                <div className="mt-4">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${w.completionPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-green-600 font-bold mt-2">{w.completionPercentage}% הושלם</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TraineeView;
