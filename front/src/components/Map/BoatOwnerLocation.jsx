import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Snackbar, Alert } from '@mui/material';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const BoatOwnerLocation = ({ boatId }) => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const socket = io('http://localhost:3000', { withCredentials: true });
  const navigate = useNavigate();

  useEffect(() => {
    if (!boatId) {
      setError('No boat ID provided');
      setSnackbarOpen(true);
      return;
    }

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ latitude, longitude });
          socket.emit('updateBoatLocation', {
            boatId,
            latitude,
            longitude,
            token: localStorage.getItem('token')
          });
        },
        (err) => {
          setError('Geolocation error: ' + err.message);
          setSnackbarOpen(true);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError('Geolocation not supported by this browser');
      setSnackbarOpen(true);
    }
  }, [socket, boatId]);

  useEffect(() => {
    socket.on('error', ({ message }) => {
      setError(message);
      setSnackbarOpen(true);
      if (message === 'Unauthorized') {
        navigate('/login');
      }
    });

    return () => socket.off('error');
  }, [socket, navigate]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleManualUpdate = () => {
    if (position) {
      socket.emit('updateBoatLocation', {
        boatId,
        latitude: position.latitude,
        longitude: position.longitude,
        token: localStorage.getItem('token')
      });
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {position
          ? `Current Location: ${position.latitude}, ${position.longitude}`
          : 'Fetching location...'}
      </Typography>
      <Button
        variant="contained"
        onClick={handleManualUpdate}
        disabled={!position}
        sx={{ mr: 2 }}
      >
        Update Location
      </Button>
      <Button
        variant="outlined"
        onClick={() => navigator.geolocation.getCurrentPosition(handleManualUpdate)}
        disabled={!navigator.geolocation}
      >
        Refresh Location
      </Button>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BoatOwnerLocation;