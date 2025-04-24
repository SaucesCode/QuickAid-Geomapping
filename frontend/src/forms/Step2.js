import React from "react";
import AddressDropdown from "./AddressDropdown";
import "./MultiStepForm.css";

const Step2 = ({ formData, handleChange, nextStep, prevStep }) => {
  const handleAddressChange = (field, value) => {
    handleChange({ target: { name: field, value } });
  };

  return (
    <div className="form-step">
      {/* <div className="form-step-header">
        <span className="step-title">Address & Additional Information</span>
        <p className="step-description">Please provide your address and personal details</p>
      </div> */}

      <div className="form-section">
        <h3 className="section-title">Address Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="purok">
              Purok <span className="required">*</span>
            </label>
            <input
              type="text"
              id="purok"
              name="purok"
              value={formData.purok}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Enter your purok"
            />
          </div>

          <div className="form-group address-group full-width">
            <AddressDropdown onSelect={handleAddressChange} />
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
              value={formData.birthday}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">
              Gender <span className="required">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Select Gender</option>
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
              value={formData.civil_status}
              onChange={handleChange}
              required
              className="form-control"
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
              value={formData.occupation}
              onChange={handleChange}
              required
              className="form-control"
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
              value={formData.monthly_income}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Enter amount in PHP"
            />
          </div>
        </div>
      </div>

      <div className="form-navigation">
        <button type="button" className="back-btn" onClick={prevStep}>
          <span className="btn-icon">←</span>
          Back to Personal Info
        </button>
        <button type="button" className="next-btn" onClick={nextStep}>
          Continue to Final Step
          <span className="btn-icon">→</span>
        </button>
      </div>
    </div>
  );
};

export default Step2;
