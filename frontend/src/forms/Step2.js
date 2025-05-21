import React from "react";
import AddressDropdown from "./AddressDropdown";
import "./Steps.css";

const Step2 = ({ formData, handleChange, nextStep, prevStep, setFormData }) => {
  // Handle selection from AddressDropdown and update formData
  const handleAddressSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="form-step">
      <div className="form-section">
        <h3 className="section-title">Address Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="street_address">
              Street Address <span className="required">*</span>
            </label>
            <input
              type="text"
              id="street_address"
              name="street_address"
              value={formData.street_address || ""}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter your street/purok"
              required
            />
          </div>

          <div className="form-group address-group full-width">
            <AddressDropdown onSelect={handleAddressSelect} initialValues={formData} />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Personal Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="birthday">
              Date of Birth <span className="required">*</span>
            </label>
            <input
              type="date"
              id="birthday"
              name="birthday"
              value={formData.birthday || ""}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sex">
              Sex <span className="required">*</span>
            </label>
            <select
              id="sex"
              name="sex"
              value={formData.sex || ""}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="civil_status">
              Civil Status <span className="required">*</span>
            </label>
            <select
              id="civil_status"
              name="civil_status"
              value={formData.civil_status || ""}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Select Civil Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
              <option value="Divorced">Divorced</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="occupation">
              Occupation <span className="required">*</span>
            </label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation || ""}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="Enter your occupation"
            />
          </div>

          <div className="form-group">
            <label htmlFor="monthly_income">
              Monthly Income (PHP) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="monthly_income"
              name="monthly_income"
              value={formData.monthly_income || ""}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="e.g. 15000"
            />
          </div>
        </div>
      </div>

      <div className="form-navigation">
        <button type="button" onClick={prevStep} className="back-btn">
          <span className="btn-icon">←</span> Back
        </button>
        <button type="button" onClick={nextStep} className="next-btn">
          Continue to Assistance
          <span className="btn-icon">→</span>
        </button>
      </div>
    </div>
  );
};
//
export default Step2;
