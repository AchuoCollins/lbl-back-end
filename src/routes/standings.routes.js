import { Router } from 'express';
import store from '../db/store.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(store.all('standings'));
});

router.post('/recalculate', requireAdmin, (req, res) => {
  const { homeTeam, awayTeam, homeScore, awayScore } = req.body || {};
  if (!homeTeam || !awayTeam || homeScore === undefined || awayScore === undefined) {
    return res.status(400).json({ error: 'homeTeam, awayTeam, homeScore and awayScore are required' });
  }

  let standings = [...store.all('standings')];

  if (!standings.some((s) => s.team === homeTeam)) {
    standings.push({ team: homeTeam, w: 0, l: 0 });
  }
  if (!standings.some((s) => s.team === awayTeam)) {
    standings.push({ team: awayTeam, w: 0, l: 0 });
  }

  standings = standings.map((team) => {
    if (team.team === homeTeam) {
      return {
        ...team,
        w: homeScore > awayScore ? (team.w || 0) + 1 : team.w || 0,
        l: homeScore < awayScore ? (team.l || 0) + 1 : team.l || 0,
      };
    }
    if (team.team === awayTeam) {
      return {
        ...team,
        w: awayScore > homeScore ? (team.w || 0) + 1 : team.w || 0,
        l: awayScore < homeScore ? (team.l || 0) + 1 : team.l || 0,
      };
    }
    return team;
  });

  store.replaceAll('standings', standings);
  res.json(standings);
});

router.post('/reset', requireAdmin, (req, res) => {
  const reset = store.all('standings').map((team) => ({ ...team, w: 0, l: 0 }));
  store.replaceAll('standings', reset);
  res.json(reset);
});

export default router;
