import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Typography, Paper, TextField, Button, MenuItem,
  Snackbar, Alert, CircularProgress, Box
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const api = process.env.REACT_APP_API_URL;

const uploadToS3 = async (file, category, token, meta) => {
  const res = await fetch(`${api}/api/s3/generate-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      uploadCategory: category,
      meta
    })
  });
  const { uploadUrl, key } = await res.json();
  await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
  return key;
};

const NewCarUpload = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    make: '', model: '', year: '', driver: '', salesPersonid: '', damageReport: '',
    carImages: [], carVideo: null, driverIdPicture: null
  });
  const [salespeople, setSalespeople] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => {
    const fetchUsers = async () => {
      const [salesRes, driverRes] = await Promise.all([
        fetch(`${api}/api/users/salespeople`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${api}/api/users/drivers`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setSalespeople(await salesRes.json());
      setDrivers(await driverRes.json());
    };
    fetchUsers();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const { name, files } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'carImages' ? Array.from(files) : files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSnack({ open: false, msg: '', severity: 'success' });

    try {
      const pictureKeys = [];
      for (const file of form.carImages) {
        const key = await uploadToS3(file, 'new-car', token, {
          year: form.year, make: form.make, salesPerson: form.salesPersonid
        });
        pictureKeys.push(key);
      }

      const videoKey = form.carVideo ? await uploadToS3(form.carVideo, 'new-car', token, {
        year: form.year, make: form.make, salesPerson: form.salesPersonid
      }) : null;

      const driverIdPictureKey = form.driverIdPicture ? await uploadToS3(form.driverIdPicture, 'new-car', token, {
        year: form.year, make: form.make, salesPerson: form.salesPersonid
      }) : null;

      const res = await fetch(`${api}/car/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          pictureKeys,
          videoKey,
          driverIdPictureKey
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSnack({ open: true, msg: 'New car uploaded!', severity: 'success' });
        setTimeout(() => navigate('/driver/dashboard'), 2000);
      } else {
        setSnack({ open: true, msg: data.message || 'Upload failed', severity: 'error' });
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setSnack({ open: true, msg: 'Something went wrong.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 5 }}>
        <Typography variant="h5" mb={2}>Upload New Car</Typography>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth name="make" label="Make" value={form.make} onChange={handleChange} margin="normal" required />
          <TextField fullWidth name="model" label="Model" value={form.model} onChange={handleChange} margin="normal" required />
          <TextField fullWidth name="year" label="Year" value={form.year} onChange={handleChange} margin="normal" required />

          <TextField fullWidth select name="salesPersonid" label="Salesperson" value={form.salesPersonid} onChange={handleChange} margin="normal" required>
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

          <Box mt={2}><Typography>Upload Car Pictures</Typography><input type="file" name="carImages" accept="image/*" multiple onChange={handleFile} /></Box>
          <Box mt={2}><Typography>Upload Car Video</Typography><input type="file" name="carVideo" accept="video/*" onChange={handleFile} /></Box>
          <Box mt={2}><Typography>Upload Driver ID Picture</Typography><input type="file" name="driverIdPicture" accept="image/*" onChange={handleFile} /></Box>

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

export default NewCarUpload;
