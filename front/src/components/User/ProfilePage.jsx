import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Avatar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';

const EditProfilePage = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    photo: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  // Set up axios defaults with the token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token); // DEBUG
      
      if (!token) {
        console.log('No token found, redirecting to login'); // DEBUG
        navigate('/login');
        return;
      }

      // DEBUG: Check if token is valid format
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Token expiration:', new Date(payload.exp * 1000));
      } catch (e) {
        console.log('Token format invalid:', e);
      }

       const response = await axios.get('/api/users/me', {
       headers: {
       Authorization: `Bearer ${localStorage.getItem('token')}`,
         },
            });


      if (response.data.success) {
        const userData = response.data.user;
        if (userData.photo && !userData.photo.startsWith('http')) {
          userData.photo = `http://localhost:3000${userData.photo}`;
        }
        
        setUser(userData);
        setPreviewImage(userData.photo || '/default-avatar.jpg');
      }
    } catch (err) {
      console.error('Profile fetch error details:', err.response?.data); // DEBUG
      setError(err.response?.data?.message || 'Error fetching profile');
      setSnackbarOpen(true);
      
      if (err.response?.status === 401) {
        console.log('401 error - removing token and redirecting'); // DEBUG
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  fetchUserProfile();
}, [navigate]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();

      // Append the file if selected
      if (selectedFile) {
        formData.append('photo', selectedFile);
      }

      // Append other user data
      formData.append('firstName', user.firstName);
      formData.append('lastName', user.lastName);
      formData.append('phoneNumber', user.phoneNumber);

      // FIX: Use relative path
      const response = await axios.patch(
        '/api/users/me',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        setSnackbarOpen(true);
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Error updating profile');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading && !user.firstName) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Profile
        </Typography>

        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar
              src={previewImage || '/default-avatar.jpg'}
              sx={{ width: 120, height: 120, mb: 2 }}
              onError={(e) => {
                e.target.src = '/default-avatar.jpg';
              }}
            />
            <Button variant="contained" component="label">
              Upload Photo
              <input 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={handleFileChange}
                id="profile-upload"
              />
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <TextField
              label="First Name"
              name="firstName"
              value={user.firstName}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={user.lastName}
              onChange={handleChange}
              fullWidth
              required
            />
          </Box>

          <TextField
            label="Email"
            name="email"
            value={user.email}
            onChange={handleChange}
            fullWidth
            disabled
          />

          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={user.phoneNumber}
            onChange={handleChange}
            fullWidth
          />

          <FormControl fullWidth disabled>
            <InputLabel>Role</InputLabel>
            <Select
              value={user.role}
              label="Role"
            >
              <MenuItem value="passenger">Passenger</MenuItem>
              <MenuItem value="boat_owner">Boat Owner</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/profile')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditProfilePage;