// File: frontend/src/forms/MultiStepForm.js (Steps are "Out of the Box")
import React, { useState, useEffect, useCallback } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import PreviewStep from "./PreviewStep";
import { useNavigate } from "react-router-dom";

const initialFormData = {
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
  rep_contact_number: "",
  rep_address: "",
  rep_birthday: "",
  rep_gender: "",
  rep_civil_status: "",
  rep_occupation: "",
  rep_monthly_income: "",
  rep_relationship: "",
  use_same_address: false,
};

// Helper: Capitalize each word (moved outside component for purity)
const capitalizeWords = str => str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

const STEP_TITLES = [
  "Personal Information",
  "Address Details",
  "Additional Information",
  "Preview & Submit",
];

const REPRESENTATIVE_FIELDS = [
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
];

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [cancelModal, setCancelModal] = useState({ show: false });
  const [formData, setFormData] = useState(initialFormData);

  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("k");
  const staffRef = encoded ? atob(encoded) : null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleChange = useCallback(
    e => {
      const { name, value } = e.target;
      let newValue = value;

      // Auto-capitalize representative fields logic remains
      if (
        formData.applicant_type === "Representative" &&
        REPRESENTATIVE_FIELDS.includes(name)
      ) {
        newValue = capitalizeWords(value);
      }

      setFormData(prev => ({
        ...prev,
        [name]: newValue,
      }));
    },
    [formData.applicant_type]
  );

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);
  const handleCancel = () => setCancelModal({ show: true });
  const closeCancelModal = () => setCancelModal({ show: false });
  const confirmCancel = () => {
    closeCancelModal();
    navigate(-1);
  };

  const StepComponent = [Step1, Step2, Step3, PreviewStep][step - 1];
  const stepProps = {
    formData,
    handleChange,
    nextStep,
    prevStep: step > 1 ? prevStep : undefined,
    staffRef,
    ...(step === 2 && { setFormData }),
    ...(step === 3 && { setFormData }),
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Unified Sticky Header (Title and Cancel) */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Applicant Registration</h1>
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-sm bg-red-50 text-red-600 font-semibold rounded-md border border-red-200 hover:bg-red-100 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
      {/* END: Unified Sticky Header */}

      {/* NEW: Step Indicator (Out of the box and sticky below the header) */}
      <div className="sticky top-[58px] z-40 bg-gray-50/90 py-4 shadow-inner">
        <div className="flex items-center justify-center bg-white p-4 rounded-xl shadow-md border border-gray-100">
          {[1, 2, 3, 4].map(stepNum => (
            <React.Fragment key={stepNum}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step === stepNum
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-105"
                      : step > stepNum
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step > stepNum ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
              </div>
              {stepNum < 4 && (
                <div
                  className={`w-16 h-1 rounded-full transition-all duration-300 mx-2 ${
                    step > stepNum ? "bg-blue-400" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      {/* END: New Step Indicator */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {StepComponent && <StepComponent {...stepProps} />}
      </div>

      {/* Cancel Modal - Retained structure */}
      {cancelModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-11/12 max-w-xs p-5">
            <h2 className="text-lg font-bold text-gray-800 text-center mb-2">
              Cancel Application?
            </h2>
            <p className="text-gray-600 text-center mb-4 text-xs">
              All entered information will be{" "}
              <span className="font-bold text-red-600">permanently lost</span>.
            </p>
            <div className="flex gap-2">
              <button
                onClick={closeCancelModal}
                className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold"
              >
                No, Keep Editing
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-semibold border border-gray-200"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStepForm;
