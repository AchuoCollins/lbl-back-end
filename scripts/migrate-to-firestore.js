// One-time migration: copy data/db.json into Firestore.
// Usage: node scripts/migrate-to-firestore.js
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../src/db/firebase.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

if (!fs.existsSync(DB_PATH)) {
  console.error(`No data/db.json found at ${DB_PATH} — nothing to migrate.`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

for (const [collection, items] of Object.entries(data)) {
  if (!Array.isArray(items) || items.length === 0) continue;

  const batch = db.batch();
  for (const item of items) {
    if (item.id === undefined || item.id === null) {
      console.warn(`Skipping item without id in "${collection}":`, item);
      continue;
    }
    batch.set(db.collection(collection).doc(String(item.id)), item);
  }
  await batch.commit();
  console.log(`Migrated ${items.length} item(s) into "${collection}"`);
}

console.log('Migration complete.');
process.exit(0);
