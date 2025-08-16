import React from 'react';

const footerStyle = {
  background: '#eee', color: '#222', textAlign: 'center',
  padding: '24px 0', marginTop: '40px', fontSize: '1.1em'
};
const iconStyle = { margin: '0 0.5em', color: '#026aa7', textDecoration: 'none', fontSize: '1.4em' };

const Footer = () => (
  <footer style={footerStyle}>
    <div>
      <span>© {new Date().getFullYear()} BoatDrive. All rights reserved.</span>
      <br/>
      <span>
        <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" style={iconStyle}>🐦</a>
        <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" style={iconStyle}>📘</a>
        <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" style={iconStyle}>📸</a>
      </span>
      <br/>
      <span>
        <a href="/about" style={{color: '#026aa7', textDecoration: 'none'}}>About</a> | 
        <a href="/contact" style={{color: '#026aa7', marginLeft: '10px', textDecoration: 'none'}}>Contact</a>
      </span>
    </div>
  </footer>
);
export default Footer;