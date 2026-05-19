import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

const env = import.meta.env;

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

export const firebaseEnabled = Boolean(
  config.apiKey && config.databaseURL && config.projectId
);

let app: FirebaseApp | null = null;
let database: Database | null = null;

if (firebaseEnabled) {
  app = initializeApp(config);
  database = getDatabase(app);
} else if (typeof window !== 'undefined') {
  console.warn(
    '[fromgreytoplay] Firebase env vars missing — running in offline/demo mode. ' +
      'Copy .env.example to .env and fill in your Firebase web config to enable live data.'
  );
}

export const db = database;

export function getUserId(): string {
  const KEY = 'fgtp-user';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `u_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}
