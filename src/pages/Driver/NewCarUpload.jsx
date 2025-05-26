import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, TextField, Button, MenuItem,
  CircularProgress, Snackbar, Alert
} from '@mui/material';

const api = process.env.REACT_APP_API_URL;

const NewCarForm = () => {
  const [form, setForm] = useState({
    vin: '',
    year: '',
    make: '',
    model: '',
    trim: '',
    salesPersonid: '',
    driver: '',
    damageReport: '',
    pictureFiles: [],
    videoFile: null,
    driverIdPictureFile: null
  });

  const [salespeople, setSalespeople] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => {
    const fetchUsers = async () => {
      const [salesRes, driverRes] = await Promise.all([
        fetch(`${api}/api/users/salespeople`, {
          credentials: 'include'
        }),
        fetch(`${api}/api/users/drivers`, {
          credentials: 'include'
        })
      ]);
      setSalespeople(await salesRes.json());
      setDrivers(await driverRes.json());
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'vin' && value.length >= 17) {
      fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${value}?format=json`)
        .then(res => res.json())
        .then(data => {
          const get = (label) => data.Results.find(r => r.Variable === label)?.Value?.trim() || '';
          setForm(prev => ({
            ...prev,
            make: get('Make'),
            model: get('Model'),
            trim: get('Trim'),
            year: get('Model Year')
          }));
        });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'pictureFiles') {
      setForm(prev => ({ ...prev, pictureFiles: Array.from(files) }));
    } else {
      setForm(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const uploadToS3 = async (file, category, customerName) => {
    const res = await fetch(`${api}/api/s3/generate-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        uploadCategory: category,
        meta: {
          year: form.year,
          make: form.make,
          salesPerson: form.salesPersonid,
          customerName
        }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pictureUrls = [];
      for (const pic of form.pictureFiles) {
        const key = await uploadToS3(pic, 'new-car', form.driver);
        pictureUrls.push(key);
      }

      const videoUrl = form.videoFile
        ? await uploadToS3(form.videoFile, 'new-car', form.driver)
        : null;

      const driverIdPicture = form.driverIdPictureFile
        ? await uploadToS3(form.driverIdPictureFile, 'new-car', form.driver)
        : null;

      const res = await fetch(`${api}/api/car`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          vin: form.vin,
          make: form.make,
          model: form.model,
          trim: form.trim,
          year: parseInt(form.year),
          salesPerson: form.salesPersonid,
          driver: form.driver,
          damageReport: form.damageReport,
          pictureUrls,
          videoUrl,
          driverIdPicture
        })
      });

      if (res.ok) {
        setSnack({ open: true, msg: 'Car posted successfully!', severity: 'success' });
        setForm({
          vin: '',
          year: '',
          make: '',
          model: '',
          trim: '',
          salesPersonid: '',
          driver: '',
          damageReport: '',
          pictureFiles: [],
          videoFile: null,
          driverIdPictureFile: null
        });
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      setSnack({ open: true, msg: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" mb={3}>New Car Post</Typography>
      <form onSubmit={handleSubmit}>
        <TextField fullWidth name="vin" label="VIN" value={form.vin} onChange={handleChange} margin="normal" required />
        <TextField fullWidth label="Make" value={form.make} disabled margin="dense" />
        <TextField fullWidth label="Model" value={form.model} disabled margin="dense" />
        <TextField fullWidth label="Trim" value={form.trim} disabled margin="dense" />
        <TextField fullWidth label="Year" value={form.year} disabled margin="dense" />

        <TextField select fullWidth name="salesPersonid" label="Salesperson" value={form.salesPersonid} onChange={handleChange} margin="normal" required>
          {salespeople.map(sp => (
            <MenuItem key={sp._id} value={sp._id}>{sp.name}</MenuItem>
          ))}
        </TextField>

        <TextField select fullWidth name="driver" label="Driver" value={form.driver} onChange={handleChange} margin="normal" required>
          {drivers.map(d => (
            <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          name="damageReport"
          label="Damage Report"
          value={form.damageReport}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={3}
        />

        <Box mt={2}>
          <Typography>Upload Car Pictures</Typography>
          <input type="file" name="pictureFiles" accept="image/*" multiple onChange={handleFileChange} />
        </Box>

        <Box mt={2}>
          <Typography>Upload Car Video</Typography>
          <input type="file" name="videoFile" accept="video/*" onChange={handleFileChange} />
        </Box>

        <Box mt={2}>
          <Typography>Upload Driver ID</Typography>
          <input type="file" name="driverIdPictureFile" accept="image/*" onChange={handleFileChange} />
        </Box>

        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Submit'}
        </Button>
      </form>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Container>
  );
};

export default NewCarForm;
