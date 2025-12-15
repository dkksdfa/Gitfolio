import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
    ) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });
    } else {
        console.warn('Firebase environment variables are missing. Server storage will not work.');
    }
}

// Export db only if initialized, otherwise it might throw or be undefined
export const db = admin.apps.length ? admin.firestore() : null;
