import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBell } from 'react-icons/fa';
import { Badge } from 'react-bootstrap';

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
            headers: { Authorization: `Bearer ${token}` },
          });
          setUnreadCount(response.data.count);
        } catch (error) {
          console.error('Fetch unread count error:', error);
        }
      };

      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/auth/signout',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
    <header className="glass-effect sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 shadow-sm">
      <div className="font-bold text-xl sm:text-2xl text-gray-900 tracking-tight">
        🚤 BoatDrive
      </div>
      <nav className="flex items-center gap-3 sm:gap-5 text-gray-800 text-sm sm:text-base">
        <Link to="/" className="nav-link hover:text-blue-600">
          Home
        </Link>
        <Link to="/boats" className="nav-link hover:text-blue-600">
          Explore Boats
        </Link>
        {isLoggedIn && (
          <Link to="/calendar" className="nav-link hover:text-blue-600">
            Calendar
          </Link>
        )}
        {isLoggedIn ? (
          <>
            <Link
              to="/notifications"
              className="relative nav-link hover:text-blue-600"
            >
              <FaBell size={20} />
              {unreadCount > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="absolute -top-2 -right-3 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Link>
            <Link to="/profile" className="flex items-center">
              {user?.photo ? (
                <img
                  src={`http://localhost:3000${user.photo}`}
                  alt="Profile"
                  className="w-7 h-7 rounded-full border-2 border-gray-300 object-cover hover:border-blue-500 transition-colors"
                  onError={(e) => {
                    e.target.src = '/default-avatar.jpg';
                  }}
                />
              ) : (
                <img
                  src="/default-avatar.jpg"
                  alt="Default Profile"
                  className="w-7 h-7 rounded-full border-2 border-gray-300 object-cover hover:border-blue-500 transition-colors"
                />
              )}
            </Link>
            <Link
              to="/find-companions"
              className="nav-link hover:text-blue-600"
            >
              Find Friends
            </Link>
            <button
              onClick={handleLogout}
              className="nav-link hover:text-blue-600 bg-transparent border-none p-0"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/contact" className="nav-link hover:text-blue-600">
              Sign Up
            </Link>
            <Link to="/login" className="nav-link hover:text-blue-600">
              Sign In
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;