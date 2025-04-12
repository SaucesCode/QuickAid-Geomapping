import React from "react";
import AddressDropdown from "./AddressDropdown";

const Step2 = ({ formData, handleChange, nextStep, prevStep }) => {
  const handleAddressChange = (field, value) => {
    handleChange({ target: { name: field, value } });
  };

  return (
    <div>
      <h2>Step 2: Address & Additional Information</h2>

      <input
        type="text"
        name="purok"
        placeholder="Purok"
        value={formData.purok}
        onChange={handleChange}
        required
      />

      {/* PSGC Dropdown Component */}
      <AddressDropdown onSelect={handleAddressChange} />

      <input
        type="date"
        name="birthday"
        value={formData.birthday}
        onChange={handleChange}
        required
      />

      <select name="gender" value={formData.gender} onChange={handleChange} required>
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>

      <select
        name="civil_status"
        value={formData.civil_status}
        onChange={handleChange}
        required
      >
        <option value="">Select Civil Status</option>
        <option value="Single">Single</option>
        <option value="Married">Married</option>
        <option value="Widowed">Widowed</option>
        <option value="Separated">Separated</option>
        <option value="Divorced">Divorced</option>
      </select>

      <input
        type="text"
        name="occupation"
        placeholder="Occupation"
        value={formData.occupation}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="monthly_income"
        placeholder="Monthly Income"
        value={formData.monthly_income}
        onChange={handleChange}
        required
      />

      <button onClick={prevStep}>Back</button>
      <button onClick={nextStep}>Next</button>
    </div>
  );
};

export default Step2;
