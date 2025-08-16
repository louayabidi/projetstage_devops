import React, { useState } from "react";
import axios from "axios";

const StudentInfo = () => {
  const [studentData, setStudentData] = useState({
    identifier: "",
    situation: "",
    disease: "",
    socialCase: "",
  });

  const handleChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/auth/student-info", studentData);
      alert(response.data.message);
      window.location.href = "/profile"; // Redirigez vers le profil après la soumission
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div>
      <h1>Student Information</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Identifier:
          <input type="text" name="identifier" value={studentData.identifier} onChange={handleChange} required />
        </label>
        <label>
          Situation:
          <input type="text" name="situation" value={studentData.situation} onChange={handleChange} required />
        </label>
        <label>
          Disease:
          <input type="text" name="disease" value={studentData.disease} onChange={handleChange} />
        </label>
        <label>
          Social Case:
          <input type="text" name="socialCase" value={studentData.socialCase} onChange={handleChange} />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default StudentInfo;