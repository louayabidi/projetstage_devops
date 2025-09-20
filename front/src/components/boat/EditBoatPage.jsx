import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Typography, Paper, CircularProgress, Alert, Snackbar, Chip, Grid, Avatar,
  TextField, Button, Autocomplete, FormControl,
} from '@mui/material';

const API_URL = "http://localhost:3000";

const EditBoatPage = () => {
  const [boat, setBoat] = useState({
    name: '',
    boatType: '',
    boatCapacity: '',
    boatLicense: '',
    description: '',
    amenities: [],
    photos: [],
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [licenseFile, setLicenseFile] = useState(null);
  const [licensePreview, setLicensePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to edit boat info');
      setSnackbarOpen(true);
      navigate('/login');
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const fetchBoatInfo = async () => {
      try {
        // Check user role
        const userResponse = await axios.get(`${API_URL}/api/users/me`);
        if (!userResponse.data.success || userResponse.data.user.role !== 'boat_owner') {
          setError('Only boat owners can edit boat info');
          setSnackbarOpen(true);
          navigate('/profile');
          return;
        }

        // Fetch boat
        const boatResponse = await axios.get(`${API_URL}/api/boats/my-boat`);
        if (boatResponse.data.success) {
          setBoat({
            name: boatResponse.data.boat.name || '',
            boatType: boatResponse.data.boat.boatType || '',
            boatCapacity: boatResponse.data.boat.boatCapacity || '',
            boatLicense: boatResponse.data.boat.boatLicense || '',
            description: boatResponse.data.boat.description || '',
            amenities: boatResponse.data.boat.amenities || [],
            photos: boatResponse.data.boat.photos || [],
          });
          setPreviewImages(boatResponse.data.boat.photos.map((photo) => `${API_URL}${photo}`));
          if (boatResponse.data.boat.boatLicense) {
            setLicensePreview(`${API_URL}${boatResponse.data.boat.boatLicense}`);
          }
        } else {
          setError(boatResponse.data.message || 'Failed to fetch boat info');
          setSnackbarOpen(true);
        }
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Error fetching boat info');
        setSnackbarOpen(true);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else if (err.response?.status === 404) {
          navigate('/complete-boat-info'); // Redirect to create boat if none exists
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBoatInfo();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBoat((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const handleLicenseChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLicenseFile(file);
      setLicensePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('name', boat.name);
      formData.append('boatType', boat.boatType);
      formData.append('boatCapacity', boat.boatCapacity);
      formData.append('description', boat.description);
      formData.append('amenities', JSON.stringify(boat.amenities));
      selectedFiles.forEach((file) => formData.append('photos', file));
      if (licenseFile) {
        formData.append('boatLicense', licenseFile);
      }

      const response = await axios.put(`${API_URL}/api/boats/my-boat`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        setSuccess('Boat updated successfully');
        setSnackbarOpen(true);
        setTimeout(() => navigate('/boat-info'), 1000);
      }
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error updating boat info');
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Boat Information
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box display="flex" flexDirection="column" alignItems="center">
                {previewImages.length > 0 ? (
                  <Avatar
                    src={previewImages[0]}
                    sx={{ width: 150, height: 150, mb: 2 }}
                    onError={(e) => (e.target.src = '/default-boat.jpg')}
                  />
                ) : (
                  <Avatar src="/default-boat.jpg" sx={{ width: 150, height: 150, mb: 2 }} />
                )}
                <Button variant="contained" component="label">
                  Upload Photos
                  <input type="file" hidden accept="image/*" multiple onChange={handleFileChange} />
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Boat Name"
                name="name"
                value={boat.name}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Boat Type"
                name="boatType"
                value={boat.boatType}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Capacity"
                name="boatCapacity"
                type="number"
                value={boat.boatCapacity}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box display="flex" flexDirection="column" alignItems="center">
                {licensePreview ? (
                  <Avatar
                    src={licensePreview}
                    sx={{ width: 150, height: 150, mb: 2 }}
                    onError={(e) => (e.target.src = '/default-license.jpg')}
                  />
                ) : (
                  <Avatar src="/default-license.jpg" sx={{ width: 150, height: 150, mb: 2 }} />
                )}
                <Button variant="contained" component="label">
                  Upload License Photo
                  <input type="file" hidden accept="image/*" onChange={handleLicenseChange} />
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={boat.description}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  freeSolo
                  options={['wifi', 'kitchen', 'bathroom', 'shower', 'air conditioning']}
                  value={boat.amenities}
                  onChange={(e, newValue) => setBoat((prev) => ({ ...prev, amenities: newValue }))}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip key={index} label={option} {...getTagProps({ index })} color="primary" variant="outlined" />
                    ))
                  }
                  renderInput={(params) => <TextField {...params} label="Amenities" />}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate('/boat-info')}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={submitting}>
                  {submitting ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={error ? 'error' : 'success'} sx={{ width: '100%' }}>
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditBoatPage;