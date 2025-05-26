import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Container, Typography, TextField, Grid, Card, CardContent,
  IconButton, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, CardMedia
} from '@mui/material';
import { Delete, Visibility } from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';

const api = process.env.REACT_APP_API_URL;

const LeaseReturnsList = () => {
  const { token } = useContext(AuthContext);
  const [leases, setLeases] = useState([]);
  const [filteredLeases, setFilteredLeases] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLease, setSelectedLease] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [thumbnails, setThumbnails] = useState({});
  const [users, setUsers] = useState({});

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
    const filtered = leases.filter(lr =>
      lr.customerName?.toLowerCase().includes(term) ||
      lr.vin?.toLowerCase().includes(term) ||
      lr.address?.toLowerCase().includes(term)
    );
    setFilteredLeases(filtered);
  }, [search, leases]);

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
    const mediaFiles = await Promise.all(
      mediaKeys.map(async (key) => {
        const url = await fetchSignedUrl(key);
        return { key, url };
      })
    );

    const damagePictures = mediaFiles
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file.key))
      .map(file => file.url);

    const damageVideos = mediaFiles
      .filter(file => /\.mp4$/i.test(file.key))
      .map(file => file.url);

    setSelectedLease({
      ...lease,
      odometerPicture: odometerUrl,
      titlePicture: titleUrl,
      damagePictures,
      damageVideos,
      odometerStatementUrl
    });
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${api}/lease/deleteLr/${confirmDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setLeases(prev => prev.filter(lr => lr._id !== confirmDelete));
        setConfirmDelete(null);
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" mb={2} textAlign="center">Lease Returns</Typography>

      <Box sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
        <TextField
          fullWidth
          label="Search by Customer, VIN, or Address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2} justifyContent="center">
          {filteredLeases.map(lease => (
            <Grid item xs={12} sm={6} md={4} key={lease._id}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 2,
                boxShadow: 2,
                transition: '0.2s ease-in-out',
                '&:hover': { boxShadow: 6 }
              }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={thumbnails[lease._id] || 'https://via.placeholder.com/300x180?text=No+Image'}
                  alt="thumbnail"
                  sx={{ objectFit: 'cover', backgroundColor: '#f0f0f0' }}
                />
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {lease.customerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {lease.year} {lease.make} {lease.model}
                  </Typography>
                  <Typography variant="body2">Salesperson: {users[lease.salesPerson] || lease.salesPerson}</Typography>
                  <Typography variant="body2">Driver: {users[lease.driver] || lease.driver}</Typography>
                  <Typography variant="body2">Created: {new Date(lease.createdAt).toLocaleString()}</Typography>
                </CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pb: 1 }}>
                  <IconButton onClick={() => handleViewLease(lease)}><Visibility /></IconButton>
                  <IconButton color="error" onClick={() => setConfirmDelete(lease._id)}><Delete /></IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this lease return?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!selectedLease} onClose={() => setSelectedLease(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Lease Return Details</DialogTitle>
        <DialogContent>
          {selectedLease && (
            <Box>
              <Typography><strong>Customer:</strong> {selectedLease.customerName}</Typography>
              <Typography><strong>VIN:</strong> {selectedLease.vin}</Typography>
              <Typography><strong>Miles:</strong> {selectedLease.miles}</Typography>
              <Typography><strong>Bank:</strong> {selectedLease.bank}</Typography>
              <Typography><strong>Damage:</strong> {selectedLease.damageReport}</Typography>

              <Typography mt={2}><strong>Odometer Statement:</strong></Typography>
              {selectedLease.odometerStatementUrl && (
                <img
                  src={selectedLease.odometerStatementUrl}
                  alt="Odometer Statement"
                  style={{ width: '100%', borderRadius: 8, marginTop: 8 }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x250?text=Image+Not+Found';
                  }}
                />
              )}

              <Typography mt={2}><strong>Pictures:</strong></Typography>
              {selectedLease.damagePictures.map((pic, idx) => (
                <img
                  key={idx}
                  src={pic}
                  alt={`damage-${idx}`}
                  style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x250?text=Image+Not+Found';
                  }}
                />
              ))}

              <Typography mt={2}><strong>Videos:</strong></Typography>
              {selectedLease.damageVideos.map((vid, idx) => (
                <video key={idx} controls style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}>
                  <source src={vid} type="video/mp4" />
                </video>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLease(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeaseReturnsList;
