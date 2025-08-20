// BookingDetails.jsx - Version corrigée
import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Alert, 
  Spinner, 
  Badge, 
  ListGroup 
} from 'react-bootstrap';
import { 
  FaCalendar, 
  FaUsers, 
  FaHome, 
  FaMapMarkerAlt, 
  FaMoneyBillWave, 
  FaPaperPlane 
} from 'react-icons/fa';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './BookingDetails.css';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const [bookingResponse, messagesResponse] = await Promise.all([
          axios.get(`/api/bookings/${bookingId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`/api/bookings/${bookingId}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setBooking(bookingResponse.data);
        setMessages(messagesResponse.data.messages || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/bookings/${bookingId}/messages`, {
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleAcceptOffer = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/bookings/${bookingId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBooking(response.data.booking);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept offer');
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5 py-5">
        <Spinner animation="border" variant="primary" />
        <h4 className="mt-3">Loading booking details...</h4>
      </Container>
    );
  }

  if (error || !booking) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error || 'Booking not found'}</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }

  const isPassenger = booking.passenger._id === localStorage.getItem('userId');
  const canAcceptOffer = isPassenger && booking.status === 'offered';

  return (
    <Container className="my-5">
      <Button variant="outline-primary" className="mb-4" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </Button>

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Booking #{booking._id.slice(-6)}</h4>
              <Badge bg={
                booking.status === 'pending' ? 'warning' :
                booking.status === 'offered' ? 'info' :
                booking.status === 'accepted' ? 'success' :
                booking.status === 'completed' ? 'secondary' : 'danger'
              }>
                {booking.status.toUpperCase()}
              </Badge>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <h6>Boat Information</h6>
                  <p className="mb-1"><strong>Name:</strong> {booking.boat?.name}</p>
                  <p className="mb-1"><strong>Type:</strong> {booking.boat?.boatType}</p>
                  <p className="mb-1"><strong>Capacity:</strong> {booking.boat?.boatCapacity} persons</p>
                </Col>
                <Col md={6}>
                  <h6>Trip Details</h6>
                  <p className="mb-1"><strong>Persons:</strong> {booking.numberOfPersons}</p>
                  <p className="mb-1"><strong>Cabins:</strong> {booking.numberOfCabins}</p>
                  <p className="mb-1"><strong>Kids:</strong> {booking.hasKids ? 'Yes' : 'No'}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <h6>Dates</h6>
                  <p className="mb-1"><strong>Start:</strong> {new Date(booking.startDate).toLocaleString()}</p>
                  <p className="mb-1"><strong>End:</strong> {new Date(booking.endDate).toLocaleString()}</p>
                </Col>
                <Col md={6}>
                  <h6>Location</h6>
                  <p className="mb-1"><strong>From:</strong> {booking.departureLocation.coordinates.join(', ')}</p>
                  <p className="mb-1"><strong>To:</strong> {booking.destination}</p>
                </Col>
              </Row>

              {booking.offerPrice && (
                <Alert variant="info" className="mb-3">
                  <Alert.Heading>Offer from Boat Owner</Alert.Heading>
                  <p className="mb-0"><strong>Price:</strong> ${booking.offerPrice}</p>
                  {canAcceptOffer && (
                    <Button variant="success" className="mt-2" onClick={handleAcceptOffer}>
                      Accept Offer
                    </Button>
                  )}
                </Alert>
              )}

              <div className="booking-chat mt-4">
                <h5>Chat with {isPassenger ? 'Boat Owner' : 'Passenger'}</h5>
                
                <div className="chat-messages mb-3">
                  {messages.length === 0 ? (
                    <p className="text-muted text-center">No messages yet. Start the conversation!</p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message._id}
                        className={`message ${message.sender._id === localStorage.getItem('userId') ? 'own-message' : 'other-message'}`}
                      >
                        <div className="message-content">
                          <p className="mb-1">{message.content}</p>
                          <small className="text-muted">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </small>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="chat-input">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={sending || !newMessage.trim()}
                    >
                      {sending ? <Spinner animation="border" size="sm" /> : <FaPaperPlane />}
                    </button>
                  </div>
                </form>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Header>
              <h5 className="mb-0">Booking Status</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Current Status:</strong>
                  <Badge bg={
                    booking.status === 'pending' ? 'warning' :
                    booking.status === 'offered' ? 'info' :
                    booking.status === 'accepted' ? 'success' :
                    booking.status === 'completed' ? 'secondary' : 'danger'
                  } className="ms-2">
                    {booking.status.toUpperCase()}
                  </Badge>
                </ListGroup.Item>
                
                <ListGroup.Item>
                  <strong>Created:</strong>
                  <br />
                  {new Date(booking.createdAt).toLocaleDateString()}
                </ListGroup.Item>
                
                <ListGroup.Item>
                  <strong>Payment Method:</strong>
                  <br />
                  {booking.paymentMethod.replace('_', ' ').toUpperCase()}
                </ListGroup.Item>
                
                {booking.offerPrice && (
                  <ListGroup.Item className="bg-light">
                    <strong>Offered Price:</strong>
                    <br />
                    ${booking.offerPrice}
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BookingDetails;