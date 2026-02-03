import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../../api/firebaseConfig";
import { Plus, Trash2, Dumbbell, Search } from "lucide-react";

const ExercisesTab = () => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [formData, setFormData] = useState({ name: "", category: "", defaultSets: "3", defaultReps: "8-12" });

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const snap = await getDocs(collection(db, "exercise_bank"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setExercises(data);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.category) return;
    try {
      await addDoc(collection(db, "exercise_bank"), { ...formData, createdAt: serverTimestamp() });
      setFormData({ name: "", category: "", defaultSets: "3", defaultReps: "8-12" });
      setShowForm(false);
      loadExercises();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`למחוק את "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, "exercise_bank", id));
      loadExercises();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const filtered = exercises.filter(ex =>
    (ex.name?.toLowerCase().includes(search.toLowerCase()) ||
     ex.category?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterCategory || ex.category === filterCategory)
  );

  const categories = [...new Set(exercises.map(ex => ex.category))].sort();

  if (loading) return <div className="text-center py-20">טוען...</div>;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-2">בנק תרגילים</h2>
          <p className="text-slate-600">{exercises.length} תרגילים | {categories.length} קטגוריות</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-sky-200 hover:shadow-xl hover:scale-105 transition-all"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">תרגיל חדש</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          placeholder="חיפוש תרגיל..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-4 pr-12 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
        />
      </div>

      {/* Category Filters - Single Row */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setFilterCategory("")}
          className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
            filterCategory === ""
              ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg'
              : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-sky-300'
          }`}
        >
          הכל ({exercises.length})
        </button>
        {categories.map(cat => {
          const count = exercises.filter(ex => ex.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                filterCategory === cat
                  ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-sky-300'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white border-2 border-sky-500 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold mb-4">תרגיל חדש</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              placeholder="שם התרגיל"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
            <input
              placeholder="קטגוריה (גב, רגליים, חזה...)"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
            <input
              placeholder="סטים"
              value={formData.defaultSets}
              onChange={(e) => setFormData({...formData, defaultSets: e.target.value})}
              className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
            <input
              placeholder="חזרות"
              value={formData.defaultReps}
              onChange={(e) => setFormData({...formData, defaultReps: e.target.value})}
              className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} className="px-6 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600">שמור</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-3 border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50">ביטול</button>
          </div>
        </div>
      )}

      {/* Exercise List by Category */}
      <div className="space-y-6">
        {categories.filter(cat => !filterCategory || cat === filterCategory).map(cat => {
          const catExercises = filtered.filter(ex => ex.category === cat);
          if (catExercises.length === 0) return null;
          
          return (
            <div key={cat} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-slate-50 to-sky-50 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">{cat}</h3>
                <p className="text-sm text-slate-500">{catExercises.length} תרגילים</p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catExercises.map(ex => (
                    <div key={ex.id} className="flex items-center justify-between border-2 border-slate-200 rounded-xl p-4 hover:border-sky-300 hover:shadow-md transition-all group">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                          <Dumbbell size={20} className="text-sky-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 truncate group-hover:text-sky-600 transition-colors">{ex.name}</p>
                          <p className="text-xs text-slate-500">{ex.defaultSets} × {ex.defaultReps}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(ex.id, ex.name)} 
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExercisesTab;
