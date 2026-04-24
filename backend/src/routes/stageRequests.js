const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data: requests, error } = await db.from('stage_requests').select(`
      *,
      fields (name, stage),
      users (name)
    `).eq('status', 'PENDING').order('created_at', { ascending: false });

    if (error) throw error;

    const mapped = (requests || []).map(r => ({
      id: r.id,
      fieldId: r.field_id,
      agentId: r.agent_id,
      fieldName: r.fields?.name || 'Unknown',
      currentStage: r.fields?.stage || 'Unknown',
      agentName: r.users?.name || 'Unknown',
      targetStage: r.target_stage,
      proof: r.proof,
      proofImage: r.proof_image,
      status: r.status,
      createdAt: r.created_at
    }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stage requests' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { fieldId, targetStage, proof, proofImage } = req.body;
    
    const { data: field, error: fieldErr } = await db.from('fields').select('agent_ids').eq('id', parseInt(fieldId)).single();
    if (fieldErr || !field) return res.status(404).json({ error: 'Field not found' });
    
    const authorized = req.user.role === 'ADMIN' || (field.agent_ids && field.agent_ids.includes(req.user.id));
    if (!authorized) {
      return res.status(403).json({ error: 'Not authorized for this field' });
    }

    const { data: newRequest, error } = await db.from('stage_requests').insert([{
      field_id: parseInt(fieldId),
      agent_id: req.user.id,
      target_stage: targetStage,
      proof,
      proof_image: proofImage,
      status: 'PENDING'
    }]).select().single();

    if (error) throw error;
    res.status(201).json(newRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit stage request' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { action } = req.body;
    
    const { data: request, error: reqErr } = await db.from('stage_requests').select('*').eq('id', parseInt(req.params.id)).single();
    if (reqErr || !request) return res.status(404).json({ error: 'Request not found' });
    
    const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    
    const { error: updateErr } = await db.from('stage_requests').update({ status }).eq('id', request.id);
    if (updateErr) throw updateErr;

    if (action === 'APPROVE') {
       await db.from('fields').update({ stage: request.target_stage, updated_at: new Date() }).eq('id', request.field_id);
    }
    
    res.json({ message: `Request ${action}D successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update stage request' });
  }
});

module.exports = router;
