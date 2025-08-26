import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFacebook, FaTwitter, FaInstagram, FaAnchor } from "react-icons/fa";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-transparent text-white py-6"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-center bg-black/30 backdrop-blur-md rounded-lg p-4">
          {/* Branding Section */}
          <motion.div
            className="mb-6 lg:mb-0 text-center lg:text-left"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-center lg:justify-start mb-2">
              <FaAnchor className="text-2xl mr-2 text-teal-300" />
              <h2 className="text-xl font-bold text-white drop-shadow-md">
                Boat Rental Admin
              </h2>
            </div>
            <p className="text-sm opacity-80 drop-shadow-md">
              © 2025 Boat Rental App. All rights reserved.
            </p>
          </motion.div>

          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row sm:space-x-8 mb-6 lg:mb-0">
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                to="/"
                className="text-sm text-white hover:text-teal-300 transition duration-300 drop-shadow-md mb-2 sm:mb-0"
              >
                Home
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                to="/contact"
                className="text-sm text-white hover:text-teal-300 transition duration-300 drop-shadow-md mb-2 sm:mb-0"
              >
                Sign Up
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                to="/boats"
                className="text-sm text-white hover:text-teal-300 transition duration-300 drop-shadow-md mb-2 sm:mb-0"
              >
                Boats
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <a
                href="/support"
                className="text-sm text-white hover:text-teal-300 transition duration-300 drop-shadow-md"
              >
                Support
              </a>
            </motion.div>
          </div>

          {/* Social Media Links */}
          <div className="flex space-x-4">
            <motion.a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-teal-300 transition duration-300 drop-shadow-md"
              whileHover={{ scale: 1.2 }}
            >
              <FaFacebook size={20} />
            </motion.a>
            <motion.a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-teal-300 transition duration-300 drop-shadow-md"
              whileHover={{ scale: 1.2 }}
            >
              <FaTwitter size={20} />
            </motion.a>
            <motion.a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-teal-300 transition duration-300 drop-shadow-md"
              whileHover={{ scale: 1.2 }}
            >
              <FaInstagram size={20} />
            </motion.a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;