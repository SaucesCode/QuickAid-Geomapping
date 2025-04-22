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
      console.log("Submitting data:", formData);
    }
  };

  return (
    <div>
      <h2>Step 3: ID & Assistance Details</h2>

      <h4>Valid ID Presented</h4>
      {["National ID", "Driver's License", "Voter's ID", "Passport"].map(id => (
        <label key={id}>
          <input
            type="radio"
            name="valid_id_presented"
            value={id}
            checked={formData.valid_id_presented === id}
            onChange={handleChange}
          />{" "}
          {id}
        </label>
      ))}
      <label>
        <input
          type="radio"
          name="valid_id_presented"
          value="Others"
          checked={formData.valid_id_presented === "Others"}
          onChange={handleChange}
        />{" "}
        Others:
      </label>
      {formData.valid_id_presented === "Others" && (
        <input
          type="text"
          name="other_valid_id"
          placeholder="Specify ID"
          value={formData.other_valid_id || ""}
          onChange={handleChange}
        />
      )}

      <h4>Are you applying for yourself or someone else?</h4>
      <label>
        <input
          type="radio"
          name="applicant_type"
          value="Self"
          checked={formData.applicant_type === "Self"}
          onChange={handleChange}
        />{" "}
        Self
      </label>
      <label>
        <input
          type="radio"
          name="applicant_type"
          value="Representative"
          checked={formData.applicant_type === "Representative"}
          onChange={handleChange}
        />{" "}
        Representative
      </label>

      {formData.applicant_type === "Representative" && (
        <div>
          <h4>Representative Information</h4>
          <input
            type="text"
            name="rep_first_name"
            placeholder="First Name"
            onChange={handleChange}
          />
          <input
            type="text"
            name="rep_last_name"
            placeholder="Last Name"
            onChange={handleChange}
          />
          <input
            type="text"
            name="rep_middle_initial"
            placeholder="Middle Initial"
            onChange={handleChange}
          />
          <input type="text" name="rep_suffix" placeholder="Suffix" onChange={handleChange} />
          <input
            type="text"
            name="rep_address"
            placeholder="Address"
            onChange={handleChange}
          />
          <input type="date" name="rep_birthday" onChange={handleChange} />
          <select name="rep_gender" onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <select name="rep_civil_status" onChange={handleChange}>
            <option value="">Select Civil Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widowed">Widowed</option>
            <option value="Separated">Separated</option>
          </select>
          <input
            type="text"
            name="rep_occupation"
            placeholder="Occupation"
            onChange={handleChange}
          />
          <input
            type="number"
            name="rep_monthly_income"
            placeholder="Monthly Income"
            onChange={handleChange}
          />
          <input
            type="text"
            name="rep_relationship"
            placeholder="Relationship to Beneficiary"
            onChange={handleChange}
          />
        </div>
      )}

      <h4>Type of Assistance</h4>
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

      <button onClick={prevStep}>Back</button>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default Step3;
