import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { FaShip, FaUsers, FaCheckCircle, FaRegClock, FaSearch, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import './Boats.css';
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";

const Boats = () => {
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoats = async () => {
      try {
        const response = await axios.get('/api/boats');
        setBoats(Array.isArray(response?.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch boats');
        setBoats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBoats();
  }, []);

  const filteredBoats = boats.filter(boat => {
    const name = boat?.name?.toLowerCase() || '';
    const type = boat?.boatType?.toLowerCase() || '';
    return (
      (name.includes(searchTerm.toLowerCase()) || type.includes(searchTerm.toLowerCase())) &&
      (filterType === 'all' || boat?.boatType === filterType)
    );
  });

  const boatTypes = [...new Set(boats.map(boat => boat?.boatType).filter(Boolean))];

  if (loading) {
    return (
      <Container className="text-center my-5 py-5">
        <Spinner animation="border" variant="primary" role="status" aria-label="Loading luxury vessels" />
        <h4 className="mt-3 text-primary">Discovering Amazing Boats...</h4>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger" className="text-center shadow-sm">
          <Alert.Heading>⛔ Connection Error</Alert.Heading>
          <p>We couldn't reach our marina. {error}</p>
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
        <h1 className="display-4 mb-3">Explore Luxury Vessels</h1>
        <p className="lead text-muted">Find your perfect boat for an unforgettable experience</p>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter mb-5 p-4 bg-white rounded shadow-sm">
        <Row className="align-items-center g-3">
          <Col xs={12} md={7}>
            <div className="search-box position-relative">
              <FaSearch className="search-icon text-primary" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search by boat name or type..."
                className="form-control ps-5 py-2 border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search boats"
              />
            </div>
          </Col>
          <Col xs={12} md={5}>
            <div className="filter-select position-relative">
              <FaFilter className="filter-icon text-primary" aria-hidden="true" />
              <select
                className="form-select py-2 ps-5 border-primary"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                aria-label="Filter by boat type"
              >
                <option value="all">All Categories</option>
                {boatTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </Col>
        </Row>
      </div>

      {/* Boats Listing */}
      {filteredBoats.length === 0 ? (
        <Alert variant="info" className="text-center shadow-sm">
          <h4>No matching boats found</h4>
          <p>Try adjusting your search or filter criteria</p>
        </Alert>
      ) : (
      <Row xs={1} md={2} className="g-4">
  {filteredBoats.map(boat => (
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
          {boat.isVerified && (
            <span className="verified-badge">
              <FaCheckCircle className="me-1" aria-hidden="true" /> Verified
            </span>
          )}
        </div>

        <Card.Body className="d-flex flex-column">
          <Card.Title className="d-flex justify-content-between align-items-center mb-2">
            <span className="boat-name text-truncate">{boat.name}</span>
            {!boat.isVerified && (
              <span className="text-warning small">
                <FaRegClock className="me-1" aria-hidden="true" /> Pending
              </span>
            )}
          </Card.Title>

          <Card.Subtitle className="mb-3 text-primary text-truncate">
            {boat.boatType}
          </Card.Subtitle>

          <div className="boat-details mb-3">
            <div className="detail-item">
              <FaUsers className="me-2 text-primary" aria-hidden="true" />
              <span>Up to {boat.boatCapacity} guests</span>
            </div>
            {boat.boatLicense && (
              <div className="detail-item small text-muted text-truncate">
                License: {boat.boatLicense}
              </div>
            )}
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
            href={`/boats/${boat._id}`}
            className="px-4 py-2 rounded-pill w-100"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Explore ${boat.name}`}
          >
            Explore This Vessel
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

export default Boats;