
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SectionWrapper } from "../hoc";
import { slideIn } from "../utils/motion";
import GoogleSvg from "../assets/icons8-google.svg";
import FacebookSVG from "../assets/icons8-facebook.svg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import backgroundImage from "../assets/backgroundlogin.jpg";
import { EarthCanvas } from "./canvas";
import {jwtDecode} from "jwt-decode"; // Add jwt-decode import

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      console.log("Sending login request with:", formData);
      const response = await axios.post("/api/auth/signin", formData, { withCredentials: true });
      console.log("Login successful - Response:", response.data);

      const token = response.data.token;
      localStorage.setItem("token", token);

      const tokenPayload = jwtDecode(token); // Use jwtDecode instead of manual parsing
      console.log("Token payload:", tokenPayload);
      localStorage.setItem("userId", tokenPayload._id); // Set userId
      const userRole = tokenPayload.role;

      if (userRole === 'admin') {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Login error - Full error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Login failed");
      if (error.response?.data?.message === "Invalid credentials") {
        console.log("Credential check failed - Possible hash mismatch. Check server logs for stored hash.");
      }
    }
  };

  const handleFacebookLogin = () => {
    window.location.href = "/api/auth/facebook";
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div
      className="relative flex flex-col lg:flex-row items-center justify-center min-h-screen w-full bg-cover bg-center bg-no-repeat p-4 sm:p-8"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-teal-700/70 z-0"></div>

      <motion.div
        variants={slideIn("left", "tween", 0.7, 1)}
        className="relative lg:w-1/2 w-full max-w-lg bg-white/95 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-2xl z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 mb-4 text-center">
          Set Sail with Us
        </h3>
        <p className="text-gray-700 text-lg text-center mb-8">
          Log in to embark on your adventure!
        </p>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm text-center mb-6 p-3 bg-red-100 rounded-lg"
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <label className="flex flex-col">
            <span className="text-gray-800 font-semibold mb-2">Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="p-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition duration-300 placeholder-gray-400"
              placeholder="Enter your email"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-gray-800 font-semibold mb-2">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition duration-300 placeholder-gray-400"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-blue-600 transition duration-200"
              >
                {showPassword ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
              </button>
            </div>
          </label>

          <motion.button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-teal-600 transition duration-300 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Log In
          </motion.button>
        </form>

        <div className="flex items-center justify-between my-6">
          <hr className="w-1/3 border-gray-300" />
          <span className="text-gray-400 font-medium">OR</span>
          <hr className="w-1/3 border-gray-300" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            onClick={handleFacebookLogin}
            className="flex-1 flex items-center justify-center bg-blue-800 text-white py-3 rounded-xl hover:bg-blue-900 transition duration-300 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src={FacebookSVG} alt="Facebook" className="w-6 h-6 mr-3" />
            Login with Facebook
          </motion.button>
          <motion.button
            onClick={handleGoogleLogin}
            className="flex-1 flex items-center justify-center bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition duration-300 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src={GoogleSvg} alt="Google" className="w-6 h-6 mr-3" />
            Login with Google
          </motion.button>
        </div>

        <p className="text-center text-gray-600 mt-8">
          New to the crew?{" "}
          <a
            href="/contact"
            className="text-blue-600 font-semibold hover:text-blue-800 transition duration-200"
          >
            Sign Up
          </a>
        </p>
      </motion.div>

      <motion.div
        variants={slideIn("right", "tween", 0.2, 1)}
        className="lg:w-1/2 w-full max-w-3xl h-[400px] sm:h-[600px] lg:h-[800px] mt-10 lg:mt-0 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Login, "login");