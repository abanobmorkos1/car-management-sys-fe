import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Container, Typography, TextField, Grid, Card, CardContent,
  IconButton, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, CardMedia, MenuItem, Pagination
} from '@mui/material';
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
  const { token } = useContext(AuthContext);
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
        data.forEach(u => userMap[u._id] = u.name || u.email || 'Unknown');
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
        setFilteredLeases(data);
        fetchThumbnails(data);
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
    });
    setFilteredLeases(filtered);
    setPage(1);
    setPaginatedLeases(filtered.slice(0, itemsPerPage));
  }, [search, searchField, leases]);

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
      odometerStatementUrl
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" mb={3} fontWeight="bold" textAlign="center">Lease Returns</Typography>

      <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          fullWidth
          label={searchField === 'All' ? 'Search by Customer, VIN, or Address' : `Search by ${searchField}`}
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
      </Box>

      {loading ? (
        <Box display="flex" alignContent="center" mt={4}></Box>
      ) : (
        <Grid container spacing={3} justifyContent={"center"}>
          {paginatedLeases.map(lease => (
            <Grid item xs={12} sm={6} md={4} key={lease._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: 3, boxShadow: 3, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)', boxShadow: 6 } }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={thumbnails[lease._id] }
                  alt="thumbnail"
                  sx={{ objectFit: 'fit', backgroundColor: '#f5f5f5' }}
                />
                <CardContent justifyContent='center'>
                  <Typography variant="h6">{highlightText(lease.customerName || '', search)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {lease.year}{' '}
                    {highlightText(lease.make || '', search)}{' '}
                    {highlightText(lease.model || '', search)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Salesperson: {users[lease.salesPerson] || lease.salesPerson}</Typography>
                  <Typography variant="body2" color="text.secondary">Driver: {users[lease.driver] || lease.driver}</Typography>
                  <Typography variant="body2" color="text.secondary">Created: {new Date(lease.createdAt).toLocaleString()}</Typography>
                </CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
                  <IconButton onClick={() => handleViewLease(lease)}><Visibility /></IconButton>
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
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                <Typography variant="body1">{selectedLease.customerName}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">VIN</Typography>
                <Typography variant="body1">{selectedLease.vin}</Typography>
              </Box>
              <Box display="flex" gap={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.secondary">Miles</Typography>
                  <Typography variant="body1">{selectedLease.miles}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.secondary">Bank</Typography>
                  <Typography variant="body1">{selectedLease.bank}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Damage Report</Typography>
                <Typography variant="body1">{selectedLease.damageReport}</Typography>
              </Box>

              {selectedLease.odometerStatementUrl && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Odometer Statement</Typography>
                  <img src={selectedLease.odometerStatementUrl} alt="Odometer Statement" style={{ width: '100%', borderRadius: 8, marginTop: 8 }} />
                </Box>
              )}

              {selectedLease.damagePictures.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>Damage Photos</Typography>
                  <Grid container spacing={2}>
                    {selectedLease.damagePictures.map((pic, idx) => (
                      <Grid item xs={12} sm={6} key={idx}>
                        <img src={pic} alt={`damage-${idx}`} style={{ width: '100%', borderRadius: 8 }} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {selectedLease.damageVideos.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>Damage Videos</Typography>
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
