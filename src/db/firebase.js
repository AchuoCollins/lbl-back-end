import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadServiceAccount() {
  // Hosting platforms (Render, etc.) can't see gitignored files, so let the
  // whole key be passed as an env var there instead of read from disk.
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  const keyPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    path.join(__dirname, '..', '..', 'serviceAccountKey.json');

  if (!fs.existsSync(keyPath)) {
    throw new Error(
      `Firebase service account key not found at ${keyPath}. Download it from ` +
        'Firebase console → Project settings → Service accounts, and either save it ' +
        'there, set FIREBASE_SERVICE_ACCOUNT_PATH, or set FIREBASE_SERVICE_ACCOUNT_JSON ' +
        'to the full key content (for hosting platforms).'
    );
  }

  return JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
}

const app = initializeApp({
  credential: cert(loadServiceAccount()),
});

export const db = getFirestore(app);
