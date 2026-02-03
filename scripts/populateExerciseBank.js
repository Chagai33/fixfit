/**
 * Populate Exercise Bank from existing workouts
 * Usage: node scripts/populateExerciseBank.js <path-to-service-account.json>
 */

import admin from 'firebase-admin';
import fs from 'fs';

async function populateExerciseBank() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node scripts/populateExerciseBank.js <path-to-service-account.json>');
    process.exit(1);
  }

  const [serviceAccountPath] = args;

  // Initialize Firebase
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase initialized');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  const db = admin.firestore();

  // Get all workouts
  console.log('📊 Reading workouts...');
  const workoutsSnap = await db.collection('workouts').get();
  
  // Extract unique exercises
  const exerciseMap = new Map();
  
  workoutsSnap.docs.forEach(doc => {
    const workout = doc.data();
    workout.exercises?.forEach(ex => {
      const key = ex.name.toLowerCase().trim();
      if (!exerciseMap.has(key)) {
        // Guess category from name
        let category = 'כללי';
        const name = ex.name.toLowerCase();
        if (name.includes('דדליפט') || name.includes('חתירה') || name.includes('משיכ')) category = 'גב';
        else if (name.includes('סקוואט') || name.includes('לאנג') || name.includes('רגל')) category = 'רגליים';
        else if (name.includes('לחיצ') || name.includes('חזה') || name.includes('פרפר')) category = 'חזה';
        else if (name.includes('כתף') || name.includes('ארנולד')) category = 'כתפיים';
        else if (name.includes('ביצפ') || name.includes('טריצפ') || name.includes('יד')) category = 'ידיים';
        else if (name.includes('בטן') || name.includes('פלאנק') || name.includes('קור')) category = 'בטן';
        
        exerciseMap.set(key, {
          name: ex.name,
          category: category,
          defaultSets: ex.sets || '3',
          defaultReps: ex.reps || '8-12'
        });
      }
    });
  });

  console.log(`💪 Found ${exerciseMap.size} unique exercises`);

  // Add to exercise_bank
  const batch = db.batch();
  let count = 0;
  
  for (const exercise of exerciseMap.values()) {
    const docRef = db.collection('exercise_bank').doc();
    batch.set(docRef, {
      ...exercise,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    count++;
  }

  await batch.commit();
  console.log(`✅ Added ${count} exercises to exercise_bank`);
  console.log('🎉 Done!');
  process.exit(0);
}

populateExerciseBank().catch(console.error);
