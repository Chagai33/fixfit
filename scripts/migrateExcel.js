/**
 * FixFit Excel Data Migration Script
 * 
 * Usage: node scripts/migrateExcel.js <path-to-service-account.json> <path-to-excel-file.xlsx>
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// System sheets to ignore
const IGNORED_SHEETS = [
  "מחסן תרגילים", "כל המתאמנים", "לוח אימונים",
  "מחסן תרגילים#", "כל המתאמנים#", "לוח אימונים#",
  "Users", "users", "Dashboard", "Settings"
];

// Helper to normalize strings
const cleanString = (str) => {
  if (str === undefined || str === null) return '';
  return String(str).trim();
};

async function migrateExcel() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/migrateExcel.js <path-to-service-account.json> <path-to-excel-file.xlsx>');
    process.exit(1);
  }

  const [serviceAccountPath, excelPath] = args;

  // Initialize Firebase Admin
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin Initialized.');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    process.exit(1);
  }

  const db = admin.firestore();
  const auth = admin.auth();

  // Load Workbook
  console.log(`📂 Loading Excel file: ${excelPath}`);
  const workbook = XLSX.readFile(excelPath);

  // 1. Process Users Sheet
  const usersSheet = workbook.Sheets['Users'] || workbook.Sheets['users'];
  if (!usersSheet) {
    console.warn('⚠️ "Users" sheet not found! Will rely on auto-creation from sheet names.');
  }

  const userMap = new Map(); // Name -> UID

  if (usersSheet) {
    const usersData = XLSX.utils.sheet_to_json(usersSheet);
    console.log('--- Processing Users ---');
    for (const row of usersData) {
      const email = cleanString(row['Email']);
      const traineeName = cleanString(row['TraineeName'] || row['Name']);
      const role = cleanString(row['Role']) || 'trainee';

      if (!email || !traineeName) continue;

      try {
        let userRecord;
        try {
          userRecord = await auth.getUserByEmail(email);
        } catch (e) {
          userRecord = await auth.createUser({
            email,
            password: 'password123',
            displayName: traineeName
          });
        }

        await db.collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email,
          displayName: traineeName,
          role: role,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        userMap.set(traineeName, userRecord.uid);
        console.log(`👤 User: ${traineeName} (${role})`);
      } catch (err) {
        console.error(`❌ Failed to process user ${email}:`, err.message);
      }
    }
  }

  // 2. Process Workout Sheets
  console.log('--- Processing Workouts ---');
  for (const sheetName of workbook.SheetNames) {
    if (IGNORED_SHEETS.includes(sheetName)) continue;

    let uid = userMap.get(sheetName);

    // Auto-create user if not in Users sheet
    if (!uid) {
      const email = `${sheetName.replace(/\s+/g, '.').toLowerCase()}@fixfit.placeholder.com`;
      try {
        let user;
        try {
          user = await auth.getUserByEmail(email);
        } catch (e) {
          user = await auth.createUser({ email, displayName: sheetName, password: 'password123' });
        }
        uid = user.uid;
        await db.collection('users').doc(uid).set({
          uid, email, displayName: sheetName, role: 'trainee', createdAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        userMap.set(sheetName, uid);
      } catch (err) {
        console.error(`❌ Could not handle user for sheet ${sheetName}`);
        continue;
      }
    }

    console.log(`🏋️  Workouts for: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: "A", range: 1 });

    const workoutsByType = new Map();

    for (const row of rows) {
      const type = cleanString(row['B']); // Title/Type of workout (e.g. "אימון A")
      const name = cleanString(row['C']); // Exercise name
      const sets = cleanString(row['D']);
      const reps = cleanString(row['E']);
      const weight = cleanString(row['F']);

      if (!type || !name) continue;

      if (!workoutsByType.has(type)) {
        workoutsByType.set(type, []);
      }

      workoutsByType.get(type).push({
        name,
        sets,
        reps,
        weight,
        isCompleted: false,
        order: workoutsByType.get(type).length
      });
    }

    const batch = db.batch();
    for (const [type, exercises] of workoutsByType.entries()) {
      // Use structured ID to avoid duplicates on re-run: traineeId_type
      // Sanitize 'type' to avoid forward slashes which Firestore treats as path separators
      const sanitizedType = type.replace(/\s+/g, '_').replace(/\//g, '_');
      const workoutId = `${uid}_${sanitizedType}`;
      const docRef = db.collection('workouts').doc(workoutId);
      batch.set(docRef, {
        traineeId: uid,
        traineeName: sheetName,
        title: type,
        type: type,
        exercises: exercises,
        status: 'pending',
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }

    await batch.commit();
    console.log(`✅ Saved ${workoutsByType.size} workout types for ${sheetName}`);
  }

  console.log('\n🚀 Migration Successful.');
  process.exit(0);
}

migrateExcel().catch(console.error);
