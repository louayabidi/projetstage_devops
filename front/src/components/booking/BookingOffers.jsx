import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaCalendar, FaUsers, FaShip, FaMoneyBillWave } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BookingOffers = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingOffers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/bookings/owner', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter for 'offered' or 'confirmed' bookings
        const offeredBookings = response.data.bookings.filter(
          (booking) => booking.status === 'offered' || booking.status === 'confirmed'
        );
        setBookings(offeredBookings);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch booking offers');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingOffers();
  }, []);

  if (loading) {
    return (
      <Container className="text-center my-5 py-5">
        <Spinner animation="border" variant="primary" />
        <h4 className="mt-3">Loading booking offers...</h4>
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
      <h2 className="mb-4">Your Booking Offers</h2>
      {bookings.length === 0 ? (
        <Alert variant="info">No offers made yet.</Alert>
      ) : (
        <Row>
          {bookings.map((booking) => (
            <Col md={6} lg={4} key={booking._id} className="mb-4">
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Booking #{booking._id.slice(-6)}</h5>
                  <Badge
                    bg={
                      booking.status === 'offered'
                        ? 'info'
                        : booking.status === 'confirmed'
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
                  <p className="mb-1">
                    <FaMoneyBillWave className="me-2" />
                    <strong>Offered Price:</strong> ${booking.offerPrice}
                  </p>
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

export default BookingOffers;