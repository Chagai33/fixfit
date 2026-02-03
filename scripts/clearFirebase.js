/**
 * Clear all data from Firebase
 * WARNING: This will delete ALL data!
 * Usage: node scripts/clearFirebase.js <path-to-service-account.json>
 */

import admin from 'firebase-admin';
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function clearFirebase() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node scripts/clearFirebase.js <path-to-service-account.json>');
    process.exit(1);
  }

  const [serviceAccountPath] = args;

  // Initialize Firebase
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase initialized\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  const db = admin.firestore();
  const auth = admin.auth();

  // Confirmation
  console.log('⚠️  WARNING: This will delete ALL data from Firebase!');
  console.log('   - All users from Authentication');
  console.log('   - All documents from Firestore\n');
  
  const answer = await askQuestion('Type "DELETE ALL" to confirm: ');
  
  if (answer !== 'DELETE ALL') {
    console.log('❌ Cancelled');
    process.exit(0);
  }

  console.log('\n🗑️  Deleting data...\n');

  // Delete Firestore collections
  const collections = ['users', 'workouts', 'exercise_bank'];
  
  for (const collectionName of collections) {
    console.log(`Deleting ${collectionName}...`);
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`✅ Deleted ${snapshot.size} documents from ${collectionName}`);
  }

  // Delete Auth users
  console.log('\nDeleting Authentication users...');
  const listUsersResult = await auth.listUsers();
  let deletedCount = 0;
  
  for (const user of listUsersResult.users) {
    try {
      await auth.deleteUser(user.uid);
      deletedCount++;
    } catch (error) {
      console.error(`Failed to delete user ${user.email}`);
    }
  }
  console.log(`✅ Deleted ${deletedCount} users from Authentication\n`);

  console.log('🎉 All data cleared!');
  rl.close();
  process.exit(0);
}

clearFirebase().catch(console.error);
