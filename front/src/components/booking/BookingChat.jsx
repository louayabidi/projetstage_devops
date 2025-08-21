import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, ListGroup, Spinner, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { FaPaperPlane, FaUser, FaMoneyBillWave } from 'react-icons/fa';
import moment from 'moment';

const BookingChat = ({ bookingId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;
  const token = localStorage.getItem('token');

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/bookings/${bookingId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data.messages);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await axios.post(
        `http://localhost:3000/api/bookings/${bookingId}/messages`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" />
        <p>Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Card className="mb-4">
      <Card.Header className="bg-primary text-white">
        Booking Discussion
      </Card.Header>
      <Card.Body className="d-flex flex-column" style={{ maxHeight: '300px', minHeight: '200px' }}>
        <div className="flex-grow-1 overflow-auto mb-3" style={{ maxHeight: '200px' }}>
          {messages.length === 0 ? (
            <div className="text-center text-muted my-4">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <ListGroup variant="flush">
              {messages.map((message) => (
                <ListGroup.Item
                  key={message._id}
                  className={`mb-2 ${message.isOffer ? 'bg-light-warning' : ''}`}
                >
                  <div className={`d-flex ${message.sender._id === userId ? 'justify-content-end' : ''}`}>
                    <div className={`p-3 rounded ${message.sender._id === userId ? 'bg-primary text-white' : 'bg-light'}`}>
                      <div className="d-flex align-items-center mb-1">
                        <FaUser className="me-2" />
                        <strong>{message.sender.firstName} {message.sender.lastName}</strong>
                        <small className="text-muted ms-2">
                          {moment(message.createdAt).format('MMM D, h:mm a')}
                        </small>
                      </div>
                      <p className="mb-0">{message.content}</p>
                      {message.isOffer && (
                        <Badge bg="warning" className="mt-2">
                          <FaMoneyBillWave className="me-1" />
                          Offer: ${message.offerPrice}
                        </Badge>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
              <div ref={messagesEndRef} />
            </ListGroup>
          )}
        </div>
        <Form onSubmit={handleSendMessage}>
          <Form.Group className="mb-0">
            <div className="input-group">
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
                style={{ resize: 'none' }}
              />
              <Button
                variant="primary"
                type="submit"
                disabled={sending || !newMessage.trim()}
              >
                <FaPaperPlane />
              </Button>
            </div>
          </Form.Group>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default BookingChat;