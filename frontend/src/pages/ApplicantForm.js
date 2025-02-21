import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios to make requests

const ApplicantForm = () => {
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        "http://127.0.0.1:8000/api/submit-applicant/", // Use correct API route
        { full_name: fullName, contact_number: contactNumber, address },
        { headers: { Authorization: `Bearer ${token}` } } // Send token for authentication
      );
      setMessage("Applicant registered successfully!");
      setFullName("");
      setContactNumber("");
      setAddress("");
    } catch (err) {
      setMessage("Error submitting applicant. Please try again.");
    }
  };

  return (
    <div>
      <h2>Register Applicant</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Contact Number"
          value={contactNumber}
          onChange={e => setContactNumber(e.target.value)}
          required
        />
        <textarea
          placeholder="Address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ApplicantForm;
