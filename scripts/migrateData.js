/**
 * FixFit Data Migration Script
 * 
 * Usage: node scripts/migrateData.js <path-to-service-account.json> <path-to-csv-directory>
 * 
 * Prerequisites:
 * npm install firebase-admin csv-parser
 * 
 * Expected CSV Structure:
 * 1. Users.csv: headers [Email, Password, TraineeName]
 * 2. Workouts/*.csv: headers [מתאמן, סוג אימון, שם תרגיל, סטים, חזרות, משקל] (Hebrew headers)
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map Hebrew headers to English keys
const WORKOUT_HEADERS = {
  'מתאמן': 'traineeName',
  'סוג אימון': 'type',
  'שם תרגיל': 'name',
  'סטים': 'sets',
  'חזרות': 'reps',
  'משקל': 'weight'
};

async function migrateData() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/migrateData.js <path-to-service-account.json> <path-to-csv-directory>');
    process.exit(1);
  }

  const [serviceAccountPath, dataDir] = args;

  // Initialize Firebase Admin
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin Initialized.');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error.message);
    process.exit(1);
  }

  const db = admin.firestore();
  const auth = admin.auth();

  // 1. Process Users
  console.log('--- Processing Users ---');
  const userMap = new Map(); // Map TraineeName -> UID
  const usersPath = path.join(dataDir, 'Users.csv');

  if (fs.existsSync(usersPath)) {
    const users = [];
    await new Promise((resolve) => {
      fs.createReadStream(usersPath)
        .pipe(csv())
        .on('data', (row) => users.push(row))
        .on('end', resolve);
    });

    for (const user of users) {
      if (!user.Email || !user.TraineeName) {
        console.warn('Skipping invalid user row:', user);
        continue;
      }

      try {
        // Create Authentication User
        let userRecord;
        try {
          userRecord = await auth.getUserByEmail(user.Email);
          console.log(`User already exists: ${user.Email}`);
        } catch (e) {
          userRecord = await auth.createUser({
            email: user.Email,
            password: user.Password || '123456', // Default password if missing
            displayName: user.TraineeName
          });
          console.log(`Created Auth User: ${user.Email}`);
        }

        // Create Firestore User Document
        await db.collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email: user.Email,
          displayName: user.TraineeName,
          role: 'trainee',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        userMap.set(user.TraineeName, userRecord.uid);
      } catch (error) {
        console.error(`Failed to process user ${user.Email}:`, error.message);
      }
    }
  } else {
    console.warn(`Users.csv not found at ${usersPath}`);
  }

  // 2. Process Workouts
  console.log('--- Processing Workouts ---');
  const workoutsDir = path.join(dataDir, 'Workouts'); // Assuming workouts are in a subdir or just match *.csv in main dir? 
  // User Prompt said "Workouts CSVs (e.g. shaked.csv...)"
  // I'll scan the main dataDir but ignore Users.csv
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv') && f !== 'Users.csv');

  for (const file of files) {
    console.log(`Processing workout file: ${file}`);
    const filePath = path.join(dataDir, file);
    const rows = [];

    await new Promise((resolve) => {
      fs.createReadStream(filePath)
        .pipe(csv({ mapHeaders: ({ header }) => WORKOUT_HEADERS[header] || header }))
        .on('data', (row) => rows.push(row))
        .on('end', resolve);
    });

    // Group by Trainee and Mutation Type
    // The requirement says: Group rows by 'סוג אימון' (type) and create single Document
    const workoutsByType = new Map(); // Key: type, Value: { traineeName, exercises: [] }

    for (const row of rows) {
      if (!row.type || !row.traineeName) continue;

      const key = `${row.traineeName}::${row.type}`;
      if (!workoutsByType.has(key)) {
        workoutsByType.set(key, {
          traineeName: row.traineeName,
          type: row.type,
          exercises: []
        });
      }

      workoutsByType.get(key).exercises.push({
        name: row.name,
        sets: row.sets,
        reps: row.reps,
        weight: row.weight
      });
    }

    // Write to Firestore
    for (const workout of workoutsByType.values()) {
      const uid = userMap.get(workout.traineeName);
      if (!uid) {
        console.warn(`Skipping workout for unknown trainee: ${workout.traineeName}`);
        continue;
      }

      try {
        await db.collection('workouts').add({
          traineeId: uid,
          type: workout.type,
          exercises: workout.exercises,
          importedAt: admin.firestore.FieldValue.serverTimestamp(),
          sourceFile: file
        });
        console.log(`Imported workout '${workout.type}' for ${workout.traineeName}`);
      } catch (error) {
        console.error(`Failed to save workout for ${workout.traineeName}:`, error.message);
      }
    }
  }

  console.log('Migration Complete.');
  process.exit(0);
}

migrateData().catch(console.error);
