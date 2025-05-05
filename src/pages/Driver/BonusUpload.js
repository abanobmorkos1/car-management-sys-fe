import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext'; // adjust path if needed
import {
  Box, Button, Typography, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert
} from '@mui/material';

const BonusUpload = () => {
  const { token } = useContext(AuthContext);
  const [type, setType] = useState('review');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file || !type) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    try {
      const res = await fetch(`${process.env.REACT_APP_API}/driver/upload-bonus`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSnack({ open: true, msg: 'Upload successful!', severity: 'success' });
        setPreviewUrl(data.url);
      } else {
        setSnack({ open: true, msg: data.error || 'Upload failed.', severity: 'error' });
      }
    } catch (err) {
      setSnack({ open: true, msg: 'Error uploading.', severity: 'error' });
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
      {previewUrl && <img src={previewUrl} alt="preview" style={{ width: '100%', marginTop: 10 }} />}

      <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleUpload}>
        Upload
      </Button>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default BonusUpload;
