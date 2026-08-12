import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  Firestore,
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
let db: Firestore;
try {
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  }, firebaseConfigJson.firestoreDatabaseId || '(default)');
} catch (e) {
  db = getFirestore(app, firebaseConfigJson.firestoreDatabaseId || '(default)');
}
const googleProvider = new GoogleAuthProvider();

// Safe wrapper for getDoc with a 2.5s timeout to prevent hanging when offline or firestore connection fails
async function getDocSafe(docRef: any) {
  try {
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ exists: () => false, data: () => null }), 2500)
    );
    const result: any = await Promise.race([getDoc(docRef), timeoutPromise]);
    return result;
  } catch (err) {
    console.warn('Firestore getDoc notice (operating in offline/fallback mode):', err);
    return { exists: () => false, data: () => null };
  }
}

// Safe wrapper for setDoc with timeout
async function setDocSafe(docRef: any, data: any, options?: any) {
  try {
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(true), 2500));
    await Promise.race([setDoc(docRef, data, options), timeoutPromise]);
  } catch (err) {
    console.warn('Firestore setDoc notice (operating in offline/fallback mode):', err);
  }
}

export {
  app,
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  getDocSafe,
  setDocSafe,
  updateDoc,
  serverTimestamp
};
export type { FirebaseUser };
