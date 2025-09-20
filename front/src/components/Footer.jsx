import React from 'react';
import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';

const Footer = () => (
  <footer className="glass-effect py-4 text-center text-gray-800 mt-6">
    <div className="flex flex-col items-center gap-3">
      <span className="text-sm">
        © {new Date().getFullYear()} BoatDrive. All rights reserved.
      </span>
      <div className="flex gap-4">
        <a
          href="https://twitter.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-800 hover:text-blue-600 transition-colors"
          aria-label="Twitter"
        >
          <FaTwitter size={20} />
        </a>
        <a
          href="https://facebook.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-800 hover:text-blue-600 transition-colors"
          aria-label="Facebook"
        >
          <FaFacebook size={20} />
        </a>
        <a
          href="https://instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-800 hover:text-blue-600 transition-colors"
          aria-label="Instagram"
        >
          <FaInstagram size={20} />
        </a>
      </div>
      <div className="flex gap-3 text-sm">
        <a href="/about" className="nav-link hover:text-blue-600">
          About
        </a>
        <span>|</span>
        <a href="/contact" className="nav-link hover:text-blue-600">
          Contact
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;