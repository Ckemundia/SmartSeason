import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function FieldDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [field, setField] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [stageRequestForm, setStageRequestForm] = useState(null);
  const [proofText, setProofText] = useState('');
  const [proofImage, setProofImage] = useState('');

  const STAGES = ['Planted', 'Growing', 'Ready', 'Harvested'];

  useEffect(() => {
    fetchFieldData();
  }, [id]);

  const fetchFieldData = async () => {
    try {
      const res = await api.get('/fields');
      const found = res.data.find(f => f.id === parseInt(id));
      if (!found) return navigate('/');
      
      setField({ ...found, notes: undefined });
      
      const notesRes = await api.get(`/fields/${id}/notes`);
      setNotes(notesRes.data);
    } catch (e) {
      console.error(e);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleStageClick = async (s) => {
    if (field.stage === s) return;
    if (user.role === 'ADMIN') {
      try {
        await api.put(`/fields/${id}`, { stage: s });
        fetchFieldData();
      } catch(e) { console.error(e); }
    } else {
      setStageRequestForm(s);
    }
  };

  const submitStageRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/stageRequests`, { 
        fieldId: id, 
        targetStage: stageRequestForm, 
        proof: proofText,
        proofImage: proofImage
      });
      alert('Stage change request submitted to Admin!');
      setStageRequestForm(null);
      setProofText('');
      setProofImage('');
    } catch(e) {
      alert(e.response?.data?.error || 'Failed to submit request');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProofImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await api.post(`/fields/${id}/notes`, { content: newNote });
      setNewNote('');
      fetchFieldData();
    } catch(e) { console.error(e); }
  };

  const handleRemoveAgent = async (agentIdToRemove) => {
    if (field.agentIds.length <= 1) {
      return alert("A field must have at least one assigned agent!");
    }
    if (!window.confirm('Are you sure you want to un-assign this agent?')) return;
    try {
      const newAgentIds = field.agentIds.filter(id => id !== agentIdToRemove);
      await api.put(`/fields/${id}`, { agentIds: newAgentIds });
      fetchFieldData();
    } catch(e) {
      console.error(e);
      alert('Failed to remove agent');
    }
  };

  const isAuthorizedToEdit = user.role === 'ADMIN' || (field?.agentIds && field.agentIds.includes(user.id));

  if (loading || !field) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: "2rem" }}>
        <h2>{field.name}</h2>
        <div>
          {field.milestones && field.milestones.map((m, i) => (
            <span key={i} className="badge badge-active" style={{ marginRight: '0.5rem' }}>{m.name}</span>
          ))}
          <span className={`badge badge-${field.computedStatus === 'At Risk' ? 'risk' : field.computedStatus === 'Completed' ? 'completed' : 'active'}`}>
            {field.computedStatus}
          </span>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: "2rem" }}>
        <div className="card">
          <h4>Details</h4>
          <p style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}><strong>Crop:</strong> {field.cropType}</p>
          <p style={{ marginBottom: '0.5rem' }}><strong>Planted:</strong> {new Date(field.plantingDate).toLocaleDateString()}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <strong>Agents:</strong> 
            {field.agents && field.agents.length > 0 ? field.agents.map(a => (
              <span key={a.id} className="badge badge-active" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.15rem 0.5rem' }}>
                {a.name}
                {user.role === 'ADMIN' && (
                  <span onClick={() => handleRemoveAgent(a.id)} style={{ cursor: 'pointer', fontSize: '1rem', title: 'Unassign Agent' }}>&times;</span>
                )}
              </span>
            )) : 'None'}
          </div>
        </div>
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h4>Stage Progression</h4>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {STAGES.map(s => (
              <button 
                key={s} 
                className={`btn ${field.stage === s ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleStageClick(s)}
                disabled={!isAuthorizedToEdit}
              >
                {s}
              </button>
            ))}
          </div>
          
          {stageRequestForm && (
            <div className="card" style={{ marginTop: '1rem', border: '1px solid var(--primary)', padding: '1rem', background: 'var(--bg-card)' }}>
              <h4>Request Stage Change to {stageRequestForm}</h4>
              <form onSubmit={submitStageRequest}>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Proof / Notes / Image Link</label>
                  <input type="text" className="form-input" value={proofText} onChange={e => setProofText(e.target.value)} placeholder="Text proof or link..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Or Upload Image File</label>
                  <input type="file" className="form-input" accept="image/*" onChange={handleImageUpload} style={{ paddingTop: '0.5rem' }} />
                </div>
                {proofImage && (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <img src={proofImage} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }} />
                    <button type="button" onClick={() => setProofImage(null)} style={{ background: 'var(--status-risk)', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.4rem 0.8rem', cursor: 'pointer' }}>Remove Image</button>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={!proofText && !proofImage}>Submit Request</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setStageRequestForm(null)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Observation Notes</h3>
        
        <form onSubmit={addNote} style={{ display: 'flex', gap: '1rem', margin: '1.5rem 0' }}>
          <input 
            type="text" 
            className="form-input" 
            value={newNote} 
            onChange={e => setNewNote(e.target.value)} 
            placeholder="Add new observation..." 
            disabled={!isAuthorizedToEdit}
          />
          <button type="submit" className="btn btn-primary" disabled={!isAuthorizedToEdit}>Add Note</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notes.map(note => (
            <div key={note.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge" style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.75rem', padding: '0.1rem 0.5rem' }}>
                  {note.authorName || 'Anonymous'}
                </span>
                <span>{new Date(note.createdAt).toLocaleString()}</span>
              </div>
              <p>{note.content}</p>
            </div>
          ))}
          {notes.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No notes recorded.</p>}
        </div>
      </div>
    </div>
  );
}
