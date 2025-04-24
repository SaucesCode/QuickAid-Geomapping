import React, { useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import "./MultiStepForm.css";

const MultiStepForm = ({ closeModal }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_initial: "",
    last_name: "",
    suffix: "",
    contact_number: "",
    purok: "",
    barangay: "",
    city_municipality: "",
    province: "Quezon",
    birthday: "",
    gender: "",
    civil_status: "",
    occupation: "",
    monthly_income: "",
    valid_id_presented: "",
    other_valid_id: "",
    applicant_type: "Self",
    rep_first_name: "",
    rep_last_name: "",
    rep_middle_initial: "",
    rep_suffix: "",
    rep_address: "",
    rep_birthday: "",
    rep_gender: "",
    rep_civil_status: "",
    rep_occupation: "",
    rep_monthly_income: "",
    rep_relationship: "",
    type_of_assistance: "",
    started_at: new Date().toISOString(),
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="form-container">
      <div className="step-indicator">
        <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>3</div>
      </div>

      <div className="step-content">
        {step === 1 && (
          <Step1 formData={formData} handleChange={handleChange} nextStep={nextStep} />
        )}
        {step === 2 && (
          <Step2
            formData={formData}
            handleChange={handleChange}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}
        {step === 3 && (
          <Step3 formData={formData} handleChange={handleChange} prevStep={prevStep} />
        )}
      </div>
      <button className="close-btn" onClick={closeModal}>
        Cancel
      </button>
    </div>
  );
};

export default MultiStepForm;
