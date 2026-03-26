import * as admin from "firebase-admin";

const initializeAdmin = () => {
  if (admin.apps.length > 0) return;

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not defined. Firebase Admin features will not work.");
    return;
  }

  try {
    let config;
    if (serviceAccountKey.startsWith('{')) {
      config = JSON.parse(serviceAccountKey);
    } else {
      // Try base64 decoding if it doesn't look like JSON
      config = JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('utf8'));
    }

    // Fix for private key newlines if they were escaped in env var
    if (config.private_key) {
      config.private_key = config.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert(config),
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
  } catch (error: any) {
    console.error("Firebase admin initialization error:", error.message);
    if (error instanceof SyntaxError) {
      console.error("The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not valid JSON.");
      console.error("Value start:", serviceAccountKey.substring(0, 20), "...");
    }
  }
};

initializeAdmin();

export const adminAuth = admin.apps.length > 0 ? admin.auth() : null as any;
export const adminDb = admin.apps.length > 0 ? admin.firestore() : null as any;
export const adminStorage = admin.apps.length > 0 ? admin.storage() : null as any;
