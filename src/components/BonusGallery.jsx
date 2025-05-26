import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardMedia, Chip, CardActions,
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';

const api = process.env.REACT_APP_API_URL;

const BonusGallery = () => {
  const [uploads, setUploads] = useState([]);
  const [signedUrls, setSignedUrls] = useState({});
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const res = await fetch(`${api}/api/driver/my-uploads`, {
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setUploads(data);

        for (const upload of data) {
          if (upload.key) {
            fetchSignedUrl(upload.key, upload._id);
          } else {
            console.warn('⚠️ Missing key for upload:', upload._id);
          }
        }
      } else {
        console.error('❌ Failed to fetch uploads');
      }
    } catch (err) {
      console.error('❌ Error loading uploads:', err);
    }
  };

  const fetchSignedUrl = async (key, id) => {
    try {
      const res = await fetch(`${api}/api/get-image-url?key=${encodeURIComponent(key)}`, {
        credentials: 'include'
      });

      if (res.ok) {
        const { url } = await res.json();
        setSignedUrls(prev => ({ ...prev, [id]: url }));
      } else {
        console.error(`❌ Failed to get signed URL for: ${key}`);
      }
    } catch (err) {
      console.error('❌ Error fetching signed URL:', err);
    }
  };

  const confirmDelete = (id) => {
    setSelectedId(id);
    setOpenConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${api}/api/driver/delete-upload/${selectedId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setUploads(prev => prev.filter(upload => upload._id !== selectedId));
        setSignedUrls(prev => {
          const updated = { ...prev };
          delete updated[selectedId];
          return updated;
        });
      } else {
        console.error('❌ Delete failed');
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
    } finally {
      setOpenConfirm(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Your Uploaded Bonus Pictures
      </Typography>

      <Grid container spacing={2}>
        {uploads.map(upload => (
          <Grid item key={upload._id} xs={12} sm={6} md={4}>
            <Card>
              {signedUrls[upload._id] ? (
                <CardMedia
                  component="img"
                  height="180"
                  image={signedUrls[upload._id]}
                  alt={upload.type}
                  onError={(e) => {
                    console.error(`❌ Image failed to load for ID: ${upload._id}, key: ${upload.key}`);
                    e.target.src = '/fallback-image.png';
                  }}
                />
              ) : (
                <Box height={180} display="flex" alignItems="center" justifyContent="center">
                  <Typography variant="body2" color="textSecondary">Loading image...</Typography>
                </Box>
              )}

              <Box p={1}>
                <Chip
                  label={upload.type.toUpperCase()}
                  size="small"
                  color={upload.type === 'review' ? 'success' : 'primary'}
                />
              </Box>

              <CardActions>
                <Button
                  size="small"
                  color="error"
                  onClick={() => confirmDelete(upload._id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this bonus image? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BonusGallery;
