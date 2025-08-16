import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  Avatar,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Divider,
  Rating,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  DirectionsBoat as BoatIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const BoatOwnersList = () => {
  const [boatOwners, setBoatOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoatOwners = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:3000/api/users/boat-owners', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setBoatOwners(response.data.boatOwners);
          setFilteredOwners(response.data.boatOwners);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || 'Error fetching boat owners');
      } finally {
        setLoading(false);
      }
    };

    fetchBoatOwners();
  }, [navigate]);

  useEffect(() => {
    const results = boatOwners.filter(owner =>
      `${owner.firstName} ${owner.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.boat?.boatType?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOwners(results);
  }, [searchTerm, boatOwners]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={80} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h5" color="error" gutterBottom>
          Oops! Something went wrong
        </Typography>
        <Typography>{error}</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
          Meet Our Boat Owners
        </Typography>
        
        <TextField
          variant="outlined"
          placeholder="Search owners or boat types..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Browse through our trusted boat owners and find the perfect match for your next adventure
      </Typography>

      {filteredOwners.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Typography variant="h5" gutterBottom>
            No boat owners found
          </Typography>
          <Typography color="text.secondary">
            {searchTerm ? 'Try a different search term' : 'No boat owners are currently available'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {filteredOwners.map((owner) => (
            <Grid item xs={12} sm={6} md={4} key={owner._id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="div"
                    sx={{
                      pt: '56.25%', // 16:9 ratio
                      backgroundImage: owner.boat?.boatImage 
                        ? `url(${owner.boat.boatImage})` 
                        : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <Avatar
                    src={owner.photo?.startsWith('http') ? owner.photo : `http://localhost:3000${owner.photo}`}
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      position: 'absolute', 
                      bottom: -40, 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      border: '4px solid white'
                    }}
                  />
                </Box>
                
                <CardContent sx={{ flexGrow: 1, pt: 6, textAlign: 'center' }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {owner.firstName} {owner.lastName}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Rating 
                      value={4.5} 
                      precision={0.5} 
                      readOnly 
                      sx={{ color: 'gold' }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      (12 reviews)
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      icon={<BoatIcon />}
                      label={owner.boat?.boatType || 'Unknown boat type'}
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      icon={owner.boat?.isVerified ? <VerifiedIcon /> : <WarningIcon />}
                      label={owner.boat?.isVerified ? 'Verified' : 'Unverified'}
                      color={owner.boat?.isVerified ? 'success' : 'warning'}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: 1,
                    textAlign: 'left',
                    mb: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">{owner.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">{owner.phoneNumber || 'Not provided'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">Owner since 2023</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BoatIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Capacity: {owner.boat?.boatCapacity || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => navigate(`/boat-owners/${owner._id}`)}
                    sx={{ mt: 2 }}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default BoatOwnersList;