import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { EarthCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { slideIn } from "../utils/motion";
import { useNavigate } from 'react-router-dom';
const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    password: "",
    phoneNumber: "",
    photo: "",
    role: "passenger", // default role
    boatInfo: {
      name:"",
      boatLicense: "",
      boatType: "",
      boatCapacity: ""
    },
    adminInfo: {
      adminId: "",
      department: ""
    }
  });

const API_URL = "/api";
    const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const inputStyle = {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "100%",
    boxSizing: "border-box",
    marginBottom: "16px",
    backgroundColor: "#fff",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

 

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

 

  const handleProfileImageUpload = async () => {
    if (!profileImage) {
      alert("Please select a profile image");
      return;
    }

    const formDataImage = new FormData();
    formDataImage.append("image", profileImage);

  
      try {
    const response = await axios.post(`${API_URL}/auth/upload-profile-image`, formDataImage, {
      headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          photo: response.data.image
        }));
      } else {
        alert("Failed to upload profile image.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred");
    }
  };

//signup is here 

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const submitData = {
    ...formData,
    ...(formData.role === 'boat_owner' && { boatInfo: formData.boatInfo }),
    ...(formData.role === 'admin' && { adminInfo: formData.adminInfo })
  };

  try {
    const response = await axios.post("/api/auth/signup", submitData);


    
    // Store token and user data
    localStorage.setItem('token', response.data.token);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
  
    // Redirect based on role
    if (response.data.requiresBoatInfo) {
      navigate('/complete-boat-info');
    } else {
      navigate('/profile'); // Redirect to profile page
    }
    
  } catch (error) {
    console.error("Error during sign-up:", error);
    alert(error.response?.data?.message || "Signup failed");
  }
};

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  const renderRoleSpecificFields = () => {
    switch(formData.role) {
      case 'boat_owner':
        return (
          <>
            <h3 style={{ fontSize: "24px", margin: "20px 0 10px" }}>Boat Information</h3>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "20px" }}>
              <span style={{ color: "black", marginBottom: "8px", fontSize: "20px" }}>Boat License</span>
              <input
                type="text"
                name="boatLicense"
                value={formData.boatInfo.boatLicense}
                onChange={(e) => handleNestedChange('boatInfo', 'boatLicense', e.target.value)}
                required
                style={inputStyle}
              />
            </label>

      <label style={{ display: "flex", flexDirection: "column", fontSize: "20px" }}>
        <span style={{ color: "black", marginBottom: "8px", fontSize: "20px" }}>Boat Name</span>
        <input
          type="text"
          name="name"
          value={formData.boatInfo.name}
          onChange={(e) => handleNestedChange('boatInfo', 'name', e.target.value)}
          required
          style={inputStyle}
        />
      </label>

            <label style={{ display: "flex", flexDirection: "column", fontSize: "20px" }}>
              <span style={{ color: "black", marginBottom: "8px", fontSize: "20px" }}>Boat Type</span>
              <input
                type="text"
                name="boatType"
                value={formData.boatInfo.boatType}
                onChange={(e) => handleNestedChange('boatInfo', 'boatType', e.target.value)}
                required
                style={inputStyle}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "20px" }}>
              <span style={{ color: "black", marginBottom: "8px", fontSize: "20px" }}>Boat Capacity</span>
              <input
                type="number"
                name="boatCapacity"
                value={formData.boatInfo.boatCapacity}
                onChange={(e) => handleNestedChange('boatInfo', 'boatCapacity', e.target.value)}
                required
                style={inputStyle}
              />
            </label>
          </>
        );
      case 'admin':
        return (
          <>
            <h3 style={{ fontSize: "24px", margin: "20px 0 10px" }}>Admin Information</h3>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "20px" }}>
              <span style={{ color: "black", marginBottom: "8px", fontSize: "20px" }}>Admin ID</span>
              <input
                type="text"
                name="adminId"
                value={formData.adminInfo.adminId}
                onChange={(e) => handleNestedChange('adminInfo', 'adminId', e.target.value)}
                required
                style={inputStyle}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", fontSize: "20px" }}>
              <span style={{ color: "black", marginBottom: "8px", fontSize: "20px" }}>Department</span>
              <input
                type="text"
                name="department"
                value={formData.adminInfo.department}
                onChange={(e) => handleNestedChange('adminInfo', 'department', e.target.value)}
                required
                style={inputStyle}
              />
            </label>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      backgroundColor: "#f0f0f0",
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      width: "100%",
      gap: "10px",
      padding: "100px",
    }}>
      {/* Form Section */}
      <motion.div
        variants={slideIn("left", "tween", 0.7, 1)}
        style={{
          flex: 1,
          maxWidth: "1200px",
          backgroundColor: "#f2f2f2",
          padding: "50px",
          borderRadius: "16px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h3 className={styles.sectionSubText} style={{ fontSize: "90px" }}>Welcome!</h3>
        <h1 className={styles.sectionHeadText} style={{ fontSize: "30px" }}>Your Information</h1>

      

       

        <label style={{ display: "block", marginBottom: "16px", fontSize: "20px", marginTop: "20px" }}>
          <span style={{ color: "black", marginBottom: "8px", fontSize: "20px" }}>Upload Profile Image</span>
          <input type="file" onChange={handleProfileImageChange} accept="image/*" style={inputStyle} />
        </label>
        <button
          onClick={handleProfileImageUpload}
          style={{
            padding: "16px 32px",
            backgroundColor: "#FF5722",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "18px",
            transition: "background-color 0.3s ease",
            marginBottom: "20px"
          }}
        >
          Upload Profile Image
        </button>

        {profileImagePreview && (
          <div style={{ marginTop: "16px" }}>
            <h3 style={{ fontSize: "24px" }}>Profile Image Preview:</h3>
            <img src={profileImagePreview} alt="Preview" width="300px" />
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Improved Role Selection */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "20px", marginBottom: "15px", color: "black" }}>Select Your Role</h3>
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <div 
                onClick={() => handleRoleChange("passenger")}
                style={{
                  flex: "1",
                  minWidth: "200px",
                  padding: "20px",
                  borderRadius: "10px",
                  border: `2px solid ${formData.role === "passenger" ? "#4CAF50" : "#ddd"}`,
                  backgroundColor: formData.role === "passenger" ? "#f0fff0" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="radio"
                    name="role"
                    value="passenger"
                    checked={formData.role === "passenger"}
                    onChange={() => {}}
                    style={{ transform: "scale(1.2)" }}
                  />
                  <h4 style={{ margin: "0", fontSize: "18px" }}>Passenger</h4>
                </div>
                <p style={{ margin: "10px 0 0", color: "#666" }}>Book and manage boat trips</p>
              </div>

              <div 
                onClick={() => handleRoleChange("boat_owner")}
                style={{
                  flex: "1",
                  minWidth: "200px",
                  padding: "20px",
                  borderRadius: "10px",
                  border: `2px solid ${formData.role === "boat_owner" ? "#4CAF50" : "#ddd"}`,
                  backgroundColor: formData.role === "boat_owner" ? "#f0fff0" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="radio"
                    name="role"
                    value="boat_owner"
                    checked={formData.role === "boat_owner"}
                    onChange={() => {}}
                    style={{ transform: "scale(1.2)" }}
                  />
                  <h4 style={{ margin: "0", fontSize: "18px" }}>Boat Owner</h4>
                </div>
                <p style={{ margin: "10px 0 0", color: "#666" }}>List and manage your boats</p>
              </div>

              <div 
                onClick={() => handleRoleChange("admin")}
                style={{
                  flex: "1",
                  minWidth: "200px",
                  padding: "20px",
                  borderRadius: "10px",
                  border: `2px solid ${formData.role === "admin" ? "#4CAF50" : "#ddd"}`,
                  backgroundColor: formData.role === "admin" ? "#f0fff0" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === "admin"}
                    onChange={() => {}}
                    style={{ transform: "scale(1.2)" }}
                  />
                  <h4 style={{ margin: "0", fontSize: "18px" }}>Admin</h4>
                </div>
                <p style={{ margin: "10px 0 0", color: "#666" }}>Manage system and users</p>
              </div>
            </div>
          </div>

          {/* Common Fields */}
          <label style={{ display: "flex", flexDirection: "column", fontSize: "20px" }}>
            <span style={{ color: "black", marginBottom: "8px", fontSize: "20px" }}>First Name</span>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", fontSize: "20px" }}>
            <span style={{ color: "black", marginBottom: "8px", fontSize: "20px" }}>Last Name</span>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", fontSize: "20px" }}>
            <span style={{ color: "black", marginBottom: "8px", fontSize: "20px" }}>Age</span>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", fontSize: "20px" }}>
            <span style={{ color: "black", marginBottom: "8px", fontSize: "20px" }}>Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", fontSize: "20px" }}>
            <span style={{ color: "black", marginBottom: "8px", fontSize: "20px" }}>Password</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", fontSize: "20px" }}>
            <span style={{ color: "black", marginBottom: "8px", fontSize: "20px" }}>Phone Number</span>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

         

          {/* Hidden field for photo URL */}
          <input type="hidden" name="photo" value={formData.photo} />

          {/* Role-specific fields */}
          {renderRoleSpecificFields()}

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              padding: "16px 32px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "18px",
              transition: "background-color 0.3s ease",
              marginTop: "20px"
            }}
          >
            Sign Up
          </button>
        </form>
      </motion.div>

      {/* Earth Canvas Section */}
      <motion.div
        variants={slideIn("right", "tween", 0.6, 1)}
        style={{
          flex: 1.5,
          maxWidth: "800px",
          height: "800px",
        }}
      >
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Contact, "contact");