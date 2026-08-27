import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  setPersistence,
  browserLocalPersistence,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

// Support Vercel/Production environment variables with fallback to applet config
const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;

const firebaseConfig = {
  apiKey: metaEnv?.VITE_FIREBASE_API_KEY || firebaseConfigData.apiKey,
  authDomain: metaEnv?.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigData.authDomain,
  projectId: metaEnv?.VITE_FIREBASE_PROJECT_ID || firebaseConfigData.projectId,
  storageBucket: metaEnv?.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigData.storageBucket,
  messagingSenderId: metaEnv?.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigData.messagingSenderId,
  appId: metaEnv?.VITE_FIREBASE_APP_ID || firebaseConfigData.appId,
};

// Initialize Firebase App instance safely (singleton)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth with Local Persistence
export const auth = getAuth(app);

// Configure local persistence across browser reloads and restarts
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Falha ao configurar persistência local do Firebase Auth:', err);
  });
}

// Google Auth Provider setup with select_account prompt
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with custom databaseId and resilient Long Polling transport
const rawDbId = metaEnv?.VITE_FIREBASE_DATABASE_ID || firebaseConfigData.firestoreDatabaseId;
const targetDbId = rawDbId && rawDbId !== '(default)' ? rawDbId : undefined;

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
      experimentalForceLongPolling: true,
    },
    targetDbId
  );
} catch {
  firestoreInstance = targetDbId ? getFirestore(app, targetDbId) : getFirestore(app);
}

export const db = firestoreInstance;

/**
 * Safe status helper for Firestore initialization
 */
export async function testFirestoreConnection(): Promise<boolean> {
  return !!db;
}

// Export Auth & Firestore primitives
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  setPersistence,
  browserLocalPersistence,
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  writeBatch,
};
export type { FirebaseUser };

