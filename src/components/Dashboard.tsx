import { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useWorkouts, type Workout } from "../hooks/useWorkouts";
import { useTranslation } from "react-i18next";
import WorkoutView from "./WorkoutView";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Dumbbell,
  Search,
  LogOut,
  Plus,
  AlertCircle,
  TrendingUp,
  Command,
  MoveUpRight
} from "lucide-react";
import i18n from '../i18n';
import { Button, Input, Card } from './ui-kit';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { workouts, loading, error } = useWorkouts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'athletes' | 'protocols' | 'laboratory'>('overview');

  const stats = useMemo(() => {
    if (!workouts.length) return { trainees: 0, protocols: 0, rate: "0%" };
    return {
      trainees: new Set(workouts.map(w => w.traineeId)).size,
      protocols: workouts.length,
      rate: "94.8%"
    };
  }, [workouts]);

  const filteredWorkouts = useMemo(() => {
    return workouts.filter(w =>
      w.traineeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [workouts, searchTerm]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background" role="status">
      <div className="w-16 h-16 border-t-2 border-action rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold tracking-[0.5em] mt-8 text-primary/30 uppercase">{t('common.loading')}</p>
    </div>
  );

  if (selectedWorkout) return <WorkoutView workout={selectedWorkout} onBack={() => setSelectedWorkout(null)} />;

  return (
    <div className="min-h-screen bg-background text-primary font-sans" dir={i18n.dir()}>

      {/* --- Structural Header --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-border-standard h-20 px-8 flex items-center justify-between" role="navigation">
        <div className="flex items-center gap-16">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-border-standard flex items-center justify-center bg-surface-soft shadow-sm">
              <Command size={18} className="text-action" />
            </div>
            <h1 className="text-xl font-black tracking-tighter lowercase">
              {t('dashboard.title').split('.')[0]}<span className="text-action">.</span>
            </h1>
          </div>
          <div className="hidden lg:flex gap-10 text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">
            {['overview', 'athletes', 'protocols', 'laboratory'].map(item => (
              <button
                key={item}
                onClick={() => setActiveTab(item as any)}
                className={`transition-all px-2 py-1 focus-visible:ring-1 border-b-2 ${activeTab === item ? 'text-action border-action' : 'text-gray-400 border-transparent hover:text-action'}`}
              >
                {t(`dashboard.${item}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[8px] font-bold uppercase tracking-widest text-gray-300">Identity Verified</p>
            <p className="text-sm font-bold lowercase">{user?.displayName}</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={logout}
            className="!px-3 !py-3 rounded-full"
            aria-label={t('common.logout')}
          >
            <LogOut size={14} />
          </Button>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto pt-40 px-8 pb-40" role="main">
        {error && (
          <div className="mb-12 p-6 bg-error/5 border border-error/10 flex items-center gap-4" role="alert">
            <AlertCircle size={18} className="text-error" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-error">{error}</p>
          </div>
        )}

        {/* --- Stats Overview --- */}
        <section className="mb-32 space-y-12" aria-labelledby="stats-heading">
          <p id="stats-heading" className="text-[10px] font-bold tracking-[0.5em] uppercase text-gray-300">
            {t('dashboard.subtitle')} / Q1_REPORT
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-standard shadow-sm border border-border-standard overflow-hidden">
            <StatBlock label={t('dashboard.stats.trainees')} value={stats.trainees} sub={t('dashboard.stats.trainees_label')} />
            <StatBlock label={t('dashboard.stats.active_protocols')} value={stats.protocols} sub={t('dashboard.stats.active_label')} />
            <div className="bg-primary text-white p-12 flex flex-col justify-between relative overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('dashboard.stats.efficiency')}</p>
              <div className="space-y-4">
                <span className="text-7xl font-black lowercase leading-none">{stats.rate}</span>
                <div className="flex items-center gap-3">
                  <TrendingUp size={14} className="text-success" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">{t('dashboard.stats.growth')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Roster Control --- */}
        <section className="space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-border-standard pb-12">
            <div className="space-y-4">
              <h2 className="text-7xl font-black tracking-tighter lowercase leading-none">{t('dashboard.roster.title')}</h2>
              <p className="text-xs text-gray-400 tracking-[0.2em] uppercase font-light">{t('dashboard.roster.subtitle')}</p>
            </div>

            <div className="flex items-center gap-8 w-full md:w-auto">
              <div className="flex-1 md:w-80">
                <Input
                  placeholder={t('dashboard.roster.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="!py-4"
                  aria-label="Filter athletes"
                />
              </div>
              <Button
                variant="primary"
                size="lg"
                className="!px-6 !py-6 rounded-full shadow-lg"
                aria-label="Create new protocol"
              >
                <Plus size={24} />
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full col-span-full"
              >
                {filteredWorkouts.map((workout, idx) => (
                  <motion.div
                    key={workout.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedWorkout(workout)}
                    className="group"
                  >
                    <Card className="!p-10 cursor-pointer hover:border-action transition-all h-full">
                      <div className="flex justify-between items-start mb-12">
                        <div className="w-16 h-16 rounded-full border border-border-standard flex items-center justify-center bg-surface-soft group-hover:border-action/20">
                          <span className="text-3xl font-black group-hover:text-action">{workout.traineeName?.[0]}</span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300 group-hover:text-action">
                          {workout.type}
                        </span>
                      </div>

                      <div className="space-y-2 mb-10">
                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-none">Athlete</p>
                        <h4 className="text-4xl font-extrabold tracking-tighter lowercase group-hover:text-action transition-colors">{workout.traineeName}</h4>
                      </div>

                      <div className="pt-8 border-t border-border-standard flex justify-between items-end">
                        <div>
                          <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mb-1">{t('dashboard.roster.load_phase')}</p>
                          <p className="text-xl font-bold lowercase">{workout.exercises?.length || 0} {t('dashboard.roster.mvmt')}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-surface-soft flex items-center justify-center text-gray-300 group-hover:text-action transition-all">
                          <MoveUpRight size={14} />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab !== 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full p-20 text-center border border-dashed border-border-standard rounded-lg bg-surface-soft"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                  {t(`dashboard.${activeTab}`)} module coming soon.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
};

const StatBlock = ({ label, value, sub }: { label: string, value: string | number, sub: string }) => (
  <div className="bg-white p-12 flex flex-col justify-between h-full">
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
    <div className="flex items-baseline gap-4 mt-8">
      <span className="text-7xl font-black lowercase leading-none">{value}</span>
      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{sub}</span>
    </div>
  </div>
);

export default Dashboard;
