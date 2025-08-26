import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Badge, Button, Modal, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCalendar, FaUsers, FaShip, FaMoneyBillWave, FaMapMarkerAlt, FaHome, FaCheck } from 'react-icons/fa';
import BookingChat from './BookingChat';
import MapComponent from '../Map/MapComponent';
import WeatherWidget from './WeatherWidget';
import {jwtDecode} from 'jwt-decode';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [submittingConfirm, setSubmittingConfirm] = useState(false);
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [weatherLocation, setWeatherLocation] = useState('departure');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
        const response = await axios.get(`/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched booking data:', response.data.booking);
        setBooking(response.data.booking);
        setPassengerLocation(response.data.booking.currentLocation?.coordinates || [0, 0]);
      } catch (err) {
        console.error('Fetch booking error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();

    const intervalId = setInterval(fetchBooking, 30000);
    return () => clearInterval(intervalId);
  }, [bookingId]);

  const handleMakeOffer = async () => {
    setSubmittingOffer(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/bookings/${bookingId}/offer`,
        { offerPrice: parseFloat(offerPrice), message: offerMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Offer response:', response.data);
      setBooking(response.data.booking);
      setShowOfferModal(false);
      setOfferPrice('');
      setOfferMessage('');
    } catch (err) {
      console.error('Make offer error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to make offer');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleConfirmBooking = async () => {
    setSubmittingConfirm(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/bookings/${bookingId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Accept offer response:', response.data);
      setBooking(response.data.booking);
    } catch (err) {
      console.error('Accept offer error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to confirm booking');
    } finally {
      setSubmittingConfirm(false);
    }
  };

  const handleRejectBooking = async () => {
    setSubmittingConfirm(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/bookings/${bookingId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Reject offer response:', response.data);
      setBooking(response.data.booking);
    } catch (err) {
      console.error('Reject offer error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to reject booking');
    } finally {
      setSubmittingConfirm(false);
    }
  };

  const token = localStorage.getItem('token');
  let userId;
  try {
    const decoded = jwtDecode(token);
    userId = decoded._id;
  } catch (err) {
    console.error('JWT decode error:', err);
    userId = localStorage.getItem('userId');
  }
  const boatOwnerId = booking?.boatOwner?._id;
  const isBoatOwner = userId && boatOwnerId && userId === boatOwnerId.toString();
  console.log('Debugging button visibility:', {
    isBoatOwner,
    userId,
    boatOwnerId,
    bookingStatus: booking?.status,
    bookingData: booking ? booking : 'No booking data',
    tokenValid: !!token,
    userRole,
  });

  const getWeatherCoordinates = () => {
    if (!booking) return [0, 0];
    return weatherLocation === 'departure'
      ? booking.departureLocation?.coordinates || [0, 0]
      : booking.destination?.coordinates || [0, 0];
  };

  const getWeatherLocationName = () => {
    if (!booking) return 'No Location';
    return weatherLocation === 'departure' ? 'Departure Location' : 'Destination';
  };

  if (loading) {
    return (
      <Container className="text-center my-5 py-5">
        <Spinner animation="border" variant="primary" />
        <h4 className="mt-3">Loading booking details...</h4>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container className="my-5">
        <Alert variant="danger">Booking not found</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Button variant="outline-primary" className="mb-4" onClick={() => navigate(-1)}>
        ← Back
      </Button>
      <h2 className="mb-4 flex items-center">
        <span className="mr-2">⛵</span> Booking Details #{booking._id.slice(-6)}
      </h2>
      <div className="mb-4">
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold flex items-center">
            <span className="mr-2">🌊</span> Weather Forecast
          </h3>
          <div className="mt-2">
            <select
              className="p-2 border rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-blue-500"
              value={weatherLocation}
              onChange={(e) => setWeatherLocation(e.target.value)}
            >
              <option value="departure">Departure Location</option>
              <option value="destination">Destination</option>
            </select>
          </div>
          <div className="mt-4">
            <WeatherWidget
              coordinates={getWeatherCoordinates()}
              locationName={getWeatherLocationName()}
              startDate={booking.startDate}
              endDate={booking.endDate}
            />
          </div>
        </div>
      </div>
      <Row>
        <Col lg={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Booking Information</h5>
              <Badge
                bg={
                  booking.status === 'pending' ? 'warning' :
                  booking.status === 'offered' ? 'info' :
                  booking.status === 'confirmed' ? 'success' :
                  'secondary'
                }
              >
                {booking.status.toUpperCase()}
              </Badge>
            </Card.Header>
            <Card.Body>
              <p><FaShip className="me-2" /><strong>Boat:</strong> {booking.boat.name} ({booking.boat.boatType})</p>
              <p><FaUsers className="me-2" /><strong>Passenger:</strong> {booking.passenger.firstName} {booking.passenger.lastName}</p>
              <p><FaUsers className="me-2" /><strong>Boat Owner:</strong> {booking.boatOwner.firstName} {booking.boatOwner.lastName}</p>
              <p><FaUsers className="me-2" /><strong>Number of Persons:</strong> {booking.numberOfPersons}</p>
              <p><FaHome className="me-2" /><strong>Number of Cabins:</strong> {booking.numberOfCabins}</p>
              <p><FaCalendar className="me-2" /><strong>Dates:</strong> {new Date(booking.startDate).toLocaleString()} - {new Date(booking.endDate).toLocaleString()}</p>
              <p>
                <FaMapMarkerAlt className="me-2" />
                <strong>Departure:</strong> 
                Lat: {booking.departureLocation?.coordinates?.[1] ?? 'N/A'}, 
                Lng: {booking.departureLocation?.coordinates?.[0] ?? 'N/A'}
              </p>
              <p>
                <FaMapMarkerAlt className="me-2" />
                <strong>Destination:</strong> 
                Lat: {booking.destination?.coordinates?.[1] ?? 'N/A'}, 
                Lng: {booking.destination?.coordinates?.[0] ?? 'N/A'}
              </p>
              <p><FaMoneyBillWave className="me-2" /><strong>Payment Method:</strong> {booking.paymentMethod}</p>
              {booking.offerPrice && <p><FaMoneyBillWave className="me-2" /><strong>Offer Price:</strong> ${booking.offerPrice}</p>}
              {booking.offerMessage && <p><FaMoneyBillWave className="me-2" /><strong>Offer Message:</strong> {booking.offerMessage}</p>}
              {userRole === 'boat_owner' && (
                <>
                  {booking.status === 'pending' ? (
                    <Button
                      variant="success"
                      className="mt-3"
                      onClick={() => setShowOfferModal(true)}
                      disabled={submittingOffer}
                    >
                      {submittingOffer ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                          Making Offer...
                        </>
                      ) : (
                        'Make an Offer'
                      )}
                    </Button>
                  ) : (
                    <p className="mt-3 text-muted">Cannot make an offer: Status is {booking.status}</p>
                  )}
                  <Button
                    variant="warning"
                    className="mt-3 ml-2"
                    onClick={() => setShowOfferModal(true)}
                    disabled={submittingOffer}
                  >
                    Debug: Force Offer Modal
                  </Button>
                </>
              )}
              {userRole !== 'boat_owner' && booking.status === 'offered' && (
                <>
                  <Button
                    variant="primary"
                    className="mt-3 me-2"
                    onClick={handleConfirmBooking}
                    disabled={submittingConfirm}
                  >
                    {submittingConfirm ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Confirming...
                      </>
                    ) : (
                      'Accept Offer'
                    )}
                  </Button>
                  <Button
                    variant="danger"
                    className="mt-3"
                    onClick={handleRejectBooking}
                    disabled={submittingConfirm}
                  >
                    {submittingConfirm ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Rejecting...
                      </>
                    ) : (
                      'Reject Offer'
                    )}
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Passenger Location</h5>
            </Card.Header>
            <Card.Body>
              {passengerLocation && (
                <MapComponent
                  initialPosition={passengerLocation}
                  onLocationChange={() => {}}
                />
              )}
              {!passengerLocation && <p>No real-time location data available.</p>}
            </Card.Body>
          </Card>
          <BookingChat bookingId={bookingId} />
        </Col>
      </Row>

      <Modal show={showOfferModal} onHide={() => setShowOfferModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Make an Offer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Offer Price ($)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="Enter offer price"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="Enter optional message"
              />
            </Form.Group>
          </Form>
          {error && <Alert variant="danger">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOfferModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleMakeOffer} disabled={submittingOffer || !offerPrice}>
            {submittingOffer ? (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            ) : (
              'Submit Offer'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookingDetails;