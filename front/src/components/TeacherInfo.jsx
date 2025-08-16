import React, { useState } from "react";
import axios from "axios";

const TeacherInfo = () => {
  const [teacherData, setTeacherData] = useState({
    number: "",
    bio: "",
    cv: "",
    diploma: "",
    experience: "",
    cin: "",
  });

  const handleChange = (e) => {
    setTeacherData({ ...teacherData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/auth/teacher-info", teacherData);
      alert(response.data.message);
      window.location.href = "/profile"; // Redirigez vers le profil après la soumission
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div>
      <h1>Teacher Information</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Number:
          <input type="text" name="number" value={teacherData.number} onChange={handleChange} required />
        </label>
        <label>
          Bio:
          <textarea name="bio" value={teacherData.bio} onChange={handleChange} required />
        </label>
        <label>
          CV:
          <input type="text" name="cv" value={teacherData.cv} onChange={handleChange} required />
        </label>
        <label>
          Diploma:
          <input type="text" name="diploma" value={teacherData.diploma} onChange={handleChange} required />
        </label>
        <label>
          Experience:
          <input type="text" name="experience" value={teacherData.experience} onChange={handleChange} required />
        </label>
        <label>
          CIN:
          <input type="text" name="cin" value={teacherData.cin} onChange={handleChange} required />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default TeacherInfo;