// File: frontend/src/forms/PreviewStep.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitApplicant } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import CustomToast from "../../components/CustomToast";

const PreviewStep = ({ formData, prevStep, staffRef }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });
  const [cancelModal, setCancelModal] = useState({ show: false });
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await submitApplicant({ ...formData, staff_ref_code: staffRef });
      setSubmitSuccess(true);
      navigate("/print", { state: { applicant: data } });
      toast.custom(t => <CustomToast t={t} type="submit" />, {
        duration: 4000,
        position: "top-right",
      });
    } catch (error) {
      console.error("Submission Error:", error);
      let errorMessage = "Submission failed: ";

      if (error.response) {
        const data = error.response.data;

        // ✅ Handle array-based errors
        if (Array.isArray(data)) {
          errorMessage = data.join("\n");
        }
        // ✅ Handle object-based errors (Django/DRF style)
        else if (typeof data === "object") {
          errorMessage +=
            data.error ||
            data.detail ||
            Object.values(data).flat().join("\n") ||
            " Please try again.";
        }
        // ✅ Handle string error directly
        else if (typeof data === "string") {
          errorMessage = data;
        } else {
          errorMessage += " Please try again.";
        }
      } else if (error.request) {
        errorMessage += "No response from server. Please check your connection.";
      } else {
        errorMessage += error.message || " Please try again.";
      }

      setErrorModal({ show: true, message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setCancelModal({ show: true });
  };

  const confirmCancel = () => {
    setCancelModal({ show: false });
    prevStep();
  };

  const getFullName = () => {
    let name = formData.first_name;
    if (formData.middle_initial) name += ` ${formData.middle_initial}.`;
    name += ` ${formData.last_name}`;
    if (formData.suffix) name += ` ${formData.suffix}`;
    return name;
  };

  const getFullAddress = () => {
    // Note: Assuming barangay_name, city_municipality, and province exist from Step 2
    const parts = [
      formData.street_address,
      formData.barangay_name,
      formData.city_municipality,
      formData.province,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const formatCurrency = value => {
    if (!value && value !== 0) return "N/A";
    return `₱${parseFloat(value).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    // Responsive padding and minimum height
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-6 px-4 md:py-12 md:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section (Reduced padding and font size) */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-500 px-4 sm:px-8 py-6 sm:py-8">
            <div className="flex items-center gap-3 mb-2">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Review Applicant Details (Huling Pagsusuri)
              </h2>
            </div>
            <p className="text-blue-50 text-sm leading-relaxed">
              Please verify all information before submitting. Make sure everything is correct.
            </p>
          </div>

          {/* Content Section (Reduced padding and spacing) */}
          <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* Personal Information */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
              </div>
              {/* Data Grid (Reduced Gap, Reduced Font Size) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 sm:p-6">
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Full Name
                  </div>
                  <div className="text-base font-medium text-gray-800">{getFullName()}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Birthday
                  </div>
                  <div className="text-base font-medium text-gray-800">
                    {formData.birthday}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Sex
                  </div>
                  <div className="text-base font-medium text-gray-800">{formData.sex}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Civil Status
                  </div>
                  <div className="text-base font-medium text-gray-800">
                    {formData.civil_status}
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200"></div>

            {/* Contact Information */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-cyan-600"
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
                <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>
              </div>
              {/* Data Grid (Reduced Gap, Reduced Font Size) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 sm:p-6">
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Contact Number
                  </div>
                  <div className="text-base font-medium text-gray-800">
                    {formData.contact_number}
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  {" "}
                  {/* Address spans full width on desktop */}
                  <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Address
                  </div>
                  <div className="text-base font-medium text-gray-800">{getFullAddress()}</div>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200"></div>

            {/* Financial Information */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Financial Information</h3>
              </div>
              {/* Data Grid (Reduced Gap, Reduced Font Size) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 sm:p-6">
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Occupation
                  </div>
                  <div className="text-base font-medium text-gray-800">
                    {formData.occupation}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Monthly Income
                  </div>
                  <div className="text-base font-medium text-gray-800">
                    {formatCurrency(formData.monthly_income)}
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200"></div>

            {/* Application Details */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Application Details</h3>
              </div>
              {/* Data Grid (Reduced Gap, Reduced Font Size) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 sm:p-6">
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Valid ID Presented
                  </div>
                  <div className="text-base font-medium text-gray-800">
                    {formData.valid_id_presented}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Applicant Type
                  </div>
                  <div className="text-base font-medium text-gray-800">
                    {formData.applicant_type}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Assistance Type
                  </div>
                  <div className="text-base font-medium text-gray-800">
                    {formData.type_of_assistance}
                  </div>
                </div>
              </div>
            </section>

            {/* Representative Information (Conditional) */}
            {formData.applicant_type === "Representative" && (
              <>
                <div className="border-t border-gray-200"></div>
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-amber-600"
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
                    <h3 className="text-lg font-bold text-gray-800">
                      Representative Information
                    </h3>
                  </div>
                  {/* Data Grid (Reduced Gap, Reduced Font Size) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-xl p-4 sm:p-6">
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Representative Name
                      </div>
                      <div className="text-base font-medium text-gray-800">
                        {formData.rep_first_name}{" "}
                        {formData.rep_middle_initial && `${formData.rep_middle_initial}.`}{" "}
                        {formData.rep_last_name} {formData.rep_suffix}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Relationship to Applicant
                      </div>
                      <div className="text-base font-medium text-gray-800">
                        {formData.rep_relationship}
                      </div>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      {" "}
                      {/* Address spans full width on desktop */}
                      <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Representative Address
                      </div>
                      <div className="text-base font-medium text-gray-800">
                        {formData.rep_address}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Representative Birthday
                      </div>
                      <div className="text-base font-medium text-gray-800">
                        {formData.rep_birthday}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Representative Sex
                      </div>
                      <div className="text-base font-medium text-gray-800">
                        {formData.rep_gender}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Representative Civil Status
                      </div>
                      <div className="text-base font-medium text-gray-800">
                        {formData.rep_civil_status}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Representative Occupation
                      </div>
                      <div className="text-base font-medium text-gray-800">
                        {formData.rep_occupation}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Representative Monthly Income
                      </div>
                      <div className="text-base font-medium text-gray-800">
                        {formatCurrency(formData.rep_monthly_income)}
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>

          {/* Actions (Responsive layout) */}
          <div className="bg-gray-50 px-4 sm:px-8 py-4 sm:py-6 border-t border-gray-200">
            {/* Using flex-col sm:flex-row for stacking on mobile */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                // w-full on mobile, sm:w-auto on desktop
                className="group inline-flex items-center justify-center sm:justify-start w-full sm:w-auto bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-xl px-5 py-2.5 border-2 border-gray-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                disabled={isSubmitting}
              >
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
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
                <span className="ml-2">Back</span>
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                // w-full on mobile, sm:w-auto on desktop, order-first on mobile
                className={`group relative bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl px-6 py-2.5 inline-flex items-center justify-center w-full sm:w-auto gap-3 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-base sm:text-sm sm:order-none order-first ${
                  !isSubmitting ? "hover:scale-[1.02] active:scale-[0.98]" : ""
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="ml-1">Submitting...</span>
                  </>
                ) : submitSuccess ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-1">Submitted ✓</span>
                  </>
                ) : (
                  <>
                    <span className="mr-1">Submit Application</span>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            By submitting this application, you confirm that all information provided is
            accurate and complete.
          </p>
        </div>
      </div>

      {/* Error Modal (Reduced Header Size) */}
      {errorModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full transform animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Error</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">{errorModal.message}</p>
            <div className="flex justify-end">
              <button
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl px-5 py-2.5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-red-500/30 text-sm"
                onClick={() => setErrorModal({ show: false, message: "" })}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal (Reduced Header Size) */}
      {cancelModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full transform animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Confirm Cancellation</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to go back? Any unsaved changes will be lost.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="bg-white hover:bg-gray-100 text-gray-700 font-semibold border-2 border-gray-200 rounded-xl px-5 py-2.5 transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
                onClick={() => setCancelModal({ show: false })}
              >
                No, Stay Here
              </button>
              <button
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl px-5 py-2.5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-teal-500/30 text-sm"
                onClick={confirmCancel}
              >
                Yes, Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PreviewStep;
