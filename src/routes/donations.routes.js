import { Router } from 'express';
import store from '../db/store.js';
import { requireAdmin } from '../middleware/auth.js';
import { generateRef } from '../utils/generateRef.js';

const router = Router();

router.get('/', requireAdmin, (req, res) => {
  res.json(store.all('donations'));
});

router.get('/:id', requireAdmin, (req, res) => {
  const donation = store.find('donations', req.params.id);
  if (!donation) return res.status(404).json({ error: 'Donation not found' });
  res.json(donation);
});

// Donations come from the public site, so this endpoint is open.
router.post('/', (req, res) => {
  const donation = {
    ...req.body,
    id: Date.now(),
    ref: req.body.ref || generateRef('LBL-D'),
    date: req.body.date || new Date().toISOString().slice(0, 10),
    status: req.body.status || 'CONFIRMED',
  };
  store.insert('donations', donation);

  res.status(201).json({
    donation,
    receipt: {
      type: 'donation',
      ref: donation.ref,
      name: donation.name || 'Anonymous',
      amount: donation.amount || 0,
      details: `${donation.category} · ${donation.method || 'Card'}`,
      category: donation.category,
      method: donation.method || 'Card',
      message: donation.message || '',
      date: donation.date,
      status: donation.status,
    },
  });
});

router.patch('/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'status is required' });

  const updated = store.update('donations', req.params.id, { status });
  if (!updated) return res.status(404).json({ error: 'Donation not found' });
  res.json(updated);
});

router.delete('/:id', requireAdmin, (req, res) => {
  const removed = store.remove('donations', req.params.id);
  if (!removed) return res.status(404).json({ error: 'Donation not found' });
  res.status(204).end();
});

export default router;
