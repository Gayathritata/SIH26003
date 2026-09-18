/**
 * Firebase Client SDK Safe Module Loader
 * Handles real Firebase Auth when available and provides fallback context
 */

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyDemoConfigKeyForMindmateNER123",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "demo-mindmate-ner.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "demo-mindmate-ner",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "demo-mindmate-ner.appspot.com",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

let authInstance: any = null;
let authModule: any = null;

export const initFirebase = async () => {
  if (authInstance) return { auth: authInstance, authModule };
  try {
    const appModuleName = 'firebase/app';
    const authModuleName = 'firebase/auth';
    const appModule = await import(/* @vite-ignore */ appModuleName).catch(() => null);
    const aModule = await import(/* @vite-ignore */ authModuleName).catch(() => null);

    if (appModule && aModule) {
      const app = !appModule.getApps().length ? appModule.initializeApp(firebaseConfig) : appModule.getApp();
      authInstance = aModule.getAuth(app);
      authModule = aModule;
      return { auth: authInstance, authModule };
    }
  } catch (err) {
    console.log('[FIREBASE INIT NOTICE] Running in robust local auth mode.');
  }
  return { auth: null, authModule: null };
};
