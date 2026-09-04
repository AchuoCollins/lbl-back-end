import { Router } from 'express';
import store from '../db/store.js';
import { requireAdmin } from '../middleware/auth.js';

// Generic CRUD router for a simple, flat collection (teams, news, announcements,
// highlights, donations, tickets, supportTickets). Reads are public, writes require
// an admin token — this mirrors how the admin dashboard is the only place that
// mutates this data today.
export function collectionRouter(collection, { decorateCreate } = {}) {
  const router = Router();

  router.get('/', (req, res) => {
    res.json(store.all(collection));
  });

  router.put('/reorder', requireAdmin, (req, res) => {
    const items = Array.isArray(req.body) ? req.body : req.body.items;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items array is required' });
    res.json(store.replaceAll(collection, items));
  });

  router.get('/:id', (req, res) => {
    const item = store.find(collection, req.params.id);
    if (!item) return res.status(404).json({ error: `${collection} item not found` });
    res.json(item);
  });

  router.post('/', requireAdmin, (req, res) => {
    let item = { ...req.body, id: Date.now() };
    if (decorateCreate) item = decorateCreate(item);
    store.insert(collection, item);
    res.status(201).json(item);
  });

  router.put('/:id', requireAdmin, (req, res) => {
    const updated = store.update(collection, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: `${collection} item not found` });
    res.json(updated);
  });

  router.patch('/:id', requireAdmin, (req, res) => {
    const updated = store.update(collection, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: `${collection} item not found` });
    res.json(updated);
  });

  router.delete('/:id', requireAdmin, (req, res) => {
    const removed = store.remove(collection, req.params.id);
    if (!removed) return res.status(404).json({ error: `${collection} item not found` });
    res.status(204).end();
  });

  return router;
}
