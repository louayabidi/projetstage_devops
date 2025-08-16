import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateBooking = () => {
  const [formData, setFormData] = useState({
    numberOfPersons: 1,
    hasKids: false,
    paymentMethod: 'credit_card',
    destination: '',
    numberOfCabins: 1
  });
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        err => {
          setError('Could not get location. Please enable GPS permissions.');
          console.error('Geolocation error:', err);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!location.lat || !location.lng) {
      setError('Please allow location access to continue');
      setLoading(false);
      return;
    }

    try {
     const response = await axios.post('http://localhost:3000/api/bookings', {
  ...formData,
  departureLocation: {
    type: 'Point',
    coordinates: [location.lng, location.lat] // lng first, then lat
  }
}, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});


      setSuccess(true);
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <h2 className="mb-4">Create New Booking</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Booking created successfully!</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Number of Persons</Form.Label>
          <Form.Control 
            type="number"
            name="numberOfPersons"
            min="1"
            value={formData.numberOfPersons}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check 
            type="checkbox"
            label="Traveling with kids"
            name="hasKids"
            checked={formData.hasKids}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Number of Cabins</Form.Label>
          <Form.Control 
            type="number"
            name="numberOfCabins"
            min="1"
            value={formData.numberOfCabins}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Destination</Form.Label>
          <Form.Control 
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="Where are you going?"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Payment Method</Form.Label>
          <Form.Select 
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
          >
            <option value="credit_card">Credit Card</option>
            <option value="paypal">PayPal</option>
            <option value="cash">Cash</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Current Location</Form.Label>
          {location.lat && location.lng ? (
            <div>
              <p>Latitude: {location.lat.toFixed(6)}</p>
              <p>Longitude: {location.lng.toFixed(6)}</p>
            </div>
          ) : (
            <Spinner size="sm" animation="border" />
          )}
        </Form.Group>

        <Button 
          variant="primary" 
          type="submit"
          disabled={loading || !location.lat || !location.lng}
        >
          {loading ? 'Creating...' : 'Submit Booking'}
        </Button>
      </Form>
    </Container>
  );
};

export default CreateBooking;