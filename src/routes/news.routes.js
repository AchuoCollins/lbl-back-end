import { Router } from 'express';
import store from '../db/store.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  res.json(await store.all('news'));
});

router.get('/:id', async (req, res) => {
  const item = await store.find('news', req.params.id);
  if (!item) return res.status(404).json({ error: 'News item not found' });
  res.json(item);
});

router.post('/', requireAdmin, async (req, res) => {
  const item = {
    ...req.body,
    id: Date.now(),
    date: req.body.date || 'Coming soon',
    likes: 0,
    dislikes: 0,
    featured: false,
    category: req.body.category || 'League',
    image: req.body.image || null,
  };
  await store.insert('news', item);
  res.status(201).json(item);
});

router.put('/:id', requireAdmin, async (req, res) => {
  const updated = await store.update('news', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'News item not found' });
  res.json(updated);
});

router.patch('/:id/publish', requireAdmin, async (req, res) => {
  const item = await store.find('news', req.params.id);
  if (!item) return res.status(404).json({ error: 'News item not found' });
  const updated = await store.update('news', req.params.id, {
    status: item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
  });
  res.json(updated);
});

router.patch('/:id/featured', requireAdmin, async (req, res) => {
  const item = await store.find('news', req.params.id);
  if (!item) return res.status(404).json({ error: 'News item not found' });
  const updated = await store.update('news', req.params.id, { featured: !item.featured });
  res.json(updated);
});

router.patch('/:id/like', async (req, res) => {
  const item = await store.find('news', req.params.id);
  if (!item) return res.status(404).json({ error: 'News item not found' });
  const updated = await store.update('news', req.params.id, { likes: (item.likes || 0) + 1 });
  res.json(updated);
});

router.patch('/:id/dislike', async (req, res) => {
  const item = await store.find('news', req.params.id);
  if (!item) return res.status(404).json({ error: 'News item not found' });
  const updated = await store.update('news', req.params.id, { dislikes: (item.dislikes || 0) + 1 });
  res.json(updated);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const removed = await store.remove('news', req.params.id);
  if (!removed) return res.status(404).json({ error: 'News item not found' });
  res.status(204).end();
});

export default router;
