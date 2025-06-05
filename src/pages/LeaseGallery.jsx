import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Container, Typography, TextField, Grid, Card, CardContent,
  DialogActions, Button, CardMedia, MenuItem, Pagination, Dialog , DialogTitle
  ,DialogContent
  ,IconButton 
} from '@mui/material';
import { Chip } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';

const api = process.env.REACT_APP_API_URL;

// Utility to highlight matching text
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

const LeaseReturnsList = () => {
  const { user , token} = useContext(AuthContext);
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
      const res = await fetch(`${api}/api/users/all`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      const userMap = {};
      data.forEach(u => {
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
        credentials: 'include'
      });
      const data = await res.json();

      setLeases(data);
      fetchThumbnails(data);

      // Re-apply filters and search
      const term = search.toLowerCase();
      const filtered = data.filter(lr => {
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
          if (searchField === 'Make') return lr.make?.toLowerCase().includes(term);
          if (searchField === 'Trim') return lr.trim?.toLowerCase().includes(term);
          if (searchField === 'Model') return lr.model?.toLowerCase().includes(term);
          return false;
        })();

        const matchesStatus = !statusFilter || lr.groundingStatus === statusFilter;
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
      const key = lease.leaseReturnMediaKeys?.find(k => /\.(jpg|jpeg|png|webp)$/i.test(k)) || lease.leaseReturnMediaKeys?.[0];
      if (key) {
        try {
          const res = await fetch(`${api}/api/get-image-url?key=${encodeURIComponent(key)}`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          });
          const { url } = await res.json();
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
  const filtered = leases.filter(lr => {
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
      if (searchField === 'Make') return lr.make?.toLowerCase().includes(term);
      if (searchField === 'Trim') return lr.trim?.toLowerCase().includes(term);
      if (searchField === 'Model') return lr.model?.toLowerCase().includes(term);
      return false;
    })();

    const matchesStatus =
      !statusFilter || lr.groundingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  setFilteredLeases(filtered);
  setPage(1);
  setPaginatedLeases(filtered.slice(0, itemsPerPage));
}, [search, searchField, statusFilter, leases]);



  useEffect(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedLeases(filteredLeases.slice(startIndex, endIndex));
  }, [page, filteredLeases]);

  const fetchSignedUrl = async (key) => {
    if (!key) return null;
    try {
      const res = await fetch(`${api}/api/get-image-url?key=${encodeURIComponent(key)}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const { url } = await res.json();
      return url?.startsWith('http:') ? url.replace('http:', 'https:') : url;
    } catch (err) {
      console.error('Failed to fetch signed URL:', err);
      return null;
    }
  };

  const handleViewLease = async (lease) => {
    const odometerUrl = await fetchSignedUrl(lease.odometerKey);
    const titleUrl = lease.hasTitle ? await fetchSignedUrl(lease.titleKey) : null;
    const odometerStatementUrl = lease.odometerStatementKey ? await fetchSignedUrl(lease.odometerStatementKey) : null;
    const mediaKeys = lease.leaseReturnMediaKeys || [];
    const mediaFiles = await Promise.all(mediaKeys.map(async (key) => {
      const url = await fetchSignedUrl(key);
      return { key, url };
    }));
    const damagePictures = mediaFiles.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file.key)).map(file => file.url);
    const damageVideos = mediaFiles.filter(file => /\.mp4$/i.test(file.key)).map(file => file.url);
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
      body: JSON.stringify({ status: newStatus, note: groundingNote })
    });

     const updatedLease = await res.json();
    console.log('✅ Updated groundingStatus:', updatedLease.groundingStatus);
    const formattedLease = {
      ...updatedLease,
      salesPerson: updatedLease.salesPerson?.name || updatedLease.salesPerson?._id || '',
      driver: updatedLease.driver?.name || updatedLease.driver?._id || '',
      updatedBy: updatedLease.updatedBy || null,
      createdAt: new Date(updatedLease.createdAt).toLocaleString(),
      updatedAt: new Date(updatedLease.updatedAt).toLocaleString()
    };

    setLeases(prev => prev.map(l => (l._id === leaseId ? formattedLease : l)));
    setFilteredLeases(prev => prev.map(l => (l._id === leaseId ? formattedLease : l)));
    setPaginatedLeases(prev => prev.map(l => (l._id === leaseId ? formattedLease : l)));
    setSelectedLease(formattedLease);
  } catch (err) {
    console.error('Error updating status:', err);
  }
};

const getStatusChipProps = (status) => {
  switch (status) {
    case 'Buy':
      return { label: 'Buying', color: 'success' }; // Green
    case 'Ground':
      return { label: 'Ground', color: 'primary' }; // Blue
    case 'In Progress':
      return {
        label: 'In Progress',
        sx: { backgroundColor: '#ffeb3b', color: '#000' }, // Yellow with black text
      };
    case 'Not Set':
    case '':
    case undefined:
      return { label: '—', sx: { backgroundColor: '#e0e0e0', color: '#000' } };
    default:
      return { label: status, sx: { backgroundColor: '#e0e0e0', color: '#000' } };
  }
};

return (
  <Container maxWidth="lg" sx={{ mt: 4 }}>
    <Typography variant="h4" mb={3} fontWeight="bold" textAlign="center">
      Lease Returns
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
            ? 'Search by Customer, VIN, or Address'
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
        <MenuItem value="Not Set">Not Set</MenuItem>
      </TextField>
    </Box>

    {loading ? (
      <Box display="flex" alignContent="center" mt={4}></Box>
    ) : (
      <Grid container spacing={3} justifyContent="center">
        {paginatedLeases.map((lease) => (
          <Grid item xs={12} sm={6} md={4} key={lease._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRadius: 3,
                boxShadow: 3,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={thumbnails[lease._id]}
                alt="thumbnail"
                sx={{ objectFit: 'fit', backgroundColor: '#f5f5f5' }}
              />
              <CardContent>
                <Typography variant="h6">
                  {highlightText(lease.customerName || '', search)}
                </Typography>
                <Typography variant="body2" color="blue">
                  {lease.year}{' '}
                  {highlightText(lease.make || '', search)}{' '}
                  {highlightText(lease.model || '', search)}
                </Typography>
                <Typography variant="body2" color="blue">
                  Salesperson:{' '}
                  {typeof lease.salesPerson === 'object'
                    ? lease.salesPerson?.name ||
                      lease.salesPerson?.email ||
                      'Unknown'
                    : users[lease.salesPerson] || lease.salesPerson}
                </Typography>
                <Typography variant="body2" color="blue">
                  Driver:{' '}
                  {typeof lease.driver === 'object'
                    ? lease.driver?.name || 'Unknown'
                    : users[lease.driver] || lease.driver}
                </Typography>
                <Typography variant="body2" color="blue">
                  Created: {new Date(lease.createdAt).toLocaleString()}
                </Typography>
              <Chip
                label={getStatusChipProps(lease.groundingStatus).label}
                color={getStatusChipProps(lease.groundingStatus).color}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  ...getStatusChipProps(lease.groundingStatus).sx,
                  mt: 1
                }}
              />
              {lease.groundingStatus === 'Grounded' && (
                <Chip
                  label=" Grounded"
                  color="success"
                  sx={{ fontWeight: 600, fontSize: '0.75rem', mt: 1 }}
                />
              )}
              </CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
                <IconButton onClick={() => handleViewLease(lease)}>
                  <Visibility />
                </IconButton>
              </Box>
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
        />
      </Box>
    )}

<Dialog open={!!selectedLease} onClose={() => setSelectedLease(null)} maxWidth="md" fullWidth>
  <DialogTitle sx={{ fontWeight: 700 }}>Lease Return Details</DialogTitle>
  <DialogContent dividers sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
    {selectedLease && (
      <Box display="flex" flexDirection="column" gap={2}>
        <Typography variant="subtitle2" color="blue">Customer</Typography>
        <Typography variant="body1">{selectedLease.customerName}</Typography>

        <Typography variant="subtitle2" color="blue">VIN</Typography>
        <Typography variant="body1">{selectedLease.vin}</Typography>

        <Box display="flex" gap={2}>
          <Box flex={1}>
            <Typography variant="subtitle2" color="blue">Miles</Typography>
            <Typography variant="body1">{selectedLease.miles}</Typography>
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle2" color="blue">Bank</Typography>
            <Typography variant="body1">{selectedLease.bank}</Typography>
          </Box>
        </Box>

        <Typography variant="subtitle2" color="blue">Grounding Status</Typography>
        <Typography variant="body1" color="primary" fontWeight="bold">
          {selectedLease.groundingStatus || '—'}
        </Typography>

        {selectedLease.updatedBy && (
          <Typography variant="body2" mt={1}>
            Updated by: {selectedLease.updatedBy?.name || 'Unknown'} ({selectedLease.updatedBy?.role || ''})
          </Typography>
        )}

        <Typography variant="subtitle2" color="blue">Damage Report</Typography>
        <Typography variant="body1">{selectedLease.damageReport}</Typography>

        <Box
          sx={{
            position: 'relative',
            opacity: (selectedLease.groundingStatus === 'Grounded' && user?.role !== 'Driver' && user?.role !== 'Management') ? 0.6 : 1,
            pointerEvents: (selectedLease.groundingStatus === 'Grounded' && user?.role !== 'Driver' && user?.role !== 'Management') ? 'none' : 'auto',

          }}
        >
          {['Driver', 'Management'].includes(user?.role) ? (
            <>
              <TextField
                select
                fullWidth
                label="Select Status"
                value={groundingStatus}
                onChange={(e) => setGroundingStatus(e.target.value)}
                sx={{ mt: 1, mb: 2 }}
              >
                <MenuItem value="Grounded">Grounded</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Where was the car grounded?"
                value={groundingNote}
                onChange={(e) => setGroundingNote(e.target.value)}
                multiline
                minRows={1}
                sx={{ mb: 2 }}
              />
            </>
          ) : (
            <TextField
              select
              fullWidth
              label="Select Status"
              value={groundingStatus}
              onChange={(e) => setGroundingStatus(e.target.value)}
              sx={{ mt: 1, mb: 2 }}
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
            onClick={() => handleGroundingStatusUpdate(selectedLease._id, groundingStatus)}
          >
            Save Decision
          </Button>
        </Box>

        {selectedLease.groundingStatus === 'Grounded' && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              backgroundColor: 'rgba(255,255,255,0.9)',
              px: 2,
              py: 1,
              borderRadius: 1,
              boxShadow: 1,
              fontWeight: 'bold',
              color: '#333',
            }}
          >
            🔒 Read-Only (Grounded)
          </Box>
        )}
            {selectedLease?.odometerStatementUrl && (
              <Box>
                <Typography variant="subtitle2" color="blue">Odometer Statement</Typography>
                <img
                  src={selectedLease.odometerStatementUrl}
                  alt="Odometer Statement"
                  style={{ width: '100%', borderRadius: 8, marginTop: 8 }}
                />
              </Box>
            )}

            {selectedLease?.damagePictures?.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="blue" mb={1}>Photos</Typography>
                <Grid container spacing={2}>
                  {selectedLease.damagePictures.map((pic, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <img
                        src={pic}
                        alt={`damage-${idx}`}
                        style={{ width: '100%', borderRadius: 8 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {selectedLease?.damageVideos?.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="blue" mb={1}>Car </Typography>
                <Grid container spacing={2}>
                  {selectedLease.damageVideos.map((vid, idx) => (
                    <Grid item xs={12} key={idx}>
                      <video controls style={{ width: '100%', borderRadius: 8 }}>
                        <source src={vid} type="video/mp4" />
                      </video>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSelectedLease(null)} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  </Container>
);
};

export default LeaseReturnsList;