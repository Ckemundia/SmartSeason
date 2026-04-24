const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

const computeStatus = (stage, plantingDate, notes) => {
  if (stage === 'Harvested') return 'Completed';
  
  let riskOverride = false;
  if (notes && notes.length > 0) {
    const latestNote = notes[notes.length - 1];
    if (latestNote.content.toLowerCase().includes('risk') || latestNote.content.toLowerCase().includes('problem')) {
      riskOverride = true;
    }
  }

  if (stage === 'Planted' && plantingDate) {
    const daysSincePlanted = (new Date() - new Date(plantingDate)) / (1000 * 60 * 60 * 24);
    if (daysSincePlanted > 14) return 'At Risk';
  }
  
  if (riskOverride) return 'At Risk';
  return 'Active';
};

router.get('/', authenticate, async (req, res) => {
  try {
    const { data: fields, error: fetchErr } = await db.from('fields').select('*, notes(*)').order('created_at', { ascending: false });
    if (fetchErr) throw fetchErr;
    
    // Fetch users for mapping agent logic quickly
    const { data: users } = await db.from('users').select('id, name, email');
    
    let filteredFields = fields || [];
    if (req.user.role !== 'ADMIN') {
      filteredFields = filteredFields.filter(f => f.agent_ids && f.agent_ids.includes(req.user.id));
    }
    
    const enrichedFields = filteredFields.map(field => {
      const fieldAgents = (users || []).filter(u => field.agent_ids && field.agent_ids.includes(u.id));
      const fieldNotes = field.notes || [];
      const mappedNotes = fieldNotes.map(n => ({ ...n, fieldId: n.field_id, createdAt: n.created_at }));

      return {
        ...field,
        plantingDate: field.planting_date,
        cropType: field.crop_type,
        agentIds: field.agent_ids,
        createdAt: field.created_at,
        agents: fieldAgents.map(a => ({ name: a.name, email: a.email, id: a.id })),
        notes: mappedNotes,
        computedStatus: computeStatus(field.stage, field.planting_date, mappedNotes)
      };
    });
    
    res.json(enrichedFields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch fields' });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, cropType, plantingDate, stage, agentIds, milestones } = req.body;
    
    const parsedAgentIds = Array.isArray(agentIds) ? agentIds.map(id => parseInt(id)) : [];
    if (parsedAgentIds.length === 0) {
      return res.status(400).json({ error: 'Must assign at least one person to the field.' });
    }

    const { data: newField, error } = await db.from('fields').insert([{
      name,
      crop_type: cropType,
      planting_date: new Date(plantingDate),
      stage: stage || 'Planted',
      agent_ids: parsedAgentIds,
      milestones: Array.isArray(milestones) ? milestones : []
    }]).select().single();

    if (error) throw error;
    res.status(201).json({ ...newField, plantingDate: newField.planting_date, cropType: newField.crop_type, agentIds: newField.agent_ids });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create field' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { stage, agentIds, milestones, name, cropType, plantingDate } = req.body;
    
    const { data: existingField, error: findError } = await db.from('fields').select('*').eq('id', id).single();
    if (findError || !existingField) return res.status(404).json({ error: 'Field not found' });
    
    if (req.user.role !== 'ADMIN' && (!existingField.agent_ids || !existingField.agent_ids.includes(req.user.id))) {
      return res.status(403).json({ error: 'Not authorized to update this field' });
    }

    const updatePayload = { updated_at: new Date() };
    if (stage) updatePayload.stage = stage;
    
    if (req.user.role === 'ADMIN') {
      if (agentIds !== undefined) updatePayload.agent_ids = Array.isArray(agentIds) ? agentIds.map(i => parseInt(i)) : [];
      if (milestones !== undefined) updatePayload.milestones = milestones;
      if (name) updatePayload.name = name;
      if (cropType) updatePayload.crop_type = cropType;
      if (plantingDate) updatePayload.planting_date = new Date(plantingDate);
    }
    
    const { data: updatedField, error } = await db.from('fields').update(updatePayload).eq('id', id).select().single();
    if (error) throw error;

    res.json({ ...updatedField, plantingDate: updatedField.planting_date, cropType: updatedField.crop_type, agentIds: updatedField.agent_ids });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update field' });
  }
});

module.exports = router;
