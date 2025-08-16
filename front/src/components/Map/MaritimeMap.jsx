import { useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import boatIcon from '../../assets/boat-icon.png';

const MaritimeMap = ({
  onRouteCalculate,
  onMapLoad,
  onLocationFound,
  testMode = false,
  testCoordinates = []
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userLocation = useRef(null);
  const destinationMarker = useRef(null);
  const routeLayer = useRef(null);
  const isFirstLocationUpdate = useRef(true);
  const locationWatchId = useRef(null);
  const readyRef = useRef(false);

  // Stable configurations
  const boatIconConfig = useMemo(() => L.icon({
    iconUrl: boatIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }), []);

  // Calculate distance between two points in nautical miles
  const calculateDistance = useCallback((point1, point2) => {
    const R = 6371e3;
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c / 1852;
  }, []);

  // Calculate maritime route
  const calculateMaritimeRoute = useCallback((start, end) => ({
    type: "LineString",
    coordinates: [
      [start.lng, start.lat],
      [end.lng, end.lat]
    ],
    distance: calculateDistance(start, end)
  }), [calculateDistance]);

  // Draw route on the map
  const drawRoute = useCallback((route) => {
    if (!mapInstance.current) return;
    if (routeLayer.current) {
      mapInstance.current.removeLayer(routeLayer.current);
    }
    routeLayer.current = L.geoJSON(route, {
      style: {
        color: '#0066ff',
        weight: 4,
        opacity: 0.8,
        dashArray: '5, 5'
      }
    }).addTo(mapInstance.current);
  }, []);

  // Update user location on the map
  const updateLocation = useCallback((lat, lng) => {
    if (!mapInstance.current) return;

    const map = mapInstance.current;
    userLocation.current = { lat, lng };

    // Only update view if map is properly initialized
    if (map._loaded) {
      if (isFirstLocationUpdate.current || map.distance([lat, lng], map.getCenter()) > 1000) {
        map.setView([lat, lng], 13, { animate: false });
        isFirstLocationUpdate.current = false;
      }
    }

    // Clear previous markers
    map.eachLayer(layer => {
      if (layer.options?.isUserLocation) {
        map.removeLayer(layer);
      }
    });

    // Add new marker
    try {
      L.marker([lat, lng], {
        icon: boatIconConfig,
        title: 'Your position',
        isUserLocation: true,
        zIndexOffset: 1000
      }).addTo(map).bindPopup("You are here").openPopup();
    } catch (error) {
      console.error('Error adding marker:', error);
    }

    // Update route if destination exists
    if (destinationMarker.current) {
      const destLatLng = destinationMarker.current.getLatLng();
      const route = calculateMaritimeRoute(
        { lat, lng },
        { lat: destLatLng.lat, lng: destLatLng.lng }
      );
      drawRoute(route);
      onRouteCalculate?.({
        start: { lat, lng },
        end: { lat: destLatLng.lat, lng: destLatLng.lng },
        distance: route.distance
      });
    }
  }, [boatIconConfig, calculateMaritimeRoute, drawRoute, onRouteCalculate]);

  // Initialize map (runs once on mount)
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      try {
        const map = L.map(mapRef.current, {
          preferCanvas: true,
          zoomControl: true
        }).setView([36.8065, 10.1815], 13);

        // Add base layers
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
          attribution: '© OpenSeaMap'
        }).addTo(map);

        // Handle destination selection
        const handleMapClick = (e) => {
          if (!destinationMarker.current) {
            destinationMarker.current = L.marker(e.latlng, {
              icon: L.divIcon({ className: 'destination-marker' }),
              draggable: true
            }).addTo(map).bindPopup("Destination").openPopup();

            if (userLocation.current) {
              const route = calculateMaritimeRoute(
                userLocation.current,
                e.latlng
              );
              drawRoute(route);
              onRouteCalculate?.({
                start: userLocation.current,
                end: e.latlng,
                distance: route.distance
              });
            }
          } else {
            destinationMarker.current.setLatLng(e.latlng);
          }
        };

        map.on('click', handleMapClick);

        // Set ready state after slight delay
        const readyTimer = setTimeout(() => {
          readyRef.current = true;
          onMapLoad?.();
        }, 100);

        mapInstance.current = map;

        return () => {
          clearTimeout(readyTimer);
          map.off('click', handleMapClick);
          map.remove();
          mapInstance.current = null;
          readyRef.current = false;
        };
      } catch (error) {
        console.error('Map initialization error:', error);
      }
    }
  }, [onMapLoad, calculateMaritimeRoute, drawRoute, onRouteCalculate]);

  // Handle geolocation updates
  useEffect(() => {
    if (!readyRef.current || testMode) return;

    const handleSuccess = (position) => {
      let { latitude, longitude, accuracy } = position.coords;
      
      // Use development coordinates if accuracy is poor
      if (process.env.NODE_ENV === 'development' && accuracy > 10000) {
        latitude = 36.8065;
        longitude = 10.1815;
        accuracy = 50;
      }

      if (accuracy > 1000) return;

      updateLocation(latitude, longitude);
      onLocationFound?.();
    };

    const handleError = (err) => {
      console.error("Geolocation error:", err);
      onLocationFound?.(err.message || "Geolocation error");
    };

    if (navigator.geolocation) {
      locationWatchId.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        { 
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0
        }
      );
    } else {
      onLocationFound?.("Geolocation not supported");
    }

    return () => {
      if (locationWatchId.current) {
        navigator.geolocation.clearWatch(locationWatchId.current);
      }
    };
  }, [testMode, updateLocation, onLocationFound]);

  // Handle test coordinates in test mode
  useEffect(() => {
    if (!readyRef.current || !testMode || !testCoordinates.length) return;

    testCoordinates.forEach((coord, index) => {
      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.fire('click', {
            latlng: L.latLng(coord.lat, coord.lng)
          });
        }
      }, index * 1000);
    });
  }, [testMode, testCoordinates]);

  return (
    <div style={{ position: 'relative', height: '70vh', width: '100%' }}>
      <div
        ref={mapRef}
        style={{
          height: '100%',
          width: '100%',
          minHeight: '400px'
        }}
      />
    </div>
  );
};

export default MaritimeMap;