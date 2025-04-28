import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

const CODList = () => {
  const { token } = useContext(AuthContext);
  const [cods, setCODs] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for salesperson profile popup
  const [openProfile, setOpenProfile] = useState(false);
  const [selectedCOD, setSelectedCOD] = useState(null); // 👈 now we track whole COD, not just salesperson

  const handleOpenProfile = (cod) => {
    setSelectedCOD(cod);
    setOpenProfile(true);
  };

  const handleCloseProfile = () => {
    setOpenProfile(false);
    setSelectedCOD(null);
  };

  useEffect(() => {
    const fetchCODs = async () => {
      try {
        const res = await fetch('http://localhost:5000/cod/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('📥 Fetched CODs:', data); // See what it shows
    
        setCODs(data); // <== this must have salesperson.phoneNumber now
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch CODs:', err);
      }
    };

    fetchCODs();
  }, [token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        COD Collections
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Customer Name</strong></TableCell>
              <TableCell><strong>Salesperson</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Method</strong></TableCell>
              <TableCell><strong>Contract Picture</strong></TableCell>
              <TableCell><strong>Date Collected</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cods.map((cod) => (
              <TableRow key={cod._id}>
                <TableCell>{cod.customerName}</TableCell>
                <TableCell>
                  {cod.salesperson ? (
                    <Button variant="text" onClick={() => handleOpenProfile(cod)}>
                      {cod.salesperson.name}
                    </Button>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>${cod.amount.toFixed(2)}</TableCell>
                <TableCell>{cod.method}</TableCell>
                <TableCell>
            {cod.contractPicture ? (
              <a href={cod.contractPicture} target="_blank" rel="noopener noreferrer">
                <img 
                  src={cod.contractPicture} 
                  alt="Contract"
                  style={{ width: '100px', height: 'auto', borderRadius: '8px', cursor: 'pointer' }}
                />
              </a>
            ) : (
              '-'
            )}
          </TableCell>
                <TableCell>{new Date(cod.dateCollected).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Salesperson + Delivery Info Popup */}
      <Dialog open={openProfile} onClose={handleCloseProfile} fullWidth maxWidth="sm">
        <DialogTitle>Salesperson Profile & Delivery Info</DialogTitle>
        <DialogContent dividers>
          {selectedCOD && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Salesperson Info */}
              <Typography variant="h6">Salesperson</Typography>
              <Typography variant="body1">Name: {selectedCOD.salesperson?.name || '-'}</Typography>
              <Typography variant="body1">
              <Typography variant="body1">
            Phone: {selectedCOD.salesperson?.phoneNumber ? (
              <a href={`tel:${selectedCOD.salesperson.phoneNumber}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {selectedCOD.salesperson.phoneNumber}
              </a>
            ) : '-'}
          </Typography>

      </Typography>
              <Typography variant="body1">Email: {selectedCOD.salesperson?.email || '-'}</Typography>

              {/* Delivery Details */}
              <Typography variant="h6" mt={2}>Delivery Details</Typography>
              <Typography variant="body2">Customer: {selectedCOD.customerName || '-'}</Typography>
              <Typography variant="body2">Address: {selectedCOD.address || '-'}</Typography>
              <Typography variant="body2">
                Driver: {selectedCOD.driver?.name || selectedCOD.driver || '-'}
              </Typography>
              <Typography variant="body2">
                Car: {selectedCOD.car?.year} {selectedCOD.car?.make} {selectedCOD.car?.model}
              </Typography>
       
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProfile}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CODList;
