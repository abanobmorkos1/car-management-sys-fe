import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Box, Typography, Grid, Card, CardMedia, Chip } from '@mui/material';

const api = process.env.REACT_APP_API_URL;

const BonusGallery = () => {
  const { token } = useContext(AuthContext);
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const res = await fetch(`${api}/api/driver/my-uploads`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('🧪 API URL:', `${api}/api/driver/my-uploads`);
        const data = await res.json();
        setUploads(data);
      } catch (err) {
        console.error('Error fetching uploads:', err);
      }
    };

    fetchUploads();
  }, [token]);

  return (
    <Box>
      <Typography variant="h6" mb={2}>Your Uploaded Bonus Pictures</Typography>
      <Grid container spacing={2}>
        {uploads.map((upload) => (
          <Grid item xs={12} sm={6} md={4} key={upload._id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={upload.imageUrl}
                alt={upload.type}
              />
              <Box p={1}>
                <Chip label={upload.type.toUpperCase()} size="small" color={upload.type === 'review' ? 'success' : 'primary'} />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BonusGallery;
