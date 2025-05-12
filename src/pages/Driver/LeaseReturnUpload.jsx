import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  Box, Button, Container, Typography, TextField,
  Paper, MenuItem, CircularProgress, Snackbar, Alert
} from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import trimCanvas from 'trim-canvas';

const api = process.env.REACT_APP_API_URL;

const NewLeaseForm = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    vin: '', miles: '', bank: '', customerName: '',
    address: '', city: '', state: '', zip: '', date: '',
    salesPerson: '', driver: '', damageReport: '',
    hasTitle: false, title: null, odometer: null, damagePictures: []
  });

  const [carInfo, setCarInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [salespeople, setSalespeople] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const signatureRef = useRef();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const salesRes = await fetch(`${api}/api/users/salespeople`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const driverRes = await fetch(`${api}/api/users/drivers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSalespeople(await salesRes.json());
        setDrivers(await driverRes.json());
      } catch (err) {
        console.error('❌ Failed to fetch user lists:', err);
      }
    };
    fetchUsers();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFile = (e) => {
    const { name, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'damagePictures' ? Array.from(files) : files[0]
    }));
  };

  const decodeVIN = async () => {
    try {
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${form.vin}?format=json`);
      const data = await res.json();
      const get = (label) => data.Results.find(r => r.Variable === label)?.Value || '';
      setCarInfo({
        year: get('Model Year'),
        make: get('Make'),
        model: get('Model'),
        trim: get('Trim'),
        fuelType: get('Fuel Type - Primary')
      });
    } catch (err) {
      console.error('VIN decode error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSnack({ open: false, msg: '', severity: 'success' });
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'damagePictures') {
          value.forEach(file => formData.append('damagePictures', file));
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value);
        }
      });

      formData.append('signatureBase64', signatureDataUrl);

      const res = await fetch(`${api}/lease/createlr`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setSnack({ open: true, msg: 'Lease return created successfully!', severity: 'success' });
        setTimeout(() => navigate('/driver/dashboard'), 2000);
      } else {
        setSnack({ open: true, msg: data.message || 'Submission failed', severity: 'error' });
      }
    } catch (err) {
      console.error('Lease submit error:', err);
      setSnack({ open: true, msg: 'Error during lease return', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 5 }}>
        <Typography variant="h5" mb={2}>New Lease Return</Typography>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <TextField fullWidth name="vin" label="VIN" value={form.vin} onChange={handleChange} required margin="normal" />
          <Button variant="outlined" onClick={decodeVIN} sx={{ mb: 2 }}>Decode VIN</Button>

          {carInfo && (
            <Box mb={2}>
              <Typography variant="body2">{carInfo.year} {carInfo.make} {carInfo.model} {carInfo.trim}</Typography>
              <Typography variant="body2">Fuel Type: {carInfo.fuelType}</Typography>
            </Box>
          )}

          <TextField fullWidth name="miles" label="Miles" type="number" value={form.miles} onChange={handleChange} required margin="normal" />
          <TextField fullWidth name="bank" label="Bank" value={form.bank} onChange={handleChange} required margin="normal" />
          <TextField fullWidth name="customerName" label="Customer Name" value={form.customerName} onChange={handleChange} required margin="normal" />
          <TextField fullWidth name="address" label="Address" value={form.address} onChange={handleChange} required margin="normal" />
          <TextField fullWidth name="city" label="City" value={form.city} onChange={handleChange} required margin="normal" />
          <TextField fullWidth name="state" label="State" value={form.state} onChange={handleChange} required margin="normal" />
          <TextField fullWidth name="zip" label="ZIP Code" value={form.zip} onChange={handleChange} required margin="normal" />
          <TextField fullWidth name="date" label="Date of Statement" type="date" value={form.date} onChange={handleChange} required margin="normal" InputLabelProps={{ shrink: true }} />

          <TextField select fullWidth name="salesPerson" label="Salesperson" value={form.salesPerson} onChange={handleChange} required margin="normal">
            {salespeople.map(sp => (
              <MenuItem key={sp._id} value={sp._id}>{sp.name || sp.email}</MenuItem>
            ))}
          </TextField>

          <TextField select fullWidth name="driver" label="Driver" value={form.driver} onChange={handleChange} required margin="normal">
            {drivers.map(d => (
              <MenuItem key={d._id} value={d._id}>{d.name || d.email}</MenuItem>
            ))}
          </TextField>

          <TextField fullWidth name="damageReport" label="Damage Report" value={form.damageReport} onChange={handleChange} margin="normal" multiline rows={2} />

          <Box mt={2}><Typography>Upload Odometer Picture *</Typography><input type="file" name="odometer" onChange={handleFile} required /></Box>
          <Box mt={2}><Typography>Upload Title Picture (if any)</Typography><input type="file" name="title" onChange={handleFile} /></Box>
          <Box mt={2}><Typography>Upload Damage Pictures</Typography><input type="file" name="damagePictures" multiple onChange={handleFile} /></Box>

          <Box mt={3}>
            <Typography variant="body1" mb={1}>Customer Signature</Typography>
            <Paper variant="outlined" sx={{ width: '100%', height: 150 }}>
              <SignatureCanvas ref={signatureRef} canvasProps={{ width: 500, height: 150, className: 'sigCanvas' }} />
            </Paper>
            <Box mt={1}>
              <Button
                onClick={() => {
                  if (signatureRef.current.isEmpty()) {
                    setSnack({ open: true, msg: 'Please sign before saving.', severity: 'warning' });
                    return;
                  }
                  const rawCanvas = signatureRef.current.getCanvas();
                  const trimmed = trimCanvas(rawCanvas);
                  const trimmedDataUrl = trimmed.toDataURL('image/png');
                  setSignatureDataUrl(trimmedDataUrl);
                  setSnack({ open: true, msg: 'Signature saved.', severity: 'success' });
                }}
                variant="outlined"
              >
                Save Signature
              </Button>
              <Button
                onClick={() => {
                  signatureRef.current.clear();
                  setSignatureDataUrl('');
                }}
                sx={{ ml: 2 }}
                color="error"
              >
                Clear
              </Button>
            </Box>
          </Box>

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </form>

        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert severity={snack.severity}>{snack.msg}</Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default NewLeaseForm;
