import React from "react";

const Step2 = ({ formData, handleChange, nextStep, prevStep }) => {
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
      <input
        type="text"
        name="barangay"
        placeholder="Barangay"
        value={formData.barangay}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="city_municipality"
        placeholder="City/Municipality"
        value={formData.city_municipality}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="province"
        placeholder="Province"
        value={formData.province}
        onChange={handleChange}
        required
      />
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
      <input
        type="text"
        name="civil_status"
        placeholder="Civil Status"
        value={formData.civil_status}
        onChange={handleChange}
        required
      />
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
