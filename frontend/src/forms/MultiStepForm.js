import React, { useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";

const MultiStepForm = () => {
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
    beneficiary_name: "",
    type_of_assistance: "",
    justification: "",
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
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
  );
};

export default MultiStepForm;
