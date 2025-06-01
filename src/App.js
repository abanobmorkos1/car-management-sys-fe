import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { blueGrey, indigo } from '@mui/material/colors';
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
import PrefilledCODWrapper from './components/PrefilledCODWrapper'; 

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: indigo[600],
      contrastText: '#ffffff'
    },
    secondary: {
      main: blueGrey[500],
      contrastText: '#ffffff'
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff'
    },
    text: {
      primary: '#1f2937',
      secondary: '#4b5563'
    }
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    allVariants: {
      color: '#1f2937'
    }
  }
});

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
          <Route path="/driver/cod/from-delivery/:id" element={<PrefilledCODWrapper />}  />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
