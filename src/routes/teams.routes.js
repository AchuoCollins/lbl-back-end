import { Router } from 'express';
import store from '../db/store.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  res.json(await store.all('teams'));
});

router.get('/:id', async (req, res) => {
  const team = await store.find('teams', req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  res.json(team);
});

router.post('/', requireAdmin, async (req, res) => {
  const team = { ...req.body, id: Date.now() };
  await store.insert('teams', team);

  const standings = await store.all('standings');
  if (!standings.some((s) => s.team === team.name)) {
    await store.insert('standings', { team: team.name, w: 0, l: 0 });
  }

  res.status(201).json(team);
});

router.put('/:id', requireAdmin, async (req, res) => {
  const oldTeam = await store.find('teams', req.params.id);
  if (!oldTeam) return res.status(404).json({ error: 'Team not found' });

  const updated = await store.update('teams', req.params.id, req.body);

  if (req.body.name && req.body.name !== oldTeam.name) {
    const standings = (await store.all('standings')).filter((s) => s.team !== oldTeam.name);
    standings.push({ team: req.body.name, w: 0, l: 0 });
    await store.replaceAll('standings', standings);
  }

  res.json(updated);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const team = await store.find('teams', req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  await store.remove('teams', req.params.id);
  const standings = (await store.all('standings')).filter((s) => s.team !== team.name);
  await store.replaceAll('standings', standings);

  res.status(204).end();
});

export default router;
