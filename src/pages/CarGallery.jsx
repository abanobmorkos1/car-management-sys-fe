import React, { useEffect, useState } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, CardMedia,
  TextField, MenuItem, Box, IconButton, CircularProgress, Pagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { fetchWithSession } from '../utils/fetchWithSession';

const api = process.env.REACT_APP_API_URL;

const highlightText = (text, searchTerm) => {
  if (!searchTerm) return text;
  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === searchTerm.toLowerCase() ? (
      <span key={i} style={{ backgroundColor: 'yellow', fontWeight: 600 }}>{part}</span>
    ) : (
      part
    )
  );
};

const CarGallery = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [users, setUsers] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('All');
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedCar, setSelectedCar] = useState(null);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetchWithSession(`${api}/api/users/all`);
        const data = res || [];
        const userMap = {};
        const driverList = [];
        data.forEach(u => {
          const label = u.name || u.email || 'Unknown';
          userMap[u._id] = label;
          driverList.push({ id: u._id, label });
        });
        setUsers(userMap);
        setDrivers(driverList);
      } catch (err) {
        console.warn('❌ Failed to load users:', err);
      }
    };

    const fetchCars = async () => {
      try {
        const res = await fetchWithSession(`${api}/api/car`);
        const data = Array.isArray(res) ? res : [];

        const carsWithUrls = await Promise.all(
          data.map(async (car) => {
            const signedUrls = await Promise.all(
              (car.pictureUrls || []).map(async (key) => {
                try {
                  const res = await fetchWithSession(`${api}/api/s3/signed-url?key=${encodeURIComponent(key)}`);
                  return res?.url || null;
                } catch {
                  return null;
                }
              })
            );

            let video = '';
            if (car.videoUrl) {
              try {
                const res = await fetchWithSession(`${api}/api/s3/signed-url?key=${encodeURIComponent(car.videoUrl)}`);
                video = res?.url || '';
              } catch {}
            }

            return { ...car, signedUrls, videoUrl: video };
          })
        );

        setCars(carsWithUrls);
        setFilteredCars(carsWithUrls);
      } catch (err) {
        console.error('❌ Error loading cars:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchCars();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = cars.filter(car => {
      const byDriver = selectedDriver === 'all' || car.driver === selectedDriver;

      let matchesSearch = true;
      if (term) {
        if (searchField === 'All') {
          matchesSearch =
            car.make?.toLowerCase().includes(term) ||
            car.model?.toLowerCase().includes(term) ||
            car.trim?.toLowerCase().includes(term);
        } else if (searchField === 'Make') {
          matchesSearch = car.make?.toLowerCase().includes(term);
        } else if (searchField === 'Model') {
          matchesSearch = car.model?.toLowerCase().includes(term);
        }
      }

      return matchesSearch && byDriver;
    });

    setFilteredCars(filtered);
    setPage(1);
  }, [search, searchField, cars, selectedDriver]);

  const paginatedCars = filteredCars.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" mb={3} fontWeight="bold" textAlign="center">
        New Cars Posted
      </Typography>

      <Stack spacing={2} direction="column" mb={4}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <TextField
            fullWidth
            label={searchField === 'All' ? 'Search Make, Model, or Trim' : `Search by ${searchField}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="outlined"
          />
          <TextField
            select
            label="Filter Field"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            variant="outlined"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Make">Make</MenuItem>
            <MenuItem value="Model">Model</MenuItem>
          </TextField>
          <TextField
            select
            label="Driver"
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            variant="outlined"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Drivers</MenuItem>
            {drivers.map(d => (
              <MenuItem key={d.id} value={d.id}>{d.label}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {paginatedCars.map((car) => (
            <Grid item xs={12} sm={6} md={4} key={car._id}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRadius: 3,
                boxShadow: 3,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)', boxShadow: 6 }
              }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={car.signedUrls?.[0] || 'https://via.placeholder.com/300x180?text=No+Image'}
                  alt="Car"
                  sx={{ objectFit: 'cover', backgroundColor: '#f5f5f5' }}
                />
                <CardContent>
                  <Typography variant="h6">
                    {car.year}{' '}
                    {highlightText(car.make || '', search)}{' '}
                    {highlightText(car.model || '', search)}
                  </Typography>
                  <Typography variant="body2">Driver: {users[car.driver] || 'N/A'}</Typography>
                  <Typography variant="body2">Salesperson: {users[car.salesPerson] || 'N/A'}</Typography>
                  <Typography variant="body2">Date: {new Date(car.createdAt).toLocaleString()}</Typography>
                </CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
                  <IconButton onClick={() => setSelectedCar(car)}>
                    <Visibility />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {filteredCars.length > itemsPerPage && (
        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            count={Math.ceil(filteredCars.length / itemsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <Dialog open={!!selectedCar} onClose={() => setSelectedCar(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Car Details</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {selectedCar && (
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="subtitle2" color="text.secondary">Year / Make / Model</Typography>
              <Typography>{selectedCar.year} {selectedCar.make} {selectedCar.model}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Driver</Typography>
              <Typography>{users[selectedCar.driver] || 'N/A'}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Salesperson</Typography>
              <Typography>{users[selectedCar.salesPerson] || 'N/A'}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Date</Typography>
              <Typography>{new Date(selectedCar.createdAt).toLocaleString()}</Typography>

              {selectedCar.signedUrls?.length > 0 && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" mt={2}>Photos</Typography>
                  <Grid container spacing={2}>
                    {selectedCar.signedUrls.map((url, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <img src={url} alt={`car-${i}`} style={{ width: '100%', borderRadius: 8 }} />
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}

              {selectedCar.videoUrl && (
                <Box mt={2}>
                  <Typography variant="subtitle2" color="text.secondary">Video</Typography>
                  <video controls style={{ width: '100%', borderRadius: 8 }}>
                    <source src={selectedCar.videoUrl} type="video/mp4" />
                  </video>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedCar(null)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CarGallery;
