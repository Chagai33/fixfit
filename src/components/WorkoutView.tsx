import { useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Zap,
  Activity,
  AlertCircle
} from "lucide-react";
import { type Workout } from "../hooks/useWorkouts";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../api/firebaseConfig";
import i18n from '../i18n';
import { Button } from './ui-kit';

interface WorkoutViewProps {
  workout: Workout;
  onBack: () => void;
}

const WorkoutView = ({ workout, onBack }: WorkoutViewProps) => {
  const { t } = useTranslation();
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const toggleExercise = (index: number) => {
    const next = new Set(completedExercises);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setCompletedExercises(next);
  };

  const progress = Math.round((completedExercises.size / (workout.exercises?.length || 1)) * 100);

  const handleFinalize = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const workoutRef = doc(db, "workouts", workout.id);

      // Update the workout document with completion data
      await updateDoc(workoutRef, {
        status: progress === 100 ? 'completed' : 'partially_completed',
        completionPercentage: progress,
        completedIndices: Array.from(completedExercises),
        lastUpdated: serverTimestamp()
      });

      // Brief delay for UX feel
      setTimeout(() => {
        onBack();
      }, 500);
    } catch (err: any) {
      console.error("Error saving workout:", err);
      setSaveError(t('common.error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-primary font-sans" dir={i18n.dir()} role="main">
      {/* --- Structural Header --- */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-border-standard h-20 px-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-4 group"
          aria-label={t('common.back')}
        >
          <div className="w-10 h-10 border border-border-standard flex items-center justify-center group-hover:border-action group-hover:text-action transition-all">
            <ArrowLeft size={16} className={i18n.dir() === 'rtl' ? 'rotate-180' : ''} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-primary transition-colors">
            {t('workout.abort_protocol')}
          </span>
        </button>

        <div className="flex items-center gap-8">
          <div className={`px-6 py-2 border-primary/10 ${i18n.dir() === 'rtl' ? 'border-l' : 'border-r'} hidden sm:block`}>
            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-0.5">{t('workout.sync_status')}</p>
            <p className="text-[11px] font-bold text-action italic">{workout.traineeName}</p>
          </div>
          <h1 className="text-xl font-black tracking-tighter lowercase">
            foundry<span className="text-action">.</span>
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto pt-32 px-8 pb-40">
        {saveError && (
          <div className="mb-8 p-6 bg-error/5 border border-error/10 flex items-center gap-4" role="alert">
            <AlertCircle size={18} className="text-error" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-error">{saveError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-24">

          {/* --- Meta Section --- */}
          <div className="md:col-span-4 space-y-16">
            <section className="space-y-6">
              <p className="text-[10px] font-bold text-action uppercase tracking-widest">
                {t('workout.phase_id')}
              </p>
              <h2 className="text-5xl font-black tracking-tighter lowercase leading-[0.9]">
                {workout.type.split(' ')[0]}<br />
                <span className="text-gray-200">{workout.type.split(' ')[1] || 'PRO'}</span>
              </h2>
            </section>

            <section className="grid grid-cols-2 gap-px bg-border-standard border border-border-standard shadow-sm">
              <div className="bg-white p-6">
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-3">{t('workout.movements')}</p>
                <p className="text-4xl font-black lowercase">{workout.exercises?.length || 0}</p>
              </div>
              <div className="bg-white p-6">
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-3">{t('workout.intensity')}</p>
                <p className="text-4xl font-black lowercase text-action">{t('workout.high')}</p>
              </div>
            </section>

            {/* --- Progress Monitor --- */}
            <section className="bg-surface-soft border border-border-standard p-8 space-y-8 relative overflow-hidden">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('workout.completion')}</p>
                  <div className="flex items-center gap-3">
                    <Activity size={14} className="text-action opacity-50" />
                    <span className="text-5xl font-black text-primary leading-none">{progress}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-[3px] bg-gray-100 w-full relative">
                  <div
                    className="absolute inset-y-0 start-0 bg-action transition-all duration-[1s] ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                  <span>init v1.0</span>
                  <span>target 100</span>
                </div>
              </div>
            </section>
          </div>

          {/* --- Tasks Section --- */}
          <div className="md:col-span-8 space-y-8">
            <header className="flex items-center gap-6 mb-8">
              <h3 className="text-[10px] font-bold text-action uppercase tracking-[0.5em] whitespace-nowrap">
                {t('workout.matrix')}
              </h3>
              <div className="h-px w-full bg-border-standard" />
            </header>

            <div className="space-y-px bg-border-standard border border-border-standard">
              {workout.exercises?.map((exercise, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleExercise(idx)}
                  className={`group relative p-8 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-8
                      ${completedExercises.has(idx)
                      ? "bg-surface-soft"
                      : "bg-white hover:bg-surface-soft"
                    }`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={completedExercises.has(idx)}
                >
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <span className={`text-[9px] font-bold px-3 py-1 border transition-colors ${completedExercises.has(idx) ? 'bg-action border-action text-white' : 'border-border-standard text-gray-300'}`}>
                        {t('workout.module')} 0{idx + 1}
                      </span>
                      {completedExercises.has(idx) && (
                        <div className="flex items-center gap-2 text-action animate-pulse">
                          <Zap size={10} />
                          <span className="text-[9px] font-bold uppercase tracking-widest">{t('workout.synced')}</span>
                        </div>
                      )}
                    </div>
                    <h4 className={`text-2xl font-black lowercase tracking-tight transition-colors ${completedExercises.has(idx) ? 'text-action line-through opacity-40' : 'text-primary'}`}>
                      {exercise.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-12 sm:gap-16">
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mb-1">{t('workout.sets')}</p>
                      <p className="text-sm font-black">{exercise.sets}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mb-1">{t('workout.reps')}</p>
                      <p className="text-sm font-black">{exercise.reps}</p>
                    </div>
                    {exercise.weight && (
                      <div className="text-center">
                        <p className="text-[8px] font-bold text-action/50 uppercase tracking-widest mb-1">{t('workout.load_weight')}</p>
                        <p className="text-sm font-black text-action">{exercise.weight}</p>
                      </div>
                    )}
                    <div className={`w-12 h-12 flex items-center justify-center border transition-all
                         ${completedExercises.has(idx) ? 'border-action text-action' : 'border-border-standard text-gray-100'}
                       `}>
                      <CheckCircle2 size={24} className={completedExercises.has(idx) ? 'scale-100' : 'scale-75 opacity-20'} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* --- Action Bar --- */}
      <div className="fixed bottom-0 left-0 right-0 p-8 sm:p-12 bg-white/80 backdrop-blur-md border-t border-border-standard z-[100]">
        <div className="max-w-6xl mx-auto">
          <Button
            className="w-full h-20 flex items-center justify-center gap-4"
            variant={progress === 100 ? "primary" : "secondary"}
            onClick={handleFinalize}
            isLoading={isSaving}
          >
            <span className="text-sm sm:text-lg font-black tracking-[0.2em]">
              {progress === 100 ? t('workout.finalize') : t('workout.commit')}
            </span>
            <ChevronRight size={20} className={`transition-transform ${progress === 100 ? (i18n.dir() === 'rtl' ? '-translate-x-2' : 'translate-x-2') : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutView;
