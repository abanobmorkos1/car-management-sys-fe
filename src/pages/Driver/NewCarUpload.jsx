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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Print as PrintIcon, Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import PDFDoc from '../../components/PDFDoc';

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
  const [showModal, setShowModal] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

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

  const handleDownloadPdf = async () => {
    try {
      const pages = [
        document.querySelector('#page-1'),
        document.querySelector('#page-2'),
        document.querySelector('#page-3'),
        document.querySelector('#page-4'),
        document.querySelector('#page-5'),
      ].filter((page) => page !== null);

      if (pages.length === 0) {
        throw new Error('No PDF pages found');
      }

      // Import jsPDF and html2canvas
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      // Create new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter',
      });

      // Process each page
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgWidth = 8.5;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add image to PDF, ensuring it fits on the page
        const maxHeight = 11; // Letter size height
        const finalHeight = imgHeight > maxHeight ? maxHeight : imgHeight;

        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, finalHeight);
      }

      // Save the PDF
      pdf.save(`Vehicle_Purchase_Agreement_${form.vin || 'draft'}.pdf`);

      setSnack({
        open: true,
        msg: 'PDF downloaded successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      setSnack({
        open: true,
        msg: 'Error generating PDF. Please try again.',
        severity: 'error',
      });
    }
  };

  const handlePDFSubmit = async (pdfData) => {
    console.log('PDF form data:', pdfData);

    try {
      setLoading(true);

      const pictureUrls = [];
      for (const pic of form.pictureFiles) {
        const key = await uploadToS3(pic, 'new-car', form.driver);
        if (key) pictureUrls.push(key);
      }

      const videoUrl = form.videoFile
        ? await uploadToS3(form.videoFile, 'new-car', form.driver)
        : null;

      const carRes = await fetch(`${api}/api/car`, {
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

      const carData = await carRes.json();
      if (!carRes.ok) {
        setSnack({
          open: true,
          msg: carData.message || 'Failed to submit car data',
          severity: 'error',
        });
        setShowModal(false);
        return;
      }

      // If car submission successful, submit PDF data
      const pdfRes = await fetch(`${api}/api/car/pdf-agreement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...pdfData,
          carId: carData._id,
        }),
      });

      if (pdfRes.ok) {
        setSnack({
          open: true,
          msg: 'Car and agreement submitted successfully!',
          severity: 'success',
        });
        setShowModal(false);
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
        navigate('/cars');
      } else {
        const pdfErrorData = await pdfRes.json();
        setSnack({
          open: true,
          msg: pdfErrorData.message || 'Failed to submit PDF agreement',
          severity: 'error',
        });
      }
    } catch (err) {
      console.error('Submission error:', err);
      setSnack({
        open: true,
        msg: 'Error during submission',
        severity: 'error',
      });
    } finally {
      setLoading(false);
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
      // Prepare PDF form data
      const pdfFormData = {
        nameOfConsumer: form.customerName,
        addressOfConsumer: form.customerAddress,
        leaseOrPurchase: 'Purchase',
        make: form.make,
        model: form.model,
        year: form.year,
        vin: form.vin,
        customOptions: '',
        modificationFacility: '',
        automobilePurchasedFrom: '',
        priceOfVehicle: '',
        estimatedPrice: '',
        estimatedDeliveryDate: '',
        placeOfDelivery: form.customerAddress,
        consumerSignature: '',
        vipSignature: '',
        signatureDate: new Date().toISOString().split('T')[0],
      };

      setSubmissionData(pdfFormData);
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

  const handleCloseModal = () => {
    setShowModal(false);
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
              <Typography variant="h6">Vehicle Purchase Agreement</Typography>
              <Box>
                <Button
                  startIcon={<PrintIcon />}
                  onClick={handleDownloadPdf}
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
                <PDFDoc data={submissionData} onSubmit={handlePDFSubmit} />
              )}
            </Box>
          </DialogContent>
        </Dialog>

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
