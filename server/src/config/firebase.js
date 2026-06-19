import { initializeApp, cert, getApps } from 'firebase-admin/app';

/**
 * Initialize Firebase Admin SDK using service account credentials from environment variables.
 *
 * Required env vars:
 *  - FIREBASE_SERVICE_ACCOUNT: Full service account JSON string
 *  - FIREBASE_STORAGE_BUCKET: e.g., 'your-project-id.appspot.com' (NOT gs://...)
 *
 * Non-fatal: if credentials are invalid or missing, Firebase is skipped.
 * Storage uploads will fail with a clear error instead of crashing the server.
 *
 * Anti-patterns avoided:
 *  - Using admin.credential.applicationDefault() (fails outside GCP)
 *  - Using Firebase Web API key instead of service account
 *  - Passing gs:// URI to storageBucket
 *  - Initializing multiple times (we guard with getApps)
 */
const initFirebase = () => {
  if (getApps().length > 0) {
    console.log('Firebase already initialized — skipping re-init');
    return;
  }

  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    console.log(`Firebase initialized — bucket: ${process.env.FIREBASE_STORAGE_BUCKET}`);
  } catch (err) {
    console.warn('⚠ Firebase not configured — uploads will fail until FIREBASE_SERVICE_ACCOUNT is set with a valid service account key');
  }
};

export default initFirebase;
