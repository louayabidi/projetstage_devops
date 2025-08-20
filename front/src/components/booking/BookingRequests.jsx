import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Form } from 'react-bootstrap';
import { FaCalendar, FaUsers, FaShip, FaMoneyBillWave } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BookingRequests = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offerForms, setOfferForms] = useState({});

  useEffect(() => {
    const fetchBookingRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token:', token); // Debug log
        const response = await axios.get('http://localhost:3000/api/bookings/owner', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('API Response:', response.data); // Debug log
        setBookings(response.data.bookings || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch booking requests');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingRequests();
  }, []);

  const handleOfferSubmit = async (bookingId) => {
    const { offerPrice, message } = offerForms[bookingId] || {};
    if (!offerPrice) {
      setError('Offer price is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:3000/api/bookings/${bookingId}/offer`,
        { offerPrice, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: 'offered', offerPrice }
            : booking
        )
      );
      setOfferForms((prev) => ({ ...prev, [bookingId]: { offerPrice: '', message: '' } }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit offer');
    }
  };

  const handleOfferChange = (bookingId, field, value) => {
    setOfferForms((prev) => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        [field]: value,
      },
    }));
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
                    <Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleOfferSubmit(booking._id);
                      }}
                      className="mt-3"
                    >
                      <Form.Group className="mb-2">
                        <Form.Label>
                          <FaMoneyBillWave className="me-2" />
                          Offer Price
                        </Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter offer price"
                          value={offerForms[booking._id]?.offerPrice || ''}
                          onChange={(e) =>
                            handleOfferChange(booking._id, 'offerPrice', e.target.value)
                          }
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Message (Optional)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Add a message to your offer"
                          value={offerForms[booking._id]?.message || ''}
                          onChange={(e) =>
                            handleOfferChange(booking._id, 'message', e.target.value)
                          }
                        />
                      </Form.Group>
                      <Button variant="primary" type="submit">
                        Submit Offer
                      </Button>
                    </Form>
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
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default BookingRequests;