import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

async function updateDb() {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

  // Update Admin
  console.log("Updating admin...");
  await setDoc(doc(db, "users", "1"), { id: 1, username: 'Kels', password: 'kelsbeautyas', role: 'admin' });

  // Delete all other users
  console.log("Deleting other users...");
  const usersSnap = await getDocs(collection(db, "users"));
  for (const userDoc of usersSnap.docs) {
    if (userDoc.id !== "1") {
      await deleteDoc(userDoc.ref);
    }
  }

  console.log("Done updating DB!");
}

updateDb().catch(console.error);
