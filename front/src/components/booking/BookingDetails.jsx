import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Alert, Row, Col, Badge } from 'react-bootstrap';
import axios from 'axios';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`/api/bookings/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setBooking(response.data.booking);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooking();
  }, [id]);

  const handleMakeOffer = async () => {
    if (!offerPrice || isNaN(offerPrice)) {
      setError('Please enter a valid price');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`/api/bookings/${id}/offer`, {
        price: offerPrice
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSuccess('Offer submitted successfully!');
      setTimeout(() => navigate('/booking-requests'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptOffer = async () => {
    setSubmitting(true);
    try {
      await axios.post(`/api/bookings/${id}/accept`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSuccess('Booking confirmed!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
        <p>Loading booking details...</p>
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
      <h2 className="mb-4">Booking Details</h2>
      
      {success && <Alert variant="success">{success}</Alert>}
      
      {booking && (
        <Card>
          <Card.Body>
            <Card.Title>
              Booking #{booking._id.slice(-6)} 
              <Badge bg={booking.status === 'pending' ? 'warning' : 
                         booking.status === 'offered' ? 'info' : 
                         'success'} className="ms-2">
                {booking.status}
              </Badge>
            </Card.Title>
            
            <Row className="mb-3">
              <Col md={6}>
                <h5>Trip Details</h5>
                <p><strong>Passengers:</strong> {booking.numberOfPersons}</p>
                <p><strong>Kids:</strong> {booking.hasKids ? 'Yes' : 'No'}</p>
                <p><strong>Cabins:</strong> {booking.numberOfCabins}</p>
                <p><strong>Destination:</strong> {booking.destination}</p>
                <p><strong>Payment Method:</strong> {booking.paymentMethod}</p>
              </Col>
              
              <Col md={6}>
                <h5>Location</h5>
                {booking.departureLocation && (
                  <p>
                    <strong>Coordinates:</strong><br />
                    Lat: {booking.departureLocation.coordinates[1].toFixed(6)}<br />
                    Lng: {booking.departureLocation.coordinates[0].toFixed(6)}
                  </p>
                )}
              </Col>
            </Row>
            
            {booking.boat && (
              <div className="mb-3">
                <h5>Boat Information</h5>
                <p><strong>Boat Name:</strong> {booking.boat.name}</p>
                <p><strong>Type:</strong> {booking.boat.boatType}</p>
                <p><strong>Capacity:</strong> {booking.boat.boatCapacity}</p>
              </div>
            )}
            
            {booking.status === 'offered' && (
              <div className="mb-3">
                <h5>Offer Details</h5>
                <p><strong>Offer Price:</strong> ${booking.offerPrice?.toFixed(2)}</p>
              </div>
            )}
            
            {/* Boat Owner Actions */}
            {booking.status === 'pending' && localStorage.getItem('role') === 'boat_owner' && (
              <div className="mt-4">
                <h5>Make Offer</h5>
                <div className="d-flex align-items-center">
                  <input
                    type="number"
                    className="form-control me-2"
                    style={{ width: '150px' }}
                    placeholder="Offer price"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                  />
                  <Button 
                    variant="primary"
                    onClick={handleMakeOffer}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Offer'}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Passenger Actions */}
            {booking.status === 'offered' && localStorage.getItem('role') === 'passenger' && (
              <div className="mt-4">
                <Button 
                  variant="success"
                  onClick={handleAcceptOffer}
                  disabled={submitting}
                >
                  {submitting ? 'Confirming...' : 'Accept Offer & Confirm Booking'}
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default BookingDetails;