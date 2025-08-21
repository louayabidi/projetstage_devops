import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBell } from 'react-icons/fa';
import { Badge } from 'react-bootstrap';

const headerStyle = {
  backgroundColor: '#026aa7', 
  color: '#fff',
  padding: '16px 40px', 
  display: 'flex',
  alignItems: 'center', 
  justifyContent: 'space-between'
};
const navStyle = { display: 'flex', gap: '24px', fontSize: '1.1em' };
const brandStyle = { fontWeight: 'bold', fontSize: '1.6em', letterSpacing: '2px' };

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');
  const user = isLoggedIn ? JSON.parse(localStorage.getItem('user')) : null;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchUnreadCount = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('/api/notifications/unread-count', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUnreadCount(response.data.count);
        } catch (error) {
          console.error('Fetch unread count error:', error);
        }
      };

      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/users/signout', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <header style={headerStyle}>
      <div style={brandStyle}>🚤 BoatDrive</div>
      <nav style={navStyle}>
        <Link to='/' style={{color: "#fff", textDecoration: "none"}}>Home</Link>
        <Link to='/boats' style={{color: "#fff", textDecoration: "none"}}>Explore Boats</Link>
        
        {isLoggedIn ? (
          <>
            <Link to='/notifications' style={{color: "#fff", textDecoration: "none", position: 'relative'}}>
              <FaBell />
              {unreadCount > 0 && <Badge bg="danger" pill style={{ position: 'absolute', top: '-5px', right: '-10px' }}>{unreadCount}</Badge>}
            </Link>
            <Link to='/profile' style={{color: "#fff", textDecoration: "none"}}>
              {user?.firstName || 'Profile'}
            </Link>
            <button 
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1em',
                padding: 0,
                textDecoration: 'none'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to='/contact' style={{color: "#fff", textDecoration: "none"}}>Sign Up</Link>
            <Link to='/login' style={{color: "#fff", textDecoration: "none"}}>Sign In</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;