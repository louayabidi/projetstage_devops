import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BookingOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axios.get('/api/bookings/offers', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setOffers(response.data.offers);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load offers');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOffers();
  }, []);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
        <p>Loading booking offers...</p>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2 className="mb-4">Your Booking Offers</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {offers.length === 0 ? (
        <Alert variant="info">No offers available</Alert>
      ) : (
        <div className="booking-list">
          {offers.map(offer => (
            <Card key={offer._id} className="mb-3">
              <Card.Body>
                <Card.Title>Offer for Booking #{offer.bookingId.slice(-6)}</Card.Title>
                <Card.Text>
                  <strong>Boat:</strong> {offer.boat.name}<br />
                  <strong>Owner:</strong> {offer.owner.firstName} {offer.owner.lastName}<br />
                  <strong>Price:</strong> ${offer.offerPrice.toFixed(2)}
                </Card.Text>
                <Link to={`/bookings/${offer.bookingId}`}>
                  <Button variant="success">View Details</Button>
                </Link>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default BookingOffers;