import React from "react";
import axios from "axios";

const Step3 = ({ formData, handleChange, prevStep }) => {
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        "http://127.0.0.1:8000/api/submit-applicant/",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Applicant registered successfully!");
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Submission Error:", error.response ? error.response.data : error);
      alert("Error submitting applicant. Please try again.");
    }
  };

  return (
    <div>
      <h2>Step 3: ID & Assistance Details</h2>
      <input
        type="text"
        name="valid_id_presented"
        placeholder="Valid ID Presented"
        value={formData.valid_id_presented}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="beneficiary_name"
        placeholder="Name of Beneficiary"
        value={formData.beneficiary_name}
        onChange={handleChange}
        required
      />
      <select
        name="type_of_assistance"
        value={formData.type_of_assistance}
        onChange={handleChange}
        required
      >
        <option value="">Select Assistance Type</option>
        <option value="Medical">Medical</option>
        <option value="Burial">Burial</option>
        <option value="Educational">Educational</option>
      </select>
      <textarea
        name="justification"
        placeholder="Justification"
        value={formData.justification}
        onChange={handleChange}
        required
      />
      <button onClick={prevStep}>Back</button>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default Step3;
