import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Badge, Button, Modal, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCalendar, FaUsers, FaShip, FaMoneyBillWave, FaMapMarkerAlt, FaHome, FaCheck } from 'react-icons/fa';
import BookingChat from './BookingChat';
import MapComponent from '../Map/MapComponent';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [submittingConfirm, setSubmittingConfirm] = useState(false);
  const [passengerLocation, setPassengerLocation] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched booking data:', response.data.booking);
        setBooking(response.data.booking);
        setPassengerLocation(response.data.booking.currentLocation?.coordinates || [0, 0]);
      } catch (err) {
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
        `http://localhost:3000/api/bookings/${bookingId}/offer`,
        { offerPrice: parseFloat(offerPrice) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBooking(response.data.booking);
      setShowOfferModal(false);
      setOfferPrice('');
    } catch (err) {
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
        `http://localhost:3000/api/bookings/${bookingId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBooking(response.data.booking);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm booking');
    } finally {
      setSubmittingConfirm(false);
    }
  };

  const userId = localStorage.getItem('userId');
  const boatOwnerId = booking?.boatOwner?._id;
  console.log('Full booking data:', booking);
  console.log('User ID:', userId, 'Boat Owner ID:', boatOwnerId, 'Status:', booking?.status, 'Is Boat Owner:', userId === boatOwnerId?.toString());
  const isBoatOwner = userId && boatOwnerId && userId === boatOwnerId.toString();

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
      <h2 className="mb-4">Booking Details #{booking._id.slice(-6)}</h2>
      <Row>
        <Col lg={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Booking Information</h5>
              <Badge
                bg={
                  booking.status === 'pending' ? 'warning' :
                  booking.status === 'offered' ? 'info' :
                  booking.status === 'accepted' ? 'info' :
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
              <p><FaMapMarkerAlt className="me-2" /><strong>Departure:</strong> Lat: {booking.departureLocation.coordinates[1]}, Lng: {booking.departureLocation.coordinates[0]}</p>
              <p><FaMapMarkerAlt className="me-2" /><strong>Destination:</strong> {booking.destination}</p>
              <p><FaMoneyBillWave className="me-2" /><strong>Payment Method:</strong> {booking.paymentMethod}</p>
              {booking.offerPrice && <p><FaMoneyBillWave className="me-2" /><strong>Offer Price:</strong> ${booking.offerPrice}</p>}
              {isBoatOwner && booking.status === 'pending' ? (
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
                <Button
                  variant="warning"
                  className="mt-3"
                  onClick={() => setShowOfferModal(true)}
                  disabled={submittingOffer || booking.status !== 'pending'}
                  style={{ display: isBoatOwner ? 'none' : 'block' }}
                >
                  Make an Offer
                </Button>
              )}
              {booking.status === 'accepted' && (
                <Button
                  variant="primary"
                  className="mt-3"
                  onClick={handleConfirmBooking}
                  disabled={submittingConfirm || (isBoatOwner ? booking.boatOwnerConfirmed : booking.passengerConfirmed)}
                >
                  {submittingConfirm ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Confirming...
                    </>
                  ) : isBoatOwner ? (
                    booking.boatOwnerConfirmed ? 'Confirmed by Owner' : 'Confirm as Owner'
                  ) : (
                    booking.passengerConfirmed ? 'Confirmed by Passenger' : 'Confirm as Passenger'
                  )}
                </Button>
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

      {/* Modal for Offer Price Input */}
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