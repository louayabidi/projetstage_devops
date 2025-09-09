
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUsers, FaChild, FaCalendar, FaMapMarkerAlt, FaComment } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../Map/MapComponent';

// Configure Axios with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
});

const FindCompanions = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    groupSize: 1,
    hasKids: false,
    departureLocation: {
      type: 'Point',
      coordinates: [0, 0], // [lng, lat]
    },
    destination: {
      type: 'Point',
      coordinates: [0, 0], // [lng, lat]
    },
    startDate: '',
    endDate: '',
    interests: '',
    message: ''
  });
  const [userLocation, setUserLocation] = useState([0, 0]); // [lng, lat]
  const [destinationLocation, setDestinationLocation] = useState([0, 0]); // [lng, lat]
  const [suggestions, setSuggestions] = useState([]);
  const [myInterests, setMyInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Log baseURL for debugging
 const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
console.log('Axios baseURL:', apiUrl); 

  // Check if search button should be enabled
  const isSearchEnabled = () => {
    const isValidCoordinates = (coords) =>
      Array.isArray(coords) &&
      coords.length === 2 &&
      coords[0] !== 0 &&
      coords[1] !== 0 &&
      coords[0] >= -180 &&
      coords[0] <= 180 &&
      coords[1] >= -90 &&
      coords[1] <= 90;
    return (
      isValidCoordinates(formData.departureLocation.coordinates) &&
      isValidCoordinates(formData.destination.coordinates) &&
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) < new Date(formData.endDate)
    );
  };

  // Automatic location detection for departure
  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation([longitude, latitude]);
          setFormData((prev) => ({
            ...prev,
            departureLocation: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
          }));
        },
        (err) => {
          setError('Failed to get current location. Please select a departure location on the map.');
          console.error('Geolocation error:', err);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Fetch user's travel interests on mount
  useEffect(() => {
    fetchMyInterests();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'hasKids') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'departureLat' || name === 'departureLng') {
      const newCoordinates =
        name === 'departureLat'
          ? [formData.departureLocation.coordinates[0], parseFloat(value) || 0]
          : [parseFloat(value) || 0, formData.departureLocation.coordinates[1]];
      setFormData((prev) => ({
        ...prev,
        departureLocation: {
          type: 'Point',
          coordinates: newCoordinates,
        },
      }));
      setUserLocation(newCoordinates);
    } else if (name === 'destinationLat' || name === 'destinationLng') {
      const newCoordinates =
        name === 'destinationLat'
          ? [formData.destination.coordinates[0], parseFloat(value) || 0]
          : [parseFloat(value) || 0, formData.destination.coordinates[1]];
      setFormData((prev) => ({
        ...prev,
        destination: {
          type: 'Point',
          coordinates: newCoordinates,
        },
      }));
      setDestinationLocation(newCoordinates);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value,
      }));
    }
  };

  const handleDepartureLocationChange = (newCoordinates) => {
    setFormData((prev) => ({
      ...prev,
      departureLocation: {
        type: 'Point',
        coordinates: newCoordinates,
      },
    }));
    setUserLocation(newCoordinates);
  };

  const handleDestinationLocationChange = (newCoordinates) => {
    setFormData((prev) => ({
      ...prev,
      destination: {
        type: 'Point',
        coordinates: newCoordinates,
      },
    }));
    setDestinationLocation(newCoordinates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    const isValidCoordinates = (coords) =>
      Array.isArray(coords) &&
      coords.length === 2 &&
      coords[0] !== 0 &&
      coords[1] !== 0 &&
      coords[0] >= -180 &&
      coords[0] <= 180 &&
      coords[1] >= -90 &&
      coords[1] <= 90;
    if (
      !isValidCoordinates(formData.departureLocation.coordinates) ||
      !isValidCoordinates(formData.destination.coordinates) ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setError('Please fill in all required fields (locations and dates).');
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      console.log('Posting travel interest with data:', formData);
      const response = await api.post(
        '/api/travel-interests/travel-interests',
        {
          groupSize: formData.groupSize,
          hasKids: formData.hasKids,
          departureLocation: formData.departureLocation,
          destination: formData.destination,
          startDate: formData.startDate,
          endDate: formData.endDate,
          interests: formData.interests.split(',').map((i) => i.trim()).filter(i => i),
          message: formData.message,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      console.log('Post response:', response.data);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        fetchMyInterests();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error posting travel interest');
      console.error('Post travel interest error:', err.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = async () => {
    // Validate required fields
    const isValidCoordinates = (coords) =>
      Array.isArray(coords) &&
      coords.length === 2 &&
      coords[0] !== 0 &&
      coords[1] !== 0 &&
      coords[0] >= -180 &&
      coords[0] <= 180 &&
      coords[1] >= -90 &&
      coords[1] <= 90;
    if (
      !isValidCoordinates(formData.departureLocation.coordinates) ||
      !isValidCoordinates(formData.destination.coordinates) ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setError('Please fill in all required fields (locations and dates) to search for companions.');
      setLoading(false);
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date.');
      setLoading(false);
      return;
    }
    console.log('Sending search request with form data:', formData);
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/travel-interests/suggestions', {
        params: {
          departureLat: formData.departureLocation.coordinates[1],
          departureLng: formData.departureLocation.coordinates[0],
          destinationLat: formData.destination.coordinates[1],
          destinationLng: formData.destination.coordinates[0],
          startDate: formData.startDate,
          endDate: formData.endDate,
          interests: formData.interests,
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log('Search response:', response.data);
      setSuggestions(response.data.suggestions);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching suggestions');
      console.error('Fetch suggestions error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyInterests = async () => {
    try {
      const response = await api.get('/api/travel-interests/my', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log('Fetch my interests response:', response.data);
      setMyInterests(response.data.interests);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching my interests');
      console.error('Fetch my interests error:', err.response?.data || err.message);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      const response = await api.put(
        `/api/travel-interests/${id}/deactivate`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      console.log('Deactivate response:', response.data);
      fetchMyInterests();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deactivating travel interest');
      console.error('Deactivate travel interest error:', err.response?.data || err.message);
    }
  };

  return (
    <Container className="my-10 px-4">
      <Button
        variant="outline-primary"
        className="mb-4"
        onClick={() => navigate('/')}
      >
        ← Back to Home
      </Button>

      <Row>
        <Col lg={8}>
          <Card className="shadow-lg">
            <Card.Header className="bg-primary text-white">
              <h3 className="text-xl font-semibold">Find Travel Companions</h3>
            </Card.Header>
            <Card.Body>
              {success ? (
                <Alert variant="success">
                  <strong>Travel Interest Posted!</strong>
                  <p>Your travel interest has been posted successfully.</p>
                </Alert>
              ) : (
                <Form onSubmit={handleSubmit}>
                  {error && (
                    <Alert variant="danger" className="mb-4">
                      {error}
                    </Alert>
                  )}

                  <Row className="mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          <FaUsers className="mr-2" /> Group Size *
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="groupSize"
                          value={formData.groupSize}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          <FaChild className="mr-2" /> Includes Children
                        </Form.Label>
                        <Form.Check
                          type="checkbox"
                          name="hasKids"
                          checked={formData.hasKids}
                          onChange={handleInputChange}
                          label="Includes children under 12 years"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          <FaCalendar className="mr-2" /> Start Date *
                        </Form.Label>
                        <Form.Control
                          type="date"
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
                          <FaCalendar className="mr-2" /> End Date *
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      <FaMapMarkerAlt className="mr-2" /> Departure Location *
                    </Form.Label>
                    <Row>
                      <Col md={6}>
                        <Form.Control
                          type="number"
                          step="any"
                          placeholder="Latitude"
                          name="departureLat"
                          value={formData.departureLocation.coordinates[1]}
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
                          value={formData.departureLocation.coordinates[0]}
                          onChange={handleInputChange}
                          required
                        />
                      </Col>
                    </Row>
                    <MapComponent
                      initialPosition={userLocation}
                      onLocationChange={handleDepartureLocationChange}
                    />
                    <Form.Text className="text-muted">
                      Your current location is automatically detected. Click on the map to set a custom departure location.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      <FaMapMarkerAlt className="mr-2" /> Destination Location *
                    </Form.Label>
                    <Row>
                      <Col md={6}>
                        <Form.Control
                          type="number"
                          step="any"
                          placeholder="Latitude"
                          name="destinationLat"
                          value={formData.destination.coordinates[1]}
                          onChange={handleInputChange}
                          required
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Control
                          type="number"
                          step="any"
                          placeholder="Longitude"
                          name="destinationLng"
                          value={formData.destination.coordinates[0]}
                          onChange={handleInputChange}
                          required
                        />
                      </Col>
                    </Row>
                    <MapComponent
                      initialPosition={destinationLocation}
                      onLocationChange={handleDestinationLocationChange}
                    />
                    <Form.Text className="text-muted">
                      Click on the map to set your destination location.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Interests (comma-separated)</Form.Label>
                    <Form.Control
                      type="text"
                      name="interests"
                      value={formData.interests}
                      onChange={handleInputChange}
                      placeholder="e.g., sightseeing, adventure, relaxation"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      <FaComment className="mr-2" /> Message
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Describe your travel plans..."
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              className="mr-2"
                            />
                            Posting...
                          </>
                        ) : (
                          'Post Travel Interest'
                        )}
                      </Button>
                    </Col>
                    <Col md={6}>
                      <Button
                        variant="success"
                        className="w-full"
                        onClick={handleSearch}
                        disabled={loading || !isSearchEnabled()}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              className="mr-2"
                            />
                            Searching...
                          </>
                        ) : (
                          'Search Suggestions'
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-lg sticky top-5">
            <Card.Header className="bg-gray-100">
              <h5 className="text-lg font-semibold">Your Travel Interests</h5>
            </Card.Header>
            <Card.Body>
              {myInterests.length === 0 ? (
                <p>No travel interests posted yet.</p>
              ) : (
                <ul className="list-unstyled">
                  {myInterests.map((interest) => (
                    <li key={interest._id} className="mb-3 p-3 border rounded">
                      <p><strong>Group Size:</strong> {interest.groupSize}</p>
                      <p><strong>Dates:</strong> {new Date(interest.startDate).toLocaleDateString()} - {new Date(interest.endDate).toLocaleDateString()}</p>
                      <p><strong>Interests:</strong> {interest.interests.join(', ')}</p>
                      <p><strong>Status:</strong> {interest.isActive ? 'Active' : 'Inactive'}</p>
                      {interest.isActive && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeactivate(interest._id)}
                        >
                          Deactivate
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>

          <Card className="shadow-lg mt-4">
            <Card.Header className="bg-gray-100">
              <h5 className="text-lg font-semibold">Suggested Companions</h5>
            </Card.Header>
            <Card.Body>
              {suggestions.length === 0 ? (
                <p>No suggestions found. Try adjusting your search criteria.</p>
              ) : (
                <ul className="list-unstyled">
                  {suggestions.map((sug) => (
                    <li key={sug._id} className="mb-3 p-3 border rounded">
                      <p><strong>User:</strong> {sug.user.firstName} {sug.user.lastName}</p>
                      <p><strong>Group Size:</strong> {sug.groupSize} {sug.hasKids ? '(with kids)' : ''}</p>
                      <p><strong>Dates:</strong> {new Date(sug.startDate).toLocaleDateString()} - {new Date(sug.endDate).toLocaleDateString()}</p>
                      <p><strong>Interests:</strong> {sug.interests.join(', ')}</p>
                      <p><strong>Message:</strong> {sug.message}</p>
                      <p><strong>Contact:</strong> {sug.user.phoneNumber} | {sug.user.email}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FindCompanions;
