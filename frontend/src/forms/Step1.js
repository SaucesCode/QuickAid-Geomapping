// ✅ Step1.js — Personal Info
import React, { useState } from "react";
import "./Steps.css";

const Step1 = ({ formData, handleChange, nextStep }) => {
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name?.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name?.trim()) {
      newErrors.last_name = "Last name is required";
    }
    if (formData.middle_initial?.trim() && !/^[A-Za-z]$/.test(formData.middle_initial)) {
      newErrors.middle_initial = "Middle initial must be a single letter";
    }
    if (!formData.contact_number?.trim()) {
      newErrors.contact_number = "Contact number is required";
    } else if (!/^[0-9]{11}$/.test(formData.contact_number)) {
      newErrors.contact_number = "Please enter a valid 11-digit mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) {
      nextStep();
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    handleChange(e);
    // Clear error when field is filled
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
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
                onChange={handleInputChange}
                className={`form-control ${errors.first_name ? "error" : ""}`}
                placeholder="Enter your first name"
                autoComplete="given-name"
              />
              {errors.first_name && <div className="error-message">{errors.first_name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="middle_initial">Middle Initial</label>
              <input
                type="text"
                id="middle_initial"
                name="middle_initial"
                maxLength={1}
                value={formData.middle_initial}
                onChange={handleInputChange}
                className={`form-control ${errors.middle_initial ? "error" : ""}`}
                placeholder="Enter middle initial"
                autoComplete="additional-name"
              />
              {errors.middle_initial && (
                <div className="error-message">{errors.middle_initial}</div>
              )}
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
                onChange={handleInputChange}
                className={`form-control ${errors.last_name ? "error" : ""}`}
                placeholder="Enter your last name"
                autoComplete="family-name"
              />
              {errors.last_name && <div className="error-message">{errors.last_name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="suffix">Suffix</label>
              <select
                id="suffix"
                name="suffix"
                value={formData.suffix}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                className={`form-control ${errors.contact_number ? "error" : ""}`}
                placeholder="e.g. 09123456789"
                autoComplete="tel"
              />
              {errors.contact_number && (
                <div className="error-message">{errors.contact_number}</div>
              )}
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
