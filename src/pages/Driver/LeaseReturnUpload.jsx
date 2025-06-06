import React, { useState, useContext, useEffect } from 'react';
import {
  Box, Button, Container, Typography, TextField,
  Paper, MenuItem, CircularProgress, Snackbar, Alert , FormControlLabel , Checkbox ,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
const api = process.env.REACT_APP_API_URL;

const uploadToS3 = async (file, category, customerName) => {
  const res = await fetch(`${api}/api/s3/generate-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      uploadCategory: category,
      meta: { customerName }
    })
  });

  const { uploadUrl, key } = await res.json();

  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file
  });

  return key;
};

const NewLeaseForm = ({ prefill, fromDelivery = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    vin: '', miles: '', bank: '', customerName: '', address: '',
    city: '', state: '', zip: '', salesperson: '', driver: '',
    damageReport: '', hasTitle: false, odometer: null, title: null,
    leaseReturnMedia: [],
    year: '', make: '', model: '', trim: '', engine: '', driveType: '', fuelType: '', bodyStyle: '' , leftPlates: false,
  plateNumber: ''
  });

  const [salespeople, setSalespeople] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

    useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [salesRes, driverRes] = await Promise.all([
          fetch(`${api}/api/users/salespeople`, { credentials: 'include' }),
          fetch(`${api}/api/users/drivers`, { credentials: 'include' })
        ]);

        if (salesRes.ok) setSalespeople(await salesRes.json());
        if (driverRes.ok) setDrivers(await driverRes.json());
      } catch (err) {
        console.error('❌ Failed to fetch users:', err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
  if (fromDelivery && prefill) {
    setForm(prev => ({
      ...prev,
      year: prefill.year || '',
      make: prefill.make || '',
      model: prefill.model || '',
      trim: prefill.trim || '',
      customerName: prefill.customerName || '',
      address: prefill.address || '',
      salesPerson: prefill.salesPerson?._id || prefill.salesPerson || '',
      driver: prefill.driver?._id || prefill.driver,
      leftPlates: false,
      plateNumber: '',
    }));
  }
}, [prefill, fromDelivery]);

// Fetch salespeople, drivers, and delivery data (if any)
useEffect(() => {
  const fetchDeliveryAndPrefill = async () => {
    try {
      const res = await fetch(`${api}/api/delivery/by-delivery/${id}`, {
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch delivery');

      if (data.leaseReturn?.willReturn) {
  setForm(prev => ({
    ...prev,
    customerName: data.customerName || '',
    address: data.address || '',
    salesperson: data.salesperson?._id || data.salesperson || '',
    driver: data.driver?._id || data.driver || '',
    leftPlates: false,
    plateNumber: ''
  }));
}
    } catch (err) {
      console.error('❌ Failed to prefill lease return:', err);
    }
  };

  if (id) fetchDeliveryAndPrefill();
}, [id]);

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === 'checkbox' ? checked : value;
    setForm(prev => ({ ...prev, [name]: updatedValue }));

    if (name === 'vin' && value.length >= 17) {
      try {
        const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${value}?format=json`);
        const data = await res.json();
        const results = data.Results;
        const get = (label) => results.find(r => r.Variable === label)?.Value?.trim() || '';
        setForm(prev => ({
          ...prev,
          year: get('Model Year'),
          make: get('Make'),
          model: get('Model') || get('Series'),
          trim: get('Trim'),
          engine: get('Engine Model') || get('Engine Configuration'),
          driveType: get('Drive Type'),
          fuelType: get('Fuel Type - Primary'),
          bodyStyle: get('Body Class')
        }));
        setSnack({ open: true, msg: 'VIN decoded successfully', severity: 'success' });
      } catch (err) {
        console.error('VIN decode failed:', err);
        setSnack({ open: true, msg: 'Failed to decode VIN', severity: 'error' });
      }
    }
  };

  const handleFile = (e) => {
    const { name, files } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'leaseReturnMedia' ? Array.from(files) : files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSnack({ open: false, msg: '', severity: 'success' });
    setLoading(true);

    try {
      const odometerKey = await uploadToS3(form.odometer, 'lease-return', form.customerName);
      const titleKey = form.title ? await uploadToS3(form.title, 'lease-return', form.customerName) : null;

      const leaseReturnMediaKeys = [];
      for (const file of form.leaseReturnMedia) {
        const key = await uploadToS3(file, 'lease-return', form.customerName);
        leaseReturnMediaKeys.push(key);
      }

      const res = await fetch(`${api}/lease/createlr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          odometerKey,
          titleKey,
          leaseReturnMediaKeys
        })
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
        <form onSubmit={handleSubmit}>
          <TextField fullWidth name="vin" label="VIN" value={form.vin} onChange={handleChange} margin="normal" required />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1, mb: 2 }}>
            {form.year && (
              <Box>
                <Typography variant="caption" color="text.secondary">Year</Typography>
                <Typography variant="body2">{form.year}</Typography>
              </Box>
            )}
            {form.make && (
              <Box>
                <Typography variant="caption" color="text.secondary">Make</Typography>
                <Typography variant="body2">{form.make}</Typography>
              </Box>
            )}
            {form.model && (
              <Box>
                <Typography variant="caption" color="text.secondary">Model</Typography>
                <Typography variant="body2">{form.model}</Typography>
              </Box>
            )}
            {form.trim && (
              <Box>
                <Typography variant="caption" color="text.secondary">Trim</Typography>
                <Typography variant="body2">{form.trim}</Typography>
              </Box>
            )}
          </Box>

          <TextField fullWidth name="miles" label="Mileage" type="number" value={form.miles} onChange={handleChange} margin="normal" required />
          <TextField fullWidth name="bank" label="Bank" value={form.bank} onChange={handleChange} margin="normal" required />
          <TextField fullWidth name="customerName" label="Customer Name" value={form.customerName} onChange={handleChange} margin="normal" required />
          <TextField fullWidth name="address" label="Address" value={form.address} onChange={handleChange} margin="normal" required />
          <TextField fullWidth name="city" label="City" value={form.city} onChange={handleChange} margin="normal" required />
          <TextField fullWidth name="state" label="State" value={form.state} onChange={handleChange} margin="normal" required />
          <TextField fullWidth name="zip" label="Zip Code" value={form.zip} onChange={handleChange} margin="normal" required />

          <TextField fullWidth select name="salesPerson" label="salesperson" value={form.salespeople} onChange={handleChange} margin="normal" required>
            {salespeople.map(sp => (
              <MenuItem key={sp._id} value={sp._id}>{sp.name}</MenuItem>
            ))}
          </TextField>

          <TextField fullWidth select name="driver" label="Driver" value={form.driver} onChange={handleChange} margin="normal" required>
            {drivers.map(d => (
              <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
            ))}
          </TextField>

          <TextField fullWidth name="damageReport" label="Damage Report" value={form.damageReport} onChange={handleChange} margin="normal" multiline rows={3} />

          <Box mt={2}><Typography variant="body1">Upload Odometer Picture *</Typography><input type="file" name="odometer" accept="image/*" onChange={handleFile} required /></Box>
          <Box mt={2}><Typography variant="body1">Upload Title Picture (optional)</Typography><input type="file" name="title" accept="image/*" onChange={handleFile} /></Box>
          <Box mt={2}><Typography>Upload Lease Return Pictures/Videos</Typography><input type="file" name="leaseReturnMedia" accept="image/*,video/*" multiple onChange={handleFile} /></Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.leftPlates}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, leftPlates: e.target.checked }))
                }
              />
            }
            label="Customer left plates"
          />

          {form.leftPlates && (
            <TextField
              fullWidth
              name="plateNumber"
              label="Plate Number"
              value={form.plateNumber}
              onChange={(e) =>
                setForm(prev => ({ ...prev, plateNumber: e.target.value }))
              }
              margin="normal"
              required
            />
          )}

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
