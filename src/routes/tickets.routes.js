import { Router } from 'express';
import store from '../db/store.js';
import { requireAdmin } from '../middleware/auth.js';
import { generateRef } from '../utils/generateRef.js';

const router = Router();

router.get('/', requireAdmin, async (req, res) => {
  res.json(await store.all('tickets'));
});

router.get('/:id', requireAdmin, async (req, res) => {
  const ticket = await store.find('tickets', req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

// Ticket purchases come from the public site, so this endpoint is open.
router.post('/', async (req, res) => {
  const ticket = {
    ...req.body,
    id: Date.now(),
    ref: req.body.ref || generateRef('LEBL'),
    date: req.body.date || new Date().toISOString().slice(0, 10),
    status: req.body.status || 'CONFIRMED',
  };
  await store.insert('tickets', ticket);

  res.status(201).json({
    ticket,
    receipt: {
      type: 'ticket',
      ref: ticket.ref,
      name: ticket.name || 'Fan',
      amount: ticket.amount || 0,
      details: `${ticket.game} · ${ticket.quantity} × ${ticket.type}`,
      game: ticket.game,
      typeLabel: ticket.type,
      quantity: ticket.quantity,
      date: ticket.date,
      status: ticket.status,
    },
  });
});

router.patch('/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'status is required' });

  const updated = await store.update('tickets', req.params.id, { status });
  if (!updated) return res.status(404).json({ error: 'Ticket not found' });
  res.json(updated);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const removed = await store.remove('tickets', req.params.id);
  if (!removed) return res.status(404).json({ error: 'Ticket not found' });
  res.status(204).end();
});

export default router;
