// File: frontend/src/forms/Step3.js
import React, { useState } from "react";

const Step3 = ({ formData, handleChange, nextStep, prevStep, setFormData }) => {
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.valid_id_presented) {
      newErrors.valid_id_presented = "Valid ID is required";
    }

    if (formData.valid_id_presented === "Others" && !formData.other_valid_id?.trim()) {
      newErrors.other_valid_id = "Please specify the ID type";
    }

    if (!formData.type_of_assistance) {
      newErrors.type_of_assistance = "Type of assistance is required";
    }

    if (formData.applicant_type === "Representative") {
      if (!formData.rep_first_name?.trim())
        newErrors.rep_first_name = "First name is required";
      if (!formData.rep_last_name?.trim()) newErrors.rep_last_name = "Last name is required";
      if (!formData.rep_address?.trim()) newErrors.rep_address = "Address is required";
      if (!formData.rep_birthday) newErrors.rep_birthday = "Birthday is required";
      if (!formData.rep_gender) newErrors.rep_gender = "Sex is required";
      if (!formData.rep_civil_status) newErrors.rep_civil_status = "Civil status is required";
      if (!formData.rep_relationship?.trim())
        newErrors.rep_relationship = "Relationship is required";
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
    <div className="card bg-quickaid-surface rounded-xl shadow-md p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-quickaid-text-primary mb-1">
          ID & Assistance Details
        </h2>
        <p className="text-sm text-quickaid-text-secondary">
          Please provide your identification and assistance information. Fields marked with{" "}
          <span className="text-error">*</span> are required.
        </p>
      </div>

      <form onSubmit={handleNext} noValidate>
        {/* Valid ID Information */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-quickaid-text-primary mb-4">
            Valid ID Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              "National ID",
              "Driver's License",
              "Voter's ID",
              "Passport",
              "SSS ID",
              "GSIS ID",
              "UMID",
              "PhilHealth ID",
              "TIN ID",
              "Postal ID",
              "Senior Citizen ID",
            ].map(id => (
              <label key={id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="valid_id_presented"
                  value={id}
                  checked={formData.valid_id_presented === id}
                  onChange={handleChange}
                  className="radio radio-primary"
                  required
                />
                <span className="text-quickaid-text-primary">{id}</span>
              </label>
            ))}

            <div className="flex flex-col">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="valid_id_presented"
                  value="Others"
                  checked={formData.valid_id_presented === "Others"}
                  onChange={handleChange}
                  className="radio radio-primary"
                  required
                />
                <span className="text-quickaid-text-primary">Others</span>
              </label>
              {formData.valid_id_presented === "Others" && (
                <input
                  type="text"
                  name="other_valid_id"
                  placeholder="Specify ID"
                  value={formData.other_valid_id || ""}
                  onChange={handleChange}
                  className={`input input-bordered mt-2 rounded-lg focus:ring-2 focus:ring-quickaid-accent ${
                    errors.other_valid_id ? "border-error" : ""
                  }`}
                  required
                />
              )}
              {errors.other_valid_id && (
                <p className="text-sm text-error mt-1">{errors.other_valid_id}</p>
              )}
            </div>
          </div>
          {errors.valid_id_presented && (
            <p className="text-sm text-error mt-2">{errors.valid_id_presented}</p>
          )}
        </section>

        {/* Assistance Type */}
        <section className="mb-8">
          <label
            htmlFor="type_of_assistance"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Type of Assistance <span className="text-error">*</span>
          </label>
          <select
            id="type_of_assistance"
            name="type_of_assistance"
            value={formData.type_of_assistance}
            onChange={handleChange}
            className={`select select-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent ${
              errors.type_of_assistance ? "border-error" : ""
            }`}
            required
          >
            <option value="">Select assistance type</option>
            <option value="Medical">Medical</option>
            <option value="Burial">Burial</option>
            <option value="Educational">Educational</option>
          </select>
          {errors.type_of_assistance && (
            <p className="text-sm text-error mt-1">{errors.type_of_assistance}</p>
          )}
        </section>

        {/* Applicant Information */}
        <section>
          <p className="text-quickaid-text-primary font-medium mb-3">
            Are you applying for yourself or someone else?
          </p>
          <div className="flex space-x-6 mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="applicant_type"
                value="Self"
                checked={formData.applicant_type === "Self"}
                onChange={handleChange}
                className="radio radio-primary"
                required
              />
              <span>Self</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="applicant_type"
                value="Representative"
                checked={formData.applicant_type === "Representative"}
                onChange={handleChange}
                className="radio radio-primary"
                required
              />
              <span>Representative</span>
            </label>
          </div>

          {formData.applicant_type === "Representative" && (
            <div className="border border-gray-200 rounded-xl p-6 shadow-md">
              <h4 className="text-lg font-semibold text-quickaid-text-primary mb-4">
                Representative Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Representative First Name */}
                <div className="form-group">
                  <label
                    htmlFor="rep_first_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="rep_first_name"
                    name="rep_first_name"
                    value={formData.rep_first_name || ""}
                    onChange={handleChange}
                    className={`input input-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent ${
                      errors.rep_first_name ? "border-error" : ""
                    }`}
                    placeholder="Enter first name"
                    required
                  />
                  {errors.rep_first_name && (
                    <p className="text-sm text-error mt-1">{errors.rep_first_name}</p>
                  )}
                </div>

                {/* Representative Last Name */}
                <div className="form-group">
                  <label
                    htmlFor="rep_last_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="rep_last_name"
                    name="rep_last_name"
                    value={formData.rep_last_name || ""}
                    onChange={handleChange}
                    className={`input input-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent ${
                      errors.rep_last_name ? "border-error" : ""
                    }`}
                    placeholder="Enter last name"
                    required
                  />
                  {errors.rep_last_name && (
                    <p className="text-sm text-error mt-1">{errors.rep_last_name}</p>
                  )}
                </div>

                {/* Representative Middle Initial */}
                <div className="form-group">
                  <label
                    htmlFor="rep_middle_initial"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Middle Initial
                  </label>
                  <input
                    type="text"
                    id="rep_middle_initial"
                    name="rep_middle_initial"
                    maxLength={1}
                    value={formData.rep_middle_initial || ""}
                    onChange={handleChange}
                    className="input input-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent"
                    placeholder="Enter middle initial"
                  />
                </div>

                {/* Representative Suffix */}
                <div className="form-group">
                  <label
                    htmlFor="rep_suffix"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Suffix
                  </label>
                  <select
                    id="rep_suffix"
                    name="rep_suffix"
                    value={formData.rep_suffix || ""}
                    onChange={handleChange}
                    className="select select-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent"
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

                {/* Representative Address */}
                <div className="form-group md:col-span-2">
                  <label
                    htmlFor="rep_address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address <span className="text-error">*</span>
                  </label>
                  <label className="flex items-center mb-2 space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="use_same_address"
                      checked={formData.use_same_address}
                      onChange={e => {
                        const newValue = e.target.checked;
                        setFormData(prev => ({
                          ...prev,
                          use_same_address: newValue,
                          rep_address: newValue
                            ? `${prev.street_address}, ${prev.barangay_name}, ${prev.city_municipality}, ${prev.province}`
                            : "",
                        }));
                      }}
                      className="checkbox checkbox-primary"
                    />
                    <span className="text-quickaid-text-primary">
                      Same as applicant's address
                    </span>
                  </label>
                  <input
                    type="text"
                    id="rep_address"
                    name="rep_address"
                    value={formData.rep_address || ""}
                    onChange={handleChange}
                    className={`input input-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent ${
                      errors.rep_address ? "border-error" : ""
                    }`}
                    placeholder="Enter complete address"
                    required
                    disabled={formData.use_same_address}
                  />
                  {errors.rep_address && (
                    <p className="text-sm text-error mt-1">{errors.rep_address}</p>
                  )}
                </div>

                {/* Representative Birthday */}
                <div className="form-group">
                  <label
                    htmlFor="rep_birthday"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Birthday <span className="text-error">*</span>
                  </label>
                  <input
                    type="date"
                    id="rep_birthday"
                    name="rep_birthday"
                    value={formData.rep_birthday || ""}
                    onChange={handleChange}
                    className={`input input-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent ${
                      errors.rep_birthday ? "border-error" : ""
                    }`}
                    required
                  />
                  {errors.rep_birthday && (
                    <p className="text-sm text-error mt-1">{errors.rep_birthday}</p>
                  )}
                </div>

                {/* Representative Gender */}
                <div className="form-group">
                  <label
                    htmlFor="rep_gender"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sex <span className="text-error">*</span>
                  </label>
                  <select
                    id="rep_gender"
                    name="rep_gender"
                    value={formData.rep_gender || ""}
                    onChange={handleChange}
                    className={`select select-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent ${
                      errors.rep_gender ? "border-error" : ""
                    }`}
                    required
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.rep_gender && (
                    <p className="text-sm text-error mt-1">{errors.rep_gender}</p>
                  )}
                </div>

                {/* Representative Civil Status */}
                <div className="form-group">
                  <label
                    htmlFor="rep_civil_status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Civil Status <span className="text-error">*</span>
                  </label>
                  <select
                    id="rep_civil_status"
                    name="rep_civil_status"
                    value={formData.rep_civil_status || ""}
                    onChange={handleChange}
                    className={`select select-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent ${
                      errors.rep_civil_status ? "border-error" : ""
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
                  {errors.rep_civil_status && (
                    <p className="text-sm text-error mt-1">{errors.rep_civil_status}</p>
                  )}
                </div>

                {/* Representative Occupation */}
                <div className="form-group">
                  <label
                    htmlFor="rep_occupation"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Occupation
                  </label>
                  <input
                    type="text"
                    id="rep_occupation"
                    name="rep_occupation"
                    value={formData.rep_occupation || ""}
                    onChange={handleChange}
                    className="input input-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent"
                    placeholder="Enter occupation"
                  />
                </div>

                {/* Representative Monthly Income */}
                <div className="form-group">
                  <label
                    htmlFor="rep_monthly_income"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Monthly Income
                  </label>
                  <input
                    type="number"
                    id="rep_monthly_income"
                    name="rep_monthly_income"
                    value={formData.rep_monthly_income || ""}
                    onChange={handleChange}
                    className="input input-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent"
                    placeholder="Enter monthly income"
                  />
                </div>

                {/* Representative Relationship */}
                <div className="form-group">
                  <label
                    htmlFor="rep_relationship"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Relationship to Beneficiary <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="rep_relationship"
                    name="rep_relationship"
                    value={formData.rep_relationship || ""}
                    onChange={handleChange}
                    className={`input input-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent ${
                      errors.rep_relationship ? "border-error" : ""
                    }`}
                    placeholder="Enter relationship"
                    required
                  />
                  {errors.rep_relationship && (
                    <p className="text-sm text-error mt-1">{errors.rep_relationship}</p>
                  )}
                </div>
              </div>
            </div>
          )}
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
            Continue to Preview{" "}
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step3;
