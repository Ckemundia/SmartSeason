import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sprout } from 'lucide-react';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', name: '', role: 'AGENT' });
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }
    try {
      await register(formData.email, formData.password, formData.name, formData.role);
      setSuccessMsg('Account registered successfully! Please wait for Admin approval before logging in.');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Sprout size={48} color="var(--primary)" />
          <h2>Create an Account</h2>
          <p style={{ color: 'var(--text-muted)' }}>Join SmartSeason Monitoring</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" minLength="8" className="form-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" minLength="8" className="form-input" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="AGENT">Field Agent</option>
              <option value="ADMIN">Admin (Coordinator)</option>
            </select>
          </div>
          {error && <div className="error-text">{error}</div>}
          {successMsg && <div style={{ color: 'var(--status-completed)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{successMsg}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={successMsg.length > 0}>Register</button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login here</Link>
        </div>
      </div>
    </div>
  );
}
