import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Chip,
  Stack,
  InputAdornment,
  CircularProgress,
  Paper,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import {
  FaUsers,
  FaChild,
  FaCalendar,
  FaMapMarkerAlt,
  FaComment,
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../Map/MapComponent';

// Configure Axios with base URL
const api = axios.create({
  baseURL: 'http://localhost:3000',
});

const FindCompanions = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    groupSize: 1,
    hasKids: false,
    departureLocation: {
      type: 'Point',
      coordinates: [0, 0], // [lng, lat]
    },
    destination: {
      type: 'Point',
      coordinates: [0, 0], // [lng, lat]
    },
    startDate: '',
    endDate: '',
    interests: [], // Changed to array
    message: '',
  });
  const [userLocation, setUserLocation] = useState([0, 0]); // [lng, lat]
  const [destinationLocation, setDestinationLocation] = useState([0, 0]); // [lng, lat]
  const [suggestions, setSuggestions] = useState([]);
  const [myInterests, setMyInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [interestInput, setInterestInput] = useState(''); // For chip input

  // Log baseURL for debugging
  const apiUrl = 'http://localhost:3000';
  console.log('Axios baseURL:', apiUrl);

  // Check if search button should be enabled
  const isSearchEnabled = () => {
    const isValidCoordinates = (coords) =>
      Array.isArray(coords) &&
      coords.length === 2 &&
      coords[0] !== 0 &&
      coords[1] !== 0 &&
      coords[0] >= -180 &&
      coords[0] <= 180 &&
      coords[1] >= -90 &&
      coords[1] <= 90;
    return (
      isValidCoordinates(formData.departureLocation.coordinates) &&
      isValidCoordinates(formData.destination.coordinates) &&
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) < new Date(formData.endDate)
    );
  };

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
            departureLocation: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
          }));
        },
        (err) => {
          setError(
            'Failed to get current location. Please select a departure location on the map.'
          );
          console.error('Geolocation error:', err);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Fetch user's travel interests on mount
  useEffect(() => {
    fetchMyInterests();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'hasKids') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'departureLat' || name === 'departureLng') {
      const newCoordinates =
        name === 'departureLat'
          ? [formData.departureLocation.coordinates[0], parseFloat(value) || 0]
          : [parseFloat(value) || 0, formData.departureLocation.coordinates[1]];
      setFormData((prev) => ({
        ...prev,
        departureLocation: {
          type: 'Point',
          coordinates: newCoordinates,
        },
      }));
      setUserLocation(newCoordinates);
    } else if (name === 'destinationLat' || name === 'destinationLng') {
      const newCoordinates =
        name === 'destinationLat'
          ? [formData.destination.coordinates[0], parseFloat(value) || 0]
          : [parseFloat(value) || 0, formData.destination.coordinates[1]];
      setFormData((prev) => ({
        ...prev,
        destination: {
          type: 'Point',
          coordinates: newCoordinates,
        },
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
      departureLocation: {
        type: 'Point',
        coordinates: newCoordinates,
      },
    }));
    setUserLocation(newCoordinates);
  };

  const handleDestinationLocationChange = (newCoordinates) => {
    setFormData((prev) => ({
      ...prev,
      destination: {
        type: 'Point',
        coordinates: newCoordinates,
      },
    }));
    setDestinationLocation(newCoordinates);
  };

  const handleInterestAdd = () => {
    if (
      interestInput.trim() &&
      !formData.interests.includes(interestInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()],
      }));
    }
    setInterestInput('');
  };

  const handleInterestDelete = (interestToDelete) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interestToDelete),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    const isValidCoordinates = (coords) =>
      Array.isArray(coords) &&
      coords.length === 2 &&
      coords[0] !== 0 &&
      coords[1] !== 0 &&
      coords[0] >= -180 &&
      coords[0] <= 180 &&
      coords[1] >= -90 &&
      coords[1] <= 90;
    if (
      !isValidCoordinates(formData.departureLocation.coordinates) ||
      !isValidCoordinates(formData.destination.coordinates) ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setError('Please fill in all required fields (locations and dates).');
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      console.log('Posting travel interest with data:', formData);
      const response = await api.post(
        '/api/travel-interests/travel-interests',
        {
          groupSize: formData.groupSize,
          hasKids: formData.hasKids,
          departureLocation: formData.departureLocation,
          destination: formData.destination,
          startDate: formData.startDate,
          endDate: formData.endDate,
          interests: formData.interests, // Send as array
          message: formData.message,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      console.log('Post response:', response.data);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        fetchMyInterests();
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Error posting travel interest. Please check your network connection.'
      );
      console.error('Post travel interest error:', err.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = async () => {
    // Validate required fields
    const isValidCoordinates = (coords) =>
      Array.isArray(coords) &&
      coords.length === 2 &&
      coords[0] !== 0 &&
      coords[1] !== 0 &&
      coords[0] >= -180 &&
      coords[0] <= 180 &&
      coords[1] >= -90 &&
      coords[1] <= 90;
    if (
      !isValidCoordinates(formData.departureLocation.coordinates) ||
      !isValidCoordinates(formData.destination.coordinates) ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setError(
        'Please fill in all required fields (locations and dates) to search for companions.'
      );
      setLoading(false);
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date.');
      setLoading(false);
      return;
    }
    console.log('Sending search request with form data:', formData);
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/travel-interests/suggestions', {
        params: {
          departureLat: formData.departureLocation.coordinates[1],
          departureLng: formData.departureLocation.coordinates[0],
          destinationLat: formData.destination.coordinates[1],
          destinationLng: formData.destination.coordinates[0],
          startDate: formData.startDate,
          endDate: formData.endDate,
          interests: formData.interests.join(','), // Send as comma-separated for query
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log('Search response:', response.data);
      setSuggestions(response.data.suggestions);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Error fetching suggestions. Please check your network connection.'
      );
      console.error('Fetch suggestions error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyInterests = async () => {
    try {
      const response = await api.get('/api/travel-interests/my', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log('Fetch my interests response:', response.data);
      setMyInterests(response.data.interests);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Error fetching my interests. Please check your network connection.'
      );
      console.error('Fetch my interests error:', err.response?.data || err.message);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      const response = await api.put(
        `/api/travel-interests/${id}/deactivate`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      console.log('Deactivate response:', response.data);
      fetchMyInterests();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Error deactivating travel interest. Please check your network connection.'
      );
      console.error('Deactivate travel interest error:', err.response?.data || err.message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ my: 6, px: 2 }}>
      <Button
        variant="outlined"
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        ← Back to Home
      </Button>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        <Box sx={{ flex: 2 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h5" color="primary" gutterBottom>
              Find Travel Companions
            </Typography>
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <strong>Travel Interest Posted!</strong>
                <p>Your travel interest has been posted successfully.</p>
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Group Size"
                    name="groupSize"
                    type="number"
                    value={formData.groupSize}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaUsers />
                        </InputAdornment>
                      ),
                      inputProps: { min: 1 },
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="hasKids"
                        checked={formData.hasKids}
                        onChange={handleInputChange}
                        icon={<FaChild />}
                        checkedIcon={<FaChild />}
                      />
                    }
                    label="Includes children under 12 years"
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaCalendar />
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="End Date"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaCalendar />
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
                <Box>
                  <Typography variant="subtitle1">
                    Departure Location *
                  </Typography>
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
                      variant="outlined"
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
                      variant="outlined"
                    />
                  </Stack>
                  <MapComponent
                    initialPosition={userLocation}
                    onLocationChange={handleDepartureLocationChange}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Your current location is automatically detected. Click on the map to set a custom departure location.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1">
                    Destination Location *
                  </Typography>
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
                      variant="outlined"
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
                      variant="outlined"
                    />
                  </Stack>
                  <MapComponent
                    initialPosition={destinationLocation}
                    onLocationChange={handleDestinationLocationChange}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Click on the map to set your destination location.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1">Interests</Typography>
                  <TextField
                    size="small"
                    placeholder="Add an interest (e.g., sightseeing)"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleInterestAdd();
                      }
                    }}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaComment />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            onClick={handleInterestAdd}
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{ minWidth: '32px' }}
                          >
                            Add
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                    {formData.interests.map((interest) => (
                      <Chip
                        key={interest}
                        label={interest}
                        onDelete={() => handleInterestDelete(interest)}
                        color="primary"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </Box>
                <TextField
                  label="Message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Describe your travel plans..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaComment />
                      </InputAdornment>
                    ),
                  }}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} /> : null}
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
                    {loading ? 'Searching...' : 'Search Suggestions'}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Paper>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, mb: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h6">Your Travel Interests</Typography>
            {myInterests.length === 0 ? (
              <Typography>No travel interests posted yet.</Typography>
            ) : (
              <Stack spacing={2}>
                {myInterests.map((interest) => (
                  <Paper key={interest._id} elevation={1} sx={{ p: 2 }}>
                    <Typography><strong>Group Size:</strong> {interest.groupSize}</Typography>
                    <Typography>
                      <strong>Dates:</strong>{' '}
                      {new Date(interest.startDate).toLocaleDateString()} -{' '}
                      {new Date(interest.endDate).toLocaleDateString()}
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
                ))}
              </Stack>
            )}
          </Paper>

          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6">Suggested Companions</Typography>
            {suggestions.length === 0 ? (
              <Typography>No suggestions found. Try adjusting your search criteria.</Typography>
            ) : (
              <Stack spacing={2}>
                {suggestions.map((sug) => (
                  <Paper key={sug._id} elevation={1} sx={{ p: 2 }}>
                    <Typography>
                      <strong>User:</strong> {sug.user.firstName} {sug.user.lastName}
                    </Typography>
                    <Typography>
                      <strong>Group Size:</strong> {sug.groupSize}{' '}
                      {sug.hasKids ? '(with kids)' : ''}
                    </Typography>
                    <Typography>
                      <strong>Dates:</strong>{' '}
                      {new Date(sug.startDate).toLocaleDateString()} -{' '}
                      {new Date(sug.endDate).toLocaleDateString()}
                    </Typography>
                    <Typography><strong>Interests:</strong> {sug.interests.join(', ')}</Typography>
                    <Typography><strong>Message:</strong> {sug.message}</Typography>
                    <Typography>
                      <strong>Contact:</strong> {sug.user.phoneNumber} | {sug.user.email}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>
      </Stack>
    </Container>
  );
};

export default FindCompanions;