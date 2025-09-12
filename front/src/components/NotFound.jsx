import React from 'react';

const NotFound = () => {
  return (
    <div style={{ 
      minHeight: '90vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      flexDirection: 'column', 
      textAlign: 'center', 
      padding: '80px 20px' 
    }}>
      <h1 style={{ fontSize: '3em', color: '#026aa7', marginBottom: '20px' }}>
        404 - Page Not Found
      </h1>
      <p style={{ fontSize: '1.2em', color: '#666', marginBottom: '30px' }}>
        The page you're looking for doesn't exist.
      </p>
      <a href="/" style={{ 
        padding: '12px 24px', 
        backgroundColor: '#026aa7', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '5px' 
      }}>
        Go Home
      </a>
    </div>
  );
};

export default NotFound;