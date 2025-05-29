// File: frontend/src/forms/MultiStepForm.js
import React, { useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import PreviewStep from "./PreviewStep";
import { useNavigate } from "react-router-dom";
import "./MultiStepForm.css";

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
    barangay: "", // PSGC code
    barangay_name: "", // Human-readable

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

    // Representative (Step 3)
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

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleCancel = () => {
    setCancelModal({ show: true });
    document.body.classList.add("dialog-open");
  };

  const closeCancelModal = () => {
    setCancelModal({ show: false });
    document.body.classList.remove("dialog-open");
  };

  const confirmCancel = () => {
    closeCancelModal();
    navigate("/register-applicant");
  };

  return (
    <div className="form-container">
      <button onClick={handleCancel} className="cancel-btn">
        Cancel
      </button>

      <div className="step-indicator">
        <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>3</div>
        <div className={`step ${step >= 4 ? "active" : ""}`}>4</div>
      </div>

      <div className="step-content">
        {step === 1 && (
          <Step1 formData={formData} handleChange={handleChange} nextStep={nextStep} />
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
        {step === 4 && <PreviewStep formData={formData} prevStep={prevStep} />}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModal.show && (
        <div className="dialog-backdrop">
          <div className="dialog confirm-dialog">
            <div className="dialog-header">
              <h2>Confirm Cancel</h2>
            </div>
            <div className="dialog-content">
              <p>Are you sure you want to cancel? All entered information will be lost.</p>
            </div>
            <div className="dialog-footer">
              <button className="btn error-btn" onClick={confirmCancel}>
                Yes, Cancel
              </button>
              <button className="btn secondary-btn" onClick={closeCancelModal}>
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
