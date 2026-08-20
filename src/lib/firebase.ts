import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// getApps().length evita volver a inicializar en Fast Refresh/HMR.
const app: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Solo en la build dedicada de e2e (npm run build:e2e, ver
// playwright.config.ts): conecta contra el Firebase Auth Emulator en vez
// del proyecto real, para poder probar el flujo de registro/login sin
// crear usuarios reales en cinemaloop-platform.
if (process.env.NEXT_PUBLIC_USE_FIREBASE_AUTH_EMULATOR === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
}
