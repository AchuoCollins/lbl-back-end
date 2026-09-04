import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'db.json');

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

function emptyData() {
  return COLLECTIONS.reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {});
}

function load() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(emptyData(), null, 2));
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  const parsed = raw.trim() ? JSON.parse(raw) : {};
  return { ...emptyData(), ...parsed };
}

let data = load();

// First boot (or upgrading from the old single-admin/.env setup): seed the
// admins collection from the env credentials so existing logins keep working.
if (data.admins.length === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH) {
  data.admins.push({
    id: Date.now(),
    name: 'Admin',
    email: process.env.ADMIN_EMAIL,
    passwordHash: process.env.ADMIN_PASSWORD_HASH,
    createdAt: new Date().toISOString(),
  });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function persist() {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function assertCollection(collection) {
  if (!COLLECTIONS.includes(collection)) {
    throw new Error(`Unknown collection: ${collection}`);
  }
}

export const store = {
  all(collection) {
    assertCollection(collection);
    return data[collection];
  },

  find(collection, id) {
    assertCollection(collection);
    return data[collection].find((item) => String(item.id) === String(id));
  },

  insert(collection, item) {
    assertCollection(collection);
    data[collection].push(item);
    persist();
    return item;
  },

  update(collection, id, patch) {
    assertCollection(collection);
    let updated = null;
    data[collection] = data[collection].map((item) => {
      if (String(item.id) === String(id)) {
        updated = { ...item, ...patch };
        return updated;
      }
      return item;
    });
    persist();
    return updated;
  },

  replaceAll(collection, items) {
    assertCollection(collection);
    data[collection] = items;
    persist();
    return data[collection];
  },

  remove(collection, id) {
    assertCollection(collection);
    const before = data[collection].length;
    data[collection] = data[collection].filter((item) => String(item.id) !== String(id));
    persist();
    return data[collection].length < before;
  },
};

export default store;
