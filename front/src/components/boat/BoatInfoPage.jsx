import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {Button} from "@mui/material";

import {
  Box, Typography, Paper, CircularProgress, Alert, Snackbar, Chip, Grid, Avatar,
} from '@mui/material';
import { FaMapMarkerAlt } from 'react-icons/fa';

const API_URL = "http://localhost:3000";

const BoatInfoPage = () => {
  const [boat, setBoat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      setError('You must be logged in to view boat info');
      setSnackbarOpen(true);
      navigate('/login');
      return;
    }

    const fetchBoatInfo = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/boats/my-boat`);
        if (response.data.success) {
          setBoat(response.data.boat);
        } else {
          setError(response.data.message || 'Failed to fetch boat info');
          setSnackbarOpen(true);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching boat info');
        setSnackbarOpen(true);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBoatInfo();
  }, [navigate]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!boat) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
        <Alert severity="error">{error || 'No boat found'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Boat Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Avatar
              src={boat.photos[0] ? `${API_URL}${boat.photos[0]}` : '/default-boat.jpg'}
              sx={{ width: 150, height: 150, mb: 2 }}
              onError={(e) => (e.target.src = '/default-boat.jpg')}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="h6">Boat Name: {boat.name}</Typography>
            <Typography variant="body1">Type: {boat.boatType}</Typography>
            <Typography variant="body1">Capacity: {boat.boatCapacity} passengers</Typography>
            <Typography variant="body1">License: {boat.boatLicense}</Typography>
            <Typography variant="body1">
              Status: {boat.isVerified ? 'Verified' : boat.isRejected ? `Rejected (${boat.rejectionReason || 'No reason provided'})` : 'Unverified'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">Description: {boat.description}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">Amenities:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {boat.amenities.length > 0 ? (
                boat.amenities.map((amenity, index) => (
                  <Chip key={index} label={amenity} color="primary" variant="outlined" />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">No amenities listed</Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              Location: <FaMapMarkerAlt /> {boat.location.coordinates.join(', ')}
            </Typography>
            {boat.lastLocationUpdate && (
              <Typography variant="body2" color="text.secondary">
                Last Updated: {new Date(boat.lastLocationUpdate).toLocaleString()}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/profile')}>
                Back to Profile
              </Button>
              <Button variant="contained" onClick={() => navigate('/edit-boat')}>
                Edit Boat Info
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

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

export default BoatInfoPage;