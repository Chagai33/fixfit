import { useState } from "react";
import { ChevronLeft, CheckCircle2, Dumbbell } from "lucide-react";
import { type Workout } from "../hooks/useWorkouts";

interface WorkoutViewProps {
  workout: Workout;
  onBack: () => void;
}

const WorkoutView = ({ workout, onBack }: WorkoutViewProps) => {
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());

  const toggleExercise = (index: number) => {
    const next = new Set(completedExercises);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setCompletedExercises(next);
  };

  const progress = Math.round((completedExercises.size / (workout.exercises?.length || 1)) * 100);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans" dir="rtl">
      {/* Hero Header */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent"></div>

        <div className="relative z-10 p-6 flex flex-col justify-end h-full">
          <button
            onClick={onBack}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/10 rounded-full backdrop-blur-md border border-white/10 active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-6 h-6 rotate-180" />
          </button>

          <h1 className="text-3xl font-black mb-1">{workout.type}</h1>
          <p className="text-blue-400 text-sm font-medium tracking-wide">תוכנית אימון יומית</p>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-20 space-y-6 pb-24">
        {/* Progress Card */}
        <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">התקדמות האימון</span>
            <span className="text-2xl font-black text-blue-500">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-blue-600 to-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-blue-500" />
            תרגילים לביצוע
          </h2>

          {workout.exercises.map((exercise, idx) => (
            <div
              key={idx}
              onClick={() => toggleExercise(idx)}
              className={`group relative overflow-hidden p-5 rounded-2xl border transition-all duration-300 cursor-pointer
                ${completedExercises.has(idx)
                  ? "bg-blue-600/10 border-blue-500/50 scale-[0.98]"
                  : "bg-[#121212] border-white/5 active:bg-[#1a1a1a]"
                }`}
            >
              <div className="flex justify-between items-center relative z-10">
                <div className="flex-1">
                  <h3 className={`font-bold transition-colors ${completedExercises.has(idx) ? "text-blue-400" : "text-gray-100"}`}>
                    {exercise.name}
                  </h3>
                  <div className="flex gap-4 mt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">סטים</span>
                      <span className="text-lg font-black">{exercise.sets}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-501 font-bold uppercase">חזרות</span>
                      <span className="text-lg font-black">{exercise.reps}</span>
                    </div>
                    {exercise.weight && (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">משקל</span>
                        <span className="text-lg font-black text-blue-400">{exercise.weight}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                  ${completedExercises.has(idx)
                    ? "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    : "bg-white/5 text-gray-700"
                  }`}
                >
                  <CheckCircle2 className={`w-6 h-6 transition-transform ${completedExercises.has(idx) ? "scale-110" : "scale-100"}`} />
                </div>
              </div>

              {/* Success Decoration */}
              {completedExercises.has(idx) && (
                <div className="absolute top-0 right-0 p-2 text-[8px] font-black text-blue-500/20 uppercase tracking-tighter rotate-12">
                  DONE DONE DONE
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent pointer-events-none">
        <button
          className={`w-full py-4 rounded-2xl font-black tracking-widest uppercase text-sm shadow-2xl transition-all duration-300 pointer-events-auto
            ${progress === 100
              ? "bg-gradient-to-l from-green-500 to-emerald-600 scale-105"
              : "bg-blue-600 shadow-blue-900/40"
            }`}
        >
          {progress === 100 ? "סיים אימון בהצלחה!" : "סיום אימון"}
        </button>
      </div>
    </div>
  );
};

export default WorkoutView;
