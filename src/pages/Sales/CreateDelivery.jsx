import React, { useState, useContext } from 'react';
import {
  TextField,
  MenuItem,
  Button,
  Container,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Autocomplete,
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';

const api = process.env.REACT_APP_API_URL;

const NewDeliveryForm = ({ onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    customerName: '',
    phoneNumber: '',
    address: '',
    pickupFrom: '',
    deliveryDate: '',
    codAmount: '',
    codCollected: false,
    codMethod: '',
    codCollectionDate: '',
    notes: '',
    vin: '',
    make: '',
    model: '',
    trim: '',
    color: '',
    year: '',
    transactionType: '', // lease or purchase
    dealershipName: '',
    deliveryPrice: '',
    leaseReturn: {
      willReturn: false,
      carYear: '',
      carMake: '',
      carModel: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    msg: '',
    severity: 'success',
  });

  const [dealerships, setDealerships] = useState([]);
  const [dealershipLoading, setDealershipLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('leaseReturn.')) {
      const field = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        leaseReturn: {
          ...(prev.leaseReturn || {}),
          [field]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    if (name === 'vin' && value.length >= 17) {
      fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${value}?format=json`
      )
        .then((res) => res.json())
        .then((data) => {
          if (!Array.isArray(data.Results)) return;
          const get = (label) =>
            data.Results.find((r) => r.Variable === label)?.Value?.trim() || '';
          setForm((prev) => ({
            ...prev,
            make: get('Make'),
            model: get('Model'),
            trim: get('Trim'),
            year: get('Model Year'),
          }));
        })
        .catch((err) => console.error('❌ VIN decode error:', err.message));
    }
  };

  const searchDealerships = async (searchTerm = '') => {
    setDealershipLoading(true);
    try {
      const res = await fetch(
        `${api}/api/delivery/dealerships?q=${encodeURIComponent(searchTerm)}`,
        {
          credentials: 'include',
        }
      );
      if (res.ok) {
        const data = await res.json();
        setDealerships(data);
      }
    } catch (err) {
      console.error('Error searching dealerships:', err);
    } finally {
      setDealershipLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        salesperson: user?._id,
      };
      if (!form.codCollected) {
        delete payload.codMethod;
        delete payload.codCollectionDate;
      }
      payload.deliveryDate = new Date(form.deliveryDate).toISOString();

      const res = await fetch(`${api}/api/delivery`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');
      setSnack({ open: true, msg: 'Delivery created!', severity: 'success' });
      onSuccess(data);
      setForm({
        customerName: '',
        phoneNumber: '',
        address: '',
        pickupFrom: '',
        deliveryDate: '',
        codAmount: '',
        codCollected: false,
        codMethod: '',
        codCollectionDate: '',
        notes: '',
        vin: '',
        make: '',
        model: '',
        trim: '',
        color: '',
        transactionType: '',
        dealershipName: '',
        deliveryPrice: '',
      });
    } catch (err) {
      setSnack({ open: true, msg: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" mb={3}>
        Post New Delivery
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          name="customerName"
          label="Customer Name"
          value={form.customerName}
          onChange={handleChange}
          margin="normal"
          required
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <TextField
          fullWidth
          name="phoneNumber"
          label="Phone Number"
          value={form.phoneNumber}
          onChange={handleChange}
          margin="normal"
          required
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <TextField
          fullWidth
          name="address"
          label="Delivery Address"
          value={form.address}
          onChange={handleChange}
          margin="normal"
          required
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <TextField
          fullWidth
          name="pickupFrom"
          label="Pick Up From"
          value={form.pickupFrom}
          onChange={handleChange}
          margin="normal"
          required
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <TextField
          fullWidth
          name="deliveryDate"
          label="Delivery Date"
          type="datetime-local"
          value={form.deliveryDate}
          onChange={handleChange}
          margin="normal"
          slotProps={{ inputLabel: { shrink: true } }}
          required
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        <TextField
          fullWidth
          name="codAmount"
          label="COD Amount"
          type="number"
          value={form.codAmount}
          onChange={handleChange}
          margin="normal"
          required
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        <TextField
          select
          fullWidth
          name="codCollected"
          label="COD Collected?"
          value={form.codCollected ? 'true' : 'false'}
          onChange={(e) =>
            handleChange({
              target: {
                name: 'codCollected',
                value: e.target.value === 'true',
              },
            })
          }
          margin="normal"
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        >
          <MenuItem value="false">No</MenuItem>
          <MenuItem value="true">Yes</MenuItem>
        </TextField>

        {form.codCollected && (
          <>
            <TextField
              select
              fullWidth
              name="codMethod"
              label="COD Method"
              value={form.codMethod}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Zelle">Zelle</MenuItem>
              <MenuItem value="Check">Check</MenuItem>
            </TextField>

            <TextField
              fullWidth
              name="codCollectionDate"
              label="COD Collection Date"
              type="date"
              value={form.codCollectionDate}
              onChange={handleChange}
              slotProps={{ inputLabel: { shrink: true } }}
              margin="normal"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </>
        )}

        <TextField
          select
          fullWidth
          name="transactionType"
          label="LeaseOrPurchase"
          value={form.transactionType}
          onChange={handleChange}
          margin="normal"
          required
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        >
          <MenuItem value="lease">Lease</MenuItem>
          <MenuItem value="purchase">Purchase</MenuItem>
        </TextField>

        <Autocomplete
          fullWidth
          options={dealerships}
          getOptionLabel={(option) =>
            typeof option === 'string' ? option : option.name
          }
          freeSolo
          value={form.dealershipName}
          onInputChange={(event, newValue) => {
            setForm((prev) => ({ ...prev, dealershipName: newValue }));
            searchDealerships(newValue);
          }}
          onChange={(event, newValue) => {
            const dealershipName =
              typeof newValue === 'string' ? newValue : newValue?.name || '';
            setForm((prev) => ({ ...prev, dealershipName }));
          }}
          loading={dealershipLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              name="dealershipName"
              label="Dealership Name"
              margin="normal"
              required
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              helperText="Type to search existing dealerships or add new"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {dealershipLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password',
                autoCorrect: 'off',
                autoCapitalize: 'off',
                spellCheck: 'false',
              }}
            />
          )}
        />

        <TextField
          fullWidth
          name="deliveryPrice"
          label="Price of Delivery / Estimated Price"
          type="number"
          value={form.deliveryPrice}
          onChange={handleChange}
          margin="normal"
          required
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        <Typography variant="h6" sx={{ mt: 3 }}>
          Lease Return
        </Typography>

        <TextField
          select
          fullWidth
          name="leaseReturn.willReturn"
          label="Will there be a lease return?"
          value={form.leaseReturn?.willReturn ? 'true' : 'false'}
          onChange={(e) =>
            handleChange({
              target: {
                name: 'leaseReturn.willReturn',
                value: e.target.value === 'true',
              },
            })
          }
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        >
          <MenuItem value="false">No</MenuItem>
          <MenuItem value="true">Yes</MenuItem>
        </TextField>
        {form.leaseReturn?.willReturn && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              name="leaseReturn.carYear"
              label="Lease Return Year"
              value={form.leaseReturn.carYear}
              onChange={handleChange}
              margin="dense"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <TextField
              fullWidth
              name="leaseReturn.carMake"
              label="Lease Return Make"
              value={form.leaseReturn.carMake}
              onChange={handleChange}
              margin="dense"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <TextField
              fullWidth
              name="leaseReturn.carModel"
              label="Lease Return Model"
              value={form.leaseReturn.carModel}
              onChange={handleChange}
              margin="dense"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </Box>
        )}

        <TextField
          fullWidth
          name="vin"
          label="VIN"
          value={form.vin}
          onChange={handleChange}
          margin="normal"
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <TextField
          fullWidth
          name="make"
          label="Make"
          value={form.make}
          onChange={handleChange}
          margin="dense"
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <TextField
          fullWidth
          name="model"
          label="Model"
          value={form.model}
          onChange={handleChange}
          margin="dense"
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <TextField
          fullWidth
          name="trim"
          label="Trim"
          value={form.trim}
          onChange={handleChange}
          margin="dense"
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <TextField
          fullWidth
          name="color"
          label="Color"
          value={form.color}
          onChange={handleChange}
          margin="dense"
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <TextField
          fullWidth
          name="year"
          label="Year"
          value={form.year}
          onChange={handleChange}
          margin="dense"
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <TextField
          fullWidth
          name="notes"
          label="Notes"
          multiline
          rows={3}
          value={form.notes}
          onChange={handleChange}
          margin="normal"
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Delivery'}
        </Button>
      </form>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Container>
  );
};

export default NewDeliveryForm;
