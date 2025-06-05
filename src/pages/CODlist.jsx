import React, { useEffect, useState, useContext } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, CardMedia,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, TextField, MenuItem, Pagination, IconButton
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
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
            const imgRes = await fetch(`${api}/api/s3/signed-url?key=${encodeURIComponent(cod.contractPicture)}`, {
              credentials: 'include'
            });
            const { url } = await imgRes.json();
            return { id: cod._id, url };
          }
          return { id: cod._id, url: null };
        })
      );
      const map = {};
      urls.forEach(({ id, url }) => map[id] = url);
      setImageMap(map);
    };

    fetchCODs();
  }, [api]);

  useEffect(() => {
    const term = search.toLowerCase();
    const filteredResults = cods.filter(cod => {
      if (!term) return true;
      if (searchField === 'All') {
        return cod.customerName?.toLowerCase().includes(term) || cod.method?.toLowerCase().includes(term);
      }
      if (searchField === 'Customer') return cod.customerName?.toLowerCase().includes(term);
      if (searchField === 'Method') return cod.method?.toLowerCase().includes(term);
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

  return (<>
      <Topbar/>
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">COD Collections</Typography>

      <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          fullWidth
          label={searchField === 'All' ? 'Search by Customer or Method' : `Search by ${searchField}`}
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
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: 3, boxShadow: 3, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)', boxShadow: 6 } }}>
              {imageMap[cod._id] && (
                <CardMedia
                component="img"
                height="200"
                image={imageMap[cod._id]}
                alt="Contract"
                sx={{ objectFit: 'cover', backgroundColor: '#f5f5f5' }}
                />
              )}
              <CardContent>
                <Typography variant="h6">{cod.customerName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  ${cod.amount.toFixed(2)} • {new Date(cod.dateCollected).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">Method: {cod.method}</Typography>
              </CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
                <IconButton onClick={() => handleOpen(cod)}><Visibility /></IconButton>
              </Box>
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

      <Dialog open={!!selectedCOD} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Delivery & Salesperson Details</DialogTitle>
        <DialogContent dividers>
          {selectedCOD && (
            <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6" gutterBottom>
              Salesperson
            </Typography>
            <Typography>Name: {selectedCOD.salesperson?.name || '-'}</Typography>
            <Typography>Phone: {selectedCOD.salesperson?.phoneNumber || '-'}</Typography>
            <Typography>Email: {selectedCOD.salesperson?.email || '-'}</Typography>

            <Typography variant="h6" mt={2} gutterBottom>
              Delivery Details
            </Typography>
            <Typography>Customer: {selectedCOD.customerName}</Typography>
            <Typography>Address: {selectedCOD.address}</Typography>
            <Typography>
              Driver: {selectedCOD.driver?.name || selectedCOD.driver || '-'}
            </Typography>
            <Typography>
              Car: {selectedCOD.car?.year || '-'} {selectedCOD.car?.make || ''} {selectedCOD.car?.model || ''}
            </Typography>

            {imageMap[selectedCOD._id] && (
              <Box
              sx={{
                mt: 2,
                borderRadius: 2,
                overflow: 'hidden',
                width: '100%',
                maxHeight: 250,
                display: 'flex',
                justifyContent: 'center'
              }}
              >
                <img
                  src={imageMap[selectedCOD._id]}
                  alt="Contract"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                  />
              </Box>
            )}
          </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
          </>
  );
};

export default CODList;
