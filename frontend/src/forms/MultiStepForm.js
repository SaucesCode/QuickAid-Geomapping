// File: frontend/src/forms/MultiStepForm.js
import React, { useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import PreviewStep from "./PreviewStep";
import { NavLink } from "react-router-dom";
import "./MultiStepForm.css";

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
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
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="form-container">
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
            setFormData={setFormData} // ✅ Add this!
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
          />
        )}
        {step === 4 && <PreviewStep formData={formData} prevStep={prevStep} />}
      </div>

      <NavLink to="/register-applicant" className="close-btn">
        Cancel
      </NavLink>
    </div>
  );
};
//
export default MultiStepForm;
