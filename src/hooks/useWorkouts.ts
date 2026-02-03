import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../api/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";

export interface Exercise {
  name: string;
  altName?: string;        // שם חלופי/קצר לתצוגה (עמודה G)
  sets: string;
  reps: string;
  weight: string;
  isSuperSet?: boolean;    // האם זה סופר-סט (מזוהה ע"י +)
  superSetExercises?: string[]; // רשימת תרגילים בסופר-סט
  isCompleted?: boolean;
  order?: number;
}

export interface Workout {
  id: string;
  type: string;
  traineeId: string;
  traineeName: string;
  exercises: Exercise[];
  status?: string;
  lastUpdated?: any;
}

export const useWorkouts = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    // For trainees: filter by their ID. For admins: fetch all.
    // Note: This assumes we store 'role' in the user object or fetch it separately.
    // To keep it simple, we'll first check if the user is one of the admin emails.
    const isAdmin = user.email === "fixfit10@gmail.com" || user.email === "chagai33@gmail.com";

    const q = isAdmin
      ? query(collection(db, "workouts"))
      : query(collection(db, "workouts"), where("traineeId", "==", user.uid));

    // real-time listener handles offline cache automatically
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const fetchedWorkouts: Workout[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Workout[];

        setWorkouts(fetchedWorkouts);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Fetch workouts error:", err);
        if (err.code === 'permission-denied') {
          setError("גישת מידע חסומה. וודא שחוקי האבטחה ב-Firebase מוגדרים נכון.");
        } else {
          setError("שגיאה בטעינת נתונים. נסה שוב מאוחר יותר.");
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { workouts, loading, error };
};
