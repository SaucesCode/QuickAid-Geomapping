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
      if (!formData.rep_contact_number?.trim()) {
        newErrors.rep_contact_number =
          "Kailangan ang Contact Number (Contact number is required)";
      } else if (!/^[0-9]{11}$/.test(formData.rep_contact_number)) {
        newErrors.rep_contact_number =
          "Pakilagay ang wastong 11-digit na mobile number (Please enter a valid 11-digit mobile number)";
      }
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
  const handleRepContactChange = e => {
    const cleanedValue = e.target.value.replace(/\D/g, "").slice(0, 11);

    handleChange({
      target: { name: "rep_contact_number", value: cleanedValue },
    });

    // Clear errors when typing
    if (errors.rep_contact_number) {
      setErrors(prev => ({ ...prev, rep_contact_number: null }));
    }
  };

  return (
    // Responsive: Outer container padding ensures space on all screens
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-6 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-[#003a76] px-6 py-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">ID & Assistance Details</h2>
            </div>
            <p className="text-blue-50 text-sm leading-relaxed">
              Please provide your identification and assistance information. Fields marked with{" "}
              <span className="text-white font-semibold bg-white/20 px-1.5 py-0.5 rounded">
                *
              </span>{" "}
              are required.(Ang lahat ng field na may markang * ay kinakailangan.)
            </p>
          </div>

          <form onSubmit={handleNext} noValidate className="p-6">
            {/* Valid ID Information Section - Responsive grid: 1 col on mobile, 2 on md, 3 on lg */}
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Valid ID Information</h3>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-4 font-medium">
                  Select one valid ID <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                    <label
                      key={id}
                      className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        formData.valid_id_presented === id
                          ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/20"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="valid_id_presented"
                        value={id}
                        checked={formData.valid_id_presented === id}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue500 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <span className="text-sm font-medium text-gray-700">{id}</span>
                    </label>
                  ))}

                  <div className="flex flex-col">
                    <label
                      className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        formData.valid_id_presented === "Others"
                          ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/20"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="valid_id_presented"
                        value="Others"
                        checked={formData.valid_id_presented === "Others"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue500 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <span className="text-sm font-medium text-gray-700">Others</span>
                    </label>
                    {formData.valid_id_presented === "Others" && (
                      <div className="mt-2">
                        <input
                          type="text"
                          name="other_valid_id"
                          placeholder="Specify ID"
                          value={formData.other_valid_id || ""}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                            errors.other_valid_id
                              ? "border-red-400 bg-red-50 focus:border-red-500"
                              : "border-gray-200 focus:border-blue-500"
                          }`}
                          required
                        />
                        {errors.other_valid_id && (
                          <div className="flex items-center gap-1 mt-1">
                            <svg
                              className="w-4 h-4 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <p className="text-sm text-red-600 font-medium">
                              {errors.other_valid_id}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {errors.valid_id_presented && (
                  <div className="flex items-center gap-1 mt-3">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-red-600 font-medium">
                      {errors.valid_id_presented}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Assistance Type Section */}
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Type of Assistance</h3>
              </div>

              <div className="form-group">
                <label
                  htmlFor="type_of_assistance"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Select Assistance Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="type_of_assistance"
                    name="type_of_assistance"
                    value={formData.type_of_assistance}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border-2 rounded-xl appearance-none bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer ${
                      errors.type_of_assistance
                        ? "border-red-400 bg-red-50 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                    }`}
                    required
                  >
                    <option value="" disabled>
                      Select assistance type
                    </option>
                    <option value="Medical">Medical</option>
                    <option value="Burial">Burial</option>
                    <option value="Educational">Educational</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.type_of_assistance && (
                  <div className="flex items-center gap-1 mt-2">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-red-600 font-medium">
                      {errors.type_of_assistance}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Applicant Information Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Applicant Type</h3>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-6 mb-6">
                <p className="text-gray-700 font-semibold mb-4">
                  Are you applying for yourself or someone else?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label
                    className={`flex-1 flex items-center justify-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      formData.applicant_type === "Self"
                        ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/20"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="applicant_type"
                      value="Self"
                      checked={formData.applicant_type === "Self"}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-500 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <span className="font-semibold text-gray-700">Self</span>
                  </label>
                  <label
                    className={`flex-1 flex items-center justify-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      formData.applicant_type === "Representative"
                        ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/20"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="applicant_type"
                      value="Representative"
                      checked={formData.applicant_type === "Representative"}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-500 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <span className="font-semibold text-gray-700">Representative</span>
                  </label>
                </div>
              </div>

              {formData.applicant_type === "Representative" && (
                <div className="border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-6">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <h4 className="text-lg font-bold text-gray-800">
                      Representative Information
                    </h4>
                  </div>

                  {/* Responsive grid: 1 col on mobile, 2 on md, 3 on lg */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Representative First Name */}
                    <div className="form-group">
                      <label
                        htmlFor="rep_first_name"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        First Name (Unang Pangalan)<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="rep_first_name"
                          name="rep_first_name"
                          value={formData.rep_first_name || ""}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                            errors.rep_first_name
                              ? "border-red-400 bg-red-50 focus:border-red-500"
                              : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                          }`}
                          placeholder="Enter first name"
                          required
                        />
                        {formData.rep_first_name && !errors.rep_first_name && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <svg
                              className="w-5 h-5 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      {errors.rep_first_name && (
                        <div className="flex items-center gap-1 mt-2">
                          <svg
                            className="w-4 h-4 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-sm text-red-600 font-medium">
                            {errors.rep_first_name}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Representative Last Name */}
                    <div className="form-group">
                      <label
                        htmlFor="rep_last_name"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Last Name (Apelyido) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="rep_last_name"
                          name="rep_last_name"
                          value={formData.rep_last_name || ""}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                            errors.rep_last_name
                              ? "border-red-400 bg-red-50 focus:border-red-500"
                              : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                          }`}
                          placeholder="Enter last name"
                          required
                        />
                        {formData.rep_last_name && !errors.rep_last_name && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <svg
                              className="w-5 h-5 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      {errors.rep_last_name && (
                        <div className="flex items-center gap-1 mt-2">
                          <svg
                            className="w-4 h-4 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-sm text-red-600 font-medium">
                            {errors.rep_last_name}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Representative Middle Name */}
                    <div className="form-group">
                      <label
                        htmlFor="rep_middle_name"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Middle Name (Gitnang Pangalan)
                      </label>
                      <input
                        type="text"
                        id="rep_middle_name"
                        name="rep_middle_name"
                        value={formData.rep_middle_name || ""}
                        onChange={e => {
                          const value = e.target.value;
                          const formatted =
                            value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                          handleChange({
                            target: { name: "rep_middle_name", value: formatted },
                          });
                        }}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300"
                        placeholder="Enter full middle name "
                      />
                    </div>

                    {/* Representative Suffix */}
                    <div className="form-group">
                      <label
                        htmlFor="rep_suffix"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Suffix
                      </label>
                      <div className="relative">
                        <select
                          id="rep_suffix"
                          name="rep_suffix"
                          value={formData.rep_suffix || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl appearance-none bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 cursor-pointer"
                        >
                          <option value="">None</option>
                          <option value="Jr.">Jr.</option>
                          <option value="Sr.">Sr.</option>
                          <option value="I">I</option>
                          <option value="II">II</option>
                          <option value="III">III</option>
                          <option value="IV">IV</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor="rep_contact_number"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Contact Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        {/* Phone Icon */}
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <input
                          type="tel"
                          id="rep_contact_number"
                          name="rep_contact_number"
                          value={formData.rep_contact_number || ""}
                          onChange={handleRepContactChange}
                          inputMode="numeric"
                          maxLength="11"
                          className={`w-full h-11 pl-11 pr-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${
                            errors.rep_contact_number
                              ? "border-red-400 bg-red-50 focus:border-red-500"
                              : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                          }`}
                          placeholder="e.g. 09123456789"
                          autoComplete="tel"
                          required
                        />
                        {/* blue Checkmark - shown when valid */}
                        {formData.rep_contact_number &&
                          !errors.rep_contact_number &&
                          formData.rep_contact_number.length === 11 && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <svg
                                className="w-4 h-4 text-blue-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                      </div>
                      {/* Fixed space for error/help messages */}
                      <div className="h-6 flex items-start">
                        {errors.rep_contact_number ? (
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-3.5 h-3.5 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <p className="text-2xs text-red-600 font-medium">
                              {errors.rep_contact_number}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-3.5 h-3.5 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <small className="text-2xs text-gray-500">
                              Enter your 11-digit mobile number (Ilagay ang iyong 11-digit na
                              mobile number)
                            </small>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Representative Address - FIX: Ensures address field spans full width on md (2-col) and lg (3-col) */}
                    <div className="form-group md:col-span-2 lg:col-span-3">
                      <label
                        htmlFor="rep_address"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Address (Tirahan) <span className="text-red-500">*</span>
                      </label>
                      <label className="flex items-center mb-3 space-x-2 cursor-pointer group">
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
                          className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                          Same as applicant's address (Kagaya ng tirahan ng aplikante)
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="rep_address"
                          name="rep_address"
                          value={formData.rep_address || ""}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                            errors.rep_address
                              ? "border-red-400 bg-red-50 focus:border-red-500"
                              : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                          } ${
                            formData.use_same_address ? "bg-gray-100 cursor-not-allowed" : ""
                          }`}
                          placeholder="Enter complete address"
                          required
                          disabled={formData.use_same_address}
                        />
                        {formData.rep_address &&
                          !errors.rep_address &&
                          !formData.use_same_address && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <svg
                                className="w-5 h-5 text-blue-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                      </div>
                      {errors.rep_address && (
                        <div className="flex items-center gap-1 mt-2">
                          <svg
                            className="w-4 h-4 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-sm text-red-600 font-medium">
                            {errors.rep_address}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Representative Birthday */}
                    <div className="form-group">
                      <label
                        htmlFor="rep_birthday"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Birthday (Kaarawan) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="rep_birthday"
                          name="rep_birthday"
                          value={formData.rep_birthday || ""}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                            errors.rep_birthday
                              ? "border-red-400 bg-red-50 focus:border-red-500"
                              : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                          }`}
                          required
                        />
                        {formData.rep_birthday && !errors.rep_birthday && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <svg
                              className="w-5 h-5 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      {errors.rep_birthday && (
                        <div className="flex items-center gap-1 mt-2">
                          <svg
                            className="w-4 h-4 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-sm text-red-600 font-medium">
                            {errors.rep_birthday}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Representative Gender */}
                    <div className="form-group">
                      <label
                        htmlFor="rep_gender"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Sex (Kasarian) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="rep_gender"
                          name="rep_gender"
                          value={formData.rep_gender || ""}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 border-2 rounded-xl appearance-none bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer ${
                            errors.rep_gender
                              ? "border-red-400 bg-red-50 focus:border-red-500"
                              : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                          }`}
                          required
                        >
                          <option value="" disabled>
                            Select Sex(Mamili ng Kasarian)
                          </option>
                          <option value="Male">Male(Lalaki)</option>
                          <option value="Female">Female(Babae)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                      {errors.rep_gender && (
                        <div className="flex items-center gap-1 mt-2">
                          <svg
                            className="w-4 h-4 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-sm text-red-600 font-medium">
                            {errors.rep_gender}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Representative Civil Status */}
                    <div className="form-group">
                      <label
                        htmlFor="rep_civil_status"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Civil Status (Katayuang Sibil) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="rep_civil_status"
                          name="rep_civil_status"
                          value={formData.rep_civil_status || ""}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 border-2 rounded-xl appearance-none bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer ${
                            errors.rep_civil_status
                              ? "border-red-400 bg-red-50 focus:border-red-500"
                              : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                          }`}
                          required
                        >
                          <option value="" disabled>
                            Select Civil Status(Pumili ng Katayuang Sibil)
                          </option>
                          <option value="Single">Single(Walang Asawa)</option>
                          <option value="Married">Married(Kasal)</option>
                          <option value="Widowed">Widowed(Balo)</option>
                          <option value="Separated">Separated(Hiwalay)</option>
                          <option value="Divorced">Divorced(Diborsiyado)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                      {errors.rep_civil_status && (
                        <div className="flex items-center gap-1 mt-2">
                          <svg
                            className="w-4 h-4 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-sm text-red-600 font-medium">
                            {errors.rep_civil_status}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Representative Occupation */}
                    <div className="form-group">
                      <label
                        htmlFor="rep_occupation"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Occupation (Trabaho)
                      </label>
                      <input
                        type="text"
                        id="rep_occupation"
                        name="rep_occupation"
                        value={formData.rep_occupation || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300"
                        placeholder="Enter occupation"
                      />
                    </div>

                    {/* Representative Monthly Income */}
                    <div className="form-group">
                      <label
                        htmlFor="rep_monthly_income"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Monthly Income (Buwanang Kita)
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
                          <span className="text-gray-400 font-semibold">₱</span>
                        </div>
                        <input
                          type="number"
                          id="rep_monthly_income"
                          name="rep_monthly_income"
                          value={formData.rep_monthly_income || ""}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300"
                          placeholder="Enter monthly income"
                        />
                      </div>
                    </div>

                    {/* Representative Relationship */}
                    <div className="form-group">
                      <label
                        htmlFor="rep_relationship"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Relationship to Beneficiary <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="rep_relationship"
                          name="rep_relationship"
                          value={formData.rep_relationship || ""}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                            errors.rep_relationship
                              ? "border-red-400 bg-red-50 focus:border-red-500"
                              : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                          }`}
                          placeholder="Enter relationship"
                          required
                        />
                        {formData.rep_relationship && !errors.rep_relationship && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <svg
                              className="w-5 h-5 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      {errors.rep_relationship && (
                        <div className="flex items-center gap-1 mt-2">
                          <svg
                            className="w-4 h-4 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-sm text-red-600 font-medium">
                            {errors.rep_relationship}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Navigation Buttons - FIX: Use flex-col and w-full on mobile, revert on sm: */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={prevStep}
                className="w-full sm:w-auto group inline-flex items-center justify-center sm:justify-start gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl px-4 py-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                <svg
                  className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 17l-5-5m0 0l5-5m-5 5h12"
                  />
                </svg>
                <span>Back(Bumalik)</span>
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto group relative bg-[#003a76] hover:to-blue-600 text-white font-semibold rounded-xl px-6 py-2.5 inline-flex items-center justify-center sm:justify-start gap-3 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                <span className="text-white">Continue to Preview(Magpatuloy)</span>
                <svg
                  className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        {/* <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team for assistance. (Kailangan ng tulong? Kontakin
            ang aming support team.)
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default Step3;
