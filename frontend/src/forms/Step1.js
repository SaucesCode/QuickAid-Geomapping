import React from "react";
import "./Steps.css";

const Step1 = ({ formData, handleChange, nextStep }) => {
  return (
    <div className="form-step">
      <div className="form-step-header">
        <span className="step-title">Personal Information</span>
        <p className="step-description">
          Please provide the applicant's basic personal details
        </p>
      </div>
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
          />
        </div>

        <div className="form-group">
          <label htmlFor="middle_initial">Middle Initial</label>
          <input
            type="text"
            id="middle_initial"
            name="middle_initial"
            value={formData.middle_initial}
            onChange={handleChange}
            className="form-control"
            maxLength={1}
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
          />
        </div>

        <div className="form-group">
          <label htmlFor="suffix">Suffix</label>
          <select id="suffix" name="suffix" value={formData.suffix} onChange={handleChange}>
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
          />
        </div>
      </div>

      <div className="form-navigation">
        <div></div>
        <button type="button" className="next-btn" onClick={nextStep}>
          Continue to Address
          <span className="btn-icon">→</span>
        </button>
      </div>
    </div>
  );
};

export default Step1;
