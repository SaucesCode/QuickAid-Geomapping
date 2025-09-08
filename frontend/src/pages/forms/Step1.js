// File: frontend/src/forms/Step1.js
import React, { useState } from "react";

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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className="card bg-quickaid-surface rounded-xl shadow-md p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-quickaid-text-primary mb-1">
          Personal Information
        </h2>
        <p className="text-sm text-quickaid-text-secondary">
          Please provide your basic personal details. Fields marked with{" "}
          <span className="text-error">*</span> are required.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className={`input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent rounded-lg ${
                errors.first_name ? "border-error" : ""
              }`}
              placeholder="Enter your first name"
              autoComplete="given-name"
            />
            {errors.first_name && (
              <p className="text-sm text-error mt-1">{errors.first_name}</p>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="middle_initial"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Middle Initial
            </label>
            <input
              type="text"
              id="middle_initial"
              name="middle_initial"
              maxLength={1}
              value={formData.middle_initial}
              onChange={handleInputChange}
              className={`input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent rounded-lg ${
                errors.middle_initial ? "border-error" : ""
              }`}
              placeholder="Enter middle initial"
              autoComplete="additional-name"
            />
            {errors.middle_initial && (
              <p className="text-sm text-error mt-1">{errors.middle_initial}</p>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="last_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className={`input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent rounded-lg ${
                errors.last_name ? "border-error" : ""
              }`}
              placeholder="Enter your last name"
              autoComplete="family-name"
            />
            {errors.last_name && <p className="text-sm text-error mt-1">{errors.last_name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="suffix" className="block text-sm font-medium text-gray-700 mb-1">
              Suffix
            </label>
            <select
              id="suffix"
              name="suffix"
              value={formData.suffix}
              onChange={handleInputChange}
              className="select select-bordered w-full rounded-lg"
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

          <div className="form-group md:col-span-2">
            <label
              htmlFor="contact_number"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contact Number <span className="text-error">*</span>
            </label>
            <input
              type="tel"
              id="contact_number"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleInputChange}
              className={`input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent rounded-lg ${
                errors.contact_number ? "border-error" : ""
              }`}
              placeholder="e.g. 09123456789"
              autoComplete="tel"
            />
            {errors.contact_number && (
              <p className="text-sm text-error mt-1">{errors.contact_number}</p>
            )}
            <small className="text-sm text-quickaid-text-secondary">
              Enter your 11-digit mobile number
            </small>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="bg-quickaid-accent hover:bg-teal-600 text-white rounded-lg px-4 py-2 inline-flex items-center gap-2"
          >
            Continue to Address <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step1;
