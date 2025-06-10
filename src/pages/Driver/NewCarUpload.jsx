import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
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
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    pictureFiles: [],
    videoFile: null,
  });
  const navigate = useNavigate();
  const [salespeople, setSalespeople] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    msg: '',
    severity: 'success',
  });
  const [vinExists, setVinExists] = useState(false);
  const [vinChecking, setVinChecking] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const [salesRes, driverRes] = await Promise.all([
        fetch(`${api}/api/users/salespeople`, {
          credentials: 'include',
        }),
        fetch(`${api}/api/users/drivers`, {
          credentials: 'include',
        }),
      ]);
      setSalespeople(await salesRes.json());
      setDrivers(await driverRes.json());
    };
    fetchUsers();
  }, []);

  const allowVIN = async (vin) => {
    setVinChecking(true);
    if (vin.length < 17) {
      setVinExists(false);
      setVinChecking(false);
      return false;
    }

    try {
      const res = await fetch(`${api}/api/car/check-vin?vin=${vin}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();

      setVinExists(data.exists);
      setVinChecking(false);
      console.log({ returning: !data.exists });
      return !data.exists;
    } catch (err) {
      console.error('Error checking VIN:', err);
      setVinExists(false);
      setVinChecking(false);
      console.log({ returningE: false });
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'vin') {
      setVinChecking(false);
      setVinExists(false);
      if (value.length >= 17) {
        fetch(
          `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${value}?format=json`
        )
          .then((res) => res.json())
          .then((data) => {
            const get = (label) =>
              data.Results.find((r) => r.Variable === label)?.Value?.trim() ||
              '';
            setForm((prev) => ({
              ...prev,
              make: get('Make'),
              model: get('Model'),
              trim: get('Trim'),
              year: get('Model Year'),
            }));
          });
      }
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'pictureFiles') {
      setForm((prev) => ({ ...prev, pictureFiles: Array.from(files) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const uploadToS3 = async (file, category, customerName) => {
    let allowVin = await allowVIN(form.vin);
    console.log('Allow VIN 1:', allowVin);
    if (allowVin) {
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
            customerName,
          },
        }),
      });

      const { uploadUrl, key } = await res.json();
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      return key;
    } else {
      setSnack({
        open: true,
        msg: 'This Vin Already Exists. Please change the VIN before uploading files.',
        severity: 'error',
      });
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let allowVin = await allowVIN(form.vin);

    console.log('Allow VIN 2:', allowVin);
    if (!allowVin) {
      setSnack({
        open: true,
        msg: 'This VIN already exists. Please change the VIN before submitting.',
        severity: 'error',
      });
      return;
    }

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
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerAddress: form.customerAddress,
          pictureUrls,
          videoUrl,
        }),
      });

      if (res.ok) {
        setSnack({
          open: true,
          msg: 'Car posted successfully!',
          severity: 'success',
        });
        setForm({
          vin: '',
          year: '',
          make: '',
          model: '',
          trim: '',
          salesPersonid: '',
          driver: '',
          damageReport: '',
          customerName: '',
          customerPhone: '',
          customerAddress: '',
          pictureFiles: [],
          videoFile: null,
        });
        navigate('/driver/dashboard');
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Topbar />
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h5" mb={3}>
          New Car Post
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            name="vin"
            label="VIN"
            value={form.vin}
            onChange={handleChange}
            margin="normal"
            error={vinExists}
            helperText={
              vinChecking
                ? 'Checking VIN...'
                : vinExists
                  ? 'This VIN already exists. Please enter a different VIN.'
                  : ''
            }
          />
          <TextField
            fullWidth
            label="Make"
            value={form.make}
            disabled
            margin="dense"
          />
          <TextField
            fullWidth
            label="Model"
            value={form.model}
            disabled
            margin="dense"
          />
          <TextField
            fullWidth
            label="Trim"
            value={form.trim}
            disabled
            margin="dense"
          />
          <TextField
            fullWidth
            label="Year"
            value={form.year}
            disabled
            margin="dense"
          />

          <TextField
            select
            fullWidth
            name="salesPersonid"
            label="Salesperson"
            value={form.salesPersonid}
            onChange={handleChange}
            margin="normal"
            required
          >
            {salespeople.map((sp) => (
              <MenuItem key={sp._id} value={sp._id}>
                {sp.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            name="driver"
            label="Driver"
            value={form.driver}
            onChange={handleChange}
            margin="normal"
            required
          >
            {drivers.map((d) => (
              <MenuItem key={d._id} value={d._id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            name="customerName"
            label="Customer Name"
            value={form.customerName}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            name="customerPhone"
            label="Customer Phone"
            value={form.customerPhone}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            name="customerAddress"
            label="Customer Address"
            value={form.customerAddress}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={2}
            required
          />

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
            <input
              type="file"
              name="pictureFiles"
              accept="image/*"
              multiple
              required
              onChange={handleFileChange}
            />
          </Box>

          <Box mt={2}>
            <Typography>Upload Car Video</Typography>
            <input
              type="file"
              name="videoFile"
              accept="video/*"
              onChange={handleFileChange}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading || vinExists || vinChecking}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </form>

        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          <Alert
            severity={snack.severity}
            sx={{
              color: snack.severity === 'error' ? '#d32f2f' : 'inherit',
              '& .MuiAlert-message': {
                color: snack.severity === 'error' ? '#d32f2f' : 'inherit',
              },
            }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Container>
    </Container>
  );
};

export default NewCarForm;
