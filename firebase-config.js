// Firebase Configuration & Initialization
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase Config - From index.html
const firebaseConfig = {
    apiKey: "AIzaSyA5JfpN7Sk3tdCBDa7u5coDbjrwx7D2GV8",
    authDomain: "prompt-573fc.firebaseapp.com",
    databaseURL: "https://prompt-573fc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "prompt-573fc",
    storageBucket: "prompt-573fc.firebasestorage.app",
    messagingSenderId: "362695103484",
    appId: "1:362695103484:web:036d2d722e6754aeaed879",
    measurementId: "G-9X3DY739S9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth = getAuth(app);
const database = getDatabase(app);
const db = getFirestore(app);

// Optional: Connect to emulators in development
// Uncomment these lines if you're running Firebase Local Emulator Suite
// 
// if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
//     connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
//     connectDatabaseEmulator(database, 'localhost', 9000);
//     connectFirestoreEmulator(db, 'localhost', 8080);
// }

// Export instances
export { app, auth, database, db };
