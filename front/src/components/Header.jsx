import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  // Check if user is logged in by looking for token in localStorage
  const isLoggedIn = localStorage.getItem('token');
  // Get user data if available
  const user = isLoggedIn ? JSON.parse(localStorage.getItem('user')) : null;

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/users/signout', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if server logout fails
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
          // Show profile link and user name if logged in
          <>
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
          // Show sign up/sign in if not logged in
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