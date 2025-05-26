import React, { useState } from "react";
import "./Steps.css";

const Step3 = ({ formData, handleChange, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.valid_id_presented) {
      newErrors.valid_id_presented = "Please select a valid ID";
    }

    if (formData.valid_id_presented === "Others" && !formData.other_valid_id) {
      newErrors.other_valid_id = "Please specify the ID type";
    }

    if (!formData.type_of_assistance) {
      newErrors.type_of_assistance = "Please select a type of assistance";
    }

    if (formData.applicant_type === "Representative") {
      if (!formData.rep_first_name) newErrors.rep_first_name = "First name is required";
      if (!formData.rep_last_name) newErrors.rep_last_name = "Last name is required";
      if (!formData.rep_address) newErrors.rep_address = "Address is required";
      if (!formData.rep_birthday) newErrors.rep_birthday = "Birthday is required";
      if (!formData.rep_gender) newErrors.rep_gender = "Gender is required";
      if (!formData.rep_civil_status) newErrors.rep_civil_status = "Civil status is required";
      if (!formData.rep_relationship) newErrors.rep_relationship = "Relationship is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = e => {
    e.preventDefault();
    if (validateForm()) {
      nextStep();
    }
  };

  return (
    <div className="form-step">
      <div className="form-step-header">
        <h2 className="step-title">ID & Assistance Details</h2>
        <p className="step-description">
          Please provide your identification and assistance information. Fields marked with *
          are required.
        </p>
      </div>

      <form onSubmit={handleNext}>
        <div className="form-section">
          <h3 className="section-title">Valid ID Information</h3>
          <div className="id-options">
            {["National ID", "Driver's License", "Voter's ID", "Passport"].map(id => (
              <label key={id} className="radio-wrapper">
                <input
                  type="radio"
                  name="valid_id_presented"
                  value={id}
                  checked={formData.valid_id_presented === id}
                  onChange={handleChange}
                  className="radio-input"
                  required
                />
                <span className="radio-label">{id}</span>
              </label>
            ))}

            <div className="other-id-option">
              <label className="radio-wrapper">
                <input
                  type="radio"
                  name="valid_id_presented"
                  value="Others"
                  checked={formData.valid_id_presented === "Others"}
                  onChange={handleChange}
                  className="radio-input"
                  required
                />
                <span className="radio-label">Others</span>
              </label>

              {formData.valid_id_presented === "Others" && (
                <div className="form-group">
                  <input
                    type="text"
                    name="other_valid_id"
                    placeholder="Specify ID"
                    value={formData.other_valid_id || ""}
                    onChange={handleChange}
                    className={`form-control ${errors.other_valid_id ? "error" : ""}`}
                    required
                  />
                  {errors.other_valid_id && (
                    <div className="error-message">{errors.other_valid_id}</div>
                  )}
                </div>
              )}
            </div>
          </div>
          {errors.valid_id_presented && (
            <div className="error-message">{errors.valid_id_presented}</div>
          )}
        </div>

        <div className="form-section">
          <h3 className="section-title">Assistance Type</h3>
          <div className="form-group full-width">
            <label htmlFor="type_of_assistance">
              Type of Assistance <span className="required">*</span>
            </label>
            <select
              id="type_of_assistance"
              name="type_of_assistance"
              value={formData.type_of_assistance}
              onChange={handleChange}
              className={`form-control ${errors.type_of_assistance ? "error" : ""}`}
              required
            >
              <option value="">Select assistance type</option>
              <option value="Medical">Medical</option>
              <option value="Burial">Burial</option>
              <option value="Educational">Educational</option>
            </select>
            {errors.type_of_assistance && (
              <div className="error-message">{errors.type_of_assistance}</div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Applicant Information</h3>
          <div className="applicant-type-selector">
            <p className="field-label">Are you applying for yourself or someone else?</p>
            <div className="radio-group">
              <label className="radio-wrapper">
                <input
                  type="radio"
                  name="applicant_type"
                  value="Self"
                  checked={formData.applicant_type === "Self"}
                  onChange={handleChange}
                  className="radio-input"
                  required
                />
                <span className="radio-label">Self</span>
              </label>
              <label className="radio-wrapper">
                <input
                  type="radio"
                  name="applicant_type"
                  value="Representative"
                  checked={formData.applicant_type === "Representative"}
                  onChange={handleChange}
                  className="radio-input"
                  required
                />
                <span className="radio-label">Representative</span>
              </label>
            </div>
          </div>

          {formData.applicant_type === "Representative" && (
            <div className="representative-info">
              <h4 className="subsection-title">Representative Information</h4>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="rep_first_name">
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="rep_first_name"
                    name="rep_first_name"
                    value={formData.rep_first_name || ""}
                    onChange={handleChange}
                    className={`form-control ${errors.rep_first_name ? "error" : ""}`}
                    placeholder="Enter first name"
                    required
                  />
                  {errors.rep_first_name && (
                    <div className="error-message">{errors.rep_first_name}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="rep_last_name">
                    Last Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="rep_last_name"
                    name="rep_last_name"
                    value={formData.rep_last_name || ""}
                    onChange={handleChange}
                    className={`form-control ${errors.rep_last_name ? "error" : ""}`}
                    placeholder="Enter last name"
                    required
                  />
                  {errors.rep_last_name && (
                    <div className="error-message">{errors.rep_last_name}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="rep_middle_initial">Middle Initial</label>
                  <input
                    type="text"
                    id="rep_middle_initial"
                    name="rep_middle_initial"
                    value={formData.rep_middle_initial || ""}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter middle initial"
                    maxLength={1}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rep_suffix">Suffix</label>
                  <select
                    id="rep_suffix"
                    name="rep_suffix"
                    value={formData.rep_suffix || ""}
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
                  <label htmlFor="rep_address">
                    Address <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="rep_address"
                    name="rep_address"
                    value={formData.rep_address || ""}
                    onChange={handleChange}
                    className={`form-control ${errors.rep_address ? "error" : ""}`}
                    placeholder="Enter complete address"
                    required
                  />
                  {errors.rep_address && (
                    <div className="error-message">{errors.rep_address}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="rep_birthday">
                    Birthday <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="rep_birthday"
                    name="rep_birthday"
                    value={formData.rep_birthday || ""}
                    onChange={handleChange}
                    className={`form-control ${errors.rep_birthday ? "error" : ""}`}
                    required
                  />
                  {errors.rep_birthday && (
                    <div className="error-message">{errors.rep_birthday}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="rep_gender">
                    Gender <span className="required">*</span>
                  </label>
                  <select
                    id="rep_gender"
                    name="rep_gender"
                    value={formData.rep_gender || ""}
                    onChange={handleChange}
                    className={`form-control ${errors.rep_gender ? "error" : ""}`}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.rep_gender && (
                    <div className="error-message">{errors.rep_gender}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="rep_civil_status">
                    Civil Status <span className="required">*</span>
                  </label>
                  <select
                    id="rep_civil_status"
                    name="rep_civil_status"
                    value={formData.rep_civil_status || ""}
                    onChange={handleChange}
                    className={`form-control ${errors.rep_civil_status ? "error" : ""}`}
                    required
                  >
                    <option value="">Select Civil Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                  {errors.rep_civil_status && (
                    <div className="error-message">{errors.rep_civil_status}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="rep_occupation">Occupation</label>
                  <input
                    type="text"
                    id="rep_occupation"
                    name="rep_occupation"
                    value={formData.rep_occupation || ""}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter occupation"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rep_monthly_income">Monthly Income</label>
                  <input
                    type="number"
                    id="rep_monthly_income"
                    name="rep_monthly_income"
                    value={formData.rep_monthly_income || ""}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter monthly income"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rep_relationship">
                    Relationship to Beneficiary <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="rep_relationship"
                    name="rep_relationship"
                    value={formData.rep_relationship || ""}
                    onChange={handleChange}
                    className={`form-control ${errors.rep_relationship ? "error" : ""}`}
                    placeholder="Enter relationship"
                    required
                  />
                  {errors.rep_relationship && (
                    <div className="error-message">{errors.rep_relationship}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="form-navigation">
          <button type="button" onClick={prevStep} className="back-btn">
            <span className="btn-icon">←</span> Back
          </button>
          <button type="submit" className="next-btn">
            Continue to Preview <span className="btn-icon">→</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step3;
