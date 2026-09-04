import { db } from './firebase.js';

const COLLECTIONS = [
  'teams',
  'games',
  'news',
  'announcements',
  'highlights',
  'donations',
  'tickets',
  'standings',
  'supportTickets',
  'admins',
];

function assertCollection(collection) {
  if (!COLLECTIONS.includes(collection)) {
    throw new Error(`Unknown collection: ${collection}`);
  }
}

export const store = {
  async all(collection) {
    assertCollection(collection);
    const snapshot = await db.collection(collection).get();
    return snapshot.docs.map((doc) => doc.data());
  },

  async find(collection, id) {
    assertCollection(collection);
    const doc = await db.collection(collection).doc(String(id)).get();
    return doc.exists ? doc.data() : undefined;
  },

  async insert(collection, item) {
    assertCollection(collection);
    await db.collection(collection).doc(String(item.id)).set(item);
    return item;
  },

  async update(collection, id, patch) {
    assertCollection(collection);
    const ref = db.collection(collection).doc(String(id));
    const doc = await ref.get();
    if (!doc.exists) return null;
    const updated = { ...doc.data(), ...patch };
    await ref.set(updated);
    return updated;
  },

  async replaceAll(collection, items) {
    assertCollection(collection);
    const colRef = db.collection(collection);
    const existing = await colRef.get();

    const batch = db.batch();
    existing.docs.forEach((doc) => batch.delete(doc.ref));
    items.forEach((item) => batch.set(colRef.doc(String(item.id)), item));
    await batch.commit();

    return items;
  },

  async remove(collection, id) {
    assertCollection(collection);
    const ref = db.collection(collection).doc(String(id));
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  },
};

// First boot (or upgrading from the old single-admin/.env setup): seed the
// admins collection from the env credentials so existing logins keep working.
export async function seedAdminFromEnv() {
  const admins = await store.all('admins');
  if (admins.length === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH) {
    await store.insert('admins', {
      id: Date.now(),
      name: 'Admin',
      email: process.env.ADMIN_EMAIL,
      passwordHash: process.env.ADMIN_PASSWORD_HASH,
      createdAt: new Date().toISOString(),
    });
  }
}

export default store;
