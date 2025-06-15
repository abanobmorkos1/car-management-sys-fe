import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';
import trimCanvas from 'trim-canvas';

const SignatureModal = ({ open, onClose, onSave, title = 'Signature' }) => {
  const sigRef = useRef(null);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [error, setError] = useState('');

  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 600,
    height: 200,
  });

  const updateCanvasSize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.floor(rect.width - 4);
      const newHeight = Math.floor(rect.height - 4);

      setCanvasDimensions({ width: newWidth, height: newHeight });
    }
  }, []);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(updateCanvasSize, 100);
      return () => clearTimeout(timer);
    }
  }, [open, updateCanvasSize]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [updateCanvasSize]);

  const handleDone = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      setError('Please provide a signature before proceeding.');
      return;
    }

    try {
      const signatureCanvas = getTrimmedCanvas();

      onSave({
        signature: signatureCanvas.toDataURL('image/png'),
        proofPhoto: '',
      });
      handleClose();
    } catch (err) {
      setError('Failed to complete signature process. Please try again.');
      console.error('Signature completion error:', err);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const clearSignature = () => {
    if (sigRef.current) {
      sigRef.current.clear();
    }
  };

  const getTrimmedCanvas = () => {
    if (!sigRef.current) {
      return null;
    }
    const canvas = sigRef.current.getCanvas();
    const copy = document.createElement('canvas');
    copy.width = canvas.width;
    copy.height = canvas.height;

    copy.getContext('2d').drawImage(canvas, 0, 0);

    return trimCanvas(copy);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={{
          minHeight: '400px',
        }}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" sx={{ mb: 2 }}>
            Please sign in the box below.
          </Typography>

          <Box
            ref={containerRef}
            sx={{
              border: '2px solid #ccc',
              borderRadius: 1,
              mb: 2,
              position: 'relative',
              height: '200px',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <SignatureCanvas
              ref={sigRef}
              penColor="black"
              dotSize={0.5}
              minWidth={0.5}
              maxWidth={2}
              canvasProps={{
                width: canvasDimensions.width,
                height: canvasDimensions.height,
                style: {
                  width: '100%',
                  height: '100%',
                  display: 'block',
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Button onClick={clearSignature} variant="outlined" size="small">
              Clear Signature
            </Button>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDone} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
};

export default SignatureModal;
