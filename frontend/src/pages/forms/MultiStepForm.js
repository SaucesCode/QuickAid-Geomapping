// File: frontend/src/forms/MultiStepForm.js
import React, { useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import PreviewStep from "./PreviewStep";
import { useNavigate } from "react-router-dom";

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [cancelModal, setCancelModal] = useState({ show: false });

  const [formData, setFormData] = useState({
    // Step 1
    first_name: "",
    middle_initial: "",
    last_name: "",
    suffix: "",
    contact_number: "",
    // Step 2
    street_address: "",
    province: "Quezon",
    city_municipality: "",
    city_municipalityCode: "",
    barangay: "",
    barangay_name: "",
    birthday: "",
    sex: "",
    civil_status: "",
    occupation: "",
    monthly_income: "",
    // Step 3
    valid_id_presented: "",
    other_valid_id: "",
    applicant_type: "Self",
    type_of_assistance: "",
    created_at: new Date().toISOString(),
    // Representative
    rep_first_name: "",
    rep_middle_initial: "",
    rep_last_name: "",
    rep_suffix: "",
    rep_address: "",
    rep_birthday: "",
    rep_gender: "",
    rep_civil_status: "",
    rep_occupation: "",
    rep_monthly_income: "",
    rep_relationship: "",
    use_same_address: false,
  });

  // Helper: Capitalize each word
  const capitalizeWords = (str) =>
    str
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Auto-capitalize representative fields
    if (
      formData.applicant_type === "Representative" &&
      [
        "rep_first_name",
        "rep_middle_initial",
        "rep_last_name",
        "rep_suffix",
        "rep_address",
        "rep_relationship",
        "rep_occupation",
        "rep_province",
        "rep_city_municipality",
        "rep_barangay_name",
      ].includes(name)
    ) {
      const formatted = capitalizeWords(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleCancel = () => setCancelModal({ show: true });
  const closeCancelModal = () => setCancelModal({ show: false });
  const confirmCancel = () => {
    closeCancelModal();
    navigate("/register-applicant");
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header with Cancel Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Applicant Registration</h1>
              <p className="text-sm text-gray-500">Complete all steps to submit your application</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="group flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 font-semibold rounded-xl border-2 border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel
          </button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((stepNum) => (
            <React.Fragment key={stepNum}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    step === stepNum
                      ? "bg-gradient-to-br from-blue-500 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110"
                      : step > stepNum
                      ? "bg-blue-100 text-blue-600 border-2 border-blue-300"
                      : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  }`}
                >
                  {step > stepNum ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-semibold ${
                    step === stepNum ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  Step {stepNum}
                </span>
              </div>
              {stepNum < 4 && (
                <div
                  className={`w-16 h-1 rounded-full transition-all duration-300 -mt-6 ${
                    step > stepNum ? "bg-blue-400" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {/* Step Content - Render steps without wrapper */}
        {step === 1 && (
          <Step1
            formData={formData}
            handleChange={handleChange}
            nextStep={nextStep}
          />
        )}
        {step === 2 && (
          <Step2
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}
        {step === 3 && (
          <Step3
            formData={formData}
            handleChange={handleChange}
            nextStep={nextStep}
            prevStep={prevStep}
            setFormData={setFormData}
          />
        )}
        {step === 4 && (
          <PreviewStep formData={formData} prevStep={prevStep} />
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-md p-8 transform animate-scale-in">
            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-red-100 to-red-50 rounded-full shadow-lg">
                  <svg
                    className="w-10 h-10 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>

            {/* Header */}
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
              Cancel Application?
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-center mb-8 leading-relaxed">
              Are you sure you want to cancel? All entered information will be{" "}
              <span className="font-bold text-red-600">
                permanently lost
              </span>
              .
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={closeCancelModal}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                No, Keep Editing
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 px-6 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Yes, Cancel
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

export default MultiStepForm;