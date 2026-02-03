import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import WorkoutsTab from "./admin/WorkoutsTab";
import TraineesTab from "./admin/TraineesTab";
import ExercisesTab from "./admin/ExercisesTab";
import BuilderTab from "./admin/BuilderTab";
import SettingsTab from "./admin/SettingsTab";
import TVDisplayTab from "./admin/TVDisplayTab";
import { 
  Dumbbell, Users, Library, Plus, Settings, Tv, LogOut, 
  Menu, X 
} from "lucide-react";

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'workouts' | 'trainees' | 'exercises' | 'builder' | 'settings' | 'tv'>('workouts');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'workouts', label: 'תוכניות אימון', icon: Dumbbell },
    { id: 'trainees', label: 'מתאמנים', icon: Users },
    { id: 'builder', label: 'בניית תוכנית', icon: Plus },
    { id: 'exercises', label: 'בנק תרגילים', icon: Library },
    { id: 'settings', label: 'הגדרות', icon: Settings },
    { id: 'tv', label: 'תצוגת TV', icon: Tv }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-cyan-50" dir="rtl">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full w-72 bg-white border-l border-slate-200 shadow-xl z-40
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-3xl font-black text-slate-900">
              Fix<span className="text-sky-500">Fit</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">סטודיו בוטיק לאימונים</p>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold">
                {user?.displayName?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{user?.displayName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-200'
                      : 'text-slate-600 hover:bg-slate-100'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors font-medium"
            >
              <LogOut size={20} />
              <span>התנתק</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:mr-72 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'workouts' && <WorkoutsTab />}
            {activeTab === 'trainees' && <TraineesTab />}
            {activeTab === 'exercises' && <ExercisesTab />}
            {activeTab === 'builder' && <BuilderTab />}
            {activeTab === 'settings' && <SettingsTab />}
            {activeTab === 'tv' && <TVDisplayTab />}
          </div>
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminPanel;
