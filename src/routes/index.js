import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminsRoutes from './admins.routes.js';
import teamsRoutes from './teams.routes.js';
import gamesRoutes from './games.routes.js';
import newsRoutes from './news.routes.js';
import standingsRoutes from './standings.routes.js';
import ticketsRoutes from './tickets.routes.js';
import donationsRoutes from './donations.routes.js';
import supportTicketsRoutes from './supportTickets.routes.js';
import { collectionRouter } from './collection.routes.js';
import store from '../db/store.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admins', adminsRoutes);
router.use('/teams', teamsRoutes);
router.use('/games', gamesRoutes);
router.use('/news', newsRoutes);
router.use('/standings', standingsRoutes);
router.use('/tickets', ticketsRoutes);
router.use('/donations', donationsRoutes);
router.use('/support-tickets', supportTicketsRoutes);

router.use('/announcements', collectionRouter('announcements'));
router.use(
  '/highlights',
  collectionRouter('highlights', {
    decorateCreate: (item) => ({ ...item, views: 0, likes: 0 }),
  })
);

// Mirrors the site-wide "reset season" action in the admin dashboard.
router.post('/season/reset', requireAdmin, (req, res) => {
  const games = store.all('games').map((game) => ({
    ...game,
    status: 'UPCOMING',
    homeScore: 0,
    awayScore: 0,
    quarters: { home: [0, 0, 0, 0], away: [0, 0, 0, 0] },
  }));
  store.replaceAll('games', games);

  const standings = store.all('standings').map((team) => ({ ...team, w: 0, l: 0 }));
  store.replaceAll('standings', standings);

  res.json({ games, standings });
});

export default router;
