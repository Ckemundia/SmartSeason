import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function FieldForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', cropType: '', plantingDate: '', agentIds: [], milestones: []
  });
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/users/agents').then(res => setAgents(res.data)).catch(console.error);
  }, []);

  const handleAgentSelect = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
       if (options[i].selected) {
         selected.push(options[i].value);
       }
    }
    setFormData({...formData, agentIds: selected});
  };

  const addMilestone = () => {
    setFormData({...formData, milestones: [...formData.milestones, { name: '' }]});
  };

  const updateMilestone = (index, field, value) => {
    const newM = [...formData.milestones];
    newM[index][field] = value;
    setFormData({...formData, milestones: newM});
  };

  const removeMilestone = (index) => {
    const newM = [...formData.milestones];
    newM.splice(index, 1);
    setFormData({...formData, milestones: newM});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.agentIds.length === 0) {
      return setError('Please assign at least one person to the field.');
    }
    try {
      await api.post('/fields', formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create field');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Create New Field</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Field Name</label>
          <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">Crop Type</label>
          <input type="text" className="form-input" value={formData.cropType} onChange={e => setFormData({...formData, cropType: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">Planting Date</label>
          <input type="date" className="form-input" value={formData.plantingDate} onChange={e => setFormData({...formData, plantingDate: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">Assign Agents (Hold CTRL/CMD to select multiple)</label>
          <select multiple className="form-input" value={formData.agentIds} onChange={handleAgentSelect} style={{ height: '100px' }}>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.email})</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Custom Milestones
            <button type="button" className="btn btn-secondary" onClick={addMilestone} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>+ Add</button>
          </label>
          {formData.milestones.map((m, index) => (
            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input type="text" className="form-input" placeholder="Milestone Name" value={m.name} onChange={e => updateMilestone(index, 'name', e.target.value)} required />
              <button type="button" className="btn btn-secondary" onClick={() => removeMilestone(index)}>X</button>
            </div>
          ))}
        </div>

        {error && <div className="error-text">{error}</div>}
        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Create Field</button>
      </form>
    </div>
  );
}
