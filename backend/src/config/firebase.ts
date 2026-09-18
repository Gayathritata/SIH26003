import * as admin from 'firebase-admin';

let isFirebaseInitialized = false;

try {
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    isFirebaseInitialized = true;
    console.log('[FIREBASE] Admin SDK Initialized Successfully.');
  } else {
    console.log('[FIREBASE INFO] Firebase credentials omitted. Auth middleware using Hackathon Demo Verification mode.');
  }
} catch (error) {
  console.warn('[FIREBASE WARNING] Initialization error:', error);
}

export { admin, isFirebaseInitialized };
