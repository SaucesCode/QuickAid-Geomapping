import React, { useState } from "react";
import AddressDropdown from "./AddressDropdown";
import "./Steps.css";

const Step2 = ({ formData, handleChange, nextStep, prevStep, setFormData }) => {
  const [errors, setErrors] = useState({});

  // Handle selection from AddressDropdown and update formData
  const handleAddressSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is filled
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate address fields
    if (!formData.barangay?.trim()) {
      newErrors.barangay = "Barangay is required";
    }
    if (!formData.city_municipality?.trim()) {
      newErrors.city_municipality = "City/Municipality is required";
    }
    if (!formData.street_address?.trim()) {
      newErrors.street_address = "Street address is required";
    }

    // Validate personal details
    if (!formData.birthday) {
      newErrors.birthday = "Date of birth is required";
    }
    if (!formData.sex) {
      newErrors.sex = "Sex is required";
    }
    if (!formData.civil_status) {
      newErrors.civil_status = "Civil status is required";
    }
    if (!formData.occupation?.trim()) {
      newErrors.occupation = "Occupation is required";
    }
    if (
      formData.monthly_income === undefined ||
      formData.monthly_income === null ||
      formData.monthly_income === ""
    ) {
      newErrors.monthly_income = "Monthly income is required";
    } else if (formData.monthly_income < 0) {
      newErrors.monthly_income = "Monthly income cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = e => {
    e.preventDefault();
    e.stopPropagation();

    const isValid = validateForm();
    if (!isValid) {
      return false;
    }

    nextStep();
  };

  const handleInputChange = e => {
    const { name, value, type } = e.target;

    // Handle number inputs
    if (type === "number") {
      // Allow empty value for backspace/delete
      if (value === "") {
        handleChange(e);
        return;
      }

      // Convert to number and check if it's valid
      const numValue = parseFloat(value);

      // Allow 0 but prevent negative numbers
      if (numValue < 0) {
        return;
      }

      // Prevent multiple leading zeros
      if (value.startsWith("0") && value.length > 1) {
        return;
      }
    }

    handleChange(e);

    // Clear error when field is filled
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className="form-step">
      <form onSubmit={handleNext} noValidate>
        <div className="form-section">
          <h3 className="section-title">Address Information</h3>
          <div className="form-grid">
            <div className="form-group address-group full-width">
              <AddressDropdown onSelect={handleAddressSelect} initialValues={formData} />
              {errors.barangay && <div className="error-message">{errors.barangay}</div>}
              {errors.city_municipality && (
                <div className="error-message">{errors.city_municipality}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="street_address">
                Street Address <span className="required">*</span>
              </label>
              <input
                type="text"
                id="street_address"
                name="street_address"
                value={formData.street_address || ""}
                onChange={handleInputChange}
                className={`form-control ${errors.street_address ? "error" : ""}`}
                placeholder="Enter your street/purok"
                required
              />
              {errors.street_address && (
                <div className="error-message">{errors.street_address}</div>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Personal Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="birthday">
                Date of Birth (Day/Month/Year) <span className="required">*</span>
              </label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={formData.birthday || ""}
                onChange={handleInputChange}
                className={`form-control ${errors.birthday ? "error" : ""}`}
                required
              />
              {errors.birthday && <div className="error-message">{errors.birthday}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="sex">
                Sex <span className="required">*</span>
              </label>
              <select
                id="sex"
                name="sex"
                value={formData.sex || ""}
                onChange={handleInputChange}
                className={`form-control ${errors.sex ? "error" : ""}`}
                required
              >
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.sex && <div className="error-message">{errors.sex}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="civil_status">
                Civil Status <span className="required">*</span>
              </label>
              <select
                id="civil_status"
                name="civil_status"
                value={formData.civil_status || ""}
                onChange={handleInputChange}
                className={`form-control ${errors.civil_status ? "error" : ""}`}
                required
              >
                <option value="">Select Civil Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
                <option value="Divorced">Divorced</option>
              </select>
              {errors.civil_status && (
                <div className="error-message">{errors.civil_status}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="occupation">
                Occupation (None if none) <span className="required">*</span>
              </label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={formData.occupation || ""}
                onChange={handleInputChange}
                className={`form-control ${errors.occupation ? "error" : ""}`}
                required
                placeholder="Enter your occupation"
              />
              {errors.occupation && <div className="error-message">{errors.occupation}</div>}
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
                onChange={handleInputChange}
                className={`form-control ${errors.monthly_income ? "error" : ""}`}
                required
                min="0"
                placeholder="e.g. 15000"
              />
              {errors.monthly_income && (
                <div className="error-message">{errors.monthly_income}</div>
              )}
            </div>
          </div>
        </div>

        <div className="form-navigation">
          <button type="button" onClick={prevStep} className="back-btn">
            <span className="btn-icon">←</span> Back
          </button>
          <button type="submit" className="next-btn">
            Continue to Assistance
            <span className="btn-icon">→</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2;
