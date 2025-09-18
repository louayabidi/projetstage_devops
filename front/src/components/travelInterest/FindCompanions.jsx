import React, { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, Box, Chip, Stack, InputAdornment,
  CircularProgress, Paper, FormControlLabel, Checkbox, Alert, Card, CardContent,
  CardActions, Avatar, Grid, Fade, Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  FaUsers, FaChild, FaCalendar, FaMapMarkerAlt, FaComment, FaPaperPlane
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../Map/MapComponent';

// Configure Axios with base URL
const api = axios.create({
  baseURL: 'http://localhost:3000',
});

const FindCompanionsPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    groupSize: 1,
    hasKids: false,
    departureLocation: { type: 'Point', coordinates: [0, 0] },
    destination: { type: 'Point', coordinates: [0, 0] },
    startDate: null,
    endDate: null,
    interests: [],
    message: '',
  });
  const [userLocation, setUserLocation] = useState([0, 0]);
  const [destinationLocation, setDestinationLocation] = useState([0, 0]);
  const [suggestions, setSuggestions] = useState([]);
  const [myInterests, setMyInterests] = useState([]);
  const [user, setUser] = useState({ firstName: '', photo: '' });
  const [predefinedInterests, setPredefinedInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if search button should be enabled
  const isSearchEnabled = () => {
    const isValidCoordinates = (coords) =>
      Array.isArray(coords) && coords.length === 2 && coords[0] !== 0 && coords[1] !== 0 &&
      coords[0] >= -180 && coords[0] <= 180 && coords[1] >= -90 && coords[1] <= 90;
    return (
      isValidCoordinates(formData.departureLocation.coordinates) &&
      isValidCoordinates(formData.destination.coordinates) &&
      formData.startDate && formData.endDate &&
      dayjs(formData.startDate).isValid() &&
      dayjs(formData.endDate).isValid() &&
      dayjs(formData.startDate).isBefore(dayjs(formData.endDate))
    );
  };

  // Fetch user profile and predefined interests
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/api/users/me');
        if (response.data.success) {
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        setError('Failed to load profile');
        if (err.response?.status === 401) navigate('/login');
      }
    };

    const fetchPredefinedInterests = async () => {
      try {
        const response = await api.get('/api/travel-interests/predefined');
        setPredefinedInterests(response.data.interests);
      } catch (err) {
        console.error('Failed to fetch interests');
        setPredefinedInterests(['adventure', 'relaxation', 'fishing', 'snorkeling']);
      }
    };

    fetchUserProfile();
    fetchPredefinedInterests();
    fetchMyInterests();
  }, [navigate]);

  // Automatic location detection for departure
  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation([longitude, latitude]);
          setFormData((prev) => ({
            ...prev,
            departureLocation: { type: 'Point', coordinates: [longitude, latitude] },
          }));
        },
        (err) => {
          setError('Failed to get current location. Select on map.');
          console.error('Geolocation error:', err);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation not supported.');
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'hasKids') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'departureLat' || name === 'departureLng') {
      const newCoordinates = name === 'departureLat'
        ? [formData.departureLocation.coordinates[0], parseFloat(value) || 0]
        : [parseFloat(value) || 0, formData.departureLocation.coordinates[1]];
      setFormData((prev) => ({
        ...prev,
        departureLocation: { type: 'Point', coordinates: newCoordinates },
      }));
      setUserLocation(newCoordinates);
    } else if (name === 'destinationLat' || name === 'destinationLng') {
      const newCoordinates = name === 'destinationLat'
        ? [formData.destination.coordinates[0], parseFloat(value) || 0]
        : [parseFloat(value) || 0, formData.destination.coordinates[1]];
      setFormData((prev) => ({
        ...prev,
        destination: { type: 'Point', coordinates: newCoordinates },
      }));
      setDestinationLocation(newCoordinates);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value,
      }));
    }
  };

  const handleDepartureLocationChange = (newCoordinates) => {
    setFormData((prev) => ({
      ...prev,
      departureLocation: { type: 'Point', coordinates: newCoordinates },
    }));
    setUserLocation(newCoordinates);
  };

  const handleDestinationLocationChange = (newCoordinates) => {
    setFormData((prev) => ({
      ...prev,
      destination: { type: 'Point', coordinates: newCoordinates },
    }));
    setDestinationLocation(newCoordinates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSearchEnabled()) {
      setError('Please fill in all required fields (locations and dates).');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      const response = await api.post('/api/travel-interests/travel-interests', {
        ...formData,
        startDate: formData.startDate ? dayjs(formData.startDate).format('YYYY-MM-DD') : null,
        endDate: formData.endDate ? dayjs(formData.endDate).format('YYYY-MM-DD') : null,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSuccess(true);
      setFormData({ ...formData, message: '', interests: [] });
      setTimeout(() => {
        setSuccess(false);
        fetchMyInterests();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error posting travel interest.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = async () => {
    if (!isSearchEnabled()) {
      setError('Please fill in all required fields to search.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/travel-interests/suggestions', {
        params: {
          departureLat: formData.departureLocation.coordinates[1],
          departureLng: formData.departureLocation.coordinates[0],
          destinationLat: formData.destination.coordinates[1],
          destinationLng: formData.destination.coordinates[0],
          startDate: formData.startDate ? dayjs(formData.startDate).format('YYYY-MM-DD') : '',
          endDate: formData.endDate ? dayjs(formData.endDate).format('YYYY-MM-DD') : '',
          interests: formData.interests.join(','),
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSuggestions(response.data.suggestions);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching suggestions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyInterests = async () => {
    try {
      const response = await api.get('/api/travel-interests/my', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMyInterests(response.data.interests);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching my interests.');
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await api.put(`/api/travel-interests/${id}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchMyInterests();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deactivating travel interest.');
    }
  };

  const handleConnect = (companionId) => {
    navigate(`/chat/${companionId}`);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', py: 6 }}>
        <Container maxWidth="lg" sx={{ px: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/')} sx={{ mb: 2, color: 'white', borderColor: 'white' }}>
            ← Back to Home
          </Button>

          <Fade in timeout={1000}>
            <Paper sx={{ p: 4, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.9)', mb: 4 }}>
              <Typography variant="h4" color="primary" align="center" gutterBottom>
                Find Your Crew! 🌊
                <Typography variant="subtitle1" sx={{ color: '#636e72', fontStyle: 'italic' }}>
                  Sailing solo? Let's make waves together!
                </Typography>
              </Typography>
              {success && <Alert severity="success" sx={{ mb: 2 }}>Travel Interest Posted! 🚢</Alert>}
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Group Size"
                        name="groupSize"
                        type="number"
                        value={formData.groupSize}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><FaUsers /></InputAdornment>,
                          inputProps: { min: 1 },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={<Checkbox name="hasKids" checked={formData.hasKids} onChange={handleInputChange} icon={<FaChild />} checkedIcon={<FaChild />} />}
                        label="Includes children under 12"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Autocomplete
                        multiple
                        freeSolo
                        options={predefinedInterests}
                        value={formData.interests}
                        onChange={(e, newVal) => setFormData({ ...formData, interests: newVal })}
                        renderTags={(value, getTagProps) => value.map((option, index) => (
                          <Chip variant="outlined" label={option} {...getTagProps({ index })} color="primary" />
                        ))}
                        renderInput={(params) => <TextField {...params} label="Interests (e.g., adventure, fishing)" />}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">Departure Location *</Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          label="Latitude"
                          name="departureLat"
                          type="number"
                          step="any"
                          value={formData.departureLocation.coordinates[1]}
                          onChange={handleInputChange}
                          fullWidth
                          required
                        />
                        <TextField
                          label="Longitude"
                          name="departureLng"
                          type="number"
                          step="any"
                          value={formData.departureLocation.coordinates[0]}
                          onChange={handleInputChange}
                          fullWidth
                          required
                        />
                      </Stack>
                      <MapComponent initialPosition={userLocation} onLocationChange={handleDepartureLocationChange} />
                      <Typography variant="caption" color="text.secondary">
                        Auto-detected location. Click map to adjust.
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">Destination Location *</Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          label="Latitude"
                          name="destinationLat"
                          type="number"
                          step="any"
                          value={formData.destination.coordinates[1]}
                          onChange={handleInputChange}
                          fullWidth
                          required
                        />
                        <TextField
                          label="Longitude"
                          name="destinationLng"
                          type="number"
                          step="any"
                          value={formData.destination.coordinates[0]}
                          onChange={handleInputChange}
                          fullWidth
                          required
                        />
                      </Stack>
                      <MapComponent initialPosition={destinationLocation} onLocationChange={handleDestinationLocationChange} />
                      <Typography variant="caption" color="text.secondary">
                        Click map to set destination.
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Start Date"
                        value={formData.startDate}
                        onChange={(newVal) => {
                          if (newVal && dayjs(newVal).isValid()) {
                            setFormData({ ...formData, startDate: newVal });
                          } else {
                            setError('Invalid start date');
                          }
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            InputProps: {
                              startAdornment: <InputAdornment position="start"><FaCalendar /></InputAdornment>,
                            },
                            error: !formData.startDate || !dayjs(formData.startDate).isValid(),
                            helperText: !formData.startDate || !dayjs(formData.startDate).isValid() ? 'Invalid date' : '',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="End Date"
                        value={formData.endDate}
                        onChange={(newVal) => {
                          if (newVal && dayjs(newVal).isValid()) {
                            setFormData({ ...formData, endDate: newVal });
                          } else {
                            setError('Invalid end date');
                          }
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            InputProps: {
                              startAdornment: <InputAdornment position="start"><FaCalendar /></InputAdornment>,
                            },
                            error: !formData.endDate || !dayjs(formData.endDate).isValid(),
                            helperText: !formData.endDate || !dayjs(formData.endDate).isValid() ? 'Invalid date' : '',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="What's your travel vibe? 🏖️"
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><FaComment /></InputAdornment>,
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={20} /> : <FaPaperPlane />}
                    >
                      {submitting ? 'Posting...' : 'Post Travel Interest'}
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      onClick={handleSearch}
                      disabled={loading || !isSearchEnabled()}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                      {loading ? 'Searching...' : 'Search Crew'}
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </Paper>
          </Fade>

          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.9)', mb: 2, position: 'sticky', top: 20 }}>
                <Typography variant="h6" color="primary">Your Travel Interests</Typography>
                {myInterests.length === 0 ? (
                  <Typography>No travel interests posted yet. 🛥️</Typography>
                ) : (
                  <Stack spacing={2}>
                    {myInterests.map((interest) => (
                      <Fade in key={interest._id} timeout={500}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                          <Typography><strong>Group Size:</strong> {interest.groupSize}</Typography>
                          <Typography>
                            <strong>Dates:</strong> {new Date(interest.startDate).toLocaleDateString()} - {new Date(interest.endDate).toLocaleDateString()}
                          </Typography>
                          <Typography><strong>Interests:</strong> {interest.interests.join(', ')}</Typography>
                          <Typography><strong>Status:</strong> {interest.isActive ? 'Active' : 'Inactive'}</Typography>
                          {interest.isActive && (
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => handleDeactivate(interest._id)}
                            >
                              Deactivate
                            </Button>
                          )}
                        </Paper>
                      </Fade>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.9)', position: 'sticky', top: 20 }}>
                <Typography variant="h6" color="primary">Suggested Shipmates ({suggestions.length})</Typography>
                {suggestions.length === 0 ? (
                  <Typography>No crew found. Try tweaking your search! ⚓</Typography>
                ) : (
                  <Stack spacing={2}>
                    {suggestions.map((sug) => (
                      <Fade in key={sug._id} timeout={500}>
                        <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 2 }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar
                                src={sug.user.photo ? `http://localhost:3000${sug.user.photo}` : '/default-avatar.jpg'}
                                sx={{ width: 50, height: 50 }}
                                onError={(e) => { e.target.src = '/default-avatar.jpg'; }}
                              />
                              <Box>
                                <Typography variant="h6">{sug.user.firstName} {sug.user.lastName}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  <FaMapMarkerAlt /> Near {sug.departureLocation.coordinates.join(', ')}
                                </Typography>
                              </Box>
                            </Box>
                            <Typography mt={1}>{sug.message || 'Ready for a sea adventure!'}</Typography>
                            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                              {sug.interests.map((interest) => (
                                <Chip key={interest} label={interest} color="primary" size="small" />
                              ))}
                            </Box>
                          </CardContent>
                          <CardActions>
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={<FaPaperPlane />}
                              onClick={() => handleConnect(sug.user._id)}
                            >
                              Connect
                            </Button>
                          </CardActions>
                        </Card>
                      </Fade>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Box>
          </Stack>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default FindCompanionsPage;