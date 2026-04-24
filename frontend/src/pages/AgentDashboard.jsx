import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Clock, CheckCircle } from 'lucide-react';

export default function AgentDashboard() {
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const res = await api.get('/fields');
      setFields(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>My Assigned Fields</h2>

      <div className="grid-3">
        {fields.map(f => (
          <div onClick={() => navigate(`/fields/${f.id}`)} key={f.id} className="card" style={{ transition: 'transform 0.2s', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-color)' }}>{f.name}</h3>
              <span className={`badge badge-${f.computedStatus === 'At Risk' ? 'risk' : f.computedStatus === 'Completed' ? 'completed' : 'active'}`}>
                {f.computedStatus}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}><strong>Crop:</strong> {f.cropType}</p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}><strong>Stage:</strong> {f.stage}</p>
          </div>
        ))}
        {fields.length === 0 && <p>No assigned fields found.</p>}
      </div>
    </div>
  );
}
