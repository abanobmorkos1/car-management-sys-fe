import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Paper,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Print as PrintIcon, Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import Topbar from '../../components/Topbar';
import { AuthContext } from '../../contexts/AuthContext';
import OdometerAndDamageDisclosureForm from '../../components/OdometerAndDamageDisclosureForm';
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
      meta: { customerName },
    }),
  });

  const { uploadUrl, key } = await res.json();

  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  return key;
};

const NewLeaseForm = ({ prefill, fromDelivery = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    vin: '',
    miles: '',
    bank: '',
    customerName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    salesPerson: '',
    driver: '',
    damageReport: '',
    hasTitle: false,
    title: null,
    leaseReturnMedia: [],
    year: '',
    make: '',
    model: '',
    trim: '',
    engine: '',
    driveType: '',
    fuelType: '',
    bodyStyle: '',
    leftPlates: false,
    plateNumber: '',
  });

  const [salespeople, setSalespeople] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    msg: '',
    severity: 'success',
  });
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [salesRes, driverRes] = await Promise.all([
          fetch(`${api}/api/users/salespeople`, { credentials: 'include' }),
          fetch(`${api}/api/users/drivers`, { credentials: 'include' }),
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
      setForm((prev) => ({
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

  useEffect(() => {
    const fetchDeliveryAndPrefill = async () => {
      try {
        const res = await fetch(`${api}/api/delivery/by-delivery/${id}`, {
          credentials: 'include',
        });

        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || 'Failed to fetch delivery');

        if (data.leaseReturn?.willReturn) {
          setForm((prev) => ({
            ...prev,
            customerName: data.customerName || '',
            address: data.address || '',
            salesPerson: data.salesPerson?._id || data.salesPerson || '',
            driver: data.driver?._id || data.driver || '',
            leftPlates: false,
            plateNumber: '',
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
    setForm((prev) => ({ ...prev, [name]: updatedValue }));

    if (name === 'vin' && value.length >= 17) {
      try {
        const res = await fetch(
          `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${value}?format=json`
        );
        const data = await res.json();
        const results = data.Results;
        const get = (label) =>
          results.find((r) => r.Variable === label)?.Value?.trim() || '';
        setForm((prev) => ({
          ...prev,
          year: get('Model Year'),
          make: get('Make'),
          model: get('Model') || get('Series'),
          trim: get('Trim'),
          engine: get('Engine Model') || get('Engine Configuration'),
          driveType: get('Drive Type'),
          fuelType: get('Fuel Type - Primary'),
          bodyStyle: get('Body Class'),
        }));
        setSnack({
          open: true,
          msg: 'VIN decoded successfully',
          severity: 'success',
        });
      } catch (err) {
        console.error('VIN decode failed:', err);
        setSnack({
          open: true,
          msg: 'Failed to decode VIN',
          severity: 'error',
        });
      }
    }
  };

  const handleFile = (e) => {
    const { name, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'leaseReturnMedia' ? Array.from(files) : files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSnack({ open: false, msg: '', severity: 'success' });
    setLoading(true);

    try {
      const disclosureData = {
        vehicleInfo: {
          vehicleYear: form.year,
          make: form.make,
          model: form.model,
          bodyType: form.bodyStyle,
          vin: form.vin,
        },
        odometerInfo: {
          odometerReading: form.miles,
          odometerDigits: form.miles?.length.toString(),
          certification: {
            actualMileage: false,
            exceedsMechanicalLimits: false,
            odometerDiscrepancy: false,
          },
        },
        damageDisclosure: {
          status: 'has_not_been',
        },
        seller: {
          signature: '',
          name: form.customerName,
          address: {
            street: form.address,
            city: form.city,
            state: form.state,
            zipCode: form.zip,
          },
          dateOfStatement: new Date().toISOString(),
        },
        newOwner: {
          signature: '',
          name: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
          },
          dateOfStatement: new Date().toISOString(),
        },
      };

      setSubmissionData(disclosureData);
      setShowModal(true);
    } catch (err) {
      console.error('Error preparing form:', err);
      setSnack({
        open: true,
        msg: 'Error preparing form data',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const element = printRef.current;

    if (!element) {
      console.error('Print element not found');
      return;
    }

    const opt = {
      filename: `Odometer_Damage_Disclosure_${
        new Date().toISOString().split('T')[0]
      }.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
      },
      jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation: 'portrait',
      },
    };

    const printButtons = element.querySelectorAll('.no-print');
    printButtons.forEach((btn) => (btn.style.display = 'none'));

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        printButtons.forEach((btn) => (btn.style.display = ''));
      })
      .catch((error) => {
        console.error('PDF generation failed:', error);
        setSnack({
          open: true,
          msg: 'Failed to generate PDF',
          severity: 'error',
        });
        printButtons.forEach((btn) => (btn.style.display = ''));
      });
  };

  const handleDisclosureSubmit = async (disclosureFormData) => {
    console.log('Disclosure form data:', disclosureFormData);

    try {
      // First, submit the lease return
      const titleKey = form.title
        ? await uploadToS3(form.title, 'lease-return', form.customerName)
        : null;

      const leaseReturnMediaKeys = [];
      for (const file of form.leaseReturnMedia) {
        const key = await uploadToS3(file, 'lease-return', form.customerName);
        leaseReturnMediaKeys.push(key);
      }

      const leaseRes = await fetch(`${api}/lease/createlr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          titleKey,
          leaseReturnMediaKeys,
        }),
      });

      const leaseData = await leaseRes.json();
      if (!leaseRes.ok) {
        setSnack({
          open: true,
          msg: leaseData.message || 'Failed to submit lease return',
          severity: 'error',
        });
        setShowModal(false);
        return;
      }

      // If lease return successful, submit disclosure
      const disclosureRes = await fetch(`${api}/lease/odometer-disclosure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...disclosureFormData,
          leaseReturnId: leaseData._id,
        }),
      });

      if (disclosureRes.ok) {
        setSnack({
          open: true,
          msg: 'Lease return and disclosure submitted successfully!',
          severity: 'success',
        });
        setShowModal(false);

        if (user.role === 'Management') {
          navigate('/management/dashboard');
        } else {
          navigate('/driver/dashboard');
        }
      } else {
        const disclosureData = await disclosureRes.json();
        setSnack({
          open: true,
          msg: disclosureData.message || 'Failed to submit disclosure',
          severity: 'error',
        });
        console.error('Disclosure submission error:', disclosureData);
        // Keep modal open for disclosure errors
      }
    } catch (err) {
      console.error('Submission error:', err);
      setSnack({
        open: true,
        msg: 'Error during submission',
        severity: 'error',
      });
      // Keep modal open for unexpected errors
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Topbar />
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, mt: 5 }}>
          <Typography variant="h5" mb={3} textAlign="center">
            New Lease Return
          </Typography>
          <form onSubmit={handleSubmit}>
            <Typography variant="h6" mb={2} color="primary">
              Vehicle Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="vin"
                  label="VIN"
                  value={form.vin}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {(form.year || form.make || form.model || form.trim) && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 3,
                      flexWrap: 'wrap',
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                    }}
                  >
                    {form.year && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Year
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {form.year}
                        </Typography>
                      </Box>
                    )}
                    {form.make && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Make
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {form.make}
                        </Typography>
                      </Box>
                    )}
                    {form.model && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Model
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {form.model}
                        </Typography>
                      </Box>
                    )}
                    {form.trim && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Trim
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {form.trim}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="miles"
                  label="Mileage"
                  type="number"
                  value={form.miles}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="bank"
                  label="Bank"
                  value={form.bank}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" mb={2} color="primary">
              Customer Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="customerName"
                  label="Customer Name"
                  value={form.customerName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="address"
                  label="Address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  name="city"
                  label="City"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  name="state"
                  label="State"
                  value={form.state}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  name="zip"
                  label="Zip Code"
                  value={form.zip}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" mb={2} color="primary">
              Staff Assignment
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  name="salesPerson"
                  value={form.salesPerson}
                  onChange={handleChange}
                  required
                  sx={{
                    '& .MuiSelect-select': {
                      minHeight: '20px',
                      padding: '16px 14px',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1rem',
                    },
                  }}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected) => {
                      if (!selected) return <em>Select a salesperson</em>;
                      const salesPerson = salespeople.find(
                        (sp) => sp._id === selected
                      );
                      return salesPerson ? salesPerson.name : selected;
                    },
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    },
                  }}
                >
                  {salespeople.map((sp) => (
                    <MenuItem
                      key={sp._id}
                      value={sp._id}
                      sx={{ padding: '12px 16px' }}
                    >
                      {sp.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  name="driver"
                  value={form.driver}
                  onChange={handleChange}
                  required
                  sx={{
                    '& .MuiSelect-select': {
                      minHeight: '20px',
                      padding: '16px 14px',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1rem',
                    },
                  }}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected) => {
                      if (!selected) return <em>Select a driver</em>;
                      const driver = drivers.find((d) => d._id === selected);
                      return driver ? driver.name : selected;
                    },
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    },
                  }}
                >
                  {drivers.map((d) => (
                    <MenuItem
                      key={d._id}
                      value={d._id}
                      sx={{ padding: '12px 16px' }}
                    >
                      {d.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" mb={2} color="primary">
              Additional Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="damageReport"
                  label="Damage Report"
                  value={form.damageReport}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body1" mb={1} fontWeight="medium">
                    Upload Title Picture (optional)
                  </Typography>
                  <input
                    type="file"
                    name="title"
                    accept="image/*"
                    onChange={handleFile}
                    style={{ width: '100%' }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body1" mb={1} fontWeight="medium">
                    Upload Lease Return Media
                  </Typography>
                  <input
                    type="file"
                    name="leaseReturnMedia"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFile}
                    style={{ width: '100%' }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.leftPlates}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          leftPlates: e.target.checked,
                        }))
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
                      setForm((prev) => ({
                        ...prev,
                        plateNumber: e.target.value,
                      }))
                    }
                    sx={{ mt: 2 }}
                    required
                  />
                )}
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ minWidth: 200 }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Submit Lease Return'
                )}
              </Button>
            </Box>
          </form>
        </Paper>

        <Dialog
          open={showModal}
          onClose={handleCloseModal}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6">
                Odometer and Damage Disclosure Statement
              </Typography>
              <Box>
                <Button
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  variant="outlined"
                  sx={{ mr: 1 }}
                >
                  Print
                </Button>
                <IconButton onClick={handleCloseModal}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <Box
              ref={printRef}
              sx={{
                p: 2,
                backgroundColor: 'white',
                minHeight: '100vh',
                '& .no-print': {
                  '@media print': {
                    display: 'none !important',
                  },
                },
              }}
            >
              {submissionData && (
                <OdometerAndDamageDisclosureForm
                  data={submissionData}
                  onSubmit={handleDisclosureSubmit}
                />
              )}
            </Box>
          </DialogContent>
        </Dialog>

        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          <Alert severity={snack.severity}>{snack.msg}</Alert>
        </Snackbar>
      </Container>
    </Container>
  );
};

export default NewLeaseForm;
