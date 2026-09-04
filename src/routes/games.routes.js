import { Router } from 'express';
import store from '../db/store.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  res.json(await store.all('games'));
});

router.get('/:id', async (req, res) => {
  const game = await store.find('games', req.params.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  res.json(game);
});

router.post('/', requireAdmin, async (req, res) => {
  const game = {
    ...req.body,
    id: Date.now(),
    status: 'UPCOMING',
    homeScore: 0,
    awayScore: 0,
    quarters: { home: [0, 0, 0, 0], away: [0, 0, 0, 0] },
  };
  await store.insert('games', game);
  res.status(201).json(game);
});

router.put('/:id', requireAdmin, async (req, res) => {
  const updated = await store.update('games', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Game not found' });
  res.json(updated);
});

router.patch('/:id/score', requireAdmin, async (req, res) => {
  const { homeScore, awayScore, quarters } = req.body || {};
  const game = await store.find('games', req.params.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });

  const updated = await store.update('games', req.params.id, {
    homeScore: homeScore !== undefined ? homeScore : game.homeScore,
    awayScore: awayScore !== undefined ? awayScore : game.awayScore,
    quarters: quarters || game.quarters || { home: [0, 0, 0, 0], away: [0, 0, 0, 0] },
  });

  res.json(updated);
});

router.patch('/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'status is required' });

  const updated = await store.update('games', req.params.id, { status });
  if (!updated) return res.status(404).json({ error: 'Game not found' });
  res.json(updated);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const removed = await store.remove('games', req.params.id);
  if (!removed) return res.status(404).json({ error: 'Game not found' });
  res.status(204).end();
});

router.post('/reset-season', requireAdmin, async (req, res) => {
  const reset = (await store.all('games')).map((game) => ({
    ...game,
    status: 'UPCOMING',
    homeScore: 0,
    awayScore: 0,
    quarters: { home: [0, 0, 0, 0], away: [0, 0, 0, 0] },
  }));
  await store.replaceAll('games', reset);
  res.json(reset);
});

export default router;
