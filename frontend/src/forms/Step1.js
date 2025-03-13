import React from "react";

const Step1 = ({ formData, handleChange, nextStep }) => {
  return (
    <div>
      <h2>Step 1: Personal Information</h2>
      <input
        type="text"
        name="first_name"
        placeholder="First Name"
        value={formData.first_name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="middle_initial"
        placeholder="Middle Initial"
        value={formData.middle_initial}
        onChange={handleChange}
      />
      <input
        type="text"
        name="last_name"
        placeholder="Last Name"
        value={formData.last_name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="suffix"
        placeholder="Suffix"
        value={formData.suffix}
        onChange={handleChange}
      />
      <input
        type="text"
        name="contact_number"
        placeholder="Contact Number"
        value={formData.contact_number}
        onChange={handleChange}
        required
      />
      <button onClick={nextStep}>Next</button>
    </div>
  );
};

export default Step1;
