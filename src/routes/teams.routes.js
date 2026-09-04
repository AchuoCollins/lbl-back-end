import { Router } from 'express';
import store from '../db/store.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(store.all('teams'));
});

router.get('/:id', (req, res) => {
  const team = store.find('teams', req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  res.json(team);
});

router.post('/', requireAdmin, (req, res) => {
  const team = { ...req.body, id: Date.now() };
  store.insert('teams', team);

  const standings = store.all('standings');
  if (!standings.some((s) => s.team === team.name)) {
    store.insert('standings', { team: team.name, w: 0, l: 0 });
  }

  res.status(201).json(team);
});

router.put('/:id', requireAdmin, (req, res) => {
  const oldTeam = store.find('teams', req.params.id);
  if (!oldTeam) return res.status(404).json({ error: 'Team not found' });

  const updated = store.update('teams', req.params.id, req.body);

  if (req.body.name && req.body.name !== oldTeam.name) {
    const standings = store.all('standings').filter((s) => s.team !== oldTeam.name);
    standings.push({ team: req.body.name, w: 0, l: 0 });
    store.replaceAll('standings', standings);
  }

  res.json(updated);
});

router.delete('/:id', requireAdmin, (req, res) => {
  const team = store.find('teams', req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  store.remove('teams', req.params.id);
  store.replaceAll('standings', store.all('standings').filter((s) => s.team !== team.name));

  res.status(204).end();
});

export default router;
