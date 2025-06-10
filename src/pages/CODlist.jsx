import React, { useEffect, useState, useContext } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  Pagination,
  IconButton,
  Skeleton,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import {
  Visibility,
  Image,
  Person,
  LocalShipping,
  AttachMoney,
  CalendarToday,
  LocationOn,
  DriveEta,
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import Topbar from '../components/Topbar';

const CODList = () => {
  const [cods, setCODs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [paginated, setPaginated] = useState([]);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('All');
  const [imageMap, setImageMap] = useState({});
  const [selectedCOD, setSelectedCOD] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 6;
  const api = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchCODs = async () => {
      try {
        const res = await fetch(`${api}/cod/all`, { credentials: 'include' });
        const data = await res.json();
        setCODs(data);
        setFiltered(data);
        fetchImages(data);
      } catch (err) {
        console.error('❌ Failed to fetch CODs:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchImages = async (codList) => {
      const urls = await Promise.all(
        codList.map(async (cod) => {
          if (cod.contractPicture) {
            return {
              id: cod._id,
              url: `${api}/api/s3/signed-url?key=${encodeURIComponent(
                cod.contractPicture
              )}`,
            };
          }
          return { id: cod._id, url: null };
        })
      );
      const map = {};
      urls.forEach(({ id, url }) => (map[id] = url));
      setImageMap(map);
    };

    fetchCODs();
  }, [api]);

  useEffect(() => {
    const term = search.toLowerCase();
    const filteredResults = cods.filter((cod) => {
      if (!term) return true;
      if (searchField === 'All') {
        return (
          cod.customerName?.toLowerCase().includes(term) ||
          cod.method?.toLowerCase().includes(term)
        );
      }
      if (searchField === 'Customer')
        return cod.customerName?.toLowerCase().includes(term);
      if (searchField === 'Method')
        return cod.method?.toLowerCase().includes(term);
      return false;
    });
    setFiltered(filteredResults);
    setPage(1);
  }, [search, searchField, cods]);

  useEffect(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setPaginated(filtered.slice(start, end));
  }, [page, filtered]);

  const handleOpen = (cod) => setSelectedCOD(cod);
  const handleClose = () => setSelectedCOD(null);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Topbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          textAlign="center"
        >
          COD Collections
        </Typography>

        <Box
          sx={{
            maxWidth: 800,
            mx: 'auto',
            mb: 4,
            display: 'flex',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <TextField
            fullWidth
            label={
              searchField === 'All'
                ? 'Search by Customer or Method'
                : `Search by ${searchField}`
            }
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
            <MenuItem value="Customer">Customer</MenuItem>
            <MenuItem value="Method">Method</MenuItem>
          </TextField>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {paginated.map((cod) => (
            <Grid item xs={12} sm={6} md={4} key={cod._id}>
              <Card
                sx={{
                  height: 400, // Fixed height for consistency
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
                }}
              >
                {/* Always render CardMedia container with fixed height */}
                <Box sx={{ height: 200, position: 'relative' }}>
                  {loading ? (
                    <Skeleton variant="rectangular" width="100%" height={200} />
                  ) : imageMap[cod._id] ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={imageMap[cod._id]}
                      alt="Contract"
                      sx={{ objectFit: 'cover' }}
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
                </Box>

                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {cod.customerName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      ${cod.amount.toFixed(2)} •{' '}
                      {new Date(cod.dateCollected).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Method: {cod.method}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}
                  >
                    <IconButton onClick={() => handleOpen(cod)}>
                      <Visibility />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filtered.length > itemsPerPage && (
          <Box mt={4} display="flex" justifyContent="center">
            <Pagination
              count={Math.ceil(filtered.length / itemsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}

        <Dialog
          open={!!selectedCOD}
          onClose={handleClose}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            },
          }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center',
              py: 3,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Collection Details
            </Typography>
            {selectedCOD && (
              <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
                {selectedCOD.customerName}
              </Typography>
            )}
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            {selectedCOD && (
              <Box>
                {/* Payment Summary Section */}
                <Paper
                  elevation={0}
                  sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 0 }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <AttachMoney color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Payment Summary
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Amount
                      </Typography>
                      <Typography
                        variant="h6"
                        color="primary"
                        fontWeight="bold"
                      >
                        ${selectedCOD.amount.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Date Collected
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {new Date(selectedCOD.dateCollected).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Payment Method
                      </Typography>
                      <Chip
                        label={selectedCOD.method}
                        color="primary"
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                <Box sx={{ p: 3 }}>
                  <Grid container spacing={4}>
                    {/* Salesperson Section */}
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Person color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          Salesperson
                        </Typography>
                      </Box>
                      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                        <Box display="flex" flexDirection="column" gap={1.5}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Name
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedCOD.salesperson?.name || 'Not assigned'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Phone
                            </Typography>
                            <Typography variant="body1">
                              {selectedCOD.salesperson?.phoneNumber ||
                                'Not available'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Email
                            </Typography>
                            <Typography variant="body1">
                              {selectedCOD.salesperson?.email ||
                                'Not available'}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Delivery Section */}
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <LocalShipping color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          Delivery Details
                        </Typography>
                      </Box>
                      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                        <Box display="flex" flexDirection="column" gap={1.5}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Address
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedCOD.address || 'Not specified'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Driver
                            </Typography>
                            <Typography variant="body1">
                              {selectedCOD.driver?.name ||
                                selectedCOD.driver ||
                                'Not assigned'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Vehicle
                            </Typography>
                            <Typography variant="body1">
                              {selectedCOD.car?.year || '-'}{' '}
                              {selectedCOD.car?.make || ''}{' '}
                              {selectedCOD.car?.model || ''}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Contract Image Section */}
                  {imageMap[selectedCOD._id] && (
                    <Box mt={4}>
                      <Typography variant="h6" fontWeight="bold" mb={2}>
                        Contract Image
                      </Typography>
                      <Paper
                        elevation={2}
                        sx={{
                          borderRadius: 3,
                          overflow: 'hidden',
                          maxHeight: 400,
                          display: 'flex',
                          justifyContent: 'center',
                          backgroundColor: '#f5f5f5',
                        }}
                      >
                        <img
                          src={imageMap[selectedCOD._id]}
                          alt="Contract"
                          style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '400px',
                            objectFit: 'contain',
                          }}
                        />
                      </Paper>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
            <Button
              onClick={handleClose}
              variant="contained"
              sx={{
                px: 4,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'medium',
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Container>
  );
};

export default CODList;
