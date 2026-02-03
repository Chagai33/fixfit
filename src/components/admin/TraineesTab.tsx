import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, getDocs, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../../api/firebaseConfig";
import { Plus, Trash2, User, Mail, Calendar } from "lucide-react";

const TraineesTab = () => {
  const [trainees, setTrainees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: "", name: "" });

  useEffect(() => {
    loadTrainees();
  }, []);

  const loadTrainees = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      const data = snap.docs
        .map(d => ({ uid: d.id, ...d.data() }))
        .filter((u: any) => u.role !== 'admin')
        .sort((a: any, b: any) => a.displayName.localeCompare(b.displayName));
      setTrainees(data);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.email || !formData.name) {
      alert("נא למלא את כל השדות");
      return;
    }
    
    try {
      const userCred = await createUserWithEmailAndPassword(auth, formData.email, "password123");
      await addDoc(collection(db, "users"), {
        uid: userCred.user.uid,
        email: formData.email,
        displayName: formData.name,
        traineeSheetName: formData.name,
        role: 'trainee',
        createdAt: serverTimestamp()
      });
      
      setFormData({ email: "", name: "" });
      setShowForm(false);
      loadTrainees();
    } catch (error: any) {
      alert(`שגיאה: ${error.message}`);
    }
  };

  const handleDelete = async (t: any) => {
    if (!confirm(`האם למחוק את ${t.displayName}? פעולה זו בלתי הפיכה.`)) return;
    try {
      await deleteDoc(doc(db, "users", t.uid));
      loadTrainees();
    } catch (error: any) {
      alert(`שגיאה: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="text-center py-20">טוען...</div>;
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-2">מתאמנים</h2>
          <p className="text-slate-600">{trainees.length} מתאמנים רשומים</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-sky-200 hover:shadow-xl hover:scale-105 transition-all"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">הוסף מתאמן</span>
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white border-2 border-sky-500 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-slate-900 mb-4">מתאמן חדש</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              placeholder="שם מלא"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
            <input
              type="email"
              placeholder="אימייל"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleAdd} 
              className="px-6 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors"
            >
              שמור
            </button>
            <button 
              onClick={() => setShowForm(false)} 
              className="px-6 py-3 border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              ביטול
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-3">הסיסמה הראשונית: password123</p>
        </div>
      )}

      {/* Trainees Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {trainees.map(t => (
          <div key={t.uid} className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-sky-300 transition-all group">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center flex-shrink-0 text-white font-black text-xl shadow-md">
                {t.displayName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-slate-900 truncate group-hover:text-sky-600 transition-colors">{t.displayName}</h3>
                <p className="text-sm text-slate-500 truncate flex items-center gap-1 mt-1">
                  <Mail size={12} />
                  {t.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(t)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all text-sm font-bold"
            >
              <Trash2 size={16} />
              מחק מתאמן
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TraineesTab;
