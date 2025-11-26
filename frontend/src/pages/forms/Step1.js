import { useState } from "react";

// Filipino-English Hybrid Translations
const T = {
  // Main Header
  headerTitle: "Personal Information (Impormasyon ng Sarili)",
  headerSubtitle: "Please provide your basic personal details. All fields marked with",
  requiredNote: "are required. (Ang lahat ng field na may markang * ay kinakailangan.)",

  // Form Labels
  firstName: "First Name (Unang Pangalan)",
  middleInitial: "Middle Initial (Gitnang Pangalan)",
  lastName: "Last Name (Apelyido)",
  // FIX 1: New keys to clearly separate label and default option text
  suffixLabel: "Suffix ",
  suffixDefault: "None/Wala",
  contactNumber: "Contact Number",

  // Placeholders/Help/Errors
  placeholderFirstName: "Enter your first name (e.g., Juan)",
  placeholderMiddleInitial: "Enter your middle initial (e.g., M.)",
  placeholderLastName: "Enter your last name (e.g., Dela Cruz)",
  placeholderContact: "e.g. 09123456789",
  helpText: "Enter your 11-digit mobile number (Ilagay ang iyong 11-digit na mobile number)",
  continue: "Continue to Address (Magpatuloy sa Tirahan)",
  footerHelp:
    "Need help? Contact our support team for assistance. (Kailangan ng tulong? Kontakin ang aming support team.)",

  errorFirstName: "Kailangan ang Unang Pangalan (First name is required)",
  errorLastName: "Kailangan ang Apelyido (Last name is required)",
  errorContactRequired: "Kailangan ang Contact Number (Contact number is required)",
  errorContactInvalid:
    "Pakilagay ang wastong 11-digit na mobile number (Please enter a valid 11-digit mobile number)",
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

    if (!formData.contact_number?.trim()) {
      newErrors.contact_number = T.errorContactRequired;
    } else if (!/^[0-9]{11}$/.test(formData.contact_number)) {
      newErrors.contact_number = T.errorContactInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    e.stopPropagation();

    if (validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      nextStep();
    }
  };

  const handleInputChange = e => {
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
        .map(word => (word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
        .join(" ");
      handleChange({ target: { name, value: formattedValue } });
    }
    // Default for other fields (e.g., suffix)
    else {
      handleChange(e);
    }

    // Clear field errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-6 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* HEADER SECTION */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-500 px-6 py-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
              </div>
              <h2 className="text-2xl font-bold text-white">{T.headerTitle}</h2>
            </div>
            <p className="text-sm text-blue-50 leading-relaxed">
              {T.headerSubtitle}{" "}
              <span className="text-white font-semibold bg-white/20 px-1 py-0.5 rounded">
                *
              </span>{" "}
              {T.requiredNote}
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} noValidate className="p-6">
            {/* 3-COLUMN LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
              {/* First Name (1/3) */}
              <div className="flex flex-col">
                <label
                  htmlFor="first_name"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  {T.firstName} <span className="text-blue-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name || ""}
                    onChange={handleInputChange}
                    // FIX: py-0 and leading-10 guarantee text is vertically centered in 40px box.
                    className={`w-full h-11 px-3 border-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200 ${
                      errors.first_name
                        ? "border-blue-300 bg-blue-50/50 focus:border-blue-500 text-blue-900"
                        : "border-slate-200 focus:border-blue-500 hover:border-slate-300 bg-white"
                    }`}
                    placeholder={T.placeholderFirstName}
                    autoComplete="given-name"
                    required
                  />
                  {formData.first_name && !errors.first_name && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="h-6 flex items-center mt-1.5">
                  {errors.first_name && (
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-xs text-blue-700 font-medium">{errors.first_name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Middle Initial (1/3) */}
              <div className="flex flex-col">
                <label
                  htmlFor="middle_initial"
                  className="block text-sm font-semibold text-gray-700 mb-2 whitespace-nowrap"
                >
                  {T.middleInitial}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="middle_initial"
                    name="middle_initial"
                    value={formData.middle_initial || ""}
                    onChange={handleInputChange}
                    // FIX: py-0 and leading-10 guarantee text is vertically centered in 40px box.
                    className={`w-full h-11 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.middle_initial
                        ? "border-red-400 bg-red-50 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                    }`}
                    placeholder={T.placeholderMiddleInitial}
                    autoComplete="additional-name"
                  />
                  {formData.middle_initial && !errors.middle_initial && (
                    // Reverted positioning to absolute for maximum stability
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
                {/* Fixed space for error messages (ensures alignment) */}
                <div className="h-6 flex items-start">
                  {errors.middle_initial && (
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
                        {errors.middle_initial}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Last Name (1/3) */}
              <div className="flex flex-col">
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
                    // FIX: py-0 and leading-10 guarantee text is vertically centered in 40px box.
                    className={`w-full h-11 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.last_name
                        ? "border-red-400 bg-red-50 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                    }`}
                    placeholder={T.placeholderLastName}
                    autoComplete="family-name"
                    required
                  />
                  {formData.last_name && !errors.last_name && (
                    // Reverted positioning to absolute for maximum stability
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
                {/* Fixed space for error messages (ensures alignment) */}
                <div className="h-6 flex items-start">
                  {errors.last_name && (
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
                      <p className="text-2xs text-red-600 font-medium">{errors.last_name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Suffix (1/3) */}
              <div className="flex flex-col">
                <label
                  htmlFor="suffix"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {/* FIX 1: Use the dedicated label text */}
                  {T.suffixLabel}
                </label>
                <div className="relative">
                  <select
                    id="suffix"
                    name="suffix"
                    value={formData.suffix || ""}
                    onChange={handleChange}
                    // FIX: py-0 and leading-10 guarantee text is vertically centered in 40px box.
                    className="w-full h-11 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {/* FIX 1: Use the dedicated default option text */}
                    <option value="">{T.suffixDefault}</option>
                    <option value="Jr.">Jr.</option>
                    <option value="Sr.">Sr.</option>
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                  </select>
                  {/* FIX 2: Removed the custom dropdown arrow (the "second dropdown") */}
                </div>
                {/* Fixed space for error/help messages (ensures alignment) */}
                <div className="h-6 flex items-start">
                  {/* This container remains empty for alignment */}
                </div>
              </div>

              {/* Contact Number (2/3) - Stays col-span-2 */}
              <div className="flex flex-col md:col-span-2">
                <label
                  htmlFor="contact_number"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {T.contactNumber} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {/* Reverted positioning to absolute for maximum stability */}
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
                    id="contact_number"
                    name="contact_number"
                    value={formData.contact_number || ""}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    maxLength="11"
                    // FIX 3: Changed 'px-3' to 'pl-11 pr-3' to prevent text from overlaying the icon.
                    className={`w-full h-11 pl-11 pr-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.contact_number
                        ? "border-red-400 bg-red-50 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                    }`}
                    placeholder={T.placeholderContact}
                    autoComplete="tel"
                    required
                  />
                  {formData.contact_number &&
                    !errors.contact_number &&
                    formData.contact_number.length === 11 && (
                      // Reverted positioning to absolute for maximum stability
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
                {/* Fixed space for error/help messages (ensures alignment) */}
                <div className="h-6 flex items-start">
                  {errors.contact_number ? (
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
                        {errors.contact_number}
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
                      <small className="text-2xs text-gray-500">{T.helpText}</small>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
              <button
                type="submit"
                className="group relative bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white text-sm font-semibold rounded-xl px-5 py-2.5 inline-flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <span className="text-white">{T.continue}</span>
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
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

        {/* Help Text */}
        {/* <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">{T.footerHelp}</p>
        </div> */}
      </div>
    </div>
  );
};

export default Step1;
