export const calculateMaritimeRoute = (start, end) => {
  // This is a simplified calculation - in a real app you'd use a proper routing algorithm
  return {
    type: "LineString",
    coordinates: [
      [start.lng, start.lat],
      [end.lng, end.lat]
    ],
    distance: calculateDistance(start, end)
  };
};

const calculateDistance = (point1, point2) => {
  // Haversine formula for distance calculation
  const R = 6371e3; // Earth radius in meters
  const φ1 = point1.lat * Math.PI/180;
  const φ2 = point2.lat * Math.PI/180;
  const Δφ = (point2.lat-point1.lat) * Math.PI/180;
  const Δλ = (point2.lng-point1.lng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c / 1852; // Return distance in nautical miles
};