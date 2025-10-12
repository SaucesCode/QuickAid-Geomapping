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
    window.scrollTo({ top: 0, behavior: "smooth" }); // 👈 Scrolls up smoothly
    nextStep();
  }
};


  const handleInputChange = (e) => {
  const { name, value, type } = e.target;

  // ✅ Allow numbers but prevent negatives or leading zeros
  if (type === "number") {
    if (value === "") {
      handleChange(e);
      return;
    }
    const numValue = parseFloat(value);
    if (numValue < 0) return;
    if (value.startsWith("0") && value.length > 1) return;
  }

  // 🟦 Auto-capitalize first letter for occupation
  if (name === "occupation") {
    const formattedValue =
      value.charAt(0).toUpperCase() + value.slice(1);
    handleChange({ target: { name, value: formattedValue } });
  }
  // 🟩 Auto-format street_address (Title Case + allow spaces)
  else if (name === "street_address") {
    // Keep spaces as user types
    const formattedValue = value
      .split(" ")
      .map((word) =>
        word.length > 0
          ? word.charAt(0).toUpperCase() + word.slice(1)
          : ""
      )
      .join(" ");
    handleChange({ target: { name, value: formattedValue } });
  }
  // 🟨 Default for other fields
  else {
    handleChange(e);
  }

  // ✅ Clear field errors
  if (errors[name]) {
    setErrors((prev) => ({ ...prev, [name]: null }));
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-500 px-8 py-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">
                Address & Personal Details
              </h2>
            </div>
            <p className="text-blue-50 text-base leading-relaxed">
              Please provide your address and additional personal information. All fields marked with{" "}
              <span className="text-white font-semibold bg-white/20 px-1.5 py-0.5 rounded">*</span>{" "}
              are required.
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleNext} noValidate className="p-8">
            {/* Address Information Section */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Address Information
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="form-group">
                  <AddressDropdown onSelect={handleAddressSelect} initialValues={formData} />
                  {(errors.barangay || errors.city_municipality) && (
                    <div className="mt-2 space-y-1">
                      {errors.barangay && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm text-red-600 font-medium">{errors.barangay}</p>
                        </div>
                      )}
                      {errors.city_municipality && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm text-red-600 font-medium">{errors.city_municipality}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label
                    htmlFor="street_address"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="street_address"
                      name="street_address"
                      value={formData.street_address || ""}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                        errors.street_address
                          ? "border-red-400 bg-red-50 focus:border-red-500"
                          : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                      }`}
                      placeholder="Enter your street/purok"
                      required
                    />
                    {formData.street_address && !errors.street_address && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.street_address && (
                    <div className="flex items-center gap-1 mt-2">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-600 font-medium">{errors.street_address}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Personal Details Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Personal Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date of Birth */}
                <div className="form-group">
                  <label
                    htmlFor="birthday"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Date of Birth (Day/Month/Year) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="birthday"
                      name="birthday"
                      value={formData.birthday || ""}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                        errors.birthday
                          ? "border-red-400 bg-red-50 focus:border-red-500"
                          : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                      }`}
                      required
                    />
                    {formData.birthday && !errors.birthday && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.birthday && (
                    <div className="flex items-center gap-1 mt-2">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-600 font-medium">{errors.birthday}</p>
                    </div>
                  )}
                </div>

                {/* Sex */}
                <div className="form-group">
                  <label htmlFor="sex" className="block text-sm font-semibold text-gray-700 mb-2">
                    Sex <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="sex"
                      name="sex"
                      value={formData.sex || ""}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl appearance-none bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer ${
                        errors.sex
                          ? "border-red-400 bg-red-50 focus:border-red-500"
                          : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                      }`}
                      required
                    >
                      <option value="">Select Sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.sex && (
                    <div className="flex items-center gap-1 mt-2">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-600 font-medium">{errors.sex}</p>
                    </div>
                  )}
                </div>

                {/* Civil Status */}
                <div className="form-group">
                  <label
                    htmlFor="civil_status"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Civil Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="civil_status"
                      name="civil_status"
                      value={formData.civil_status || ""}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl appearance-none bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer ${
                        errors.civil_status
                          ? "border-red-400 bg-red-50 focus:border-red-500"
                          : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
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
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.civil_status && (
                    <div className="flex items-center gap-1 mt-2">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-600 font-medium">{errors.civil_status}</p>
                    </div>
                  )}
                </div>

                {/* Occupation */}
                <div className="form-group">
                  <label
                    htmlFor="occupation"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Occupation (None if none) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="occupation"
                      name="occupation"
                      value={formData.occupation || ""}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                        errors.occupation
                          ? "border-red-400 bg-red-50 focus:border-red-500"
                          : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                      }`}
                      placeholder="Enter your occupation"
                      required
                    />
                    {formData.occupation && !errors.occupation && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.occupation && (
                    <div className="flex items-center gap-1 mt-2">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-600 font-medium">{errors.occupation}</p>
                    </div>
                  )}
                </div>

                {/* Monthly Income */}
                <div className="form-group">
                  <label
                    htmlFor="monthly_income"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Monthly Income (PHP) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
                      <span className="text-gray-400 font-semibold">₱</span>
                    </div>
                    <input
                      type="number"
                      id="monthly_income"
                      name="monthly_income"
                      value={formData.monthly_income || ""}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                        errors.monthly_income
                          ? "border-red-400 bg-red-50 focus:border-red-500"
                          : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                      }`}
                      min="0"
                      placeholder="e.g. 15000"
                      required
                    />
                    {formData.monthly_income !== "" && formData.monthly_income !== null && formData.monthly_income !== undefined && !errors.monthly_income && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.monthly_income && (
                    <div className="flex items-center gap-1 mt-2">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-600 font-medium">{errors.monthly_income}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={prevStep}
                className="group inline-flex items-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl px-6 py-3 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="group relative bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white font-semibold rounded-xl px-8 py-3.5 inline-flex items-center gap-3 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <span>Continue to Assistance</span>
                <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step2;