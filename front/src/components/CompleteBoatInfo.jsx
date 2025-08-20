import React, { useState, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Chip,
  Stack,
  IconButton,
  CircularProgress,
  Paper,
  Avatar,
  InputAdornment,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DirectionsBoatFilledIcon from '@mui/icons-material/DirectionsBoatFilled';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const CompleteBoatInfo = () => {
  const [formData, setFormData] = useState({
    name: '',
    boatType: '',
    boatCapacity: '',
    boatLicense: '',
    amenities: [],
    photos: []
  });
  const [amenityInput, setAmenityInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Amenity as chips
  const handleAmenityAdd = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()],
      }));
    }
    setAmenityInput('');
  };

  const handleAmenityDelete = (amenityToDelete) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenityToDelete),
    }));
  };

  // File upload handlers
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    // Add files to formData
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = [...formData.photos];
    const newPreviews = [...previewUrls];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    newPhotos.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFormData(prev => ({ ...prev, photos: newPhotos }));
    setPreviewUrls(newPreviews);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in first');
      navigate('/login');
      return;
    }

     console.log('Using token:', token);

    const formDataToSend = new FormData();
    
    // Append all form data
    formDataToSend.append('name', formData.name);
    formDataToSend.append('boatType', formData.boatType);
    formDataToSend.append('boatCapacity', formData.boatCapacity);
    formDataToSend.append('boatLicense', formData.boatLicense);
    
    // Ensure amenities is always an array before stringifying
    const amenitiesArray = Array.isArray(formData.amenities) ? formData.amenities : [];
    formDataToSend.append('amenities', JSON.stringify(amenitiesArray));
    
    // Append photos
    formData.photos.forEach(photo => {
      formDataToSend.append('photos', photo);
    });

    console.log('Submitting form data:', {
      name: formData.name,
      boatType: formData.boatType,
      boatCapacity: formData.boatCapacity,
      boatLicense: formData.boatLicense,
      amenities: amenitiesArray,
      photoCount: formData.photos.length
    });

    const response = await axios.put(
      '/api/boats/complete-info',
      formDataToSend,
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }, 
         withCredentials: true
      }
    );

    if (response.data.success) {
      navigate('/home');
    }
  } catch (error) {
    console.error('Submission error:', error);
    alert(error.response?.data?.message || 'Failed to save boat information');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Stack alignItems="center" spacing={1} mb={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <DirectionsBoatFilledIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" mt={1} color="primary">
            Complete Your Boat Information
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Please tell us more about your boat to help travelers make a great choice.
          </Typography>
        </Stack>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Boat Name */}
            <TextField
              label="Boat Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
            
            <TextField
              label="Boat Type"
              name="boatType"
              value={formData.boatType}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
            
            <TextField
              label="Boat Capacity"
              name="boatCapacity"
              type="number"
              value={formData.boatCapacity}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
            
            <TextField
              label="Boat License"
              name="boatLicense"
              value={formData.boatLicense}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />

            {/* Amenities */}
            <Box>
              <Typography variant="subtitle1">Amenities</Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Add an amenity (e.g. WiFi)"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAmenityAdd();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={handleAmenityAdd}
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
                  variant="outlined"
                />
              </Stack>
              <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                {formData.amenities.map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    onDelete={() => handleAmenityDelete(amenity)}
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Photos - Updated File Upload Section */}
            <Box>
              <Typography variant="subtitle1">Boat Photos</Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Upload Photos
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*"
                  hidden
                />
              </Button>
              
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {previewUrls.map((url, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <img
                      src={url}
                      alt={`Boat preview ${index}`}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 4,
                        marginBottom: 1
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.7)'
                        }
                      }}
                      onClick={() => handleRemovePhoto(index)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Submit */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              color="primary"
              disabled={isLoading}
              sx={{ mt: 2 }}
              startIcon={isLoading ? <CircularProgress color="inherit" size={20} /> : null}
            >
              {isLoading ? 'Saving...' : 'Complete Registration'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default CompleteBoatInfo;