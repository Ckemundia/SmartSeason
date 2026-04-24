import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import FieldDetails from './pages/FieldDetails';
import FieldForm from './pages/FieldForm';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" />;
  
  return children;
};

const MainDashboard = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  return user.role === 'ADMIN' ? <AdminDashboard /> : <AgentDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><MainDashboard /></ProtectedRoute>} />
              <Route path="/fields/new" element={<ProtectedRoute requiredRole="ADMIN"><FieldForm /></ProtectedRoute>} />
              <Route path="/fields/:id" element={<ProtectedRoute><FieldDetails /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
