import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(response.data.notifications);

        // Optionally mark all as read
        await axios.post('http://localhost:3000/api/notifications/mark-all-read', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container className="my-5">
      <h2 className="mb-4">Notifications</h2>
      {notifications.length === 0 ? (
        <Alert variant="info">No notifications yet.</Alert>
      ) : (
        <ListGroup>
          {notifications.map((notif) => (
            <ListGroup.Item 
              key={notif._id} 
              action 
              onClick={() => notif.booking && navigate(`/bookings/${notif.booking._id}`)}
              className="d-flex justify-content-between align-items-start"
            >
              <div>
                <strong>{notif.message}</strong>
                <div className="small text-muted">{moment(notif.createdAt).fromNow()}</div>
              </div>
              <Badge bg={notif.isRead ? 'secondary' : 'primary'}>
                {notif.type.replace('_', ' ').toUpperCase()}
              </Badge>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
};

export default Notifications;