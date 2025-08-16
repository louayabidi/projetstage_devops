import { useState } from 'react';
import MaritimeMap from '../components/Map/MaritimeMap';
import MapControls from '../components/Map/MapControls';

const RoutePlanner = () => {
  const [routeInfo, setRouteInfo] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);

  const handleRouteCalculate = (data) => {
    setRouteInfo(data);
    // Average boat speed: 20 knots
    const timeHours = data.distance / 20;
    setEstimatedTime(timeHours.toFixed(1));
  };

  return (
    <div className="route-planner">
      <h2>Maritime Route Planner</h2>
      <div className="map-container">
        <MaritimeMap onRouteCalculate={handleRouteCalculate} />
        <MapControls 
          routeInfo={routeInfo} 
          estimatedTime={estimatedTime} 
        />
      </div>
    </div>
  );
};

export default RoutePlanner;