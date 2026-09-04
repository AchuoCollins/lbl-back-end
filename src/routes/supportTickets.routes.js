import { Router } from 'express';
import store from '../db/store.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAdmin, (req, res) => {
  res.json(store.all('supportTickets'));
});

// Support requests come from the public Support page, so this endpoint is open.
router.post('/', (req, res) => {
  const ticket = {
    ...req.body,
    id: Date.now(),
    ticketRef: 'SUP-' + Date.now().toString().slice(-6),
    status: req.body.status || 'PENDING',
    createdAt: new Date().toISOString(),
  };
  store.insert('supportTickets', ticket);
  res.status(201).json(ticket);
});

router.patch('/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'status is required' });

  const updated = store.update('supportTickets', req.params.id, {
    status,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return res.status(404).json({ error: 'Support ticket not found' });
  res.json(updated);
});

router.delete('/:id', requireAdmin, (req, res) => {
  const removed = store.remove('supportTickets', req.params.id);
  if (!removed) return res.status(404).json({ error: 'Support ticket not found' });
  res.status(204).end();
});

export default router;
