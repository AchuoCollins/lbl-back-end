import { Router } from 'express';
import bcrypt from 'bcryptjs';
import store from '../db/store.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

function toPublic(admin, req) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    createdAt: admin.createdAt,
    you: String(admin.id) === String(req.admin.id),
  };
}

router.use(requireAdmin);

router.get('/', async (req, res) => {
  res.json((await store.all('admins')).map((a) => toPublic(a, req)));
});

router.post('/', async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const exists = (await store.all('admins')).some(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  );
  if (exists) {
    return res.status(409).json({ error: 'An admin with that email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = {
    id: Date.now(),
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  await store.insert('admins', admin);

  res.status(201).json(toPublic(admin, req));
});

router.delete('/:id', async (req, res) => {
  const admins = await store.all('admins');
  if (admins.length <= 1) {
    return res.status(400).json({ error: "Can't remove the last remaining admin" });
  }

  const removed = await store.remove('admins', req.params.id);
  if (!removed) return res.status(404).json({ error: 'Admin not found' });
  res.status(204).end();
});

export default router;
