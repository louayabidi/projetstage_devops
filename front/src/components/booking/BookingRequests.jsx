import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BookingRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

 // src/components/booking/BookingRequests.jsx
useEffect(() => {
  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/bookings/owner', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Ensure we always get an array
      setBookings(response.data.bookings || []);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };
  
  fetchBookings();
}, []);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
        <p>Loading booking requests...</p>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2 className="mb-4">Booking Requests</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {bookings.length === 0 ? (
        <Alert variant="info">No booking requests available</Alert>
      ) : (
        <div className="booking-list">
          {bookings.map(booking => (
            <Card key={booking._id} className="mb-3">
              <Card.Body>
                <Card.Title>Booking #{booking._id.slice(-6)}</Card.Title>
                <Card.Text>
                  <strong>Passengers:</strong> {booking.numberOfPersons}<br />
                  <strong>Kids:</strong> {booking.hasKids ? 'Yes' : 'No'}<br />
                  <strong>Cabins:</strong> {booking.numberOfCabins}<br />
                  <strong>Destination:</strong> {booking.destination}
                </Card.Text>
                <Link to={`/bookings/${booking._id}`}>
                  <Button variant="primary">Make Offer</Button>
                </Link>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default BookingRequests;