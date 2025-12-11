import React, { useState, useEffect, useCallback } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import PreviewStep from "./PreviewStep";
import { useNavigate } from "react-router-dom";
import quickAidLogo from "../../assets/quickaid-text.png";

const initialFormData = {
  first_name: "",
  middle_initial: "",
  last_name: "",
  suffix: "",
  contact_number: "",
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

const capitalizeWords = str => str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

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
  const [cancelModal, setCancelModal] = useState({ show: false });
  const [formData, setFormData] = useState(initialFormData);
  const navigate = useNavigate();

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

  const handleCancel = () => setCancelModal({ show: true });
  const closeCancelModal = () => setCancelModal({ show: false });
  const confirmCancel = () => {
    closeCancelModal();
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: "url('/AICS-3.jpg')",
        }}
      ></div>

      {/* Fade Overlay for readability */}
      {/* <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]"></div> */}

      {/* Actual Page */}
      <div className="relative">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between">
            {/* Logo + Title */}
            <div className="flex flex-col w-full sm:w-auto sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto mb-2 sm:mb-0">
                <img src={quickAidLogo} alt="QuickAid" className="h-6 w-auto" />
              </div>

              <h1 className="text-xl font-bold text-gray-800 border-t border-gray-100 pt-2 sm:border-none sm:pt-0">
                Applicant Registration
              </h1>
            </div>

            <button
              onClick={handleCancel}
              className="absolute top-3 right-4 sm:relative sm:top-auto sm:right-auto px-3 py-1.5 text-sm bg-red-50 text-red-600 font-semibold rounded-md border border-red-200 hover:bg-red-100 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="sticky top-0 z-40 bg-gray-50/90 py-4 shadow-inner">
          <div className="max-w-10xl mx-auto flex items-center justify-center bg-white p-4 shadow-md border border-gray-100">
            {[1, 2, 3, 4].map(stepNum => (
              <React.Fragment key={stepNum}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      step === stepNum
                        ? "bg-[#003a76] text-white shadow-lg shadow-blue-500/50 scale-105"
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

        {/* Form Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {StepComponent && <StepComponent {...stepProps} />}
        </div>

        {/* Cancel Modal */}
        {cancelModal.show && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              <div className="bg-[#003a76] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Cancel Application?</h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-3 leading-relaxed">
                  All entered information will be{" "}
                  <span className="font-bold text-amber-600">permanently lost</span>. Are you
                  sure you want to cancel?
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Ang lahat ng impormasyong inilagay ay{" "}
                  <span className="font-bold text-amber-600">permanenteng mawawala</span>.
                  Sigurado ka bang gusto mong magkansel?
                </p>
              </div>

              <div className="flex gap-3 px-6 pb-6">
                <button
                  type="button"
                  onClick={closeCancelModal}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                >
                  No, Keep Editing
                </button>
                <button
                  type="button"
                  onClick={confirmCancel}
                  className="flex-1 px-4 py-2.5 bg-[#003a76] hover:from-amber-400 hover:to-amber-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-amber-300/30"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiStepForm;
