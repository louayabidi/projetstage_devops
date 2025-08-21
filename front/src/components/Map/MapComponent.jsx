import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapUpdater = ({ center, onLocationChange }) => {
  const map = useMap();

  useEffect(() => {
    // UPDATED: Use flyTo for smooth transition on real-time updates
    map.flyTo(center, 13, { animate: true, duration: 1 });
  }, [center, map]);

  useEffect(() => {
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      onLocationChange([lng, lat]); // Update coordinates in parent component
    });

    return () => {
      map.off('click');
    };
  }, [map, onLocationChange]);

  return null;
};

const MapComponent = ({ initialPosition, onLocationChange }) => {
  const [position, setPosition] = useState(initialPosition);

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} />
        <MapUpdater center={position} onLocationChange={(newPos) => {
          setPosition(newPos);
          onLocationChange(newPos);
        }} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;