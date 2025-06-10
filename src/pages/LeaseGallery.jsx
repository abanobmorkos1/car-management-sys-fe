import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  DialogActions,
  Button,
  CardMedia,
  MenuItem,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  Skeleton,
  Stack,
  IconButton,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  Person,
  CalendarToday,
  DirectionsCar,
  ArrowBackIos,
  ArrowForwardIos,
  PlayCircleOutline,
  Image as ImageIcon,
  Search,
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import Topbar from '../components/Topbar';
import { format } from 'date-fns';

const api = process.env.REACT_APP_API_URL;

// Utility to highlight matching text
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

const LeaseReturnsList = () => {
  const { user, token } = useContext(AuthContext);
  const [leases, setLeases] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchField, setSearchField] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedLease, setSelectedLease] = useState(null);
  const [thumbnails, setThumbnails] = useState({});
  const [users, setUsers] = useState({});
  const [page, setPage] = useState(1);
  const [totalLeases, setTotalLeases] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 6;
  const [statusFilter, setStatusFilter] = useState('');
  const [groundingNote, setGroundingNote] = useState('');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Debounced search function
  const debounceSearch = useCallback(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

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
        const res = await fetch(`${api}/api/users/drivers`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        const userMap = {};
        data.forEach((u) => {
          userMap[u._id] = u.name || u.email || 'Unknown';
        });
        setUsers(userMap);
      } catch (err) {
        console.warn('Failed to fetch users:', err);
      }
    };

    fetchUsers();
  }, [token]);

  const fetchLeases = async (currentPage = 1, searchTerm = '', status = '') => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        perPage: itemsPerPage.toString(),
      });

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
        if (searchField !== 'All') {
          params.append('searchField', searchField.toLowerCase());
        }
      }

      if (status.trim()) {
        params.append('status', status.trim());
      }

      const res = await fetch(`${api}/lease/getlr?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();

      // Expect backend to return { leases, total, totalPages, currentPage }
      const {
        leases: leasesData = data.leases,
        total = data.total,
        totalPages: pages = Math.ceil(total / itemsPerPage),
      } = data;

      setLeases(leasesData);
      setTotalLeases(total);
      setTotalPages(pages);
      fetchThumbnails(leasesData);
    } catch (err) {
      console.error('Failed to fetch lease returns:', err);
      setLeases([]);
      setTotalLeases(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchThumbnails = async (leaseList) => {
    const thumbs = {};
    for (const lease of leaseList) {
      const key = lease.leaseReturnMediaKeys?.find((k) =>
        /\.(jpg|jpeg|png|webp)$/i.test(k)
      );
      if (!key) {
        if (
          lease.odometerKey &&
          /\.(jpg|jpeg|png|webp)$/i.test(lease.odometerKey)
        ) {
          thumbs[lease._id] =
            `${api}/api/s3/signed-url?key=${encodeURIComponent(
              lease.odometerKey
            )}`;
          continue;
        } else if (
          lease.titleKey &&
          /\.(jpg|jpeg|png|webp)$/i.test(lease.titleKey)
        ) {
          thumbs[lease._id] =
            `${api}/api/s3/signed-url?key=${encodeURIComponent(
              lease.titleKey
            )}`;
          continue;
        }
      }
      if (key) {
        try {
          const url = `${api}/api/s3/signed-url?key=${encodeURIComponent(key)}`;
          thumbs[lease._id] = url;
        } catch (err) {
          console.warn('Failed to load thumbnail:', err);
        }
      }
    }
    setThumbnails(thumbs);
  };

  useEffect(() => {
    fetchLeases(1, debouncedSearch, statusFilter);
  }, [token]);

  useEffect(() => {
    fetchLeases(page, debouncedSearch, statusFilter);
  }, [page, debouncedSearch, statusFilter]);

  // Reset page when search/filter changes
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    } else {
      fetchLeases(1, debouncedSearch, statusFilter);
    }
  }, [debouncedSearch, searchField, statusFilter]);

  const handleViewLease = async (lease) => {
    const odometerUrl = `${api}/api/s3/signed-url?key=${encodeURIComponent(
      lease.odometerKey
    )}`;
    const titleUrl = lease.hasTitle
      ? `${api}/api/s3/signed-url?key=${encodeURIComponent(lease.titleKey)}`
      : null;
    const odometerStatementUrl = lease.odometerStatementKey
      ? `${api}/api/s3/signed-url?key=${encodeURIComponent(
          lease.odometerStatementKey
        )}`
      : null;
    const mediaKeys = lease.leaseReturnMediaKeys || [];
    const mediaFiles = await Promise.all(
      mediaKeys.map(async (key) => {
        const url = `${api}/api/s3/signed-url?key=${encodeURIComponent(key)}`;
        return { key, url };
      })
    );
    const damagePictures = mediaFiles
      .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file.key))
      .map((file) => file.url);
    const damageVideos = mediaFiles
      .filter((file) => /\.mp4$/i.test(file.key))
      .map((file) => file.url);
    setSelectedLease({
      ...lease,
      odometerPicture: odometerUrl,
      titlePicture: titleUrl,
      damagePictures,
      damageVideos,
      odometerStatementUrl,
    });
    setGroundingNote(lease.groundingNote || '');
  };

  const handleGroundingStatusUpdate = async (leaseId, newStatus) => {
    try {
      const res = await fetch(`${api}/lease/grounding-status/${leaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus, note: groundingNote }),
      });

      const updatedLease = await res.json();
      console.log('✅ Updated groundingStatus:', updatedLease.groundingStatus);
      const formattedLease = {
        ...updatedLease,
        salesPerson:
          updatedLease.salesPerson?.name || updatedLease.salesPerson?._id || '',
        driver: updatedLease.driver?.name || updatedLease.driver?._id || '',
        updatedBy: updatedLease.updatedBy || null,
        createdAt: new Date(updatedLease.createdAt).toLocaleString(),
        updatedAt: new Date(updatedLease.updatedAt).toLocaleString(),
      };

      // Update all lease arrays while preserving current page
      setLeases((prev) =>
        prev.map((l) => (l._id === leaseId ? formattedLease : l))
      );

      setSelectedLease(formattedLease);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const getStatusChipProps = (status) => {
    switch (status) {
      case 'Buy':
        return {
          label: 'Buying',
          color: '#66b0ec',
          sx: { backgroundColor: '#2196f3', color: '#fff' },
        };
      case 'Ground':
        return {
          label: 'Ground',
          color: '#4caf50',
          sx: { backgroundColor: '#4caf50', color: '#fff' },
        };
      case 'Grounded':
        return {
          label: 'Grounded',
          color: '#4caf50',
          sx: { backgroundColor: '#4caf50', color: '#fff' },
        };
      case 'In Progress':
        return {
          label: 'In Progress',
          sx: { backgroundColor: '#ffeb3b', color: '#000' }, // Yellow with black text
        };
      case 'Not Set':
      case '':
      case undefined:
        return {
          label: '—',
          sx: { backgroundColor: '#e0e0e0', color: '#000' },
        };
      default:
        return {
          label: status,
          sx: { backgroundColor: '#e0e0e0', color: '#000' },
        };
    }
  };

  const getPlatesLeftProps = (leftPlates, plateNumber) => {
    if (leftPlates) {
      return {
        label: `${plateNumber}`,
        sx: { backgroundColor: '#4caf50', color: '#fff' },
      };
    }
    return {
      label: 'No Plates',
      sx: { backgroundColor: '#f44336', color: '#fff' },
    };
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Topbar />
      <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
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
            Lease Returns Gallery
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Vehicle return inspection records
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
                    ? 'Search by Customer, VIN, or Address'
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
                  minWidth: 150,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Make">Make</MenuItem>
                <MenuItem value="Trim">Trim</MenuItem>
                <MenuItem value="Model">Model</MenuItem>
              </TextField>
              <TextField
                select
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{
                  minWidth: 160,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Grounded">Grounded</MenuItem>
                <MenuItem value="Buy">Buying</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value=" ">Not Set</MenuItem>
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
                Showing {leases.length} of {totalLeases} lease returns
                {debouncedSearch && ` • Search: "${debouncedSearch}"`}
                {statusFilter && ` • Status: ${statusFilter}`}
              </Typography>
              {loading && <CircularProgress size={20} />}
            </Box>
          </Stack>
        </Paper>

        {loading ? (
          <Grid container spacing={3} justifyContent="center">
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: 420, borderRadius: 3 }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={24} />
                    <Skeleton variant="text" height={24} />
                    <Skeleton variant="text" height={24} />
                    <Skeleton
                      variant="rectangular"
                      height={24}
                      width={80}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : leases.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
            <DirectionsCar
              sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No lease returns found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {debouncedSearch || statusFilter
                ? 'Try adjusting your search criteria'
                : 'No lease returns available'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {leases.map((lease) => (
              <Grid item xs={12} sm={6} md={4} key={lease._id}>
                <Card
                  sx={{
                    height: 420,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    },
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: 200,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {thumbnails[lease._id] ? (
                      <CardMedia
                        component="img"
                        height="200"
                        src={thumbnails[lease._id]}
                        alt={`${lease.year || ''} ${lease.make || ''} ${
                          lease.model || ''
                        }`}
                        sx={{
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                          '&:hover': { transform: 'scale(1.05)' },
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <Box
                      sx={{
                        height: 200,
                        display: thumbnails[lease._id] ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        color: 'text.secondary',
                      }}
                    >
                      <DirectionsCar sx={{ fontSize: 48 }} />
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                      }}
                    >
                      <Chip
                        {...getStatusChipProps(lease.groundingStatus)}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          ...getStatusChipProps(lease.groundingStatus).sx,
                        }}
                      />
                    </Box>
                  </Box>

                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      p: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {highlightText(
                        lease.customerName || 'Unknown Customer',
                        search
                      )}
                    </Typography>

                    <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <DirectionsCar
                          sx={{ fontSize: 16, color: 'primary.main' }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {lease.year} {highlightText(lease.make || '', search)}{' '}
                          {highlightText(lease.model || '', search)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <Person sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          Sales: {lease.salesPerson}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <Person sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          Driver: {lease.driver}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <CalendarToday
                          sx={{ fontSize: 16, color: 'primary.main' }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {format(
                            new Date(lease.createdAt),
                            'MMM dd, yyyy hh:mm a'
                          )}{' '}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<Visibility />}
                        onClick={() => handleViewLease(lease)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 'bold',
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
                  Page {page} of {totalPages} • {totalLeases} total lease
                  returns
                </Typography>
              </Stack>
            </Paper>
          </Box>
        )}

        {/* Enhanced Dialog */}
        <Dialog
          open={!!selectedLease}
          onClose={() => setSelectedLease(null)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxHeight: '90vh',
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              fontSize: '1.5rem',
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              color: 'white',
              textAlign: 'center',
            }}
          >
            Lease Return Details
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            {selectedLease && (
              <Box>
                {/* Customer Info Section */}
                <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      color="primary.main"
                      gutterBottom
                      fontWeight="bold"
                    >
                      Customer Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Customer Name
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {selectedLease.customerName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          VIN
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {selectedLease.vin}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Miles
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {selectedLease.miles}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Bank
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {selectedLease.bank}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Current Status
                        </Typography>
                        <Chip
                          {...getStatusChipProps(selectedLease.groundingStatus)}
                          sx={{
                            fontWeight: 600,
                            ...getStatusChipProps(selectedLease.groundingStatus)
                              .sx,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Customer Plates
                        </Typography>
                        <Chip
                          {...getPlatesLeftProps(
                            selectedLease.leftPlates,
                            selectedLease.plateNumber
                          )}
                          sx={{
                            fontWeight: 600,
                            ...getPlatesLeftProps(
                              selectedLease.leftPlates,
                              selectedLease.plateNumber
                            ).sx,
                          }}
                        />
                      </Grid>
                    </Grid>

                    {selectedLease.updatedBy && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          backgroundColor: '#f8f9fa',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Last updated by:{' '}
                          <strong>
                            {selectedLease.updatedBy?.name || 'Unknown'}
                          </strong>
                          {selectedLease.updatedBy?.role &&
                            ` (${selectedLease.updatedBy.role})`}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Damage Report Section */}
                {selectedLease.damageReport && (
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        color="primary.main"
                        gutterBottom
                        fontWeight="bold"
                      >
                        Damage Report
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {selectedLease.damageReport}
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {/* Status Update Section */}
                <Card
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: 1,
                    position: 'relative',
                  }}
                >
                  <CardContent
                    sx={{
                      opacity:
                        selectedLease.groundingStatus === 'Grounded' &&
                        user?.role !== 'Driver' &&
                        user?.role !== 'Management'
                          ? 0.6
                          : 1,
                      pointerEvents:
                        selectedLease.groundingStatus === 'Grounded' &&
                        user?.role !== 'Driver' &&
                        user?.role !== 'Management'
                          ? 'none'
                          : 'auto',
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="primary.main"
                      gutterBottom
                      fontWeight="bold"
                    >
                      Update Status
                    </Typography>

                    {['Driver', 'Management'].includes(user?.role) ? (
                      <Stack spacing={2}>
                        <TextField
                          select
                          fullWidth
                          label="Select Status"
                          value={selectedLease.groundingStatus}
                          onChange={(e) =>
                            setSelectedLease((prev) => ({
                              ...prev,
                              groundingStatus: e.target.value,
                            }))
                          }
                        >
                          <MenuItem value="Grounded">Grounded</MenuItem>
                        </TextField>

                        <TextField
                          fullWidth
                          label="Where was the car grounded?"
                          value={groundingNote}
                          onChange={(e) => setGroundingNote(e.target.value)}
                          multiline
                          rows={2}
                          placeholder="Enter grounding location details..."
                        />
                      </Stack>
                    ) : (
                      <TextField
                        select
                        fullWidth
                        label="Select Status"
                        value={selectedLease.groundingStatus}
                        onChange={(e) =>
                          setSelectedLease((prev) => ({
                            ...prev,
                            groundingStatus: e.target.value,
                          }))
                        }
                      >
                        <MenuItem value="Ground">Ground</MenuItem>
                        <MenuItem value="Buy">Buying</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                      </TextField>
                    )}

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{
                        mt: 2,
                        py: 1.5,
                        fontWeight: 'bold',
                        borderRadius: 2,
                      }}
                      onClick={() =>
                        handleGroundingStatusUpdate(
                          selectedLease._id,
                          selectedLease.groundingStatus
                        )
                      }
                    >
                      Save Decision
                    </Button>
                  </CardContent>

                  {selectedLease.groundingStatus === 'Grounded' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        backgroundColor: 'warning.light',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: 2,
                        fontWeight: 'bold',
                        color: 'warning.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      🔒 Read-Only (Grounded)
                    </Box>
                  )}
                </Card>

                {/* Photos and Videos Combined Section */}
                {(selectedLease?.damagePictures?.length > 0 ||
                  selectedLease?.damageVideos?.length > 0) && (
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
                    <CardContent>
                      {(() => {
                        // Combine images and videos into a single media array
                        const mediaItems = [];

                        // Add images
                        if (selectedLease.damagePictures) {
                          selectedLease.damagePictures.forEach((url, index) => {
                            mediaItems.push({
                              type: 'image',
                              url: url,
                              id: `image-${index}`,
                            });
                          });
                        }

                        // Add videos
                        if (selectedLease.damageVideos) {
                          selectedLease.damageVideos.forEach((url, index) => {
                            mediaItems.push({
                              type: 'video',
                              url: url,
                              id: `video-${index}`,
                            });
                          });
                        }

                        if (mediaItems.length === 0) return null;

                        return (
                          <>
                            <Typography
                              variant="h6"
                              color="primary.main"
                              gutterBottom
                              fontWeight="bold"
                              sx={{ mb: 3 }}
                            >
                              Media Gallery ({mediaItems.length} items)
                            </Typography>

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
                                {/* Current Media Item */}
                                {mediaItems[currentMediaIndex]?.type ===
                                'image' ? (
                                  <img
                                    src={mediaItems[currentMediaIndex].url}
                                    alt={`Media ${currentMediaIndex + 1}`}
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
                                    key={currentMediaIndex} // Force re-render when switching
                                  >
                                    <source
                                      src={mediaItems[currentMediaIndex]?.url}
                                      type="video/mp4"
                                    />
                                    Your browser does not support the video tag.
                                  </video>
                                )}

                                {/* Navigation Arrows */}
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

                                {/* Media Type Indicator */}
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

                                {/* Counter */}
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

                              {/* Thumbnail Navigation */}
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
                                      onClick={() =>
                                        setCurrentMediaIndex(index)
                                      }
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
                                              backgroundColor:
                                                'rgba(0,0,0,0.7)',
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
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
            <Button
              onClick={() => {
                setSelectedLease(null);
                setCurrentMediaIndex(0); // Reset carousel when closing
              }}
              variant="outlined"
              size="large"
              sx={{
                borderRadius: 2,
                px: 4,
                fontWeight: 'bold',
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

export default LeaseReturnsList;
