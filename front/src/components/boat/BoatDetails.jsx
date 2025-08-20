import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { 
  FaShip, 
  FaUsers, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaStar, 
  FaChevronLeft, 
  FaCalendar, 
  FaMoneyBillWave 
} from 'react-icons/fa';

import axios from 'axios';
import './BoatDetails.css'; 
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

const BoatDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [boat, setBoat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
const handleReservation = () => {
  navigate(`/reservation/${id}`);
}; 

  useEffect(() => {
    const fetchBoatDetails = async () => {
      try {
        const response = await axios.get(`/api/boats/${id}`);
        console.log('Boat data:', response.data);
        setBoat(response.data);
        if (response.data.photos && response.data.photos.length > 0) {
          setMainImage(response.data.photos[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch boat details');
      } finally {
        setLoading(false);
      }
    };

    fetchBoatDetails();
  }, [id]);

  if (loading) {
    return (
      <Container className="text-center my-5 py-5">
        <Spinner animation="border" variant="primary" />
        <h4 className="mt-3">Loading boat details...</h4>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          <Alert.Heading>Error loading boat</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={() => navigate(-1)}>
            <FaChevronLeft /> Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!boat) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          <Alert.Heading>Boat not found</Alert.Heading>
          <p>The boat you're looking for doesn't exist or may have been removed.</p>
          <Button variant="primary" onClick={() => navigate('/boats')}>
            Browse all boats
          </Button>
        </Alert>
      </Container>
    );
  }

  // Prepare images for the gallery
  const galleryImages = boat.photos?.map(photo => ({
    original: `http://localhost:3000${photo}`,
    thumbnail: `http://localhost:3000${photo}`,
  })) || [];

  return (
    <Container className="boat-details-container my-5">
      <Button variant="outline-primary" onClick={() => navigate(-1)} className="mb-4">
        <FaChevronLeft /> Back to Boats
      </Button>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              {/* Main Image Gallery */}
              {galleryImages.length > 0 ? (
                <ImageGallery
                  items={galleryImages}
                  showPlayButton={false}
                  showFullscreenButton={true}
                  showNav={galleryImages.length > 1}
                  showThumbnails={galleryImages.length > 1}
                  thumbnailPosition="bottom"
                  lazyLoad={true}
                  additionalClass="boat-gallery"
                />
              ) : (
                <div className="no-image-placeholder text-center py-5">
                  <FaShip size={80} className="text-muted" />
                  <p className="mt-3 text-muted">No images available</p>
                </div>
              )}

              {/* Boat Info Tabs */}
              <div className="boat-tabs mt-4">
                <ul className="nav nav-tabs">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'description' ? 'active' : ''}`}
                      onClick={() => setActiveTab('description')}
                    >
                      Description
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'specs' ? 'active' : ''}`}
                      onClick={() => setActiveTab('specs')}
                    >
                      Specifications
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'amenities' ? 'active' : ''}`}
                      onClick={() => setActiveTab('amenities')}
                    >
                      Amenities
                    </button>
                  </li>
                </ul>

                <div className="tab-content p-3 border border-top-0 rounded-bottom">
                  {activeTab === 'description' && (
                    <div className="tab-pane active">
                      <h4>About this boat</h4>
                      <p>{boat.description || 'No description provided.'}</p>
                    </div>
                  )}

                  {activeTab === 'specs' && (
                    <div className="tab-pane">
                      <Row>
                        <Col md={6}>
                          <ul className="list-unstyled">
                            <li className="mb-2">
                              <strong>Type:</strong> {boat.boatType}
                            </li>
                            <li className="mb-2">
                              <strong>Capacity:</strong> {boat.boatCapacity} guests
                            </li>
                            <li className="mb-2">
                              <strong>License:</strong> {boat.boatLicense || 'Not specified'}
                            </li>
                          </ul>
                        </Col>
                        <Col md={6}>
                          <ul className="list-unstyled">
                            <li className="mb-2">
                              <strong>Year:</strong> {boat.year || 'Not specified'}
                            </li>
                            <li className="mb-2">
                              <strong>Length:</strong> {boat.length || 'Not specified'}
                            </li>
                            <li className="mb-2">
                              <strong>Engine:</strong> {boat.engineType || 'Not specified'}
                            </li>
                          </ul>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {activeTab === 'amenities' && (
                    <div className="tab-pane">
                      {boat.amenities?.length > 0 ? (
                        <Row>
                          {boat.amenities.map((amenity, index) => (
                            <Col xs={6} md={4} key={index} className="mb-2">
                              <div className="amenity-item">
                                <FaStar className="text-warning me-2" />
                                {amenity}
                              </div>
                            </Col>
                          ))}
                        </Row>
                      ) : (
                        <p>No amenities listed.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Reserve This Boat</h5>
            </Card.Header>
            <Card.Body>
           {boat.owner && (
  <div className="mb-3">
    <h6>Boat Owner</h6>
    <p className="mb-1">
      {boat.owner.firstName} {boat.owner.lastName}
    </p>
    {boat.owner.verified && (
      <Badge bg="success" className="small">
        Verified Owner
      </Badge>
    )}
  </div>
)}
              
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleReservation}
                >
                  <FaCalendar className="me-2" />
                  Make Reservation
                </Button>
              </div>
              
              <hr />
              
              <div className="text-center">
                <p className="text-muted small">
                  <FaMoneyBillWave className="me-1" />
                  Secure payment options available
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
export default BoatDetails;