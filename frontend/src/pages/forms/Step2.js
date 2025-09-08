// File: frontend/src/forms/Step2.js
import React, { useState } from "react";
import AddressDropdown from "./AddressDropdown";

const Step2 = ({ formData, handleChange, nextStep, prevStep, setFormData }) => {
  const [errors, setErrors] = useState({});

  const handleAddressSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.barangay?.trim()) {
      newErrors.barangay = "Barangay is required";
    }
    if (!formData.city_municipality?.trim()) {
      newErrors.city_municipality = "City/Municipality is required";
    }
    if (!formData.street_address?.trim()) {
      newErrors.street_address = "Street address is required";
    }
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

    if (validateForm()) {
      nextStep();
    }
  };

  const handleInputChange = e => {
    const { name, value, type } = e.target;

    if (type === "number") {
      if (value === "") {
        handleChange(e);
        return;
      }
      const numValue = parseFloat(value);
      if (numValue < 0) return;
      if (value.startsWith("0") && value.length > 1) return;
    }

    handleChange(e);

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className="card bg-quickaid-surface rounded-xl shadow-md p-6 max-w-4xl mx-auto">
      <form onSubmit={handleNext} noValidate>
        {/* Address Information Section */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-quickaid-text-primary mb-4">
            Address Information
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="form-group">
              <AddressDropdown onSelect={handleAddressSelect} initialValues={formData} />
              {(errors.barangay || errors.city_municipality) && (
                <div className="mt-1 space-y-1">
                  {errors.barangay && <p className="text-sm text-error">{errors.barangay}</p>}
                  {errors.city_municipality && (
                    <p className="text-sm text-error">{errors.city_municipality}</p>
                  )}
                </div>
              )}
            </div>
            <div className="form-group mt-4">
              <label
                htmlFor="street_address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Street Address <span className="text-error">*</span>
              </label>
              <input
                type="text"
                id="street_address"
                name="street_address"
                value={formData.street_address || ""}
                onChange={handleInputChange}
                className={`input input-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent ${
                  errors.street_address ? "border-error" : ""
                }`}
                placeholder="Enter your street/purok"
                required
              />
              {errors.street_address && (
                <p className="text-sm text-error mt-1">{errors.street_address}</p>
              )}
            </div>
          </div>
        </section>

        {/* Personal Details Section */}
        <section>
          <h3 className="text-xl font-semibold text-quickaid-text-primary mb-4">
            Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label
                htmlFor="birthday"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date of Birth (Day/Month/Year) <span className="text-error">*</span>
              </label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={formData.birthday || ""}
                onChange={handleInputChange}
                className={`input input-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent ${
                  errors.birthday ? "border-error" : ""
                }`}
                required
              />
              {errors.birthday && <p className="text-sm text-error mt-1">{errors.birthday}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-1">
                Sex <span className="text-error">*</span>
              </label>
              <select
                id="sex"
                name="sex"
                value={formData.sex || ""}
                onChange={handleInputChange}
                className={`select select-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent ${
                  errors.sex ? "border-error" : ""
                }`}
                required
              >
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.sex && <p className="text-sm text-error mt-1">{errors.sex}</p>}
            </div>

            <div className="form-group">
              <label
                htmlFor="civil_status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Civil Status <span className="text-error">*</span>
              </label>
              <select
                id="civil_status"
                name="civil_status"
                value={formData.civil_status || ""}
                onChange={handleInputChange}
                className={`select select-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent ${
                  errors.civil_status ? "border-error" : ""
                }`}
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
                <p className="text-sm text-error mt-1">{errors.civil_status}</p>
              )}
            </div>

            <div className="form-group">
              <label
                htmlFor="occupation"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Occupation (None if none) <span className="text-error">*</span>
              </label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={formData.occupation || ""}
                onChange={handleInputChange}
                className={`input input-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent ${
                  errors.occupation ? "border-error" : ""
                }`}
                placeholder="Enter your occupation"
                required
              />
              {errors.occupation && (
                <p className="text-sm text-error mt-1">{errors.occupation}</p>
              )}
            </div>

            <div className="form-group">
              <label
                htmlFor="monthly_income"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Monthly Income (PHP) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                id="monthly_income"
                name="monthly_income"
                value={formData.monthly_income || ""}
                onChange={handleInputChange}
                className={`input input-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent ${
                  errors.monthly_income ? "border-error" : ""
                }`}
                min="0"
                placeholder="e.g. 15000"
                required
              />
              {errors.monthly_income && (
                <p className="text-sm text-error mt-1">{errors.monthly_income}</p>
              )}
            </div>
          </div>
        </section>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            className="btn btn-outline bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2"
          >
            <span aria-hidden="true" className="mr-2">
              ←
            </span>{" "}
            Back
          </button>
          <button
            type="submit"
            className="bg-quickaid-accent hover:bg-teal-600 text-white rounded-lg px-4 py-2"
          >
            Continue to Assistance{" "}
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2;
