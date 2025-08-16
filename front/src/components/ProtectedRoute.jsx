import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, requireBoatInfo = false }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const decoded = jwtDecode(token);
        
        // Check token expiration
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        // Redirect boat owners who haven't completed info
        if (requireBoatInfo && decoded.role === 'boat_owner') {
          const userData = JSON.parse(localStorage.getItem('user'));
          if (userData && !userData.boatInfoComplete) {
            navigate('/complete-boat-info');
          }
        }
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate, requireBoatInfo]);

  return children;
};

export default ProtectedRoute;