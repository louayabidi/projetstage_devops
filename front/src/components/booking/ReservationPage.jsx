// ReservationPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaCalendar, FaUsers, FaHome, FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';


const ReservationPage = () => {
  const { boatId } = useParams();
  const navigate = useNavigate();
  const [boat, setBoat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    numberOfPersons: 1,
    hasKids: false,
    paymentMethod: 'credit_card',
    departureLocation: {
      type: 'Point',
      coordinates: [0, 0]
    },
    destination: '',
    numberOfCabins: 1,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchBoatDetails = async () => {
      try {
        const response = await axios.get(`/api/boats/${boatId}`);
        setBoat(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch boat details');
      } finally {
        setLoading(false);
      }
    };

    fetchBoatDetails();
  }, [boatId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'hasKids') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'departureLat' || name === 'departureLng') {
      setFormData(prev => ({
        ...prev,
        departureLocation: {
          ...prev.departureLocation,
          coordinates: name === 'departureLat' 
            ? [prev.departureLocation.coordinates[0], parseFloat(value) || 0]
            : [parseFloat(value) || 0, prev.departureLocation.coordinates[1]]
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setError(null);

  try {
    const token = localStorage.getItem('token');
     console.log('Token:', token);
    const response = await axios.post('http://localhost:3000/api/bookings', { ...formData, boatId }, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    });

    if (response.data.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate(`/booking/${response.data.booking._id}`);
      }, 2000);
    }
  } catch (err) {
    console.error('Booking creation error:', err.response?.data || err.message);
    setError(err.response?.data?.message || 'Failed to create booking');
  } finally {
    setSubmitting(false);
  }
};


  if (loading) {
    return (
      <Container className="text-center my-5 py-5">
        <Spinner animation="border" variant="primary" />
        <h4 className="mt-3">Loading reservation details...</h4>
      </Container>
    );
  }

  if (!boat) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>Boat not found</p>
          <Button variant="primary" onClick={() => navigate('/boats')}>
            Back to Boats
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Button variant="outline-primary" className="mb-4" onClick={() => navigate(`/boats/${boatId}`)}>
        ← Back to Boat Details
      </Button>

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">Reservation Request</h3>
            </Card.Header>
            <Card.Body>
              {success ? (
                <Alert variant="success">
                  <Alert.Heading>Reservation Request Sent!</Alert.Heading>
                  <p>Your reservation request has been sent to the boat owner. You will be redirected to your booking page shortly.</p>
                </Alert>
              ) : (
                <Form onSubmit={handleSubmit}>
                  {error && <Alert variant="danger">{error}</Alert>}

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          <FaUsers className="me-2" />
                          Number of Persons *
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="numberOfPersons"
                          value={formData.numberOfPersons}
                          onChange={handleInputChange}
                          min="1"
                          max={boat.boatCapacity}
                          required
                        />
                        <Form.Text className="text-muted">
                          Maximum capacity: {boat.boatCapacity} persons
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          <FaHome className="me-2" />
                          Number of Cabins *
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="numberOfCabins"
                          value={formData.numberOfCabins}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      name="hasKids"
                      label="Includes children under 12 years"
                      checked={formData.hasKids}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          <FaCalendar className="me-2" />
                          Start Date *
                        </Form.Label>
                        <Form.Control
                          type="datetime-local"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          <FaCalendar className="me-2" />
                          End Date *
                        </Form.Label>
                        <Form.Control
                          type="datetime-local"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaMapMarkerAlt className="me-2" />
                      Departure Location *
                    </Form.Label>
                    <Row>
                      <Col md={6}>
                        <Form.Control
                          type="number"
                          step="any"
                          placeholder="Latitude"
                          name="departureLat"
                          onChange={handleInputChange}
                          required
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Control
                          type="number"
                          step="any"
                          placeholder="Longitude"
                          name="departureLng"
                          onChange={handleInputChange}
                          required
                        />
                      </Col>
                    </Row>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Destination *</Form.Label>
                    <Form.Control
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="Enter your destination"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      <FaMoneyBillWave className="me-2" />
                      Payment Method *
                    </Form.Label>
                    <Form.Select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="paypal">PayPal</option>
                      <option value="cash">Cash</option>
                    </Form.Select>
                  </Form.Group>

                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      size="lg"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Sending Request...
                        </>
                      ) : (
                        'Send Reservation Request'
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Header>
              <h5 className="mb-0">Boat Summary</h5>
            </Card.Header>
            <Card.Body>
              <h6>{boat.name}</h6>
              <p className="text-muted">{boat.boatType}</p>
              
              {boat.photos && boat.photos.length > 0 && (
                <img
                  src={`http://localhost:3000${boat.photos[0]}`}
                  alt={boat.name}
                  className="img-fluid rounded mb-3"
                />
              )}
              
              <div className="mb-2">
                <strong>Capacity:</strong> {boat.boatCapacity} persons
              </div>
              <div className="mb-2">
                <strong>License:</strong> {boat.boatLicense}
              </div>
              
              {boat.amenities && boat.amenities.length > 0 && (
                <div className="mt-3">
                  <strong>Amenities:</strong>
                  <div className="amenities-small">
                    {boat.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="badge bg-light text-dark me-1 mb-1 small">
                        {amenity}
                      </span>
                    ))}
                    {boat.amenities.length > 3 && (
                      <span className="badge bg-light text-dark small">
                        +{boat.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReservationPage;