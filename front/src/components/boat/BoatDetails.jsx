import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FaShip, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaStar, FaChevronLeft } from 'react-icons/fa';
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

  useEffect(() => {
    const fetchBoatDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/boats/${id}`);
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

        <Col lg={4}>
          <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Body>
              <h2 className="boat-title">{boat.name}</h2>
              {boat.isVerified && (
                <div className="verified-badge mb-3">
                  <FaStar className="me-1" /> Verified Boat
                </div>
              )}

              <div className="price-section mb-4">
                <h3 className="text-primary">${boat.pricePerDay || '--'} <small className="text-muted">/ day</small></h3>
                {boat.discount && (
                  <div className="text-success">
                    <small>Special offer: {boat.discount}% off</small>
                  </div>
                )}
              </div>

              <div className="booking-widget mb-4">
                <h5 className="mb-3">
                  <FaCalendarAlt className="me-2" /> Book this boat
                </h5>
                <div className="d-grid gap-2">
                  <Button variant="primary" size="lg">
                    Check Availability
                  </Button>
                  <Button variant="outline-primary">
                    Contact Owner
                  </Button>
                </div>
              </div>

              <div className="owner-info mt-4 pt-3 border-top">
  <h5>About the owner</h5>
  {boat.owner ? (
    <div className="d-flex align-items-center mt-2">
      <div className="owner-avatar me-3">
        {boat.owner.avatar ? (
          <img 
            src={`http://localhost:3000${boat.owner.avatar}`} 
            alt={boat.owner.firstName} 
            className="rounded-circle"
            width="50"
            height="50"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/path/to/default/avatar.jpg';
            }}
          />
        ) : (
          <div className="avatar-placeholder rounded-circle bg-light d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
            <FaUsers className="text-muted" />
          </div>
        )}
      </div>
      <div>
        <h6 className="mb-0">{boat.owner.name || `${boat.owner.firstName} ${boat.owner.lastName}`}</h6>
        <small className="text-muted">
          Member since {boat.owner.createdAt ? new Date(boat.owner.createdAt).getFullYear() : '--'}
        </small>
      </div>
    </div>
  ) : (
    <p className="text-muted">Owner information not available</p>
  )}
</div>

           
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BoatDetails;