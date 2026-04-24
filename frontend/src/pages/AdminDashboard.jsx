import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { PlusCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stageRequests, setStageRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fieldsRes, usersRes, requestsRes] = await Promise.all([
        api.get('/fields'),
        api.get('/users/pending'),
        api.get('/stageRequests')
      ]);
      setFields(fieldsRes.data);
      setPendingUsers(usersRes.data);
      setStageRequests(requestsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCounts = () => {
    const counts = { Active: 0, 'At Risk': 0, Completed: 0 };
    fields.forEach(f => {
      if (counts[f.computedStatus] !== undefined) {
        counts[f.computedStatus]++;
      }
    });
    return counts;
  };

  const handleApproveUser = async (userId) => {
    try {
      await api.put(`/users/${userId}/approve`);
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (e) {
      console.error(e);
      alert('Failed to approve user');
    }
  };

  const handleStageRequest = async (id, action) => {
    try {
      await api.put(`/stageRequests/${id}`, { action });
      fetchData(); // reload all data to get updated fields and requests
    } catch (e) {
      console.error(e);
      alert(`Failed to ${action} request`);
    }
  };

  if (loading) return <div>Loading...</div>;

  const stats = getStatusCounts();

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <h2>Admin Overview</h2>
        <Link to="/fields/new" className="btn btn-primary"><PlusCircle size={18} /> New Field</Link>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button className={`btn ${activeTab === 'OVERVIEW' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('OVERVIEW')}>Fields Overview</button>
        <button className={`btn ${activeTab === 'PENDING_USERS' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('PENDING_USERS')}>
          Pending Users {pendingUsers.length > 0 && <span className="badge badge-risk" style={{ marginLeft: '0.5rem' }}>{pendingUsers.length}</span>}
        </button>
        <button className={`btn ${activeTab === 'STAGE_REQUESTS' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('STAGE_REQUESTS')}>
          Stage Requests {stageRequests.length > 0 && <span className="badge badge-risk" style={{ marginLeft: '0.5rem' }}>{stageRequests.length}</span>}
        </button>
      </div>

      {activeTab === 'OVERVIEW' && (
        <>
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Clock size={32} color="var(--status-active)" />
              <div><p>Active</p><h3>{stats.Active}</h3></div>
            </div>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <AlertTriangle size={32} color="var(--status-risk)" />
              <div><p>At Risk</p><h3>{stats['At Risk']}</h3></div>
            </div>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle size={32} color="var(--status-completed)" />
              <div><p>Completed</p><h3>{stats.Completed}</h3></div>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem' }}>All Fields</h3>
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
                  <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}><strong>Assignees:</strong> {f.agents && f.agents.length > 0 ? f.agents.map(a => a.name).join(', ') : 'Unassigned'}</p>
                </div>
              ))}
              {fields.length === 0 && <p>No fields found</p>}
            </div>
          </div>
        </>
      )}

      {activeTab === 'PENDING_USERS' && (
        <div className="card">
          <h3>Users Pending Approval</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem' }}>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="badge badge-active">{u.role}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => handleApproveUser(u.id)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Approve</button>
                  </td>
                </tr>
              ))}
              {pendingUsers.length === 0 && <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No pending users waiting for approval</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'STAGE_REQUESTS' && (
        <div className="card">
          <h3>Pending Stage Change Requests</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem' }}>Field</th>
                <th>Requested By</th>
                <th>Current → Target</th>
                <th>Agent Proof/Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stageRequests.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{r.fieldName}</td>
                  <td>{r.agentName}</td>
                  <td>{r.currentStage} &rarr; <strong>{r.targetStage}</strong></td>
                  <td>
                    <em>"{r.proof}"</em>
                    {r.proofImage && <div style={{ marginTop: '0.5rem' }}><img src={r.proofImage} alt="Proof" style={{ maxWidth: '100px', borderRadius: '4px', cursor: 'zoom-in' }} onClick={() => window.open(r.proofImage, '_blank')} /></div>}
                  </td>
                  <td style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
                    <button className="btn btn-primary" onClick={() => handleStageRequest(r.id, 'APPROVE')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Approve</button>
                    <button className="btn btn-secondary" onClick={() => handleStageRequest(r.id, 'REJECT')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Reject</button>
                  </td>
                </tr>
              ))}
              {stageRequests.length === 0 && <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No pending stage requests</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
