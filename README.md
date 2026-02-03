# FixFit - מערכת ניהול אימונים מקצועית

> סטודיו בוטיק לאימונים אישיים | בנוי עם ui-ux-pro-max design system

---

## 🚀 התחלה מהירה

```bash
npm install
npm run dev
```

---

## 📋 תהליך מיגרציה מלא

### שלב 1: ניקוי נתונים ישנים (אם קיימים)

```bash
node scripts/clearFirebase.js <service-account.json>
# הקלד "DELETE ALL" לאישור
```

### שלב 2: מיגרציה מ-Excel

```bash
node scripts/migrateExcel.js <service-account.json> public/data/data.xlsx
```

זה ייצור:
- ✅ 16 משתמשים ב-Authentication
- ✅ 16 documents ב-`users` collection
- ✅ ~45 documents ב-`workouts` collection

### שלב 3: מילוי בנק תרגילים

```bash
node scripts/populateExerciseBank.js <service-account.json>
```

זה יחלץ את כל התרגילים הייחודיים מה-workouts ויוסיף אותם ל-`exercise_bank`.

---

## 🎨 עיצוב - ui-ux-pro-max

**פלטת צבעים** (Healthcare/Wellness):
- Primary: Sky-500 / Cyan-500
- Success: Green-500
- Error: Red-500
- Neutral: Slate-50 to Slate-900

**טיפוגרפיה**:
- Rubik (עברית) - נקי ועגול
- Inter (אנגלית) - מודרני

**עקרונות**:
- ✅ Minimalist & Clean
- ✅ Wellness Calm
- ✅ High Accessibility (WCAG AA)
- ✅ Mobile-First Responsive
- ✅ 44px+ Touch Targets
- ✅ Smooth Animations (200-300ms)

---

## ✨ תכונות

### 🏋️ תוכניות אימון
- צפייה בכל התוכניות מקובץ לפי מתאמן
- **כפתור "העתק לינק"** - לשליחה למתאמן
- לחיצה על תוכנית = תצוגה מפורטת
- סטטיסטיקות: מתאמנים, תוכניות, ממוצע

### 👥 ניהול מתאמנים
- הוספת מתאמן חדש (שם + אימייל)
- מחיקת מתאמן
- הסיסמה הראשונית: `password123`

### 💪 בנק תרגילים
- הוספת תרגילים חדשים
- מחיקת תרגילים
- חיפוש וסינון לפי קטגוריה
- **אוכלס אוטומטית** מהמיגרציה

### ➕ בניית תוכנית
- בחירת מתאמן מרשימה
- בחירת תרגילים מהבנק
- עדכון סטים/חזרות/משקל
- Drag & drop visual order
- שמירה ל-Firebase

### 📺 תצוגת טלוויזיה
- **4 תוכניות במסך אחד**
- רענון אוטומטי כל 30 שניות
- כפתור מסך מלא (F11)
- מושלם למסכים גדולים בסטודיו

### 🔗 לינק ייעודי למתאמן
- **URL**: `?trainee={id}`
- צפייה בתוכניות **ללא התחברות**
- מעקב התקדמות עם checkboxes
- Progress bar בזמן אמת

### 🔐 הגדרות והרשאות
- הפיכת משתמשים למנהלים
- הסרת הרשאות מנהל

---

## 🗄️ מבנה ה-Database

### Collection: `users`
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  traineeSheetName: string,
  role: 'trainee' | 'admin',
  createdAt: Timestamp
}
```

### Collection: `workouts`
```javascript
{
  traineeId: string,  // FK -> users.uid
  traineeName: string,
  type: string,       // FB, FB2...
  exercises: [
    {
      name: string,
      altName: string,
      sets: string,
      reps: string,
      weight: string,
      isSuperSet: boolean,
      superSetExercises: string[],
      order: number
    }
  ],
  status: string,
  completionPercentage: number,
  lastUpdated: Timestamp
}
```

### Collection: `exercise_bank`
```javascript
{
  name: string,
  category: string,    // גב, רגליים, חזה...
  defaultSets: string,
  defaultReps: string,
  createdAt: Timestamp
}
```

---

## 🔄 מחיקת נתונים ישנים

### אופציה 1: דרך סקריפט (מומלץ)
```bash
node scripts/clearFirebase.js <service-account.json>
```

### אופציה 2: דרך Firebase Console
1. פתח [Firebase Console](https://console.firebase.google.com)
2. **Firestore Database** → בחר collection → Delete collection
3. **Authentication** → בחר משתמשים → Delete

---

## 🎯 שימוש יומיומי

### כניסה
- Email: כל משתמש מהמיגרציה (לדוגמה: `DuduG@gmail.com`)
- Password: `password123`

### העתקת לינק למתאמן
1. לחץ על "העתק לינק" ליד שם המתאמן
2. שלח את הלינק בוואטסאפ/SMS
3. המתאמן נכנס ללינק וצופה בתוכניות שלו

### יצירת תוכנית חדשה
1. לחץ על "בניית תוכנית"
2. בחר מתאמן
3. הזן סוג אימון (FB, FB2...)
4. לחץ על תרגילים מהבנק להוספה
5. ערוך סטים/חזרות/משקל
6. שמור

---

## 🛠️ פתרון בעיות

### בנק התרגילים ריק?
```bash
node scripts/populateExerciseBank.js <service-account.json>
```

### רוצה להתחיל מאפס?
```bash
# 1. מחק הכל
node scripts/clearFirebase.js <service-account.json>

# 2. מיגרציה מחדש
node scripts/migrateExcel.js <service-account.json> public/data/data.xlsx

# 3. מלא בנק תרגילים
node scripts/populateExerciseBank.js <service-account.json>
```

### שגיאת הרשאות?
וודא ש-`firestore.rules` הועלה ל-Firebase Console.

---

## 📱 Responsive Design

- **Mobile**: תפריט המבורגר, כרטיסיות stack
- **Tablet**: Grid 2 columns
- **Desktop**: Sidebar קבוע, Grid 3-4 columns
- **TV**: 4 תוכניות 2×2 grid

**Touch Targets**: מינימום 44×44px (ui-ux-pro-max standard)

---

**Built with ❤️ using ui-ux-pro-max design system**
