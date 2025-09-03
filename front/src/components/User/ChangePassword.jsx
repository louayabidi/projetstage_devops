import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { SectionWrapper } from "../../hoc";
import { slideIn } from "../../utils/motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import backgroundImage from "../../assets/backgroundlogin.jpg";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to change your password.");
        return;
      }

      const response = await axios.patch(
        "http://localhost:3000//api/auth/change-password",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setSuccess(response.data.message);
      setFormData({ oldPassword: "", newPassword: "" });
    } catch (error) {
      console.error("Change password error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to change password.");
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen w-full bg-cover bg-center bg-no-repeat p-4 sm:p-8"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-teal-700/70 z-0"></div>

      <motion.div
        variants={slideIn("left", "tween", 0.7, 1)}
        className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-2xl z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 mb-4 text-center">
          Change Password
        </h3>
        <p className="text-gray-700 text-lg text-center mb-8">
          Update your password securely.
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
        {success && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-500 text-sm text-center mb-6 p-3 bg-green-100 rounded-lg"
          >
            {success}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <label className="flex flex-col">
            <span className="text-gray-800 font-semibold mb-2">Old Password</span>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                required
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition duration-300 placeholder-gray-400"
                placeholder="Enter your old password"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-blue-600 transition duration-200"
              >
                {showOldPassword ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
              </button>
            </div>
          </label>

          <label className="flex flex-col">
            <span className="text-gray-800 font-semibold mb-2">New Password</span>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition duration-300 placeholder-gray-400"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-blue-600 transition duration-200"
              >
                {showNewPassword ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
              </button>
            </div>
          </label>

          <motion.button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-teal-600 transition duration-300 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Change Password
          </motion.button>
        </form>

        <p className="text-center text-gray-600 mt-8">
          Back to{" "}
          <a
            href="/profile"
            className="text-blue-600 font-semibold hover:text-blue-800 transition duration-200"
          >
            Profile
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default SectionWrapper(ChangePassword, "change-password");