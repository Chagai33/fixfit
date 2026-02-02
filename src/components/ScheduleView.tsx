import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkouts } from '../hooks/useWorkouts';
import {
  Plus,
  ChevronRight,
  User,
  Calendar,
  Grid,
  Menu,
  Bell,
  AlertCircle
} from 'lucide-react';
import i18n from '../i18n';
import { Button, Card } from './ui-kit';

const ScheduleView = () => {
  const { t } = useTranslation();
  const { workouts, loading, error } = useWorkouts();
  const [activeDay, setActiveDay] = useState(2);

  // Map real workouts to "Schedule Items"
  const scheduleItems = useMemo(() => {
    return workouts.map((w, idx) => ({
      id: w.id,
      // Simulate times for the schedule view since we don't store session times yet
      time: `${8 + (idx % 8)}:00`,
      name: w.type || 'Standard Protocol',
      trainer: 'Staff Coach',
      athlete: w.traineeName,
      status: idx === 0 ? 'In Progress' : 'Scheduled',
      exercisesCount: w.exercises?.length || 0
    })).sort((a, b) => a.time.localeCompare(b.time));
  }, [workouts]);

  const stats = useMemo(() => {
    return {
      calories: workouts.length * 450, // Simulated aggregate
      hours: (workouts.length * 0.75).toFixed(1),
      count: workouts.length
    };
  }, [workouts]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white" role="status">
      <div className="w-12 h-12 border-t-2 border-action rounded-full animate-spin"></div>
      <p className="text-[10px] font-bold tracking-[0.4em] mt-8 text-gray-300 uppercase">{t('common.loading')}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-primary font-sans overflow-x-hidden" dir={i18n.dir()} role="main">

      {/* --- Structural Header --- */}
      <nav className="h-16 px-8 flex items-center justify-between border-b border-border-standard fixed top-0 left-0 right-0 bg-white z-[100]" role="navigation">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-black tracking-tighter lowercase">
            {t('dashboard.title').split('.')[0]}<span className="text-action">.</span>
          </h1>
          <div className="h-4 w-[1px] bg-border-standard hidden sm:block" />
          <div className="hidden sm:flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-300">
            <button className="text-primary hover:text-action transition-colors">{t('dashboard.overview')}</button>
            <button className="hover:text-action transition-colors">{t('dashboard.athletes')}</button>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="p-2 text-gray-200 hover:text-action transition-colors" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-soft border border-border-standard" />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto pt-32 px-8 pb-32">

        {/* --- Title --- */}
        <section className="mb-16">
          <p className="text-[10px] font-bold text-action uppercase tracking-widest mb-4">
            {t('schedule.subtitle')} / 02 Feb
          </p>
          <h2 className="text-5xl font-black tracking-tighter lowercase leading-none">{t('schedule.title')}</h2>
        </section>

        {error && (
          <div className="mb-8 p-6 bg-error/5 border border-error/10 flex items-center gap-4" role="alert">
            <AlertCircle size={18} className="text-error" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-error">{error}</p>
          </div>
        )}

        {/* --- Metrics --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border-standard border border-border-standard mb-20 shadow-sm" aria-label="Stats Overview">
          <Metric label="Live Capacity" value={stats.count} trend="Active" />
          <Metric label="Daily Load" value={stats.calories} trend="+5%" />
          <Metric label="Protocol Hours" value={stats.hours} trend="Total" />
          <Metric label="System Health" value="100%" trend="Optimal" color="text-action" />
        </section>

        {/* --- Day Selector --- */}
        <section className="mb-12 border-b border-border-standard pb-8 flex justify-between items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex gap-10" role="tablist" aria-label="Day selection">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
              <button
                key={day}
                role="tab"
                aria-selected={activeDay === idx}
                onClick={() => setActiveDay(idx)}
                className={`text-[11px] font-bold uppercase tracking-widest transition-all pb-2 border-b-2 focus-visible:ring-0
                    ${activeDay === idx ? 'border-action text-primary' : 'border-transparent text-gray-300 hover:text-primary'}
                  `}
              >
                {day} <span className="ml-1 opacity-40">{12 + idx}</span>
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="!text-action !px-2 flex items-center gap-2">
            <Plus size={14} /> {t('schedule.add_session')}
          </Button>
        </section>

        {/* --- Real-Time List --- */}
        <section className="space-y-px bg-border-standard border border-border-standard">
          {scheduleItems.length > 0 ? scheduleItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-surface-soft transition-colors cursor-pointer group"
              role="button"
              tabIndex={0}
              aria-label={`Protocol: ${item.name} for ${item.athlete}`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-20">
                <div className="w-16">
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">{t('schedule.time')}</p>
                  <p className="text-sm font-bold">{item.time}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">{t('schedule.class')}</p>
                  <div className="flex items-center gap-3">
                    <h4 className="text-xl font-black lowercase tracking-tight group-hover:text-action transition-colors">{item.name}</h4>
                    <span className="text-[9px] px-2 py-0.5 bg-surface-mid text-gray-400 font-bold uppercase rounded">
                      {item.exercisesCount} MVMT
                    </span>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">{t('dashboard.roster.trainee') || 'Athlete'}</p>
                  <p className="text-sm font-bold text-action/60 italic">{item.athlete}</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-12">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">{t('schedule.status')}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded
                          ${item.status === 'In Progress' ? 'bg-action/5 text-action' : 'bg-surface-soft text-gray-400'}
                       `}>
                    {item.status}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full border border-border-standard flex items-center justify-center text-gray-200 group-hover:text-action group-hover:border-action/20 transition-all">
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white p-20 text-center space-y-4">
              <p className="text-sm text-gray-300 italic font-light">No operational protocols found for active day.</p>
              <Button variant="secondary" size="sm">{t('schedule.add_session')}</Button>
            </div>
          )}
        </section>
      </main>

      {/* --- Footer Nav --- */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-standard h-20 px-8 flex items-center justify-center lg:justify-between" role="navigation">
        <div className="hidden lg:flex gap-12 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <span>FOUNDRY_SYS_V2.0</span>
          <button className="hover:text-primary transition-colors">Protocol</button>
          <button className="hover:text-primary transition-colors">Support</button>
        </div>
        <div className="flex items-center gap-10 text-[10px] font-bold uppercase tracking-widest text-primary">
          <button className="text-action flex items-center gap-2"><Grid size={14} /> Overview</button>
          <button className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors"><Calendar size={14} /> Schedule</button>
          <button className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors"><User size={14} /> Athletes</button>
          <button className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors"><Menu size={14} /> More</button>
        </div>
      </footer>
    </div>
  );
};

const Metric = ({ label, value, trend, color = "text-primary" }: { label: string, value: string | number, trend: string, color?: string }) => (
  <div className="bg-white p-8">
    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-4">{label}</p>
    <div className="flex items-baseline justify-between">
      <p className={`text-4xl font-black lowercase ${color}`}>{value}</p>
      <p className="text-[10px] font-bold text-gray-400">{trend}</p>
    </div>
  </div>
);

export default ScheduleView;
