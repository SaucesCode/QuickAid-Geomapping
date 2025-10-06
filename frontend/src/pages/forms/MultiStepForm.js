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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    <div className="relative w-full min-h-screen flex flex-col items-center justify-start bg-gray-50 py-12 px-6">
      {/* Cancel Button (top-right corner) */}
      <div className="w-full max-w-4xl flex justify-end">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 px-5 py-2 bg-red-100 text-red-700 font-semibold rounded-lg border border-red-300 hover:bg-red-200 hover:shadow-md transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Cancel
        </button>
      </div>

      {/* Step Indicator */}
      <div className="relative flex justify-between items-center w-full max-w-3xl mt-10 mb-12">
        {/* Background line */}
        <div className="absolute top-[30px] left-0 right-0 h-1 bg-gray-300"></div>

        {/* Progress line */}
        <div
          className="absolute top-[30px] left-0 h-1 bg-blue-600 transition-all duration-500"
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        ></div>

        {/* Steps */}
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className="relative z-10 flex flex-col items-center">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all duration-300 ${
                step >= num
                  ? "bg-blue-600 text-white shadow-lg scale-110"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {num}
            </div>
            <span
              className={`mt-3 text-sm font-medium ${
                step >= num ? "text-blue-600" : "text-gray-500"
              }`}
            >
              Step {num}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-md p-8 transform transition-all scale-100 animate-fadeIn">
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center bg-red-100 text-red-600 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Header */}
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Cancel Application?
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-center mb-8 leading-relaxed">
              Are you sure you want to cancel? All entered information will be{" "}
              <span className="font-semibold text-red-600">
                permanently lost
              </span>
              .
            </p>

            {/* Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmCancel}
                className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-semibold shadow-sm hover:bg-red-700 hover:scale-[1.03] transition-transform"
              >
                Yes, Cancel
              </button>
              <button
                onClick={closeCancelModal}
                className="px-6 py-2.5 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 hover:scale-[1.03] transition-transform"
              >
                No, Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStepForm;
