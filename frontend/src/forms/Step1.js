// ✅ Step1.js — Personal Info
import React from "react";
import "./Steps.css";

const Step1 = ({ formData, handleChange, nextStep }) => {
  const handleSubmit = e => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="form-step">
      <div className="form-step-header">
        <h2 className="step-title">Personal Information</h2>
        <p className="step-description">
          Please provide your basic personal details. Fields marked with * are required.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="first_name">
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="Enter your first name"
                autoComplete="given-name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="middle_initial">Middle Initial</label>
              <input
                type="text"
                id="middle_initial"
                name="middle_initial"
                maxLength={1}
                value={formData.middle_initial}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter middle initial"
                autoComplete="additional-name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="Enter your last name"
                autoComplete="family-name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="suffix">Suffix</label>
              <select
                id="suffix"
                name="suffix"
                value={formData.suffix}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">None</option>
                <option value="Jr.">Jr.</option>
                <option value="Sr.">Sr.</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="contact_number">
                Contact Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="contact_number"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="e.g. 09123456789"
                pattern="[0-9]{11}"
                title="Please enter a valid 11-digit mobile number"
                autoComplete="tel"
              />
              <small className="form-text">Enter your 11-digit mobile number</small>
            </div>
          </div>
        </div>

        <div className="form-navigation">
          <div></div>
          <button type="submit" className="next-btn">
            Continue to Address <span className="btn-icon">→</span>
          </button>
        </div>
      </form>
    </div>
  );
};
//
export default Step1;
