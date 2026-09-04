import { Router } from 'express';
import store from '../db/store.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(store.all('games'));
});

router.get('/:id', (req, res) => {
  const game = store.find('games', req.params.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  res.json(game);
});

router.post('/', requireAdmin, (req, res) => {
  const game = {
    ...req.body,
    id: Date.now(),
    status: 'UPCOMING',
    homeScore: 0,
    awayScore: 0,
    quarters: { home: [0, 0, 0, 0], away: [0, 0, 0, 0] },
  };
  store.insert('games', game);
  res.status(201).json(game);
});

router.put('/:id', requireAdmin, (req, res) => {
  const updated = store.update('games', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Game not found' });
  res.json(updated);
});

router.patch('/:id/score', requireAdmin, (req, res) => {
  const { homeScore, awayScore, quarters } = req.body || {};
  const game = store.find('games', req.params.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });

  const updated = store.update('games', req.params.id, {
    homeScore: homeScore !== undefined ? homeScore : game.homeScore,
    awayScore: awayScore !== undefined ? awayScore : game.awayScore,
    quarters: quarters || game.quarters || { home: [0, 0, 0, 0], away: [0, 0, 0, 0] },
  });

  res.json(updated);
});

router.patch('/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'status is required' });

  const updated = store.update('games', req.params.id, { status });
  if (!updated) return res.status(404).json({ error: 'Game not found' });
  res.json(updated);
});

router.delete('/:id', requireAdmin, (req, res) => {
  const removed = store.remove('games', req.params.id);
  if (!removed) return res.status(404).json({ error: 'Game not found' });
  res.status(204).end();
});

router.post('/reset-season', requireAdmin, (req, res) => {
  const reset = store.all('games').map((game) => ({
    ...game,
    status: 'UPCOMING',
    homeScore: 0,
    awayScore: 0,
    quarters: { home: [0, 0, 0, 0], away: [0, 0, 0, 0] },
  }));
  store.replaceAll('games', reset);
  res.json(reset);
});

export default router;
