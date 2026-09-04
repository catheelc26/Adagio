import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Config del proyecto de Firebase — se completa con variables de entorno
// (ver .env.example). No hace falta tocar este archivo: solo crear un
// archivo .env con tus credenciales reales del proyecto Firebase.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = firebaseReady && !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = firebaseReady ? getFirestore(app) : null;
