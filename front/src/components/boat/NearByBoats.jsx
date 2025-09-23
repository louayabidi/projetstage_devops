// src/components/boat/NearbyBoats.js
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { FaShip, FaUsers, FaCheckCircle, FaRegClock } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useGeolocated } from 'react-geolocated';
import './Boats.css'; // Reuse the same CSS as Boats.js for consistency
import "bootstrap/dist/css/bootstrap.min.css";

const NearbyBoats = () => {
  const [nearbyBoats, setNearbyBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:3000";

  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: { enableHighAccuracy: true },
    userDecisionTimeout: 5000,
  });

  useEffect(() => {
    const fetchNearbyBoats = async () => {
      if (!isGeolocationAvailable) {
        setLocationError('Geolocation is not supported by your browser');
        setLoading(false);
        return;
      }
      if (!isGeolocationEnabled) {
        setLocationError('Please enable location services');
        setLoading(false);
        return;
      }
      if (coords) {
        try {
          const token = localStorage.getItem('token'); // Assuming token is stored
          const response = await axios.post(
            `${API_BASE_URL}/api/boats/nearby-boats`,
            {
              latitude: coords.latitude,
              longitude: coords.longitude,
              maxDistance: 10000, // 10km
            },
            {
              headers: { Authorization: `Bearer ${token}` }, // Include token for auth
            }
          );
          setNearbyBoats(response.data.boats || []);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch nearby boats');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNearbyBoats();
  }, [coords, isGeolocationAvailable, isGeolocationEnabled]);

  if (loading) {
    return (
      <Container className="text-center my-5 py-5">
        <Spinner animation="border" variant="primary" role="status" aria-label="Loading nearby boats" />
        <h4 className="mt-3 text-primary">Finding Nearby Boats...</h4>
      </Container>
    );
  }

  if (error || locationError) {
    return (
      <Container className="my-5">
        <Alert variant="danger" className="text-center shadow-sm">
          <Alert.Heading>⛔ Error</Alert.Heading>
          <p>{locationError || error}</p>
          <div className="d-flex justify-content-center gap-3">
            <Button variant="outline-primary" onClick={() => window.location.reload()}>
              Refresh
            </Button>
            <Button variant="primary" href="/contact">
              Contact Support
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="boats-container my-5 px-4">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">Find Nearby Boats</h1>
        <p className="lead text-muted">Discover boats closest to your location for a quick ride</p>
      </div>

      {nearbyBoats.length === 0 ? (
        <Alert variant="info" className="text-center shadow-sm">
          <h4>No nearby boats found</h4>
          <p>Try adjusting your location or check back later.</p>
        </Alert>
      ) : (
        <Row xs={1} md={2} className="g-4">
          {nearbyBoats.map(boat => (
            <Col key={boat._id}>
              <Card
                className="boat-card shadow-sm h-100"
                onClick={() => navigate(`/boats/${boat._id}`)}
                role="button"
                aria-label={`View details for ${boat.name}`}
              >
                <div className="image-container">
                  {boat.photos?.[0] ? (
                    <Card.Img
                      variant="top"
                      src={`http://localhost:3000${boat.photos[0]}`}
                      alt={boat.name}
                      className="boat-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/images/default-boat.jpg';
                      }}
                    />
                  ) : (
                    <div className="no-image-placeholder bg-light d-flex align-items-center justify-content-center">
                      <FaShip size={50} className="text-primary" aria-hidden="true" />
                    </div>
                  )}
                  <span className="verified-badge">
                    <FaCheckCircle className="me-1" aria-hidden="true" /> Verified
                  </span>
                </div>

                <Card.Body className="d-flex flex-column">
                  <Card.Title className="d-flex justify-content-between align-items-center mb-2">
                    <span className="boat-name text-truncate">{boat.name}</span>
                    <span className="text-muted small">{boat.distance.toFixed(2)} km away</span>
                  </Card.Title>

                  <Card.Subtitle className="mb-3 text-primary text-truncate">
                    {boat.boatType}
                  </Card.Subtitle>

                  <Card.Text className="mb-3 text-muted text-truncate">
                    {boat.description ? boat.description.substring(0, 100) + (boat.description.length > 100 ? '...' : '') : 'No description available'}
                  </Card.Text>

                  <div className="boat-details mb-3">
                    <div className="detail-item">
                      <FaUsers className="me-2 text-primary" aria-hidden="true" />
                      <span>Up to {boat.boatCapacity} guests</span>
                    </div>
                  </div>

                  {boat.amenities?.length > 0 && (
                    <div className="amenities-section mt-auto">
                      <h6 className="text-primary mb-2">Premium Amenities:</h6>
                      <div className="amenities-list">
                        {boat.amenities.slice(0, 3).map((amenity, index) => (
                          <span key={index} className="badge bg-light text-primary me-1 mb-1">
                            {amenity}
                          </span>
                        ))}
                        {boat.amenities.length > 3 && (
                          <span className="badge bg-light text-primary">
                            +{boat.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </Card.Body>

                <Card.Footer className="bg-white border-top-0 text-center">
                  <Button
                    variant="primary"
                    href={`/reservation/${boat._id}?quickRide=true`}
                    className="px-4 py-2 rounded-pill w-100"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Book quick ride on ${boat.name}`}
                  >
                    Book Quick Ride
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default NearbyBoats;