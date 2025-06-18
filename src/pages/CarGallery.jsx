import React, { useEffect, useState, useCallback } from 'react';
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
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import {
  Visibility,
  DirectionsCar,
  Person,
  Speed,
  ConfirmationNumber,
  Search,
  PersonOutline,
  ArrowBackIos,
  ArrowForwardIos,
  PlayCircleOutline,
  Image as ImageIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  Print,
} from '@mui/icons-material';
import { fetchWithSession } from '../utils/fetchWithSession';
import Topbar from '../components/Topbar';
import PDFDoc from '../components/PDFDoc';

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
  const [users, setUsers] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchField, setSearchField] = useState('All');
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCars, setTotalCars] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCar, setSelectedCar] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const itemsPerPage = 6;

  // Debounced search function
  const debounceSearch = useCallback(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Effect to handle search debouncing
  useEffect(() => {
    const cleanup = debounceSearch();
    return cleanup;
  }, [debounceSearch]);

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

    fetchUsers();
  }, []);
  const handleDownloadPdf = async () => {
    try {
      const pages = [
        document.querySelector('#page-1'),
        document.querySelector('#page-2'),
        document.querySelector('#page-3'),
        document.querySelector('#page-4'),
        document.querySelector('#page-5'),
      ].filter((page) => page !== null);

      if (pages.length === 0) {
        throw new Error('No PDF pages found');
      }

      // Import jsPDF and html2canvas
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      // Create new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter',
      });

      // Process each page
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgWidth = 8.5;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add image to PDF, ensuring it fits on the page
        const maxHeight = 11; // Letter size height
        const finalHeight = imgHeight > maxHeight ? maxHeight : imgHeight;

        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, finalHeight);
      }

      // Save the PDF
      pdf.save(`Vehicle_Purchase_Agreement_${pdfData.vin || 'draft'}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
    }
  };

  const fetchCars = async (
    currentPage = 1,
    searchTerm = '',
    driverId = 'all'
  ) => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        perPage: itemsPerPage.toString(),
      });

      if (searchTerm.trim()) {
        params.append('searchText', searchTerm.trim());
      }
      if (driverId !== 'all') {
        params.append('driverId', driverId);
      }

      const res = await fetchWithSession(`${api}/api/car?${params.toString()}`);

      const {
        cars: carsData = [],
        total = 0,
        totalPages: pages = Math.ceil(total / itemsPerPage),
      } = res || {};

      const carsWithUrls = await Promise.all(
        carsData.map(async (car) => {
          const signedUrls = await Promise.all(
            (car.pictureUrls || []).map(async (key) => {
              try {
                return `${api}/api/s3/signed-url?key=${encodeURIComponent(
                  key
                )}`;
              } catch {
                return null;
              }
            })
          );

          let videoUrl = '';
          if (car.videoUrl) {
            videoUrl = `${api}/api/s3/signed-url?key=${encodeURIComponent(
              car.videoUrl
            )}`;
          }

          return {
            ...car,
            signedUrls: signedUrls.filter((url) => url !== null),
            videoUrl,
          };
        })
      );

      setCars(carsWithUrls);
      setTotalCars(total);
      setTotalPages(pages);
    } catch (err) {
      console.error('❌ Error loading cars:', err);
      setCars([]);
      setTotalCars(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars(1, debouncedSearch, selectedDriver);
  }, []);

  useEffect(() => {
    fetchCars(page, debouncedSearch, selectedDriver);
  }, [page, debouncedSearch, selectedDriver]);

  // Reset page when search/filter changes
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    } else {
      fetchCars(1, debouncedSearch, selectedDriver);
    }
  }, [debouncedSearch, selectedDriver]);

  const handleViewPDF = (carUploadDoc) => {
    setPdfData(carUploadDoc);
    setPdfModalOpen(true);
  };

  const handleClosePDFModal = () => {
    setPdfModalOpen(false);
    setPdfData(null);
  };

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
              Search
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

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {cars.length} of {totalCars} cars
              {debouncedSearch && ` • Search: "${debouncedSearch}"`}
              {selectedDriver !== 'all' &&
                ` • Driver: ${
                  drivers.find((d) => d.id === selectedDriver)?.label ||
                  'Unknown'
                }`}
            </Typography>
            {loading && <CircularProgress size={20} />}
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
      ) : cars.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
          <DirectionsCar
            sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }}
          />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No cars found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {debouncedSearch || selectedDriver !== 'all'
              ? 'Try adjusting your search criteria'
              : 'No cars available in the system'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {cars.map((car) => (
            <Grid item xs={12} sm={6} lg={4} key={car._id}>
              <Card
                sx={{
                  minWidth: 440,
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

                  {car.signedUrls && car.signedUrls.length > 0 && (
                    <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                      <Chip
                        label={car.linkedDelivery.status}
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
                        debouncedSearch
                      )}
                    </Typography>

                    {car.trim && (
                      <Typography
                        variant="body2"
                        color="primary.main"
                        sx={{ mb: 2, fontWeight: 500 }}
                      >
                        {highlightText(car.trim, debouncedSearch)}
                      </Typography>
                    )}

                    <Stack spacing={1.5}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Speed sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {car.mileage ? `${car.mileage} miles` : 'Mileage N/A'}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <ConfirmationNumber
                          sx={{ fontSize: 16, color: 'text.secondary' }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          VIN: {car.vin || 'N/A'}
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

      {totalPages > 1 && (
        <Box mt={6} display="flex" justifyContent="center">
          <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
            <Stack spacing={2} alignItems="center">
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                disabled={loading}
              />
              <Typography variant="caption" color="text.secondary">
                Page {page} of {totalPages} • {totalCars} total cars
              </Typography>
            </Stack>
          </Paper>
        </Box>
      )}

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
              <Box sx={{ p: 4, bgcolor: 'grey.50' }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {selectedCar.year} {selectedCar.make} {selectedCar.model}
                </Typography>
                {selectedCar.trim && (
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    {selectedCar.trim}
                  </Typography>
                )}

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        VIN
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ mt: 1, fontFamily: 'monospace' }}
                      >
                        {selectedCar.vin || 'N/A'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Date Added
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {new Date(selectedCar.createdAt).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        minHeight: '32px',
                      }}
                    >
                      <PersonOutline color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Customer Information
                      </Typography>
                    </Box>
                    <Paper
                      sx={{
                        p: 3,
                        bgcolor: 'grey.50',
                        height: '200px',
                        width: '100%',
                      }}
                    >
                      <Stack spacing={2}>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Name
                          </Typography>
                          <Typography variant="body1">
                            {selectedCar.customerName || 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Phone
                          </Typography>
                          <Typography variant="body1">
                            {selectedCar.customerPhone || 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Address
                          </Typography>
                          <Typography variant="body1">
                            {selectedCar.customerAddress || 'N/A'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Box>

                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        minHeight: '32px',
                      }}
                    >
                      <Person color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Driver
                      </Typography>
                    </Box>
                    <Paper
                      sx={{
                        p: 3,
                        bgcolor: 'grey.50',
                        height: '200px',
                        width: '100%',
                      }}
                    >
                      <Stack spacing={2}>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Name
                          </Typography>
                          <Typography variant="body1">
                            {selectedCar.driver?.name ||
                              users[selectedCar.driver?._id] ||
                              users[selectedCar.driver] ||
                              'Not assigned'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Phone
                          </Typography>
                          <Typography variant="body1">
                            {selectedCar.driver?.phoneNumber || 'N/A'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Box>

                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        minHeight: '32px',
                      }}
                    >
                      <Person color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Salesperson
                      </Typography>
                    </Box>
                    <Paper
                      sx={{
                        p: 3,
                        bgcolor: 'grey.50',
                        height: '200px',
                        width: '100%',
                      }}
                    >
                      <Stack spacing={2}>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Name
                          </Typography>
                          <Typography variant="body1">
                            {selectedCar.salesPerson?.name ||
                              users[selectedCar.salesPerson] ||
                              'Not assigned'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Phone
                          </Typography>
                          <Typography variant="body1">
                            {selectedCar.salesPerson?.phoneNumber || 'N/A'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Box>
                </Box>
              </Box>

              {selectedCar.carUploadDoc && (
                <>
                  <Divider />
                  <Box sx={{ p: 4 }}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      gutterBottom
                      sx={{ mb: 3 }}
                    >
                      Vehicle Purchase Agreement
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<DescriptionIcon />}
                      onClick={() => handleViewPDF(selectedCar.carUploadDoc)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                        py: 1.5,
                      }}
                    >
                      View Purchase Agreement
                    </Button>
                  </Box>
                </>
              )}

              {(selectedCar.signedUrls?.length > 0 || selectedCar.videoUrl) && (
                <>
                  <Divider />
                  <Box sx={{ p: 4 }}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      gutterBottom
                      sx={{ mb: 3 }}
                    >
                      Media Gallery
                      {(() => {
                        const totalMedia =
                          (selectedCar.signedUrls?.length || 0) +
                          (selectedCar.videoUrl ? 1 : 0);
                        return totalMedia > 0 ? ` (${totalMedia} items)` : '';
                      })()}
                    </Typography>

                    {(() => {
                      const mediaItems = [];

                      if (selectedCar.signedUrls) {
                        selectedCar.signedUrls.forEach((url, index) => {
                          mediaItems.push({
                            type: 'image',
                            url: url,
                            id: `image-${index}`,
                          });
                        });
                      }

                      if (selectedCar.videoUrl) {
                        mediaItems.push({
                          type: 'video',
                          url: selectedCar.videoUrl,
                          id: 'video',
                        });
                      }

                      if (mediaItems.length === 0) return null;

                      return (
                        <Paper
                          elevation={3}
                          sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            position: 'relative',
                            backgroundColor: '#000',
                          }}
                        >
                          <Box
                            sx={{
                              position: 'relative',
                              height: { xs: '300px', md: '500px' },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {mediaItems[currentMediaIndex]?.type === 'image' ? (
                              <img
                                src={mediaItems[currentMediaIndex].url}
                                alt={`Car media ${currentMediaIndex + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  backgroundColor: '#000',
                                }}
                              />
                            ) : (
                              <video
                                controls
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                }}
                                key={currentMediaIndex}
                              >
                                <source
                                  src={mediaItems[currentMediaIndex]?.url}
                                  type="video/mp4"
                                />
                              </video>
                            )}

                            {mediaItems.length > 1 && (
                              <>
                                <IconButton
                                  onClick={() =>
                                    setCurrentMediaIndex((prev) =>
                                      prev === 0
                                        ? mediaItems.length - 1
                                        : prev - 1
                                    )
                                  }
                                  sx={{
                                    position: 'absolute',
                                    left: 16,
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    '&:hover': {
                                      backgroundColor: 'rgba(0,0,0,0.9)',
                                    },
                                    zIndex: 2,
                                  }}
                                >
                                  <ArrowBackIos />
                                </IconButton>

                                <IconButton
                                  onClick={() =>
                                    setCurrentMediaIndex((prev) =>
                                      prev === mediaItems.length - 1
                                        ? 0
                                        : prev + 1
                                    )
                                  }
                                  sx={{
                                    position: 'absolute',
                                    right: 16,
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    '&:hover': {
                                      backgroundColor: 'rgba(0,0,0,0.9)',
                                    },
                                    zIndex: 2,
                                  }}
                                >
                                  <ArrowForwardIos />
                                </IconButton>
                              </>
                            )}

                            <Box
                              sx={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                zIndex: 2,
                              }}
                            >
                              <Chip
                                icon={
                                  mediaItems[currentMediaIndex]?.type ===
                                  'video' ? (
                                    <PlayCircleOutline />
                                  ) : (
                                    <ImageIcon />
                                  )
                                }
                                label={
                                  mediaItems[currentMediaIndex]?.type ===
                                  'video'
                                    ? 'Video'
                                    : 'Photo'
                                }
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                  color: 'white',
                                  '& .MuiChip-icon': {
                                    color: 'white',
                                  },
                                }}
                              />
                            </Box>

                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 16,
                                right: 16,
                                zIndex: 2,
                              }}
                            >
                              <Chip
                                label={`${currentMediaIndex + 1} / ${
                                  mediaItems.length
                                }`}
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                  color: 'white',
                                }}
                              />
                            </Box>
                          </Box>

                          {mediaItems.length > 1 && (
                            <Box
                              sx={{
                                p: 2,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                display: 'flex',
                                gap: 1,
                                overflowX: 'auto',
                                '&::-webkit-scrollbar': {
                                  height: 6,
                                },
                                '&::-webkit-scrollbar-track': {
                                  backgroundColor: 'rgba(0,0,0,0.1)',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                  backgroundColor: 'rgba(0,0,0,0.3)',
                                  borderRadius: 3,
                                },
                              }}
                            >
                              {mediaItems.map((item, index) => (
                                <Box
                                  key={`${item.id}-${index}`}
                                  onClick={() => setCurrentMediaIndex(index)}
                                  sx={{
                                    minWidth: 80,
                                    height: 60,
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border:
                                      currentMediaIndex === index
                                        ? '3px solid #1976d2'
                                        : '2px solid transparent',
                                    opacity:
                                      currentMediaIndex === index ? 1 : 0.7,
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    '&:hover': {
                                      opacity: 1,
                                      transform: 'scale(1.05)',
                                    },
                                  }}
                                >
                                  {item.type === 'image' ? (
                                    <img
                                      src={item.url}
                                      alt={`Thumbnail ${index + 1}`}
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: '#000',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                      }}
                                    >
                                      <PlayCircleOutline
                                        sx={{
                                          color: 'white',
                                          fontSize: 24,
                                        }}
                                      />
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          position: 'absolute',
                                          bottom: 2,
                                          left: 2,
                                          color: 'white',
                                          fontSize: '0.6rem',
                                          backgroundColor: 'rgba(0,0,0,0.7)',
                                          px: 0.5,
                                          borderRadius: 0.5,
                                        }}
                                      >
                                        VIDEO
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Paper>
                      );
                    })()}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Button
            onClick={() => {
              setSelectedCar(null);
              setCurrentMediaIndex(0);
            }}
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

      <Dialog
        open={pdfModalOpen}
        onClose={handleClosePDFModal}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '90vh' } }}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Vehicle Purchase Agreement</Typography>
            <Box>
              <Button
                startIcon={<Print />}
                onClick={handleDownloadPdf}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                Print
              </Button>
              <IconButton onClick={handleClosePDFModal}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          {pdfData && (
            <Box sx={{ p: 2, backgroundColor: 'white' }}>
              <PDFDoc data={pdfData} viewOnly={true} />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default CarGallery;
