import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Container, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Paper, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import { Delete, Visibility } from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';

const api = process.env.REACT_APP_API_URL;

const LeaseReturnsList = () => {
  const { token } = useContext(AuthContext);
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLease, setSelectedLease] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const res = await fetch(`${api}/lease/getlr`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setLeases(data);
      } catch (err) {
        console.error('Failed to fetch lease returns:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeases();
  }, [token]);

  const fetchSignedUrl = async (key) => {
    if (!key) return null;
    try {
      const res = await fetch(`${api}/api/get-image-url?key=${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { url } = await res.json();
      return url?.startsWith('http:') ? url.replace('http:', 'https:') : url;
    } catch (err) {
      console.error('Failed to fetch signed URL:', err);
      return null;
    }
  };

  const fetchDownloadUrl = async (key) => {
  if (!key) return null;
  try {
    const res = await fetch(`${api}/api/get-download-url?key=${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const { url } = await res.json();
    return url;
  } catch (err) {
    console.error('Failed to fetch PDF download URL:', err);
    return null;
  }
};


  const handleViewLease = async (lease) => {
    const odometerUrl = await fetchSignedUrl(lease.odometerKey);;
    const odometerPdfUrl = await fetchDownloadUrl(lease.odometerStatementKey);
    const titleUrl = lease.hasTitle ? await fetchSignedUrl(lease.titleKey) : null;
    const damageUrls = await Promise.all((lease.damageKeys || []).map(fetchSignedUrl));
    const damageVideoUrls = await Promise.all((lease.damageVideoKeys || []).map(fetchSignedUrl));

    const docFiles = await Promise.all(
      (lease.documents || []).map(async (doc) => ({
        ...doc,
        url: await fetchSignedUrl(doc.key)
      }))
    );

    setSelectedLease({
  ...lease,
  odometerPicture: odometerUrl,
  titlePicture: titleUrl,
  damagePictures: damageUrls,
  damageVideos: damageVideoUrls,
  documentFiles: docFiles,
  odometerPdfUrl
});

  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${api}/api/lease/deleteLr/${confirmDelete}`, {
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
      <Typography variant="h5" mb={2}>Lease Returns</Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>VIN</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Salesperson</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leases.map(lease => (
                <TableRow key={lease._id}>
                  <TableCell>{lease.vin}</TableCell>
                  <TableCell>{lease.customerName}</TableCell>
                  <TableCell>{lease.salesPerson}</TableCell>
                  <TableCell>{lease.driver}</TableCell>
                  <TableCell>{new Date(lease.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleViewLease(lease)}><Visibility /></IconButton>
                    <IconButton color="error" onClick={() => setConfirmDelete(lease._id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
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
              <Typography><strong>Car:</strong> {selectedLease.year} {selectedLease.make} {selectedLease.model}</Typography>
              <Typography><strong>Miles:</strong> {selectedLease.miles}</Typography>
              <Typography><strong>Bank:</strong> {selectedLease.bank}</Typography>
              <Typography><strong>Damage:</strong> {selectedLease.damageReport}</Typography>

              <Typography mt={2}><strong>Odometer:</strong></Typography>
              {selectedLease.odometerPicture && (
                selectedLease.odometerPicture.endsWith('.mp4') ? (
                  <video controls style={{ width: '100%', borderRadius: 8 }}>
                    <source src={selectedLease.odometerPicture} type="video/mp4" />
                  </video>
                ) : (
                  <img src={selectedLease.odometerPicture} alt="odometer" style={{ width: '100%', borderRadius: 8 }} />
                )
              )}

              <Typography mt={2}><strong>Damage Pictures:</strong></Typography>
              {selectedLease.damagePictures.map((pic, idx) => (
                <img key={idx} src={pic} alt={`damage-${idx}`} style={{ width: '100%', borderRadius: 8, marginBottom: 8 }} />
              ))}

              <Typography mt={2}><strong>Damage Videos:</strong></Typography>
              {selectedLease.damageVideos.map((vid, idx) => (
                <video key={idx} controls style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}>
                  <source src={vid} type="video/mp4" />
                </video>
              ))}

              {selectedLease.hasTitle && (
                <>
                  <Typography mt={2}><strong>Title Picture:</strong></Typography>
                  {selectedLease.titlePicture?.endsWith('.mp4') ? (
                    <video controls style={{ width: '100%', borderRadius: 8 }}>
                      <source src={selectedLease.titlePicture} type="video/mp4" />
                    </video>
                  ) : (
                    <img src={selectedLease.titlePicture} alt="title" style={{ width: '100%', borderRadius: 8 }} />
                  )}
                </>
              )}

              {selectedLease.documentFiles?.length > 0 && (
<>
                  <Typography mt={2}><strong>Documents:</strong></Typography>
                  {selectedLease.documentFiles.map((doc, idx) => (
                    <Box key={idx} mt={1} sx={{ backgroundColor: '#f4f4f4', p: 1, borderRadius: 2 }}>
                      <Typography variant="subtitle2">{doc.type}</Typography>
                      {!doc.url ? (
                    <Typography color="error">⚠️ Failed to load file</Typography>
                  ) : doc.url.endsWith('.pdf') ? (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">📄 View PDF</a>
                  ) : doc.url.match(/\.(jpg|jpeg|png)$/i) ? (
                    <img src={doc.url} alt={doc.type} style={{ width: '100%', borderRadius: 8, marginTop: 4 }} />
                  ) : doc.url.endsWith('.mp4') ? (
                    <video controls style={{ width: '100%', borderRadius: 8, marginTop: 4 }}>
                      <source src={doc.url} type="video/mp4" />
                    </video>
                  ) : (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">🔗 Open File</a>
                  )}


                        </Box>
                  ))}
                </>
              )}
              {selectedLease.odometerPdfUrl && (
                <Box mt={3}>
                  <Typography variant="subtitle1">Odometer Statement PDF:</Typography>
                  <iframe
                    src={selectedLease.odometerPdfUrl}
                    width="100%"
                    height="500px"
                    title="Odometer PDF"
                    style={{ border: '1px solid #ccc', borderRadius: 8, marginTop: 8 }}
                  />
                </Box>
              )}
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
