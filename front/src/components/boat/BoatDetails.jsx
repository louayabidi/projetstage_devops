import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, Badge } from 'react-bootstrap';
import { 
  FaShip, 
  FaUsers, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaStar, 
  FaChevronLeft, 
  FaCalendar, 
  FaMoneyBillWave,
  FaDownload // Add download icon
} from 'react-icons/fa';
import axios from 'axios';
import './BoatDetails.css'; 
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

axios.defaults.baseURL = 'http://localhost:3000';

const BoatDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [boat, setBoat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [userBookings, setUserBookings] = useState([]);
  const [reviewsFetchError, setReviewsFetchError] = useState('');

  const handleReservation = () => {
    navigate(`/reservation/${id}`);
  };

  const handleDownloadLicense = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in again');
        navigate('/login');
        return;
      }

      const response = await axios.get(`/api/boats/${id}/license`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `boat_license_${id}.${response.headers['content-type'].split('/')[1]}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download license error:', err);
      setError(err.response?.data?.message || 'Failed to download license');
    }
  };

  useEffect(() => {
    const fetchBoatDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view boat details');
          setLoading(false);
          navigate('/login');
          return;
        }

        const boatResponse = await axios.get(`/api/boats/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Boat data:', boatResponse.data);
        setBoat(boatResponse.data);
        if (boatResponse.data.photos && boatResponse.data.photos.length > 0) {
          setMainImage(boatResponse.data.photos[0]);
        }

        if (boatResponse.data.owner?._id) {
          try {
            const reviewsResponse = await axios.get(`/api/bookings/boat-owner/${boatResponse.data.owner._id}/reviews`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Reviews data:', reviewsResponse.data);
            setReviews(reviewsResponse.data.reviews || []);
            setAverageRating(reviewsResponse.data.averageRating || 0);
          } catch (reviewErr) {
            console.error('Failed to fetch reviews:', reviewErr.response?.data);
            setReviews([]);
            setAverageRating(0);
            setReviewsFetchError(reviewErr.response?.data?.message || 'Failed to fetch reviews');
          }
        }

        try {
          const bookingsResponse = await axios.get(`/api/bookings/passenger`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Passenger bookings:', bookingsResponse.data.bookings);
          const filteredBookings = bookingsResponse.data.bookings.filter(
            b => b.boat && b.boat._id && b.boat._id.toString() === id && b.status === 'confirmed'
          );
          console.log('Filtered user bookings:', filteredBookings);
          setUserBookings(filteredBookings || []);
        } catch (bookingErr) {
          console.error('Failed to fetch bookings:', bookingErr.response?.data);
          setUserBookings([]);
          setError('Failed to fetch bookings. Please try again.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || 'Failed to fetch boat details');
      } finally {
        setLoading(false);
      }
    };

    fetchBoatDetails();
  }, [id, navigate]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!bookingId) {
      setReviewError('Please select a booking to review');
      return;
    }

    if (!rating) {
      setReviewError('Please select a rating');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/bookings/${bookingId}/review`,
        { bookingId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReviewSuccess(response.data.message);
      setReviews([...reviews, response.data.review]);
      if (boat.owner?._id) {
        try {
          const reviewsResponse = await axios.get(`/api/bookings/boat-owner/${boat.owner._id}/reviews`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setReviews(reviewsResponse.data.reviews || []);
          setAverageRating(reviewsResponse.data.averageRating || 0);
          setReviewsFetchError('');
        } catch (reviewErr) {
          setReviewsFetchError(reviewErr.response?.data?.message || 'Failed to fetch updated reviews');
        }
      }
      setRating(0);
      setComment('');
      setBookingId('');
    } catch (err) {
      console.error('Review submission error:', err);
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

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
          <p><Button variant="primary" onClick={() => navigate('/boats')}>
            Browse all boats
          </Button></p>
        </Alert>
      </Container>
    );
  }

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
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                      onClick={() => setActiveTab('reviews')}
                    >
                      Reviews
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
                              <strong>License:</strong> 
                              {boat.boatLicense ? (
                                <Button 
                                  variant="link" 
                                  onClick={handleDownloadLicense}
                                  className="p-0 ms-2"
                                >
                                  <FaDownload className="me-1" /> Download License
                                </Button>
                              ) : 'Not specified'}
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

                  {activeTab === 'reviews' && (
                    <div className="tab-pane">
                      <h4>Reviews ({reviews.length})</h4>
                      <p>Average Rating: {averageRating.toFixed(1)} <FaStar className="text-warning" /></p>
                      {reviewsFetchError && (
                        <Alert variant="warning">
                          {reviewsFetchError}
                        </Alert>
                      )}
                      {reviews.length > 0 ? (
                        reviews.map((review, index) => (
                          <Card key={index} className="mb-3">
                            <Card.Body>
                              <div className="d-flex align-items-center mb-2">
                                <img
                                  src={review.passenger?.photo ? `http://localhost:3000${review.passenger.photo}` : '/default-avatar.jpg'}
                                  alt={`${review.passenger?.firstName || 'Anonymous'} ${review.passenger?.lastName || ''}`}
                                  className="me-2"
                                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                />
                                <div>
                                  <strong>{review.passenger?.firstName || 'Anonymous'} {review.passenger?.lastName || ''}</strong>
                                  <div>
                                    {[...Array(5)].map((_, i) => (
                                      <FaStar key={i} className={i < review.rating ? 'text-warning' : 'text-muted'} />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <p>{review.comment || 'No comment provided.'}</p>
                              <small className="text-muted">{new Date(review.createdAt).toLocaleDateString()}</small>
                            </Card.Body>
                          </Card>
                        ))
                      ) : (
                        <p>No reviews yet.</p>
                      )}

                      {userBookings.length > 0 ? (
                        <Card className="mt-4">
                          <Card.Body>
                            <h5>Submit a Review</h5>
                            {reviewError && <Alert variant="danger">{reviewError}</Alert>}
                            {reviewSuccess && <Alert variant="success">{reviewSuccess}</Alert>}
                            <Form onSubmit={handleReviewSubmit}>
                              <Form.Group className="mb-3">
                                <Form.Label>Booking</Form.Label>
                                <Form.Select
                                  value={bookingId}
                                  onChange={(e) => setBookingId(e.target.value)}
                                  required
                                >
                                  <option value="">Select a booking</option>
                                  {userBookings.map((booking) => (
                                    <option key={booking._id} value={booking._id}>
                                      Booking from {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                              <Form.Group className="mb-3">
                                <Form.Label>Rating</Form.Label>
                                <div>
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar
                                      key={i}
                                      className={i < rating ? 'text-warning' : 'text-muted'}
                                      style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                                      onClick={() => setRating(i + 1)}
                                    />
                                  ))}
                                </div>
                              </Form.Group>
                              <Form.Group className="mb-3">
                                <Form.Label>Comment</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={4}
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  placeholder="Share your experience..."
                                />
                              </Form.Group>
                              <Button type="submit" variant="primary" disabled={!rating || !bookingId}>
                                Submit Review
                              </Button>
                            </Form>
                          </Card.Body>
                        </Card>
                      ) : (
                        <Alert variant="info" className="mt-4">
                          You need a confirmed booking to submit a review for this boat owner.
                        </Alert>
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
                  <p>Average Rating: {averageRating.toFixed(1)} <FaStar className="text-warning" /></p>
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