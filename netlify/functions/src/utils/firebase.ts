import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

let app: App;
let db: Firestore;
let auth: Auth;
let storage: Storage;

export function initializeFirebase() {
  if (getApps().length === 0) {
    // For Netlify, use environment variables for service account
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

    app = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  } else {
    app = getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  }

  return { app, db, auth, storage };
}

export function getDb(): Firestore {
  if (!db) {
    initializeFirebase();
  }
  return db;
}

export function getAuthService(): Auth {
  if (!auth) {
    initializeFirebase();
  }
  return auth;
}

export function getStorageService(): Storage {
  if (!storage) {
    initializeFirebase();
  }
  return storage;
}
