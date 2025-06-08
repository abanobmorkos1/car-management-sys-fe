import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  Chip,
  CardActions,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Paper,
  CardContent,
} from '@mui/material';
import { Image, Delete } from '@mui/icons-material';

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
        credentials: 'include',
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
      const res = await fetch(
        `${api}/api/get-image-url?key=${encodeURIComponent(key)}`,
        {
          credentials: 'include',
        }
      );

      if (res.ok) {
        const { url } = await res.json();
        setSignedUrls((prev) => ({ ...prev, [id]: url }));
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
        credentials: 'include',
      });

      if (res.ok) {
        setUploads((prev) =>
          prev.filter((upload) => upload._id !== selectedId)
        );
        setSignedUrls((prev) => {
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

      <Grid container spacing={3}>
        {uploads.map((upload) => (
          <Grid item key={upload._id} xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: 320, // Fixed height for consistency
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                boxShadow: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              {/* Always render image container with fixed height */}
              <Box sx={{ height: 200, position: 'relative' }}>
                {signedUrls[upload._id] ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={signedUrls[upload._id]}
                    alt={upload.type}
                    sx={{ objectFit: 'cover' }}
                    onError={(e) => {
                      console.error(
                        `❌ Image failed to load for ID: ${upload._id}, key: ${upload.key}`
                      );
                      e.target.src = '/fallback-image.png';
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f5f5f5',
                      color: '#bdbdbd',
                    }}
                  >
                    <Image sx={{ fontSize: 60 }} />
                  </Box>
                )}

                {/* Type badge */}
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <Chip
                    label={upload.type.toUpperCase()}
                    color={upload.type === 'review' ? 'success' : 'primary'}
                    size="small"
                    sx={{ fontWeight: 'medium' }}
                  />
                </Box>
              </Box>

              <CardContent
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    {upload.type === 'review'
                      ? 'Customer Review'
                      : 'Bonus Picture'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    align="center"
                    display="block"
                    sx={{ mt: 1 }}
                  >
                    {new Date(upload.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => confirmDelete(upload._id)}
                  startIcon={<Delete />}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    textTransform: 'none',
                  }}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center' }}>
            Are you sure you want to delete this upload? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={() => setOpenConfirm(false)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BonusGallery;
