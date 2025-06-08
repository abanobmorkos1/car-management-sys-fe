import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CardMedia,
  TextField,
  MenuItem,
  Box,
  IconButton,
  CircularProgress,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Skeleton,
  Chip,
  Divider,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Visibility,
  DirectionsCar,
  Person,
  CalendarToday,
  Speed,
  ConfirmationNumber,
  Search,
} from '@mui/icons-material';
import { fetchWithSession } from '../utils/fetchWithSession';
import Topbar from '../components/Topbar';

const api = process.env.REACT_APP_API_URL;

const highlightText = (text, searchTerm) => {
  if (!searchTerm) return text;
  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === searchTerm.toLowerCase() ? (
      <span key={i} style={{ backgroundColor: 'yellow', fontWeight: 600 }}>
        {part}
      </span>
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
        const res = await fetchWithSession(`${api}/api/users/drivers`);
        const data = res || [];
        const userMap = {};
        const driverList = [];
        data.forEach((u) => {
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
                  const imgRes = await fetch(
                    `${api}/api/s3/signed-url?key=${encodeURIComponent(key)}`,
                    {
                      credentials: 'include',
                    }
                  );
                  if (imgRes.ok) {
                    const blob = await imgRes.blob();
                    const url = URL.createObjectURL(blob);
                    return url;
                  }
                  return null;
                } catch {
                  return null;
                }
              })
            );

            let videoUrl = '';
            if (car.videoUrl) {
              try {
                const videoRes = await fetch(
                  `${api}/api/s3/signed-url?key=${encodeURIComponent(
                    car.videoUrl
                  )}`,
                  {
                    credentials: 'include',
                  }
                );
                if (videoRes.ok) {
                  const blob = await videoRes.blob();
                  videoUrl = URL.createObjectURL(blob);
                }
              } catch {}
            }

            return {
              ...car,
              signedUrls: signedUrls.filter((url) => url !== null),
              videoUrl,
            };
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
    const filtered = cars.filter((car) => {
      const byDriver =
        selectedDriver === 'all' || car?.driver?._id === selectedDriver;

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

  const paginatedCars = filteredCars.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Topbar />
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Car Gallery
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Discover our collection of premium vehicles
        </Typography>
      </Box>

      {/* Enhanced Search and Filter Section */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Search color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Search & Filter
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label={
                searchField === 'All'
                  ? 'Search Make, Model, or Trim'
                  : `Search by ${searchField}`
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              select
              label="Filter Field"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              variant="outlined"
              sx={{
                minWidth: 180,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem value="All">All Fields</MenuItem>
              <MenuItem value="Make">Make</MenuItem>
              <MenuItem value="Model">Model</MenuItem>
            </TextField>
            <TextField
              select
              label="Driver"
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              variant="outlined"
              sx={{
                minWidth: 180,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem value="all">All Drivers</MenuItem>
              {drivers.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Results Counter */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {filteredCars.length} of {cars.length} cars
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={60} />
            <Typography variant="h6" color="text.secondary">
              Loading cars...
            </Typography>
          </Stack>
        </Box>
      ) : filteredCars.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
          <DirectionsCar
            sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }}
          />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No cars found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search criteria
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {paginatedCars.map((car) => (
            <Grid item xs={12} sm={6} lg={4} key={car._id}>
              <Card
                sx={{
                  height: 480,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <Box
                  sx={{ height: 240, position: 'relative', overflow: 'hidden' }}
                >
                  {car.signedUrls && car.signedUrls.length > 0 ? (
                    <CardMedia
                      component="img"
                      height="240"
                      image={car.signedUrls[0]}
                      alt={`${car.year} ${car.make} ${car.model}`}
                      sx={{
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 240,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background:
                          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                      }}
                    >
                      <DirectionsCar sx={{ fontSize: 80 }} />
                    </Box>
                  )}

                  {/* Status Badge */}
                  <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                    <Chip
                      label={car.status}
                      color={car.status === 'Available' ? 'success' : 'warning'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)',
                        backgroundColor:
                          car.status === 'Available'
                            ? 'rgba(76, 175, 80, 0.9)'
                            : 'rgba(255, 152, 0, 0.9)',
                        color: 'white',
                      }}
                    />
                  </Box>

                  {/* Image Count Badge */}
                  {car.signedUrls && car.signedUrls.length > 1 && (
                    <Box sx={{ position: 'absolute', bottom: 12, left: 12 }}>
                      <Chip
                        label={`${car.signedUrls.length} photos`}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  )}
                </Box>

                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        mb: 1,
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {highlightText(
                        `${car.year} ${car.make} ${car.model}`,
                        search
                      )}
                    </Typography>

                    {car.trim && (
                      <Typography
                        variant="body2"
                        color="primary.main"
                        sx={{ mb: 2, fontWeight: 500 }}
                      >
                        {highlightText(car.trim, search)}
                      </Typography>
                    )}

                    <Stack spacing={1.5}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Speed sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {car.mileage
                            ? `${car.mileage.toLocaleString()} miles`
                            : 'Mileage not specified'}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <ConfirmationNumber
                          sx={{ fontSize: 16, color: 'text.secondary' }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          VIN: {car.vin || 'Not specified'}
                        </Typography>
                      </Box>

                      {car.driver && (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Person
                            sx={{ fontSize: 16, color: 'text.secondary' }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {users[car.driver._id] ||
                              users[car.driver] ||
                              'Unknown Driver'}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}
                  >
                    <Button
                      onClick={() => setSelectedCar(car)}
                      variant="contained"
                      startIcon={<Visibility />}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1,
                        background:
                          'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                        '&:hover': {
                          background:
                            'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                        },
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Enhanced Pagination */}
      {filteredCars.length > itemsPerPage && (
        <Box mt={6} display="flex" justifyContent="center">
          <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
            <Pagination
              count={Math.ceil(filteredCars.length / itemsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Paper>
        </Box>
      )}

      {/* Enhanced Dialog */}
      <Dialog
        open={!!selectedCar}
        onClose={() => setSelectedCar(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: '1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
          }}
        >
          Car Details
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {selectedCar && (
            <Box>
              {/* Hero Section */}
              <Box sx={{ p: 4, bgcolor: 'grey.50' }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {selectedCar.year} {selectedCar.make} {selectedCar.model}
                </Typography>
                {selectedCar.trim && (
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    {selectedCar.trim}
                  </Typography>
                )}

                {/* Status and Info Cards */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={selectedCar.status}
                        color={
                          selectedCar.status === 'Available'
                            ? 'success'
                            : 'warning'
                        }
                        sx={{ mt: 1, fontWeight: 600 }}
                      />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Mileage
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 1 }}>
                        {selectedCar.mileage
                          ? `${selectedCar.mileage.toLocaleString()}`
                          : 'N/A'}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        VIN
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ mt: 1, fontFamily: 'monospace' }}
                      >
                        {selectedCar.vin || 'Not specified'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Details Section */}
              <Box sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={3}>
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          <Person color="primary" />
                          <Typography variant="h6" fontWeight={600}>
                            Driver Information
                          </Typography>
                        </Box>
                        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                          <Typography variant="body1">
                            {users[selectedCar.driver?._id] ||
                              users[selectedCar.driver] ||
                              'Not assigned'}
                          </Typography>
                        </Paper>
                      </Box>

                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Salesperson
                        </Typography>
                        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                          <Typography variant="body1">
                            {users[selectedCar.salesPerson] || 'Not assigned'}
                          </Typography>
                        </Paper>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <CalendarToday color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                          Date Added
                        </Typography>
                      </Box>
                      <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                        <Typography variant="body1">
                          {new Date(selectedCar.createdAt).toLocaleString()}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Media Section */}
              {(selectedCar.signedUrls?.length > 0 || selectedCar.videoUrl) && (
                <>
                  <Divider />
                  <Box sx={{ p: 4 }}>
                    {selectedCar.signedUrls?.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Photos ({selectedCar.signedUrls.length})
                        </Typography>
                        <Grid container spacing={2}>
                          {selectedCar.signedUrls.map((url, i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                              <Paper
                                elevation={2}
                                sx={{
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                  transition: 'transform 0.2s',
                                  '&:hover': {
                                    transform: 'scale(1.02)',
                                  },
                                }}
                              >
                                <img
                                  src={url}
                                  alt={`Car photo ${i + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '200px',
                                    objectFit: 'cover',
                                  }}
                                />
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {selectedCar.videoUrl && (
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Video
                        </Typography>
                        <Paper
                          elevation={2}
                          sx={{ borderRadius: 2, overflow: 'hidden' }}
                        >
                          <video
                            controls
                            style={{
                              width: '100%',
                              maxHeight: '400px',
                            }}
                          >
                            <source
                              src={selectedCar.videoUrl}
                              type="video/mp4"
                            />
                          </video>
                        </Paper>
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Button
            onClick={() => setSelectedCar(null)}
            variant="contained"
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CarGallery;
