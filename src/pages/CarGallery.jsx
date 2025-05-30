import React, { useEffect, useState } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, CardMedia, CircularProgress
} from '@mui/material';
import { fetchWithSession } from '../utils/fetchWithSession';

const api = process.env.REACT_APP_API_URL;

const CarGallery = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await fetchWithSession(`${api}/api/car`);
        if (!Array.isArray(data)) throw new Error('Expected array of cars');

        const carsWithSignedUrls = await Promise.all(
          data.map(async (car) => {
            const signedUrls = await Promise.all(
              (car.pictureUrls || []).map(async (key) => {
                try {
                  const res = await fetchWithSession(`${api}/api/s3/signed-url?key=${encodeURIComponent(key)}`);
                  return res?.url || null;
                } catch (err) {
                  console.warn(`❌ Failed to get signed URL for key: ${key}`, err);
                  return null;
                }
              })
            );
            return { ...car, signedUrls };
          })
        );

        setCars(carsWithSignedUrls);
      } catch (err) {
        console.error('❌ Error loading cars:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" mb={3} textAlign="center">
        New Cars Posted
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          {cars.map((car) => (
            <Grid item xs={12} sm={6} md={4} key={car._id}>
              <Card sx={{ height: '100%' }}>
                <CardMedia
                  component="img"
                  sx={{ height: 180, objectFit: 'cover' }}
                  image={car.signedUrls?.[0] || 'https://via.placeholder.com/300x180?text=No+Image'}
                  alt="Car"
                  onError={(e) => {
                    e.target.onerror = null;
                  }}
                />
                <CardContent>
                  <Typography fontWeight={600}>
                    {car.year} {car.make} {car.model}
                  </Typography>
                  <Typography variant="body2">Driver: {car.driver?.name || 'N/A'}</Typography>
                  <Typography variant="body2">Salesperson: {car.salesPerson?.name || 'N/A'}</Typography>
                  <Typography variant="body2">
                    Date: {new Date(car.createdAt).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default CarGallery;
