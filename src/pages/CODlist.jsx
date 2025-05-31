import React, { useEffect, useState, useContext } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, CardMedia,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box
} from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';

const CODList = () => {
  const [cods, setCODs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCOD, setSelectedCOD] = useState(null);
  const [imageMap, setImageMap] = useState({});

  const api = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchCODs = async () => {
      try {
        const res = await fetch(`${api}/cod/all`, {
          credentials: 'include'
        });
        const data = await res.json();
        setCODs(data);

        // Fetch signed URLs for each contract image
        const urls = await Promise.all(
          data.map(async (cod) => {
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

        const imageMapObj = {};
        urls.forEach(({ id, url }) => {
          imageMapObj[id] = url;
        });
        setImageMap(imageMapObj);

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch CODs:', err);
      }
    };
    fetchCODs();
  }, [api]);

  const handleOpen = (cod) => setSelectedCOD(cod);
  const handleClose = () => setSelectedCOD(null);

  if (loading) {
    return <Typography align="center" sx={{ mt: 4 }}>Loading...</Typography>;
  }

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom align="center">COD Collections</Typography>
      <Grid container spacing={3}>
        {cods.map((cod) => (
          <Grid item xs={12} sm={6} md={4} key={cod._id}>
            <Card
              onClick={() => handleOpen(cod)}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)' }
              }}
            >
              {imageMap[cod._id] && (
                <CardMedia
                  component="img"
                  height="140"
                  image={imageMap[cod._id]}
                  alt="Contract"
                />
              )}
              <CardContent>
                <Typography variant="h6">{cod.customerName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  ${cod.amount.toFixed(2)} • {new Date(cod.dateCollected).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Method: {cod.method}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!selectedCOD} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Delivery & Salesperson Details</DialogTitle>
        <DialogContent dividers>
          {selectedCOD && (
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Salesperson</Typography>
              <Typography>Name: {selectedCOD.salesperson?.name || '-'}</Typography>
              <Typography>
                Phone: {selectedCOD.salesperson?.phoneNumber || '-'}
              </Typography>
              <Typography>Email: {selectedCOD.salesperson?.email || '-'}</Typography>

              <Typography variant="h6" mt={2}>Delivery Details</Typography>
              <Typography>Customer: {selectedCOD.customerName}</Typography>
              <Typography>Address: {selectedCOD.address}</Typography>
              <Typography>
                Driver: {selectedCOD.driver?.name || selectedCOD.driver || '-'}
              </Typography>
              <Typography>
                Car: {selectedCOD.car?.year} {selectedCOD.car?.make} {selectedCOD.car?.model}
              </Typography>
              {imageMap[selectedCOD._id] && (
                <img
                  src={imageMap[selectedCOD._id]}
                  alt="Contract"
                  style={{ width: '100%', borderRadius: '8px', marginTop: '12px' }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CODList;
