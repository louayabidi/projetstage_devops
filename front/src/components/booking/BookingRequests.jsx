// Updated BookingRequests.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Modal, Form } from 'react-bootstrap';
import { FaCalendar, FaUsers, FaShip, FaMoneyBillWave } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BookingRequests = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(null); // Track which booking's modal is open
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  useEffect(() => {
    const fetchBookingRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token:', token);
        const response = await axios.get('http://localhost:3000/api/bookings/owner', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('API Response:', response.data);
        setBookings(response.data.bookings || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch booking requests');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingRequests();
  }, []);

  const handleMakeOffer = async (bookingId) => {
    setSubmittingOffer(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:3000/api/bookings/${bookingId}/offer`,
        { offerPrice: parseFloat(offerPrice), message: offerMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: 'offered', offerPrice }
            : booking
        )
      );
      setShowOfferModal(null);
      setOfferPrice('');
      setOfferMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit offer');
    } finally {
      setSubmittingOffer(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5 py-5">
        <Spinner animation="border" variant="primary" />
        <h4 className="mt-3">Loading booking requests...</h4>
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

  return (
    <Container className="my-5">
      <h2 className="mb-4">Booking Requests for Your Boats</h2>
      {bookings.length === 0 ? (
        <Alert variant="info">No booking requests found.</Alert>
      ) : (
        <Row>
          {bookings.map((booking) => (
            <Col md={6} lg={4} key={booking._id} className="mb-4">
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Booking #{booking._id.slice(-6)}</h5>
                  <Badge
                    bg={
                      booking.status === 'pending'
                        ? 'warning'
                        : booking.status === 'offered'
                        ? 'info'
                        : booking.status === 'accepted'
                        ? 'success'
                        : 'secondary'
                    }
                  >
                    {booking.status.toUpperCase()}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <p className="mb-1">
                    <FaShip className="me-2" />
                    <strong>Boat:</strong> {booking.boat?.name} ({booking.boat?.boatType})
                  </p>
                  <p className="mb-1">
                    <FaUsers className="me-2" />
                    <strong>Passenger:</strong> {booking.passenger?.firstName}{' '}
                    {booking.passenger?.lastName}
                  </p>
                  <p className="mb-1">
                    <FaUsers className="me-2" />
                    <strong>Persons:</strong> {booking.numberOfPersons}
                  </p>
                  <p className="mb-1">
                    <FaCalendar className="me-2" />
                    <strong>Dates:</strong>{' '}
                    {new Date(booking.startDate).toLocaleDateString()} -{' '}
                    {new Date(booking.endDate).toLocaleDateString()}
                  </p>
                  {booking.offerPrice && (
                    <p className="mb-1">
                      <FaMoneyBillWave className="me-2" />
                      <strong>Offered Price:</strong> ${booking.offerPrice}
                    </p>
                  )}
                  {booking.status === 'pending' && (
                    <Button
                      variant="success"
                      className="mt-3 w-100"
                      onClick={() => setShowOfferModal(booking._id)}
                      disabled={submittingOffer}
                    >
                      Make an Offer
                    </Button>
                  )}
                  <Button
                    variant="outline-primary"
                    className="mt-3 w-100"
                    onClick={() => navigate(`/bookings/${booking._id}`)}
                  >
                    View Details & Chat
                  </Button>
                </Card.Body>
              </Card>

              {/* Modal for Offer Input */}
              <Modal show={showOfferModal === booking._id} onHide={() => setShowOfferModal(null)}>
                <Modal.Header closeButton>
                  <Modal.Title>Make an Offer for Booking #{booking._id.slice(-6)}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaMoneyBillWave className="me-2" />
                        Offer Price ($)
                      </Form.Label>
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
                        rows={2}
                        value={offerMessage}
                        onChange={(e) => setOfferMessage(e.target.value)}
                        placeholder="Add a message to your offer"
                      />
                    </Form.Group>
                  </Form>
                  {error && <Alert variant="danger">{error}</Alert>}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowOfferModal(null)}>
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleMakeOffer(booking._id)}
                    disabled={submittingOffer || !offerPrice}
                  >
                    {submittingOffer ? (
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : (
                      'Submit Offer'
                    )}
                  </Button>
                </Modal.Footer>
              </Modal>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default BookingRequests;