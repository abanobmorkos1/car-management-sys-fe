import React, { useEffect, useState, useContext } from 'react';
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
} from '@mui/material';
import { Chip } from '@mui/material';
import {
  Visibility,
  Person,
  CalendarToday,
  DirectionsCar,
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
  const [filteredLeases, setFilteredLeases] = useState([]);
  const [paginatedLeases, setPaginatedLeases] = useState([]);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedLease, setSelectedLease] = useState(null);
  const [thumbnails, setThumbnails] = useState({});
  const [users, setUsers] = useState({});
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const [groundingStatus, setGroundingStatus] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [groundingNote, setGroundingNote] = useState('');

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

    const fetchLeases = async () => {
      try {
        const res = await fetch(`${api}/lease/getlr`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();

        setLeases(data);
        fetchThumbnails(data);

        // Re-apply filters and search
        const term = search.toLowerCase();
        const filtered = data.filter((lr) => {
          const matchesSearch = (() => {
            if (!term) return true;
            if (searchField === 'All') {
              return (
                lr.customerName?.toLowerCase().includes(term) ||
                lr.vin?.toLowerCase().includes(term) ||
                lr.address?.toLowerCase().includes(term) ||
                lr.make?.toLowerCase().includes(term) ||
                lr.trim?.toLowerCase().includes(term) ||
                lr.model?.toLowerCase().includes(term)
              );
            }
            if (searchField === 'Make')
              return lr.make?.toLowerCase().includes(term);
            if (searchField === 'Trim')
              return lr.trim?.toLowerCase().includes(term);
            if (searchField === 'Model')
              return lr.model?.toLowerCase().includes(term);
            return false;
          })();

          const matchesStatus =
            !statusFilter || lr.groundingStatus === statusFilter;
          return matchesSearch && matchesStatus;
        });

        setFilteredLeases(filtered);
        setPage(1);
        setPaginatedLeases(filtered.slice(0, itemsPerPage));
      } catch (err) {
        console.error('Failed to fetch lease returns:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchLeases();
  }, [token]);

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
          thumbs[lease._id] = await fetchSignedUrl(lease.odometerKey);
          continue;
        } else if (
          lease.titleKey &&
          /\.(jpg|jpeg|png|webp)$/i.test(lease.titleKey)
        ) {
          thumbs[lease._id] = await fetchSignedUrl(lease.titleKey);
          continue;
        }
      }
      if (key) {
        try {
          console.log({ lease });
          const url = await fetchSignedUrl(key);
          console.log('Thumbnail URL:', url);
          thumbs[lease._id] = url;
        } catch (err) {
          console.warn('Failed to load thumbnail:', err);
        }
      }
    }
    setThumbnails(thumbs);
  };

  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = leases.filter((lr) => {
      const matchesSearch = (() => {
        if (!term) return true;
        if (searchField === 'All') {
          return (
            lr.customerName?.toLowerCase().includes(term) ||
            lr.vin?.toLowerCase().includes(term) ||
            lr.address?.toLowerCase().includes(term) ||
            lr.make?.toLowerCase().includes(term) ||
            lr.trim?.toLowerCase().includes(term) ||
            lr.model?.toLowerCase().includes(term)
          );
        }
        if (searchField === 'Make')
          return lr.make?.toLowerCase().includes(term);
        if (searchField === 'Trim')
          return lr.trim?.toLowerCase().includes(term);
        if (searchField === 'Model')
          return lr.model?.toLowerCase().includes(term);
        return false;
      })();

      const matchesStatus =
        !statusFilter || lr.groundingStatus === statusFilter.trim();

      return matchesSearch && matchesStatus;
    });

    setFilteredLeases(filtered);
    // Only reset page if we're beyond the available pages
    const maxPages = Math.ceil(filtered.length / itemsPerPage);
    if (page > maxPages && maxPages > 0) {
      setPage(maxPages);
    } else if (filtered.length === 0) {
      setPage(1);
    }

    // Update paginated results based on current page
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedLeases(filtered.slice(startIndex, endIndex));
  }, [search, searchField, statusFilter, leases, page]);

  useEffect(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedLeases(filteredLeases.slice(startIndex, endIndex));
  }, [page, filteredLeases]);

  const fetchSignedUrl = async (key) => {
    if (!key) return null;
    try {
      const res = await fetch(
        `${api}/api/get-image-url?key=${encodeURIComponent(key)}`,
        {
          credentials: 'include',
        }
      );

      if (res.ok) {
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch signed URL:', err);
      return null;
    }
  };

  const handleViewLease = async (lease) => {
    const odometerUrl = await fetchSignedUrl(lease.odometerKey);
    const titleUrl = lease.hasTitle
      ? await fetchSignedUrl(lease.titleKey)
      : null;
    const odometerStatementUrl = lease.odometerStatementKey
      ? await fetchSignedUrl(lease.odometerStatementKey)
      : null;
    const mediaKeys = lease.leaseReturnMediaKeys || [];
    const mediaFiles = await Promise.all(
      mediaKeys.map(async (key) => {
        const url = await fetchSignedUrl(key);
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
    setGroundingStatus(lease.groundingStatus || '');
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

  console.log({ paginatedLeases, page });
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Topbar />
      <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
        <Typography
          variant="h4"
          mb={4}
          fontWeight="bold"
          textAlign="center"
          sx={{ color: 'primary.main' }}
        >
          Lease Returns Gallery
        </Typography>

        {/* Search and Filter Controls */}
        <Card sx={{ mb: 4, p: 3, borderRadius: 3, boxShadow: 2 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
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
              sx={{ borderRadius: 2 }}
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
              <MenuItem value="Trim">Trim</MenuItem>
              <MenuItem value="Model">Model</MenuItem>
            </TextField>
            <TextField
              select
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Grounded">Grounded</MenuItem>
              <MenuItem value="Buy">Buying</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value=" ">Not Set</MenuItem>
            </TextField>
          </Box>
        </Card>

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
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {paginatedLeases.map((lease) => (
              <Grid item xs={12} sm={6} md={4} key={lease._id}>
                <Card
                  sx={{
                    height: 420,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    boxShadow: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
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
                        alt="Car thumbnail"
                        sx={{
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                          '&:hover': { transform: 'scale(1.05)' },
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: '200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f5f5f5',
                          color: 'text.secondary',
                        }}
                      >
                        <DirectionsCar sx={{ fontSize: 48 }} />
                      </Box>
                    )}
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

        {filteredLeases.length > itemsPerPage && (
          <Box mt={4} display="flex" justifyContent="center">
            <Pagination
              count={Math.ceil(filteredLeases.length / itemsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                },
              }}
            />
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
                          value={groundingStatus}
                          onChange={(e) => setGroundingStatus(e.target.value)}
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
                        value={groundingStatus}
                        onChange={(e) => setGroundingStatus(e.target.value)}
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
                          groundingStatus
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

                {/* Odometer Statement */}
                {selectedLease?.odometerStatementUrl && (
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        color="primary.main"
                        gutterBottom
                        fontWeight="bold"
                      >
                        Odometer Statement
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 400,
                          mx: 'auto',
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: 2,
                        }}
                      >
                        <img
                          src={selectedLease.odometerStatementUrl}
                          alt="Odometer Statement"
                          style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Photos Section */}
                {selectedLease?.damagePictures?.length > 0 && (
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        color="primary.main"
                        gutterBottom
                        fontWeight="bold"
                      >
                        Damage Photos ({selectedLease.damagePictures.length})
                      </Typography>
                      <Grid container spacing={2}>
                        {selectedLease.damagePictures.map((pic, idx) => (
                          <Grid item xs={12} sm={6} md={4} key={idx}>
                            <Box
                              sx={{
                                width: '100%',
                                height: 200,
                                borderRadius: 2,
                                overflow: 'hidden',
                                boxShadow: 1,
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.02)' },
                              }}
                            >
                              <img
                                src={pic}
                                alt={`Damage photo ${idx + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Videos Section */}
                {selectedLease?.damageVideos?.length > 0 && (
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        color="primary.main"
                        gutterBottom
                        fontWeight="bold"
                      >
                        Car Videos ({selectedLease.damageVideos.length})
                      </Typography>
                      <Grid container spacing={2}>
                        {selectedLease.damageVideos.map((vid, idx) => (
                          <Grid item xs={12} md={6} key={idx}>
                            <Box
                              sx={{
                                width: '100%',
                                borderRadius: 2,
                                overflow: 'hidden',
                                boxShadow: 1,
                              }}
                            >
                              <video
                                controls
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  display: 'block',
                                }}
                              >
                                <source src={vid} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
            <Button
              onClick={() => setSelectedLease(null)}
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
