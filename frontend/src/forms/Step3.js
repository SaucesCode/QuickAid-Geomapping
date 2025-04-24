import React, { useState } from "react";
import "./MultiStepForm.css"; // Using your existing CSS file

const Step3 = ({ formData, handleChange, prevStep }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get token from storage
      const token = localStorage.getItem("accessToken");

      // Make API request
      const response = await fetch("http://127.0.0.1:8000/api/submit-applicant/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Server responded with an error");
      }

      const data = await response.json();
      console.log("Response:", data);
      setSubmitSuccess(true);
      setTimeout(() => {
        alert("Applicant registered successfully!");
      }, 500);
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Error submitting applicant. Please try again.");
      console.log("Submitting data:", formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="step-content">
      {/* Step header */}
      <div className="form-step-header">
        <h2 className="step-title">ID & Assistance Details</h2>
        <p className="step-description">
          Please provide identification and assistance information
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ID Section */}
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
                />
                <span className="radio-label">Others</span>
              </label>

              {formData.valid_id_presented === "Others" && (
                <input
                  type="text"
                  name="other_valid_id"
                  placeholder="Specify ID"
                  value={formData.other_valid_id || ""}
                  onChange={handleChange}
                  className="form-control other-id-input"
                />
              )}
            </div>
          </div>
        </div>

        {/* Applicant Type Section */}
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
                />
                <span className="radio-label">Representative</span>
              </label>
            </div>
          </div>

          {/* Representative Info Section - Conditionally Rendered */}
          {formData.applicant_type === "Representative" && (
            <div className="representative-info">
              <h4 className="subsection-title">Representative Information</h4>

              <div className="form-grid">
                <div className="form-group">
                  <label>
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="rep_first_name"
                    placeholder="First Name"
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Last Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="rep_last_name"
                    placeholder="Last Name"
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Middle Initial</label>
                  <input
                    type="text"
                    name="rep_middle_initial"
                    placeholder="Middle Initial"
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Suffix</label>
                  <input
                    type="text"
                    name="rep_suffix"
                    placeholder="Suffix"
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group full-width">
                  <label>
                    Address <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="rep_address"
                    placeholder="Complete Address"
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Birthday <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    name="rep_birthday"
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Gender <span className="required">*</span>
                  </label>
                  <select
                    name="rep_gender"
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Civil Status <span className="required">*</span>
                  </label>
                  <select
                    name="rep_civil_status"
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select Civil Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Occupation</label>
                  <input
                    type="text"
                    name="rep_occupation"
                    placeholder="Occupation"
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Monthly Income</label>
                  <input
                    type="number"
                    name="rep_monthly_income"
                    placeholder="Monthly Income"
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Relationship to Beneficiary <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="rep_relationship"
                    placeholder="Relationship to Beneficiary"
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Assistance Type Section */}
        <div className="form-section">
          <h3 className="section-title">Assistance Details</h3>
          <div className="form-group">
            <label>
              Type of Assistance <span className="required">*</span>
            </label>
            <select
              name="type_of_assistance"
              value={formData.type_of_assistance || ""}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Select Assistance Type</option>
              <option value="Medical">Medical</option>
              <option value="Burial">Burial</option>
              <option value="Educational">Educational</option>
            </select>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="form-navigation">
          <button
            type="button"
            onClick={prevStep}
            className="back-btn"
            disabled={isSubmitting}
          >
            <span className="btn-icon">←</span> Back
          </button>

          <button
            type="submit"
            className={`next-btn ${isSubmitting ? "submitting" : ""} ${
              submitSuccess ? "success" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : submitSuccess ? "Submitted ✓" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step3;
