import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Typography, Button, Stack, MenuItem, Select, InputLabel, FormControl, CircularProgress
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';

const api = process.env.REACT_APP_API_URL;
const REVIEW_RATE = 20;
const CUSTOMER_RATE = 5;

const BonusUpload = () => {
  const { user } = useContext(AuthContext);
  const [type, setType] = useState('review');
  const [file, setFile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUploads = async () => {
    try {
      const res = await fetch(`${api}/api/bonus/my-uploads`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUploads(data);
      }
    } catch (err) {
      console.error('Failed to fetch uploads:', err);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const fileName = file.name;
    const fileType = file.type;

    try {
      // Step 1: Get signed upload URL
      const res = await fetch(`${api}/api/aws/generate-url`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileType,
          uploadCategory: 'bonus',
          meta: {}, // not needed for bonus
        }),
      });

      const { uploadUrl, key } = await res.json();

      // Step 2: Upload file to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': fileType },
        body: file,
      });

      // Step 3: Save to DB
      const saveRes = await fetch(`${api}/api/bonus/upload`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, key }),
      });

      if (saveRes.ok) {
        setFile(null);
        setType('review');
        fetchUploads();
      } else {
        console.error('Failed to save bonus record');
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🧮 Totals
  const reviewCount = uploads.filter(u => u.type === 'review').length;
  const customerCount = uploads.filter(u => u.type === 'customer').length;
  const totalBonus = (reviewCount * REVIEW_RATE) + (customerCount * CUSTOMER_RATE);

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Upload Bonus Proof
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select value={type} label="Type" onChange={(e) => setType(e.target.value)}>
            <MenuItem value="review">Google Review Photo</MenuItem>
            <MenuItem value="customer">Customer Picture</MenuItem>
          </Select>
        </FormControl>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ flexGrow: 1 }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? <CircularProgress size={20} /> : 'Upload'}
        </Button>
      </Stack>

      {/* 🔢 Bonus Summary */}
      <Typography variant="subtitle1" fontWeight="bold" mt={2}>
        Weekly Bonus Summary
      </Typography>
      <Typography variant="body2">Review Photos: {reviewCount} × ${REVIEW_RATE} = ${reviewCount * REVIEW_RATE}</Typography>
      <Typography variant="body2">Customer Photos: {customerCount} × ${CUSTOMER_RATE} = ${customerCount * CUSTOMER_RATE}</Typography>
      <Typography variant="body2" fontWeight="bold">Total Bonus: ${totalBonus}</Typography>

      {/* 📋 Uploaded Entries */}
      <Typography variant="subtitle1" mt={3} gutterBottom>
        Your Uploaded Bonuses
      </Typography>

      <Stack spacing={1}>
        {uploads.length > 0 ? (
          uploads.map((u) => (
            <Box key={u._id} sx={{ border: '1px solid #ddd', borderRadius: 2, p: 1 }}>
              <Typography variant="body2" color="text.secondary">
                📤 <strong>{u.type}</strong> | {new Date(u.dateUploaded).toLocaleString()}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">No uploads found.</Typography>
        )}
      </Stack>
    </Box>
  );
};

export default BonusUpload;
