import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import DriverDashboard from './pages/Driver/Dashboard';
import SalesDashboard from './pages/Sales/Dashboard';
import OwnerDashboard from './pages/Owner/Dashboard';
import NewCOD from './pages/Driver/CODUpload';
import CODList from './pages/CODlist';
import NewLeaseForm from './pages/Driver/LeaseReturnUpload';
import LeaseReturnsList from './pages/LeaseGallery';
import NewCarForm from './pages/Driver/NewCarUpload';
import CarGallery from './pages/CarGallery';
import NewDeliveryForm from './pages/Sales/CreateDelivery';
import ManDashboard from './pages/DriverManagement/Dashboard';
import CodFromDelivery from './pages/Driver/CodFromDelivery';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/sales/dashboard" element={<SalesDashboard />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/driver/cod/new" element={<NewCOD />} />
          <Route path="/allcods" element={<CODList />} />
          <Route path="/lease/create" element={<NewLeaseForm />} />
          <Route path="/driver/lease-returns" element={<LeaseReturnsList />} />
          <Route path="/new-car" element={<NewCarForm />} />
          <Route path="/cars" element={<CarGallery />} />
          <Route path="/sales/post-delivery" element={<NewDeliveryForm />} />
          <Route path="/management/dashboard" element={<ManDashboard />} />
          <Route path="/driver/cod/from-delivery/:id" element={<CodFromDelivery />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
