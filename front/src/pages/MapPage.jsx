import React from 'react';
import { Box, Typography } from '@mui/material';
import BoatMap from '../components/BoatMap';

const MapPage = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Boat Locations
      </Typography>
      <BoatMap />
    </Box>
  );
};

export default MapPage;