# מדריך התקנה - FixFit

## ✅ תשובות לשאלות שלך

### 1. הקישור בין טבלאות עובד?
**כן!** ✅
- BuilderTab טוען מתאמנים מ-`users` collection
- BuilderTab טוען תרגילים מ-`exercise_bank` collection
- כשאתה שומר תוכנית, היא נשמרת ב-`workouts` עם `traineeId` (FK)

### 2. למה בנק התרגילים ריק?
**כי צריך למלא אותו!**

הרץ את הפקודה:
```bash
node scripts/populateExerciseBank.js <service-account.json>
```

זה יחלץ את **כל התרגילים הייחודיים** מהנתונים שכבר במערכת ויוסיף אותם לבנק.

### 3. הנתונים נשמרים ב-Firebase?
**כן!** ✅ כל מה שאתה עושה נשמר:
- הוספת מתאמן → `users` collection
- יצירת תוכנית → `workouts` collection
- הוספת תרגיל → `exercise_bank` collection
- סימון תרגיל הושלם → עדכון ב-`workouts`

---

## 🔄 תהליך מלא - מאפס

### צעד 1: נקה הכל (אם יש נתונים ישנים)

```bash
node scripts/clearFirebase.js <service-account.json>
```

הקלד `DELETE ALL` לאישור.

זה ימחק:
- ✅ כל המשתמשים מ-Authentication
- ✅ כל ה-collections מ-Firestore (users, workouts, exercise_bank)

---

### צעד 2: מיגרציה מ-Excel

```bash
node scripts/migrateExcel.js <service-account.json> public/data/data.xlsx
```

**מה זה יוצר**:
```
Firebase Authentication:
├─ 16 users (כל מתאמן)
└─ Password: password123

Firestore → users collection:
├─ 16 documents
└─ Fields: uid, email, displayName, traineeSheetName, role

Firestore → workouts collection:
├─ ~45 documents (ממוצע 2-3 לכל מתאמן)
└─ Fields: traineeId, type, exercises[], status, etc.
```

**תיקונים שהסקריפט עושה אוטומטית**:
- ✅ מסנן ערכי תאריכים Excel (45999 → 8-12)
- ✅ מזהה סופר-סטים (תרגילים עם +)
- ✅ קורא עמודה G (altName)
- ✅ מטפל במשקלים כפולים (15|65)

---

### צעד 3: מלא בנק תרגילים

```bash
node scripts/populateExerciseBank.js <service-account.json>
```

**מה זה עושה**:
1. קורא את כל ה-workouts
2. מחלץ תרגילים ייחודיים
3. מנחש קטגוריה לפי שם התרגיל:
   - "דדליפט" → גב
   - "סקוואט" → רגליים
   - "לחיצת חזה" → חזה
   - "כתפיים" → כתפיים
4. שומר ב-`exercise_bank` collection

**תוצאה**: ~100-150 תרגילים בבנק!

---

### צעד 4: הרץ אפליקציה

```bash
npm run dev
```

התחבר עם:
- Email: `DuduG@gmail.com`
- Password: `password123`

---

## 📊 בדיקת הצלחה

### ב-Firebase Console:

#### Authentication
✅ צריך להיות 16 users

#### Firestore - users
✅ 16 documents
✅ כל document עם: email, displayName, role, traineeSheetName

#### Firestore - workouts
✅ ~45 documents
✅ כל document עם: traineeId, type, exercises[]

#### Firestore - exercise_bank
✅ ~100-150 documents (אחרי populateExerciseBank)
✅ כל document עם: name, category, defaultSets, defaultReps

---

## 🎯 שימוש באפליקציה

### מנהל (Admin)

1. **צפייה בתוכניות**:
   - Tab: "תוכניות אימון"
   - מקובץ לפי מתאמן
   - לחץ "העתק לינק" ושלח למתאמן

2. **ניהול מתאמנים**:
   - Tab: "מתאמנים"
   - לחץ "הוסף מתאמן"
   - הכנס שם + אימייל
   - הסיסמה: password123

3. **בניית תוכנית**:
   - Tab: "בניית תוכנית"
   - בחר מתאמן
   - הכנס סוג אימון (FB, FB2...)
   - לחץ על תרגילים מהבנק
   - ערוך סטים/חזרות/משקל
   - שמור

4. **בנק תרגילים**:
   - Tab: "בנק תרגילים"
   - הוסף תרגילים חדשים
   - חפש ומצא תרגילים
   - מחק תרגילים לא נחוצים

5. **תצוגת TV**:
   - Tab: "תצוגת TV"
   - לחץ "מסך מלא"
   - הצג על מסך גדול בסטודיו

### מתאמן

1. פתח את הלינק שקיבלת (לדוגמה: `https://yourapp.com/?trainee=abc123`)
2. רואה את כל התוכניות שלך
3. לחץ על תוכנית לפתיחה
4. סמן תרגילים שהשלמת
5. התקדמות נשמרת אוטומטית ב-Firebase

---

## 🔐 הרשאות

### להוסיף מנהל חדש
1. Tab: "הגדרות"
2. מצא את המשתמש ברשימה
3. לחץ "הפוך למנהל"

### להסיר הרשאות מנהל
1. Tab: "הגדרות"
2. מצא את המנהל
3. לחץ "הסר הרשאות מנהל"

---

## 🎨 עיצוב מבוסס ui-ux-pro-max

העיצוב החדש בנוי לפי:
- ✅ **Accessibility**: WCAG AA compliant
- ✅ **Touch Targets**: מינימום 44×44px
- ✅ **Responsive**: Mobile-first
- ✅ **Performance**: Smooth 60fps animations
- ✅ **Color Contrast**: מינימום 4.5:1
- ✅ **Focus States**: Visible rings
- ✅ **Loading States**: Spinners ברורים
- ✅ **Error Handling**: הודעות ברורות

---

## 📞 תמיכה

### בעיות נפוצות

**Q: "אין תרגילים בבנק"**
A: הרץ `node scripts/populateExerciseBank.js`

**Q: "לא יכול להתחבר"**
A: הסיסמה ברירת מחדל: `password123`

**Q: "שגיאת הרשאות"**
A: העלה את `firestore.rules` ל-Firebase Console

**Q: "רוצה להתחיל מאפס"**
A: 
```bash
node scripts/clearFirebase.js <service-account>
node scripts/migrateExcel.js <service-account> public/data/data.xlsx
node scripts/populateExerciseBank.js <service-account>
```

---

**המערכת מוכנה! 🚀**
