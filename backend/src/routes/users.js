const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

router.get('/agents', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data: agents, error } = await db
      .from('users')
      .select('id, name, email')
      .eq('status', 'ACTIVE');
      
    if (error) throw error;
    res.json(agents || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch active agents' });
  }
});

router.get('/pending', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data: pendingUsers, error } = await db
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) throw error;
    // Map created_at to createdAt for frontend consistency
    const mapped = (pendingUsers || []).map(u => ({ ...u, createdAt: u.created_at }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch pending users' });
  }
});

router.put('/:id/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { error } = await db
      .from('users')
      .update({ status: 'ACTIVE' })
      .eq('id', userId);
      
    if (error) throw error;
    res.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

module.exports = router;
