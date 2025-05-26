import React, { useEffect, useState, useContext } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, CardMedia, CircularProgress
} from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import { fetchWithToken } from '../utils/fetchWithToken';

const api = process.env.REACT_APP_API_URL;

const CarGallery = () => {
  const { token } = useContext(AuthContext);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchCarsWithSignedUrls = async () => {
      try {
        const data = await fetchWithToken(`${api}/api/car`, token);

        if (!Array.isArray(data)) {
          throw new Error('Expected an array of cars, but got: ' + JSON.stringify(data));
        }

        const carsWithSignedUrls = await Promise.all(
          data.map(async (car) => {
            const signedUrls = await Promise.all(
              (car.pictureUrls || []).map(async (key) => {
                try {
                  const { url } = await fetchWithToken(`${api}/api/s3/signed-url?key=${encodeURIComponent(key)}`, token);
                  return url;
                } catch (err) {
                  console.warn('❌ Error fetching signed URL for:', key, err);
                  return null;
                }
              })
            );
            return { ...car, signedUrls };
          })
        );

        setCars(carsWithSignedUrls);
      } catch (err) {
        console.error('❌ Failed to fetch cars or signed URLs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarsWithSignedUrls();
  }, [token]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" mb={3} textAlign="center">New Cars Posted</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          {cars.map(car => (
            <Grid item xs={12} sm={6} md={4} key={car._id}>
              <Card sx={{ height: '100%' }}>
                {car.signedUrls?.[0] ? (
                  <CardMedia
                    component="img"
                    sx={{ height: 180, objectFit: 'cover' }}
                    image={car.signedUrls[0]}
                    alt="car"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x180?text=No+Image';
                    }}
                  />
                ) : (
                  <CardMedia
                    component="img"
                    sx={{ height: 180, objectFit: 'cover' }}
                    image='https://via.placeholder.com/300x180?text=No+Image'
                    alt="No image"
                  />
                )}
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
