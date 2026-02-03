import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "../../api/firebaseConfig";
import { Trash2, GripVertical, Dumbbell, Check, Sparkles } from "lucide-react";

const BuilderTab = () => {
  const [trainees, setTrainees] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedTrainee, setSelectedTrainee] = useState("");
  const [workoutType, setWorkoutType] = useState("");
  const [selected, setSelected] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [existingWorkouts, setExistingWorkouts] = useState<any[]>([]);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tSnap, eSnap, wSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "exercise_bank")),
        getDocs(collection(db, "workouts"))
      ]);
      
      const traineeData = tSnap.docs
        .map(d => ({ uid: d.id, ...d.data() }))
        .filter((u: any) => u.role !== 'admin' && !u.displayName?.includes('#'));
      
      const exerciseData = eSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const workoutData = wSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      console.log('Loaded trainees:', traineeData.length);
      console.log('Loaded exercises:', exerciseData.length);
      
      setTrainees(traineeData);
      setExercises(exerciseData);
      setExistingWorkouts(workoutData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('שגיאה בטעינת נתונים. בדוק את החיבור ל-Firebase.');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkoutForEdit = (workout: any) => {
    setEditingWorkoutId(workout.id);
    setWorkoutType(workout.type);
    setSelected(workout.exercises || []);
  };

  const createNewWorkout = () => {
    setEditingWorkoutId(null);
    setWorkoutType("");
    setSelected([]);
  };

  const addEx = (ex: any) => {
    setSelected([...selected, {
      name: ex.name,
      sets: ex.defaultSets || "3",
      reps: ex.defaultReps || "8-12",
      weight: "",
      order: selected.length
    }]);
  };

  const removeEx = (idx: number) => setSelected(selected.filter((_, i) => i !== idx));

  const updateEx = (idx: number, field: string, value: string) => {
    const updated = [...selected];
    updated[idx] = { ...updated[idx], [field]: value };
    setSelected(updated);
  };

  const handleSave = async () => {
    if (!selectedTrainee || !workoutType || selected.length === 0) {
      alert("נא למלא את כל השדות ולבחור לפחות תרגיל אחד");
      return;
    }

    setSaving(true);
    try {
      const trainee = trainees.find(t => t.uid === selectedTrainee);
      const exercisesData = selected.map((ex, i) => ({ 
        ...ex, 
        order: i, 
        isCompleted: false,
        isSuperSet: ex.name?.includes('+'),
        superSetExercises: ex.name?.includes('+') ? ex.name.split('+').map((s: string) => s.trim()) : undefined
      }));

      if (editingWorkoutId) {
        // Update existing workout
        await updateDoc(doc(db, "workouts", editingWorkoutId), {
          type: workoutType,
          title: workoutType,
          exercises: exercisesData,
          lastUpdated: serverTimestamp()
        });
        alert("✓ תוכנית עודכנה בהצלחה!");
      } else {
        // Create new workout
        await addDoc(collection(db, "workouts"), {
          traineeId: selectedTrainee,
          traineeName: trainee?.displayName || "",
          type: workoutType,
          title: workoutType,
          exercises: exercisesData,
          status: 'pending',
          completionPercentage: 0,
          lastUpdated: serverTimestamp()
        });
        alert("✓ תוכנית חדשה נוצרה בהצלחה!");
      }
      
      setWorkoutType("");
      setSelectedTrainee("");
      setSelected([]);
      setEditingWorkoutId(null);
      loadData(); // Reload to get updated workouts
    } catch (error: any) {
      alert(`שגיאה: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredExercises = exercises.filter(ex =>
    ex.name?.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
    ex.category?.toLowerCase().includes(exerciseSearch.toLowerCase())
  );
  
  const categories = [...new Set(filteredExercises.map(ex => ex.category))].sort();
  
  const traineeWorkouts = selectedTrainee 
    ? existingWorkouts.filter(w => w.traineeId === selectedTrainee)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-black text-slate-900 mb-2">בניית תוכנית אימון</h2>
        <p className="text-slate-600">צור תוכנית מותאמת אישית למתאמן</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Settings */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-sky-500" />
              <h3 className="font-bold text-lg">
                {editingWorkoutId ? 'עריכת תוכנית' : 'תוכנית חדשה'}
              </h3>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">מתאמן</label>
              <select 
                value={selectedTrainee}
                onChange={(e) => {
                  setSelectedTrainee(e.target.value);
                  createNewWorkout(); // Reset when changing trainee
                }}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all appearance-none cursor-pointer bg-white"
              >
                <option value="">
                  {trainees.length === 0 ? 'אין מתאמנים במערכת' : 'בחר מתאמן'}
                </option>
                {trainees.map(t => (
                  <option key={t.uid} value={t.uid}>
                    {t.displayName || t.email}
                  </option>
                ))}
              </select>
              {trainees.length === 0 && (
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ אין מתאמנים. עבור ל-"מתאמנים" כדי להוסיף.
                </p>
              )}
            </div>

            {/* Existing Workouts */}
            {selectedTrainee && traineeWorkouts.length > 0 && (
              <div className="p-4 bg-sky-50 border-2 border-sky-200 rounded-xl">
                <p className="text-sm font-bold text-slate-700 mb-2">תוכניות קיימות:</p>
                <div className="space-y-2">
                  {traineeWorkouts.map(w => (
                    <button
                      key={w.id}
                      onClick={() => loadWorkoutForEdit(w)}
                      className={`w-full text-right px-3 py-2 rounded-lg font-medium transition-all ${
                        editingWorkoutId === w.id
                          ? 'bg-sky-500 text-white'
                          : 'bg-white border border-sky-300 text-slate-700 hover:bg-sky-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{w.type}</span>
                        <span className="text-xs opacity-70">{w.exercises?.length || 0} תרגילים</span>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={createNewWorkout}
                    className="w-full px-3 py-2 border-2 border-dashed border-sky-300 rounded-lg text-sky-600 hover:bg-sky-50 transition-all font-medium"
                  >
                    + תוכנית חדשה
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">סוג אימון</label>
              <input
                placeholder="FB, FB2, LOWER BODY..."
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={!selectedTrainee || !workoutType || selected.length === 0 || saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {saving ? (
                <>שומר...</>
              ) : editingWorkoutId ? (
                <><Check size={20} /> עדכן תוכנית ({selected.length})</>
              ) : (
                <><Check size={20} /> שמור תוכנית חדשה ({selected.length})</>
              )}
            </button>
            
            {editingWorkoutId && (
              <p className="text-xs text-sky-600 text-center">
                ✏️ עורך תוכנית קיימת
              </p>
            )}
          </div>

          {/* Exercise Bank */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-h-[600px]">
            <div className="p-5 bg-gradient-to-r from-slate-50 to-sky-50 border-b border-slate-200 sticky top-0 space-y-3">
              <div>
                <h3 className="font-bold">תרגילים זמינים</h3>
                <p className="text-xs text-slate-500">{exercises.length} תרגילים</p>
              </div>
              <input
                type="search"
                placeholder="חיפוש תרגיל..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-sky-500 focus:outline-none text-sm"
              />
            </div>
            <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(600px - 80px)' }}>
              {exercises.length === 0 ? (
                <div className="text-center py-12">
                  <Dumbbell size={48} className="mx-auto mb-4 text-slate-200" />
                  <p className="text-slate-400 font-medium mb-2">בנק התרגילים ריק</p>
                  <p className="text-xs text-slate-500">
                    הרץ את הפקודה:<br />
                    <code className="bg-slate-100 px-2 py-1 rounded mt-2 inline-block">
                      node scripts/populateExerciseBank.js
                    </code>
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map(cat => (
                    <div key={cat}>
                      <p className="text-xs font-bold text-slate-500 mb-2 px-2">{cat}</p>
                      <div className="space-y-2">
                        {filteredExercises.filter(ex => ex.category === cat).map(ex => (
                          <button
                            key={ex.id}
                            onClick={() => addEx(ex)}
                            className="w-full text-right p-3 border-2 border-slate-200 rounded-xl hover:border-sky-500 hover:bg-sky-50 transition-all"
                          >
                            <p className="font-medium text-sm text-slate-900">{ex.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{ex.defaultSets} × {ex.defaultReps}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Selected Exercises */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-sky-50 to-cyan-50 border-b-2 border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">התוכנית</h3>
                  <p className="text-slate-600">{selected.length} תרגילים</p>
                </div>
                {selected.length > 0 && (
                  <div className="text-left">
                    <p className="text-sm text-slate-500">סה"כ נפח</p>
                    <p className="text-xl font-bold text-sky-600">
                      {selected.reduce((acc, ex) => acc + (parseInt(ex.sets) || 0), 0)} סטים
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {selected.map((ex, idx) => (
                  <div key={idx} className="border-2 border-slate-200 rounded-xl p-4 bg-white hover:border-sky-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <GripVertical size={20} className="text-slate-300 cursor-move" />
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 text-white flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-3">
                          <p className="font-bold text-slate-900">{ex.name}</p>
                          <button 
                            onClick={() => removeEx(idx)} 
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-slate-500 font-medium block mb-1">סטים</label>
                            <input
                              value={ex.sets}
                              onChange={(e) => updateEx(idx, 'sets', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 font-medium block mb-1">חזרות</label>
                            <input
                              value={ex.reps}
                              onChange={(e) => updateEx(idx, 'reps', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 font-medium block mb-1">משקל</label>
                            <input
                              value={ex.weight}
                              onChange={(e) => updateEx(idx, 'weight', e.target.value)}
                              placeholder="20"
                              className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {selected.length === 0 && (
                  <div className="text-center py-20">
                    <Dumbbell size={64} className="mx-auto mb-4 text-slate-200" />
                    <p className="text-slate-400 text-lg font-medium">בחר תרגילים מהרשימה</p>
                    <p className="text-slate-400 text-sm mt-1">לחץ על תרגיל כדי להוסיף אותו לתוכנית</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderTab;
