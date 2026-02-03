import { useState, useEffect } from "react";
import { collection, updateDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../../api/firebaseConfig";
import { Shield, ShieldCheck, Crown } from "lucide-react";

const SettingsTab = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (user: any) => {
    const newRole = user.role === 'admin' ? 'trainee' : 'admin';
    const action = newRole === 'admin' ? 'למנהל' : 'למתאמן';
    if (!confirm(`להפוך את ${user.displayName} ${action}?`)) return;
    
    try {
      await updateDoc(doc(db, "users", user.uid), { role: newRole });
      loadUsers();
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) return <div className="text-center py-20">טוען...</div>;

  const admins = users.filter(u => u.role === 'admin');
  const regular = users.filter(u => u.role !== 'admin');

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-black text-slate-900 mb-2">הגדרות והרשאות</h2>
        <p className="text-slate-600">ניהול הרשאות מנהלים ומשתמשים</p>
      </div>

      {/* Admins Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
            <Crown size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">מנהלים</h3>
            <p className="text-sm text-slate-500">{admins.length} מנהלי מערכת</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map(u => (
            <div key={u.uid} className="bg-white border-2 border-yellow-300 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 text-white flex items-center justify-center font-black text-xl shadow-md">
                  {u.displayName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg truncate">{u.displayName}</h4>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
              </div>
              <button
                onClick={() => toggleAdmin(u)}
                className="w-full py-2.5 border-2 border-yellow-300 rounded-xl font-bold hover:bg-yellow-50 transition-colors text-yellow-700"
              >
                הסר הרשאות מנהל
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Regular Users Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
            <Shield size={20} className="text-slate-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">משתמשים רגילים</h3>
            <p className="text-sm text-slate-500">{regular.length} מתאמנים</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {regular.map(u => (
            <div key={u.uid} className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-sky-300 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center font-bold text-slate-600">
                  {u.displayName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold truncate">{u.displayName}</h4>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
              </div>
              <button
                onClick={() => toggleAdmin(u)}
                className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
              >
                הפוך למנהל
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
