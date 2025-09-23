import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SectionWrapper } from '../hoc';
import { slideIn } from '../utils/motion';
import GoogleSvg from '../assets/icons8-google.svg';
import FacebookSVG from '../assets/icons8-facebook.svg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { EarthCanvas } from './canvas';
import { jwtDecode } from 'jwt-decode';
import { useVisionUIController, setUser } from '../dashboard/context';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '', code: '', newPassword: '', confirmNewPassword: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [, dispatch] = useVisionUIController();

  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        config.withCredentials = true;
        return config;
      },
      (error) => Promise.reject(error)
    );
    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  useEffect(() => {
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');
    const errorMsg = searchParams.get('error');

    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
      setSearchParams({});
      return;
    }

    if (token && ['google', 'facebook', 'linkedin'].includes(provider)) {
      try {
        const tokenPayload = jwtDecode(token);
        // Fetch user data to store in localStorage
        axios.get(`http://localhost:3000/api/auth/users/${tokenPayload._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
          const user = response.data.user || response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('userId', tokenPayload._id);
          localStorage.setItem('user', JSON.stringify(user));
          setUser(dispatch, { ...tokenPayload, ...user });
          setSuccess(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login successful! Redirecting...`);
          setTimeout(() => {
            navigate(tokenPayload.role === 'admin' ? '/dashboard/tables' : '/home');
            setSearchParams({});
          }, 1500);
        }).catch(err => {
          setError(`Failed to fetch user data: ${err.response?.data?.message || err.message}`);
          setSearchParams({});
        });
      } catch (decodeError) {
        setError(`Invalid authentication token from ${provider}`);
        setSearchParams({});
      }
    } else if (token && !provider) {
      setError('Authentication failed: No provider specified');
      setSearchParams({});
    }
  }, [searchParams, dispatch, navigate, setSearchParams]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleForgotPasswordChange = (e) => setForgotPasswordData({ ...forgotPasswordData, [e.target.name]: e.target.value });

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:3000/api/auth/signin', formData, { withCredentials: true });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user._id);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      const tokenPayload = jwtDecode(response.data.token);
      setUser(dispatch, { ...tokenPayload, ...response.data.user });
      navigate(tokenPayload.role === 'admin' ? '/dashboard/tables' : '/home');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendForgotPasswordCode = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await axios.patch('http://localhost:3000/api/auth/send-forgot-password-code', {
        email: forgotPasswordData.email
      });
      setSuccess(response.data.message);
      setForgotPasswordStep(2);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyForgotPasswordCode = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmNewPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.patch('http://localhost:3000/api/auth/verify-forgot-password-code', {
        email: forgotPasswordData.email,
        providedCode: forgotPasswordData.code,
        newPassword: forgotPasswordData.newPassword
      });
      setSuccess(response.data.message);
      setForgotPasswordData({ email: '', code: '', newPassword: '', confirmNewPassword: '' });
      setForgotPasswordStep(0);
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    setError(null);
    window.location.href = '/api/auth/facebook';
  };

  const handleGoogleLogin = () => {
    setError(null);
    window.location.href = '/api/auth/google';
  };

  const handleLinkedInLogin = () => {
    setError(null);
    window.location.href = '/api/auth/linkedin';
  };

  return (
    <div className="relative flex flex-col lg:flex-row items-center justify-center min-h-screen w-full p-4 sm:p-8 overflow-y-auto">
      <motion.div
        variants={slideIn('left', 'tween', 0.7, 1)}
        className="lg:w-1/2 w-full max-w-lg glass-effect p-8 sm:p-12 rounded-3xl shadow-2xl z-10 h-auto overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-teal-400 mb-4 text-center">
          Embark on Your Journey
        </h3>
        <p className="text-gray-200 text-lg text-center mb-8">
          Log in to explore the universe!
        </p>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm text-center mb-6 p-3 bg-red-500/20 rounded-lg"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-400 text-sm text-center mb-6 p-3 bg-green-500/20 rounded-lg"
          >
            {success}
          </motion.p>
        )}

        {forgotPasswordStep === 0 && (
          <div className="flex flex-col gap-6">
            <label className="flex flex-col">
              <span className="text-gray-200 font-semibold mb-2">Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="p-4 rounded-xl bg-white/10 border border-gray-400/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300 placeholder-gray-400 text-white"
                placeholder="Enter your email"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-gray-200 font-semibold mb-2">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-4 rounded-xl bg-white/10 border border-gray-400/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300 placeholder-gray-400 text-white"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 hover:text-indigo-400 transition duration-200"
                >
                  {showPassword ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
                </button>
              </div>
            </label>

            <p className="text-center text-gray-300 mt-4">
              Forgot your password?{' '}
              <button
                type="button"
                onClick={() => setForgotPasswordStep(1)}
                className="text-indigo-400 font-semibold hover:text-indigo-300 transition duration-200"
              >
                Reset Password
              </button>
            </p>

            <motion.button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="custom-btn bg-gradient-to-r from-indigo-500 to-teal-400 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-600 hover:to-teal-500 transition duration-300 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </motion.button>
          </div>
        )}

        {forgotPasswordStep === 1 && (
          <div className="flex flex-col gap-6">
            <label className="flex flex-col">
              <span className="text-gray-200 font-semibold mb-2">Email</span>
              <input
                type="email"
                name="email"
                value={forgotPasswordData.email}
                onChange={handleForgotPasswordChange}
                required
                className="p-4 rounded-xl bg-white/10 border border-gray-400/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300 placeholder-gray-400 text-white"
                placeholder="Enter your email"
              />
            </label>

            <motion.button
              type="button"
              onClick={handleSendForgotPasswordCode}
              disabled={isLoading}
              className="custom-btn bg-gradient-to-r from-indigo-500 to-teal-400 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-600 hover:to-teal-500 transition duration-300 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </motion.button>

            <p className="text-center text-gray-300 mt-4">
              Back to{' '}
              <button
                type="button"
                onClick={() => setForgotPasswordStep(0)}
                className="text-indigo-400 font-semibold hover:text-indigo-300 transition duration-200"
              >
                Login
              </button>
            </p>
          </div>
        )}

        {forgotPasswordStep === 2 && (
          <div className="flex flex-col gap-6">
            <label className="flex flex-col">
              <span className="text-gray-200 font-semibold mb-2">Verification Code</span>
              <input
                type="text"
                name="code"
                value={forgotPasswordData.code}
                onChange={handleForgotPasswordChange}
                required
                className="p-4 rounded-xl bg-white/10 border border-gray-400/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300 placeholder-gray-400 text-white"
                placeholder="Enter the code from your email"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-gray-200 font-semibold mb-2">New Password</span>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={forgotPasswordData.newPassword}
                  onChange={handleForgotPasswordChange}
                  required
                  className="w-full p-4 rounded-xl bg-white/10 border border-gray-400/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300 placeholder-gray-400 text-white"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 hover:text-indigo-400 transition duration-200"
                >
                  {showNewPassword ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
                </button>
              </div>
            </label>

            <label className="flex flex-col">
              <span className="text-gray-200 font-semibold mb-2">Confirm New Password</span>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="confirmNewPassword"
                  value={forgotPasswordData.confirmNewPassword}
                  onChange={handleForgotPasswordChange}
                  required
                  className="w-full p-4 rounded-xl bg-white/10 border border-gray-400/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300 placeholder-gray-400 text-white"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 hover:text-indigo-400 transition duration-200"
                >
                  {showNewPassword ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
                </button>
              </div>
            </label>

            <motion.button
              type="button"
              onClick={handleVerifyForgotPasswordCode}
              disabled={isLoading}
              className="custom-btn bg-gradient-to-r from-indigo-500 to-teal-400 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-600 hover:to-teal-500 transition duration-300 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </motion.button>

            <p className="text-center text-gray-300 mt-4">
              Back to{' '}
              <button
                type="button"
                onClick={() => setForgotPasswordStep(0)}
                className="text-indigo-400 font-semibold hover:text-indigo-300 transition duration-200"
              >
                Login
              </button>
            </p>
          </div>
        )}

        {forgotPasswordStep === 0 && (
          <>
            <div className="flex items-center justify-between my-6">
              <hr className="w-1/3 border-gray-400/30" />
              <span className="text-gray-300 font-medium">OR</span>
              <hr className="w-1/3 border-gray-400/30" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={handleFacebookLogin}
                className="custom-btn flex-1 flex items-center justify-center bg-blue-800 text-white py-3 rounded-xl hover:bg-blue-900 transition duration-300 shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img src={FacebookSVG} alt="Facebook" className="w-6 h-6 mr-3" />
                Login with Facebook
              </motion.button>
              <motion.button
                onClick={handleGoogleLogin}
                className="custom-btn flex-1 flex items-center justify-center bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition duration-300 shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img src={GoogleSvg} alt="Google" className="w-6 h-6 mr-3" />
                Login with Google
              </motion.button>
            </div>

            <p className="text-center text-gray-300 mt-8">
              New to the crew?{' '}
              <a href="/contact" className="text-indigo-400 font-semibold hover:text-indigo-300 transition duration-200">
                Sign Up
              </a>
            </p>
          </>
        )}
      </motion.div>

      <motion.div
        variants={slideIn('right', 'tween', 0.2, 1)}
        className="lg:w-1/2 w-full max-w-3xl h-[400px] sm:h-[600px] lg:h-[800px] mt-10 lg:mt-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Login, 'login');