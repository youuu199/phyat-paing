import { initializeApp, cert, getApps } from 'firebase-admin/app';

/**
 * Initialize Firebase Admin SDK using service account credentials from environment variables.
 *
 * Required env vars:
 *  - FIREBASE_SERVICE_ACCOUNT: Full service account JSON string
 *  - FIREBASE_STORAGE_BUCKET: e.g., 'your-project-id.appspot.com' (NOT gs://...)
 *
 * Anti-patterns avoided:
 *  - Using admin.credential.applicationDefault() (fails outside GCP)
 *  - Using Firebase Web API key instead of service account
 *  - Passing gs:// URI to storageBucket
 *  - Initializing multiple times (we guard with getApps)
 */
const initFirebase = () => {
  // Guard against double initialization (e.g., hot reload in dev)
  if (getApps().length > 0) {
    console.log('Firebase already initialized — skipping re-init');
    return;
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  console.log(`Firebase initialized — bucket: ${process.env.FIREBASE_STORAGE_BUCKET}`);
};

export default initFirebase;
