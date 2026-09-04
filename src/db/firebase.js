import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEY_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.join(__dirname, '..', '..', 'serviceAccountKey.json');

if (!fs.existsSync(KEY_PATH)) {
  throw new Error(
    `Firebase service account key not found at ${KEY_PATH}. Download it from ` +
      'Firebase console → Project settings → Service accounts, and save it there ' +
      '(or set FIREBASE_SERVICE_ACCOUNT_PATH).'
  );
}

const serviceAccount = JSON.parse(fs.readFileSync(KEY_PATH, 'utf-8'));

const app = initializeApp({
  credential: cert(serviceAccount),
});

export const db = getFirestore(app);
