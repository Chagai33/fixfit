import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  type AuthError
} from "firebase/auth";
import { doc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../api/firebaseConfig";

export const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        // Registration Logic
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update Auth Profile
        await updateProfile(user, { displayName });

        // Determine role
        const isAdmin = email === "fixfit10@gmail.com" || email === "chagai33@gmail.com";
        const role = isAdmin ? "admin" : "trainee";

        // Create User Document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          role: role,
          createdAt: serverTimestamp(),
        });

        // Link existing workouts (from migration) to this new UID
        try {
          const workoutsRef = collection(db, "workouts");
          const q = query(workoutsRef, where("traineeName", "==", displayName));
          const querySnapshot = await getDocs(q);

          const updatePromises = querySnapshot.docs.map(workoutDoc =>
            updateDoc(workoutDoc.ref, { traineeId: user.uid })
          );
          await Promise.all(updatePromises);
          console.log(`Linked ${updatePromises.length} workouts to user ${user.uid}`);
        } catch (linkErr) {
          console.error("Error linking workouts:", linkErr);
        }
      } else {
        // Login Logic
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      const firebaseError = err as AuthError;
      console.error(firebaseError);

      // Friendly Error Messages
      let msg = "שגיאה כללית. נסה שוב מאוחר יותר.";
      if (firebaseError.code === "auth/invalid-credential" || firebaseError.code === "auth/user-not-found") {
        msg = "פרטים שגויים. אנא בדוק את האימייל והסיסמה.";
      } else if (firebaseError.code === "auth/email-already-in-use") {
        msg = "האימייל הזה כבר רשום במערכת.";
      } else if (firebaseError.code === "auth/weak-password") {
        msg = "הסיסמה חלשה מדי (לפחות 6 תווים).";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <h1 className="text-3xl font-bold mb-2">FixFit</h1>
          <p className="text-blue-100 text-sm">המקום שלך לצמיחה וכושר</p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            {isRegistering ? "יצירת חשבון חדש" : "כניסה למערכת"}
          </h2>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="ישראל ישראלי"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="your@email.com"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all
                ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"}`}
            >
              {loading ? "מעבד נתונים..." : (isRegistering ? "הירשם" : "התחבר")}
            </button>
          </form>

          {/* Toggle Switch */}
          <div className="mt-6 text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {isRegistering ? "כבר יש לך חשבון?" : "אין לך עדיין חשבון?"}
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError("");
                }}
                className="mr-2 text-blue-600 font-bold hover:underline focus:outline-none"
              >
                {isRegistering ? "התחבר כאן" : "הירשם עכשיו"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
