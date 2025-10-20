// File: frontend/src/forms/Step1.js
import { useState } from "react";

// Filipino-English Hybrid Translations
const T = {
  // Header
  headerTitle: "Personal Information (Impormasyon ng Sarili)",
  headerSubtitle: "Please provide your basic personal details. All fields marked with",
  requiredNote: "are required. (Ang lahat ng field na may markang * ay kinakailangan.)",

  // Form Labels
  firstName: "First Name (Unang Pangalan)",
  // UPDATED: Middle Initial is now optional
  middleInitial: "Middle Initial (Gitnang Pangalan) - Optional", 
  lastName: "Last Name (Apelyido)",
  suffix: "Suffix (Sufiks)",
  contactNumber: "Contact Number",

  // Dropdown Options
  suffixNone: "None (Wala)",

  // Placeholders
  placeholderFirstName: "Enter your first name (e.g., Juan)",
  placeholderMiddleInitial: "Enter your middle initial (e.g., M.)",
  placeholderLastName: "Enter your last name (e.g., Dela Cruz)",
  placeholderContact: "e.g. 09123456789",
  helpText: "Enter your 11-digit mobile number (Ilagay ang iyong 11-digit na mobile number)",

  // Buttons
  continue: "Continue to Address (Magpatuloy sa Tirahan)",

  // Help/Footer Text
  footerHelp: "Need help? Contact our support team for assistance. (Kailangan ng tulong? Kontakin ang aming support team.)",

  // Validation Messages (Filipino is the primary error message)
  errorFirstName: "Kailangan ang Unang Pangalan (First name is required)",
  errorLastName: "Kailangan ang Apelyido (Last name is required)",
  // REMOVED: errorMiddleInitial is no longer needed as the field is optional
  errorContactRequired: "Kailangan ang Contact Number (Contact number is required)",
  errorContactInvalid: "Pakilagay ang wastong 11-digit na mobile number (Please enter a valid 11-digit mobile number)",
};


const Step1 = ({ formData, handleChange, nextStep }) => {
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name?.trim()) {
      newErrors.first_name = T.errorFirstName;
    }
    if (!formData.last_name?.trim()) {
      newErrors.last_name = T.errorLastName;
    }
    // 👇 REMOVED: This block makes the Middle Initial NOT required.
    /*
    if (!formData.middle_initial?.trim()) {
      newErrors.middle_initial = T.errorMiddleInitial;
    }
    */
    if (!formData.contact_number?.trim()) {
      newErrors.contact_number = T.errorContactRequired;
    } else if (!/^[0-9]{11}$/.test(formData.contact_number)) {
      newErrors.contact_number = T.errorContactInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" }); // 👈 Scrolls up smoothly
      nextStep();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Enforce only digits & limit to 11 numbers for contact_number
    if (name === "contact_number") {
      const cleanedValue = value.replace(/\D/g, "").slice(0, 11);
      handleChange({ target: { name, value: cleanedValue } });
    } 
    // Auto-capitalize first letter for name fields
    else if (["first_name", "last_name", "middle_initial"].includes(name)) {
      // Allow spaces (for composite names) but ensure title-casing
      const formattedValue = value
        .split(" ")
        .map(word =>
          word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ""
        )
        .join(" ");
      handleChange({ target: { name, value: formattedValue } });
    } 
    // Default for other fields (e.g., suffix)
    else {
      handleChange(e);
    }

    // Clear field errors
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">
                {T.headerTitle}
              </h2>
            </div>
            <p className="text-blue-50 text-base leading-relaxed">
              {T.headerSubtitle}{" "}
              <span className="text-white font-semibold bg-white/20 px-1.5 py-0.5 rounded">*</span>{" "}
              {T.requiredNote}
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} noValidate className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="form-group">
                <label
                  htmlFor="first_name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {T.firstName} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                      errors.first_name
                        ? "border-red-400 bg-red-50 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                    }`}
                    placeholder={T.placeholderFirstName}
                    autoComplete="given-name"
                    required
                  />
                  {formData.first_name && !errors.first_name && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.first_name && (
                  <div className="flex items-center gap-1 mt-2">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600 font-medium">{errors.first_name}</p>
                  </div>
                )}
              </div>

              {/* Middle Initial - NO LONGER REQUIRED */}
              <div className="form-group">
                <label
                  htmlFor="middle_initial"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {/* REMOVED: The required asterisk */}
                  {T.middleInitial} 
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="middle_initial"
                    name="middle_initial"
                    value={formData.middle_initial || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                      errors.middle_initial // This error check remains for display, though validation is gone
                        ? "border-red-400 bg-red-50 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                    }`}
                    placeholder={T.placeholderMiddleInitial}
                    autoComplete="additional-name"
                    // REMOVED: The HTML required attribute
                  />
                  {formData.middle_initial && !errors.middle_initial && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.middle_initial && (
                  <div className="flex items-center gap-1 mt-2">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600 font-medium">{errors.middle_initial}</p>
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div className="form-group">
                <label
                  htmlFor="last_name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {T.lastName} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                      errors.last_name
                        ? "border-red-400 bg-red-50 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                    }`}
                    placeholder={T.placeholderLastName}
                    autoComplete="family-name"
                    required
                  />
                  {formData.last_name && !errors.last_name && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.last_name && (
                  <div className="flex items-center gap-1 mt-2">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600 font-medium">{errors.last_name}</p>
                  </div>
                )}
              </div>

              {/* Suffix */}
              <div className="form-group">
                <label
                  htmlFor="suffix"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {T.suffix}
                </label>
                <div className="relative">
                  <select
                    id="suffix"
                    name="suffix"
                    value={formData.suffix || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl appearance-none bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 cursor-pointer"
                  >
                    <option value="">{T.suffixNone}</option>
                    <option value="Jr.">Jr.</option>
                    <option value="Sr.">Sr.</option>
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Contact Number */}
              <div className="form-group md:col-span-2">
                <label
                  htmlFor="contact_number"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {T.contactNumber} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    id="contact_number"
                    name="contact_number"
                    value={formData.contact_number || ""}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    maxLength="11"
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                      errors.contact_number
                        ? "border-red-400 bg-red-50 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                    }`}
                    placeholder={T.placeholderContact}
                    autoComplete="tel"
                    required
                  />
                  {formData.contact_number && !errors.contact_number && formData.contact_number.length === 11 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.contact_number && (
                  <div className="flex items-center gap-1 mt-2">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600 font-medium">
                      {errors.contact_number}
                    </p>
                  </div>
                )}
                {!errors.contact_number && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <small className="text-sm text-gray-500">
                      {T.helpText}
                    </small>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
              <button
                type="submit"
                className="group relative bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white font-semibold rounded-xl px-8 py-3.5 inline-flex items-center gap-3 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <span>{T.continue}</span>
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
            {T.footerHelp}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step1;