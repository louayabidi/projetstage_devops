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
  Alert,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const API_URL = "http://localhost:3000"; // backend base url

const EditProfilePage = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    photo: '',
    role: '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
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

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token);

        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/profile');
          return;
        }

        const response = await axios.get('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const userData = response.data.user;

          setUser(userData);

          // prepend backend URL to the photo path
          if (userData.photo) {
            setPreviewImage(`${API_URL}${userData.photo}`);
          } else {
            setPreviewImage('/default-avatar.jpg');
          }

          console.log('Fetched user photo:', userData.photo);
        }
      } catch (err) {
        console.error('Profile fetch error details:', err.response?.data);
        setError(err.response?.data?.message || 'Error fetching profile');
        setSnackbarOpen(true);

        if (err.response?.status === 401) {
          console.log('401 error - removing token and redirecting');
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
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('photo', selectedFile);
      }
      formData.append('firstName', user.firstName);
      formData.append('lastName', user.lastName);
      formData.append('phoneNumber', user.phoneNumber);

      const response = await axios.patch('/api/users/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser((prev) => ({
          ...prev,
          ...updatedUser,
        }));

        // prepend backend URL
        setPreviewImage(updatedUser.photo ? `${API_URL}${updatedUser.photo}` : '/default-avatar.jpg');

        setSuccess('Profile updated successfully!');
        setSnackbarOpen(true);

        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      }
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error updating profile');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError('New passwords do not match');
      setSnackbarOpen(true);
      setPasswordLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to change your password');
        setSnackbarOpen(true);
        navigate('/login');
        return;
      }

      const response = await axios.patch(
        `${API_URL}/api/auth/change-password`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setSnackbarOpen(true);
        setPasswordData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
      }
    } catch (err) {
      console.error('Password change error:', err.response?.data);
      setError(err.response?.data?.message || 'Error changing password');
      setSnackbarOpen(true);
    } finally {
      setPasswordLoading(false);
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
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Profile
        </Typography>

        <Box component="form" onSubmit={handleProfileSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar
              src={previewImage || '/default-avatar.jpg'}
              sx={{ width: 120, height: 120, mb: 2 }}
              key={previewImage}
              onError={(e) => {
                e.target.src = '/default-avatar.jpg';
                console.log('Image load error, fallback to default');
              }}
            />
            <Button variant="contained" component="label">
              Upload Photo
              <input type="file" hidden accept="image/*" onChange={handleFileChange} id="profile-upload" />
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
            <Select value={user.role} label="Role">
              <MenuItem value="passenger">Passenger</MenuItem>
              <MenuItem value="boat_owner">Boat Owner</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={() => navigate('/profile')}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Change Password Section */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Change Password
        </Typography>

        <Box component="form" onSubmit={handlePasswordSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Old Password"
            name="oldPassword"
            type={showOldPassword ? 'text' : 'password'}
            value={passwordData.oldPassword}
            onChange={handlePasswordChange}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowOldPassword(!showOldPassword)}>
                  {showOldPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          <TextField
            label="New Password"
            name="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          <TextField
            label="Confirm New Password"
            name="confirmNewPassword"
            type={showNewPassword ? 'text' : 'password'}
            value={passwordData.confirmNewPassword}
            onChange={handlePasswordChange}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />

          <Box display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={passwordLoading}
            >
              {passwordLoading ? <CircularProgress size={24} /> : 'Change Password'}
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
        <Alert onClose={handleSnackbarClose} severity={error ? 'error' : 'success'} sx={{ width: '100%' }}>
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditProfilePage;
