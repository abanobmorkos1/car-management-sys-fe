import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import {
  Box, Button, Typography, MenuItem, Select, InputLabel,
  FormControl, Snackbar, Alert
} from '@mui/material';

const api = process.env.REACT_APP_API_URL;

const BonusUpload = ({ onCountUpdate }) => {
  const { token } = useContext(AuthContext);
  const [type, setType] = useState('review');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];

    if (!selected) {
      setFile(null);
      setPreviewUrl('');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selected.type)) {
      setSnack({ open: true, msg: 'Only JPG, PNG, or WEBP files allowed', severity: 'error' });
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setSnack({ open: true, msg: 'File too large (max 5MB)', severity: 'error' });
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const fetchAndUpdateCounts = async () => {
    try {
      const res = await fetch(`${api}/api/driver/my-uploads`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) return;

      const data = await res.json();
      const reviewCount = data.filter(u => u.type === 'review').length;
      const customerCount = data.filter(u => u.type === 'customer').length;

      if (onCountUpdate) {
        onCountUpdate({ review: reviewCount, customer: customerCount });
      }
    } catch (err) {
      console.error('🔴 Failed to fetch uploads for count:', err);
    }
  };

  const handleUpload = async () => {
    if (!file || !type) return;

    try {
      // Step 1: Get pre-signed S3 upload URL
      const urlRes = await fetch(
        `${api}/api/get-upload-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}&folder=bonuses`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!urlRes.ok) throw new Error('Failed to get signed URL');

      const { url, key } = await urlRes.json();

      // Step 2: Upload the file to S3
      const uploadRes = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error('S3 upload failed');

      // Step 3: Save the file key to the backend
      const saveRes = await fetch(`${api}/api/driver/save-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ key, type }),
      });

      if (!saveRes.ok) throw new Error('Failed to save upload');

      setSnack({ open: true, msg: 'Upload successful!', severity: 'success' });
      setFile(null);
      setPreviewUrl('');
      fetchAndUpdateCounts();
    } catch (err) {
      console.error('❌ Upload error:', err);
      setSnack({ open: true, msg: err.message || 'Upload failed.', severity: 'error' });
    }
  };

  return (
    <Box>
      <Typography variant="h6" mb={1}>Upload Bonus Image</Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Type</InputLabel>
        <Select value={type} label="Type" onChange={(e) => setType(e.target.value)}>
          <MenuItem value="review">Review Photo ($25)</MenuItem>
          <MenuItem value="customer">Customer Photo ($5)</MenuItem>
        </Select>
      </FormControl>

      <input type="file" accept="image/*" onChange={handleFileChange} />
      {previewUrl && (
        <img
          src={previewUrl}
          alt="preview"
          style={{ width: '100%', marginTop: 10, borderRadius: 8 }}
        />
      )}

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleUpload}
        disabled={!file}
      >
        Upload
      </Button>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default BonusUpload;
