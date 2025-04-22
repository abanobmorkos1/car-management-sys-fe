import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DriverDashboard from './pages/Driver/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
    {/* other role-based routes */}
      </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
