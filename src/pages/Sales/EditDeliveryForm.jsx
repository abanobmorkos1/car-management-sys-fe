import React, { useState } from 'react';
import {
  DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Snackbar, Alert
} from '@mui/material';

const EditDeliveryForm = ({ delivery, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    address: delivery.address || '',
    deliveryDate: delivery.deliveryDate?.split('T')[0] || '',
    codAmount: delivery.codAmount || '',
    codMethod: delivery.codMethod || '',
    notes: delivery.notes || ''
  });

  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/delivery/edit/${delivery._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess(data.delivery || data); // compatible with both response formats
        setSnack({ open: true, message: 'Delivery updated and driver notified!', severity: 'success' });
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: err.message || 'Update failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogTitle>Edit Delivery</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <TextField name="address" label="Address" fullWidth value={form.address} onChange={handleChange} />
          <TextField name="deliveryDate" label="Delivery Date" type="date" fullWidth value={form.deliveryDate} onChange={handleChange} />
          <TextField name="codAmount" label="COD Amount" type="number" fullWidth value={form.codAmount} onChange={handleChange} />

          {/* Show COD Method only if COD Amount is provided */}
          {form.codAmount && (
            <TextField
              name="codMethod"
              label="COD Method"
              fullWidth
              value={form.codMethod}
              onChange={handleChange}
            />
          )}

          <TextField
            name="notes"
            label="Notes"
            fullWidth
            value={form.notes}
            onChange={handleChange}
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </>
  );
};

export default EditDeliveryForm;
