# מדריך מיגרציה - FixFit

## 📋 צעדים

### 1. הכן Firebase Project
1. צור project ב-[Firebase Console](https://console.firebase.google.com)
2. הפעל Authentication (Email/Password)
3. הפעל Firestore Database
4. הורד Service Account JSON

### 2. העלה Security Rules
ב-Firestore → Rules, העתק את התוכן מקובץ `firestore.rules` ולחץ Publish.

### 3. הגדר משתני סביבה
צור קובץ `.env` עם הפרטים מ-Firebase (ראה README.md).

### 4. התקן תלויות
```bash
npm install
```

### 5. הרץ מיגרציה
```bash
node scripts/migrateExcel.js <path-to-service-account.json> public/data/data.xlsx
```

### 6. בדוק
- פתח Firebase Console
- ודא שיש משתמשים ב-Authentication
- ודא שיש נתונים ב-Firestore (users, workouts)

### 7. הרץ אפליקציה
```bash
npm run dev
```

התחבר עם אחד המשתמשים (סיסמה: `password123`).

## ✅ זהו!

המערכת מוכנה לשימוש.
