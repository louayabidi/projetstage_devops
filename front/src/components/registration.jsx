import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Importation de useLocation
import { motion } from "framer-motion";
import { EarthCanvas } from "./canvas"; // Modèle 3D de la Terre
import { slideIn } from "../utils/motion"; // Adjust the path if necessary

const Registration = () => {
  const location = useLocation(); // Get the passed data during navigation
  const { firstName, lastName } = location.state || {}; // Extract first name and last name

  const [formData, setFormData] = useState({
    firstName: firstName || "", // Initialize with passed data or empty string
    lastName: lastName || "",
    email: "",
    password: ""
  });

  useEffect(() => {
    // Any additional actions or debugging can go here
    console.log("Data received:", firstName, lastName);
  }, [firstName, lastName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/auth/signup", formData);
      if (response.data.success) {
        alert("Registration successful!");
        // Redirect after success (e.g., to home page)
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("There was an error registering!", error);
    }
  };

  return (
    <div className="registration-container flex xl:flex-row flex-col-reverse gap-10 overflow-hidden">
      {/* Formulaire */}
      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className="flex-[0.75] bg-black-100 p-8 rounded-2xl"
      >
        <h2 className="text-white font-bold text-2xl">Welcome to Registration!</h2>
        <p className="text-white text-lg">Please enter your details</p>
        <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-8">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium"
          />
          <button
            type="submit"
            className="bg-tertiary py-3 px-8 rounded-xl outline-none w-fit text-white font-bold shadow-md shadow-primary"
          >
            Register
          </button>
        </form>
      </motion.div>

      {/* Modèle 3D */}
      <motion.div
        variants={slideIn("right", "tween", 0.2, 1)}
        className="xl:flex-1 xl:h-auto md:h-[550px] h-[350px]"
      >
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default Registration;
