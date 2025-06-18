import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Stack,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Pagination,
  Snackbar,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
} from '@mui/material';
import {
  Search,
  FileDownload,
  Visibility,
  AttachMoney,
  Person,
  LocalShipping,
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import Topbar from '../components/Topbar';

const CODList = () => {
  const [cods, setCODs] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCODs, setTotalCODs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCOD, setSelectedCOD] = useState(null);
  const [imageMap, setImageMap] = useState({});

  const itemsPerPage = 10;
  const api = process.env.REACT_APP_API_URL;

  const debounceSearch = useCallback(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    const cleanup = debounceSearch();
    return cleanup;
  }, [debounceSearch]);

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

  const fetchCODs = async (currentPage = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        perPage: itemsPerPage.toString(),
      });

      if (searchTerm.trim()) {
        params.append('searchText', searchTerm.trim());
      }

      const res = await fetch(`${api}/cod/all?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await res.json();

      const {
        cods: codsData = data.cods || data,
        total = data.total,
        totalPages: pages = Math.ceil(total / itemsPerPage),
      } = data;

      setCODs(codsData);
      setTotalCODs(total);
      setTotalPages(pages);
      fetchImages(codsData);
    } catch (err) {
      console.error('❌ Failed to fetch CODs:', err);
      setCODs([]);
      setTotalCODs(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCODs(1, debouncedSearch);
  }, []);

  useEffect(() => {
    fetchCODs(page, debouncedSearch);
  }, [page, debouncedSearch]);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    } else {
      fetchCODs(1, debouncedSearch);
    }
  }, [debouncedSearch]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) {
        params.append('searchText', debouncedSearch.trim());
      }

      const response = await fetch(`${api}/cod/export?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cod-records-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportMessage('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      setExportMessage('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleViewDetails = (cod) => {
    setSelectedCOD(cod);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedCOD(null);
  };

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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Topbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
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
            COD Collections
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Cash on Delivery Collection Records
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
                Search Collections
              </Typography>
              <Box sx={{ ml: 'auto' }}>
                <Button
                  variant="contained"
                  startIcon={
                    exporting ? (
                      <CircularProgress size={20} />
                    ) : (
                      <FileDownload />
                    )
                  }
                  onClick={handleExport}
                  disabled={exporting}
                  sx={{ borderRadius: 2 }}
                >
                  {exporting ? 'Exporting...' : 'Export All'}
                </Button>
              </Box>
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
                label="Search by Customer or Method"
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
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing {cods.length} of {totalCODs} collections
                {debouncedSearch && ` • Search: "${debouncedSearch}"`}
                {debouncedSearch && (
                  <Typography
                    component="span"
                    variant="body2"
                    color="primary"
                    sx={{ ml: 1 }}
                  >
                    (Export will include all {totalCODs} matching records)
                  </Typography>
                )}
              </Typography>
              {loading && <CircularProgress size={20} />}
            </Box>
          </Stack>
        </Paper>

        <TableContainer component={Paper} sx={{ borderRadius: 3, mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(10)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <CircularProgress size={20} />
                    </TableCell>
                    <TableCell>
                      <CircularProgress size={20} />
                    </TableCell>
                    <TableCell>
                      <CircularProgress size={20} />
                    </TableCell>
                    <TableCell>
                      <CircularProgress size={20} />
                    </TableCell>
                    <TableCell>
                      <CircularProgress size={20} />
                    </TableCell>
                    <TableCell>
                      <CircularProgress size={20} />
                    </TableCell>
                  </TableRow>
                ))
              ) : cods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <AttachMoney
                      sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No collections found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {debouncedSearch
                        ? 'Try adjusting your search criteria'
                        : 'No COD collections available'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                cods.map((cod) => (
                  <TableRow key={cod._id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {highlightText(cod.customerName, debouncedSearch)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body1"
                        color="primary"
                        fontWeight="bold"
                      >
                        ${cod.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(cod.dateCollected).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={highlightText(cod.method, debouncedSearch)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {cod.phoneNumber || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleViewDetails(cod)}
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        sx={{ borderRadius: 2 }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box mt={4} display="flex" justifyContent="center">
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
                  Page {page} of {totalPages} • {totalCODs} total collections
                </Typography>
              </Stack>
            </Paper>
          </Box>
        )}

        <Snackbar
          open={!!exportMessage}
          autoHideDuration={4000}
          onClose={() => setExportMessage('')}
        >
          <Alert
            severity={exportMessage.includes('failed') ? 'error' : 'success'}
          >
            {exportMessage}
          </Alert>
        </Snackbar>

        <Dialog
          open={viewDialogOpen && selectedCOD !== null}
          onClose={handleCloseViewDialog}
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
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Person color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          Customer Details
                        </Typography>
                      </Box>
                      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                        <Box display="flex" flexDirection="column" gap={1.5}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Name
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedCOD.customerName || 'Not assigned'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Phone
                            </Typography>
                            <Typography variant="body1">
                              {selectedCOD.phoneNumber || 'Not available'}
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
              onClick={handleCloseViewDialog}
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
