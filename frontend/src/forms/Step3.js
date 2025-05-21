import React from "react";
import "./Steps.css";

const Step3 = ({ formData, handleChange, nextStep, prevStep }) => {
  return (
    <div className="step-content">
      <div className="form-step-header">
        <h2 className="step-title">ID & Assistance Details</h2>
        <p className="step-description">
          Please provide identification and assistance information
        </p>
      </div>

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
              <input
                type="text"
                name="other_valid_id"
                placeholder="Specify ID"
                value={formData.other_valid_id || ""}
                onChange={handleChange}
                className="form-control other-id-input"
                required
              />
            )}
          </div>
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

        <div className="form-section">
          <h3 className="section-title">Assistance Type</h3>
          <div className="form-group full-width">
            <label>
              Type of Assistance <span className="required">*</span>
            </label>
            <select
              name="type_of_assistance"
              value={formData.type_of_assistance}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Select assistance type</option>
              <option value="Medical">Medical</option>
              <option value="Burial">Burial</option>
              <option value="Educational">Educational</option>
            </select>
          </div>
        </div>

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
                  value={formData.rep_first_name}
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
                  value={formData.rep_last_name}
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
                  value={formData.rep_middle_initial}
                  onChange={handleChange}
                  className="form-control"
                  maxLength={1}
                />
              </div>

              <div className="form-group">
                <label>Suffix</label>
                <input
                  type="text"
                  name="rep_suffix"
                  placeholder="Suffix"
                  value={formData.rep_suffix}
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
                  value={formData.rep_address}
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
                  value={formData.rep_birthday}
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
                  value={formData.rep_gender}
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
                  value={formData.rep_civil_status}
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
                <label>Occupation</label>
                <input
                  type="text"
                  name="rep_occupation"
                  placeholder="Occupation"
                  value={formData.rep_occupation}
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
                  value={formData.rep_monthly_income}
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
                  value={formData.rep_relationship}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="form-navigation">
        <button type="button" onClick={prevStep} className="back-btn">
          <span className="btn-icon">←</span> Back
        </button>
        <button type="button" onClick={nextStep} className="next-btn">
          Continue to Preview
          <span className="btn-icon">→</span>
        </button>
      </div>
    </div>
  );
};
//
export default Step3;
