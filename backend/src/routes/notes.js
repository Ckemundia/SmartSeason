const express = require('express');
const { authenticate } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

router.post('/:fieldId/notes', authenticate, async (req, res) => {
  try {
    const fieldId = parseInt(req.params.fieldId);
    const { content } = req.body;
    
    const { data: field, error: fieldErr } = await db.from('fields').select('agent_ids').eq('id', fieldId).single();
    if (fieldErr || !field) return res.status(404).json({ error: 'Field not found' });

    if (req.user.role !== 'ADMIN' && (!field.agent_ids || !field.agent_ids.includes(req.user.id))) {
      return res.status(403).json({ error: 'Not authorized to comment on this field' });
    }

    const { data: author } = await db.from('users').select('name').eq('id', req.user.id).single();
    
    const { data: newNote, error } = await db.from('notes').insert([{
      content,
      field_id: fieldId,
      author_id: req.user.id,
      author_name: author ? author.name : 'Unknown'
    }]).select().single();

    if (error) throw error;

    res.status(201).json({ ...newNote, fieldId: newNote.field_id, authorId: newNote.author_id, authorName: newNote.author_name, createdAt: newNote.created_at });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

router.get('/:fieldId/notes', authenticate, async (req, res) => {
  try {
    const fieldId = parseInt(req.params.fieldId);
    
    const { data: field, error: fieldErr } = await db.from('fields').select('agent_ids').eq('id', fieldId).single();
    if (fieldErr || !field) return res.status(404).json({ error: 'Field not found' });

    if (req.user.role !== 'ADMIN' && (!field.agent_ids || !field.agent_ids.includes(req.user.id))) {
      return res.status(403).json({ error: 'Not authorized to view notes' });
    }

    const { data: fieldNotes, error } = await db.from('notes')
      .select('*')
      .eq('field_id', fieldId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json((fieldNotes || []).map(n => ({ ...n, fieldId: n.field_id, authorId: n.author_id, authorName: n.author_name, createdAt: n.created_at })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

module.exports = router;
