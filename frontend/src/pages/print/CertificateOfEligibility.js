import React, { useState, useEffect, useCallback } from "react";
import dswdLogo from "../../assets/dswd-logo.png"; // Assuming this path is correct

// This function remains a placeholder as per your last request to disable conversion.
const convertWordsToNumber = (words) => {
  return ""; 
};

/**
 * CertificateOfEligibility Component
 * - Fixed: The amountWords input text is now center-aligned on its underline in both the COE and Acknowledgement Receipt sections by using a centered placeholder.
 */
export default function CertificateOfEligibility() {
  const [formData, setFormData] = useState({
    qn: "",
    pon: "",
    dateMM: "",
    dateDD: "",
    year: "",
    timeStart: "",
    timeEnd: "",
    clientType: "",
    walkinType: "",
    name: "",
    sex: "",
    age: "",
    address: "",
    quezon: "",
    assistanceType: "",
    assistanceSubtype: [], // Holds the currently checked subtypes
    amountWords: "",
    amountNumber: "", 
    chargeableAgainst: "",
    records: {
      generalIntake: false,
      validId: false,
      dswdId: false,
      justification: false,
      medical: false,
      prescriptions: false,
      statementAccount: false,
      treatmentProtocol: false,
      quotation: false,
      dischargeSummary: false,
      laboratory: false,
      chargeSlip: false,
      funeralContract: false,
      deathCertificate: false,
      deathSummary: false,
      referralLetter: false,
      socialCaseStudy: false,
      others: false,
    },
    tinanggapNi: "",
    binayaranNi: "",
    sinaksihan: "",
  });

  // Autofill date (MM, DD, YYYY) on mount (LOGIC RETAINED)
  useEffect(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const yyyy = String(now.getFullYear());
    setFormData((prev) => ({ ...prev, dateMM: mm, dateDD: dd, year: yyyy }));
  }, []);

  const requiredKeys = [
    "name",
    "age",
    "address",
    "assistanceType",
    "amountWords",
    "amountNumber", 
  ];

  const areRequiredFieldsFilled = useCallback(
    (data) =>
      requiredKeys.every((k) => {
        const v = data[k];
        return typeof v === "string" ? v.trim() !== "" : Boolean(v);
      }),
    []
  );

  // Generic change handler (LOGIC RETAINED)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (!formData.timeStart) {
      const now = new Date();
      const formattedStart = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setFormData((prev) => ({ ...prev, timeStart: formattedStart }));
    }

    if (type === "checkbox") {
      if (name.startsWith("record-")) {
        const key = name.replace("record-", "");
        setFormData((prev) => ({
          ...prev,
          records: { ...prev.records, [key]: checked },
        }));
        return;
      }
      
      // HANDLES SUB-TYPE CHECKBOXES (in both sections)
      if (name.startsWith("subtype-")) {
        const subtype = name.replace("subtype-", "");
        setFormData((prev) => ({
          ...prev,
          assistanceSubtype: checked
            ? [...prev.assistanceSubtype, subtype]
            : prev.assistanceSubtype.filter((s) => s !== subtype),
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Logic for handling the main assistance type radio buttons
    if (name === "assistanceType") {
      // Clear all subtypes when the main type changes
      setFormData((prev) => ({ 
          ...prev, 
          assistanceType: value,
          assistanceSubtype: [], // Clears existing selections on major change
      }));
      return;
    }

    if (name === "amountWords" || name === "amountNumber") {
        setFormData((prev) => ({ ...prev, [name]: value }));
        return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    if (areRequiredFieldsFilled(formData)) {
      alert("Printing Certificate of Eligibility...");
      window.print(); 
    } else {
      alert("Please fill in all required fields before printing.");
    }
  };

  // timeEnd: set once when required fields are all filled (LOGIC RETAINED)
  useEffect(() => {
    if (!formData.timeEnd && areRequiredFieldsFilled(formData)) {
      const now = new Date();
      const formattedEnd = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setFormData((prev) => ({ ...prev, timeEnd: formattedEnd }));
    }
  }, [formData, areRequiredFieldsFilled]);

  // Modern input classes
  const inputClass = "w-full border-gray-300 border focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-3 py-2 rounded-md text-xs transition duration-150 ease-in-out";
  const disabledInputClass = "w-full border-gray-300 border px-3 py-2 rounded-md text-xs bg-gray-100 cursor-not-allowed";
  const checkboxClass = "form-checkbox text-blue-600 rounded focus:ring-blue-500";
  const radioClass = "form-radio text-blue-600 focus:ring-blue-500";

  // JSX
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden border border-blue-100">
        <div className="p-10">
          
          {/* Header row - FIXED ALIGNMENT */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <img
                src={dswdLogo} 
                alt="DSWD Logo"
                className="w-28 object-contain"
              />
            </div>

            <div className="text-right text-xs leading-snug">
              <div className="font-bold uppercase text-blue-800 tracking-wider">CRISIS INTERVENTION SECTION</div>
              <div className="uppercase text-blue-700 font-semibold">FIELD OFFICE IV-CALABARZON</div>
              <div className="text-[10px] text-gray-500 mt-1">DSWD-PMB-GF-011 | REV 01 / 30 SEPT 2022</div>
            </div>
          </div>
          {/* END OF HEADER SECTION */}

          
          <div className="text-center mt-1 mb-6">
            <h2 className="text-2xl font-black tracking-widest uppercase text-blue-900">
              CERTIFICATE OF ELIGIBILITY
            </h2>
            <p className="text-sm text-blue-700 font-semibold italic mt-1">
              (
              {formData.assistanceType === "financial" && "Financial Assistance"}
              {formData.assistanceType === "medical" && "Medical Assistance"}
              {formData.assistanceType === "funeral" && "Funeral Assistance"}
              {!formData.assistanceType && "Assistance Type"}
              )
            </p>
          </div>
          
          {/* QN PCN Time Date - FIXED ALIGNMENT */}
          <div className="grid grid-cols-2 gap-4 items-end mb-6 pb-4 border-b border-blue-200 text-sm">
            
            {/* Left Column: QN and PCN */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <label className="font-bold text-blue-700 w-10 shrink-0">QN:</label>
                <input
                  type="text"
                  name="qn"
                  value={formData.qn}
                  onChange={handleChange}
                  className={inputClass.replace('w-full', 'w-48')}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="font-bold text-blue-700 w-10 shrink-0">PCN:</label>
                <div className="flex gap-1">
                  {[...Array(15)].map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength="1"
                      className="w-5 h-7 text-center border border-gray-300 rounded-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition duration-150 text-xs"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Date and Time */}
            <div className="flex flex-col items-end gap-3 text-xs">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <label className="font-bold text-blue-700">Time Start:</label>
                  <input
                    type="text"
                    name="timeStart"
                    value={formData.timeStart}
                    readOnly
                    className={disabledInputClass.replace('w-full', 'w-24')}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-bold text-blue-700">Time End:</label>
                  <input
                    type="text"
                    name="timeEnd"
                    value={formData.timeEnd}
                    readOnly
                    className={disabledInputClass.replace('w-full', 'w-24')}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="font-bold text-blue-700">Date:</label>
                <input
                  type="text"
                  name="dateMM"
                  value={formData.dateMM}
                  onChange={handleChange}
                  className={inputClass.replace('w-full', 'w-10')}
                  placeholder="mm"
                />
                <input
                  type="text"
                  name="dateDD"
                  value={formData.dateDD}
                  onChange={handleChange}
                  className={inputClass.replace('w-full', 'w-10')}
                  placeholder="dd"
                />
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={disabledInputClass.replace('w-full', 'w-14')}
                  readOnly
                />
              </div>
            </div>
          </div>
          

          {/* Client type / Walk-in / Referral / Off-site - FIXED ALIGNMENT */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 items-center text-xs mb-6 pb-4 border-b border-blue-100">
            <span className="font-bold text-blue-800 mr-2">Client Status:</span>
            <label className="flex items-center gap-2 text-blue-800 font-medium">
              <input
                type="checkbox"
                name="clientType"
                value="new"
                onChange={handleChange}
                className={checkboxClass}
              />
              <span>New</span>
            </label>
            <label className="flex items-center gap-2 text-blue-800 font-medium">
              <input
                type="checkbox"
                name="clientType"
                value="returning"
                onChange={handleChange}
                className={checkboxClass}
              />
              <span>Returning</span>
            </label>
            <div className="h-4 w-px bg-gray-300 mx-2"></div>
            <span className="font-bold text-blue-800 mr-2">Walk-In Type:</span>
            <label className="flex items-center gap-2 text-blue-800 font-medium">
              <input
                type="radio"
                name="walkinType"
                value="onsite"
                onChange={handleChange}
                className={radioClass}
              />
              <span>On-Site</span>
            </label>
            <label className="flex items-center gap-2 text-blue-800 font-medium">
              <input
                type="radio"
                name="walkinType"
                value="walkin"
                onChange={handleChange}
                className={radioClass}
              />
              <span>Walk-In</span>
            </label>
            <label className="flex items-center gap-2 text-blue-800 font-medium">
              <input
                type="radio"
                name="walkinType"
                value="offsite"
                onChange={handleChange}
                className={radioClass}
              />
              <span>Off-Site</span>
            </label>
            <div className="h-4 w-px bg-gray-300 mx-2"></div>
            <label className="flex items-center gap-2 text-blue-800 font-medium">
              <input type="checkbox" name="referral" onChange={handleChange} className={checkboxClass} />
              <span>Referral</span>
            </label>
          </div>

          {/* Main Certification Block */}
          <div className="bg-blue-50 p-5 rounded-xl mb-6 border-2 border-blue-300 shadow-md">
            <div className="mb-4">
              <p className="text-xs text-blue-800 font-semibold mb-1">This is to certify that:</p>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Kumpletuong Pangalan (First name, Middle name, Last name)"
                className="w-full border-b-2 border-blue-500 bg-transparent focus:border-blue-700 outline-none px-2 py-2 text-sm font-semibold"
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-4 p-2 bg-white rounded-lg border border-gray-200">
                <span className="text-xs text-gray-500">Kasarian (Sex):</span>
                <label className="flex items-center gap-1">
                  <input type="checkbox" name="sex" value="male" onChange={handleChange} className={checkboxClass} />
                  <span className="text-sm font-medium text-blue-800">Male</span>
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" name="sex" value="female" onChange={handleChange} className={checkboxClass} />
                  <span className="text-sm font-medium text-blue-800">Female</span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-800">Edad (Age):</span>
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-20 border-b-2 border-blue-500 bg-transparent focus:border-blue-700 outline-none px-2 py-1 text-sm font-bold text-center"
                />
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-blue-800 font-semibold mb-1">and presently residing at:</p>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Kumpletong Tirahan (Complete Address)"
                className="w-full border-b-2 border-blue-500 bg-transparent focus:border-blue-700 outline-none px-2 py-2 text-sm"
              />
              <p className="text-xs text-gray-500 text-right mt-1">Lungsod, Lalawigan (City, Province)</p>
            </div>

            <p className="text-xs text-blue-900 bg-blue-100 p-3 rounded-lg border-l-4 border-blue-600 font-medium">
              has been found **eligible for assistance** after the assessment and validation conducted, for him/herself or through the representation of his/her
            </p>

            <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
              <input
                type="text"
                placeholder="Relasyon ng Kinatawan sa Benepisyaryo (Relationship of the Representative to Beneficiary)"
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Buong Pangalan ng Kinatawan (Name of Representative)"
                className={inputClass}
              />
            </div>
          </div>
          
          {/* Records Section */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-blue-900 mb-4 pb-2 border-b-2 border-blue-300 uppercase tracking-wider">
              Confidential Records Filed at CID
            </h3>
            <div className="grid grid-cols-3 gap-y-2 gap-x-6 text-xs bg-gray-50 p-4 rounded-lg">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-generalIntake" onChange={handleChange} className={checkboxClass} />
                <span>General Intake Sheet</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-medical" onChange={handleChange} className={checkboxClass} />
                <span>Medical Certificate/Abstract</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-dischargeSummary" onChange={handleChange} className={checkboxClass} />
                <span>Discharge Summary</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-validId" onChange={handleChange} className={checkboxClass} />
                <span>Valid I.D. Presented</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-prescriptions" onChange={handleChange} className={checkboxClass} />
                <span>Prescriptions</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-statementAccount" onChange={handleChange} className={checkboxClass} />
                <span>Statement of Account</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-dswdId" onChange={handleChange} className={checkboxClass} />
                <span>4Ps DSWD I.D.</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-treatmentProtocol" onChange={handleChange} className={checkboxClass} />
                <span>Treatment Protocol</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-quotation" onChange={handleChange} className={checkboxClass} />
                <span>Quotation</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-dischargeSummary" onChange={handleChange} className={checkboxClass} />
                <span>Discharge Summary</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-laboratory" onChange={handleChange} className={checkboxClass} />
                <span>Laboratory</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-chargeSlip" onChange={handleChange} className={checkboxClass} />
                <span>Charge Slip</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-funeralContract" onChange={handleChange} className={checkboxClass} />
                <span>Funeral Contract</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-deathCertificate" onChange={handleChange} className={checkboxClass} />
                <span>Death Certificate</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-deathSummary" onChange={handleChange} className={checkboxClass} />
                <span>Death Summary</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-referralLetter" onChange={handleChange} className={checkboxClass} />
                <span>Referral Letter</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-socialCaseStudy" onChange={handleChange} className={checkboxClass} />
                <span>Social Case Study Report</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-others" onChange={handleChange} className={checkboxClass} />
                <span>Others_____________</span>
              </label>
            </div>
          </div>


          {/* Recommendation/Amount Section */}
          <div className="bg-blue-100 border-2 border-blue-500 p-5 rounded-xl mb-8 shadow-inner">
            <p className="text-sm font-semibold text-blue-800 mb-3">The Client is hereby recommended to receive</p>

            {/* MAIN ASSISTANCE TYPE SECTION */}
            <div className="mb-4">
                <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-blue-900 mb-3">
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="assistanceType"
                            value="financial"
                            checked={formData.assistanceType === "financial"}
                            onChange={handleChange}
                            className={radioClass}
                        />
                        <span>Financial Assistance</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="assistanceType"
                            value="medical"
                            checked={formData.assistanceType === "medical"}
                            onChange={handleChange}
                            className={radioClass}
                        />
                        <span>Medical Assistance</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="assistanceType"
                            value="funeral"
                            checked={formData.assistanceType === "funeral"}
                            onChange={handleChange}
                            className={radioClass}
                        />
                        <span>Funeral Assistance</span>
                    </label>
                </div>
            </div>

            {/* TOP SUB-TYPE CHECKBOXES (CONTROLLED BY STATE) */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4 text-xs font-semibold text-blue-800 bg-white p-3 rounded-lg border border-blue-200">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="subtype-transportation" 
                  checked={formData.assistanceSubtype.includes('transportation')}
                  onChange={handleChange} 
                  className={checkboxClass}
                />
                <span>Transportation Assistance</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="subtype-cash" 
                  checked={formData.assistanceSubtype.includes('cash')}
                  onChange={handleChange} 
                  className={checkboxClass}
                />
                <span>Cash Assistance for Support Services</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="subtype-educational" 
                  checked={formData.assistanceSubtype.includes('educational')}
                  onChange={handleChange} 
                  className={checkboxClass}
                />
                <span>Educational Assistance</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="subtype-food" 
                  checked={formData.assistanceSubtype.includes('food')}
                  onChange={handleChange} 
                  className={checkboxClass}
                />
                <span>Food Assistance</span>
              </label>
            </div>

            <div className="bg-white p-4 rounded-xl border-4 border-blue-600 shadow-lg">
              <div className="mb-3">
                <label className="text-xs font-semibold text-blue-700">In the amount of</label>
                <div className="flex items-end gap-2 mt-1">
                  <input
                    type="text"
                    name="amountWords"
                    value={formData.amountWords}
                    onChange={handleChange}
                    // FIX: Added a centered placeholder
                    placeholder="AMOUNT IN WORDS"
                    // Kept: text-center class
                    className="flex-1 border-b-2 border-blue-500 bg-transparent focus:border-blue-700 outline-none px-2 py-0 text-sm font-bold uppercase text-center" 
                  />
                  
                  <span className="text-lg font-bold text-blue-800">Php.</span>
                  <input
                    type="text"
                    name="amountNumber"
                    value={formData.amountNumber}
                    onChange={handleChange}
                    placeholder=".00"
                    className="w-32 border-b-2 border-blue-500 bg-transparent focus:border-blue-700 outline-none px-2 py-0 text-xl font-black text-right"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-4 text-xs">
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-blue-900">Assistance for:</span>
                    <div className="text-gray-500 italic">
                      (Hospital bill/ Medicine/ Laboratory/ Household/ Chemotherapy/ Funeral Bill/ Daily Needs/ Dialysis/ Prosthesis/ Therapy/ School expenses)
                    </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-blue-700">CHARGEABLE AGAINST: PSP</span>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    readOnly
                    className="w-20 border-b-2 border-blue-500 bg-transparent focus:border-blue-700 outline-none px-2 py-1 text-sm font-bold text-center"
                  />
                  <span className="font-semibold text-blue-700">(Year)</span>
                </div>
              </div>

            </div>
          </div>
          
          {/* SIGNATORIES - COE - FIXED ALIGNMENT */}
          <div className="grid grid-cols-3 gap-10 mb-8 pt-4 border-t border-blue-200">
            {/* Conforme */}
            <div className="text-center">
              <p className="text-xs text-blue-700 mb-12">Conforme:</p>
              <div className="border-t-2 border-blue-500 pt-2 h-20 flex flex-col justify-end">
                <p className="text-xs font-black uppercase text-blue-900">Beneficiary/Representative</p>
                <p className="text-[10px] text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>
            {/* Prepared by */}
            <div className="text-center">
              <p className="text-xs text-blue-700 mb-12">Prepared by:</p>
              <div className="border-t-2 border-blue-500 pt-2 h-20 flex flex-col justify-end">
                <p className="text-xs font-black uppercase text-blue-900">Social Worker</p>
                <p className="text-[10px] text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>
            {/* Approved by: SWAD Team Leader (NOW INPUT) */}
            <div className="text-center">
              <input
                type="text"
                name="approvedBy"
                value={formData.approvedBy}
                onChange={handleChange}
                placeholder="SWAD Team Leader Name (REQUIRED)"
                className="w-full border-b-2 border-gray-400 text-center mb-2 py-12 text-xs font-bold uppercase"
              />
              <div className="pt-2">
                <p className="text-xs font-black uppercase text-blue-900">APPROVED BY / SWAD TEAM LEADER</p>
                <p className="text-[10px] text-gray-500">Approving Authority (Signature over Printed Name)</p>
              </div>
            </div>
          </div>


          <div className="border-t-4 border-blue-900 my-6 opacity-75" />

          {/* Acknowledgement Receipt Header (Dark Blue) */}
          <div className="bg-blue-900 text-white p-3 mb-4 rounded-t-lg shadow-xl">
            <h3 className="text-sm font-bold text-center uppercase tracking-wider">Acknowledgement Receipt</h3>
          </div>

          {/* Acknowledgement Receipt Body */}
          <div className="bg-blue-50 p-5 rounded-b-lg border border-blue-300">
            <div className="mb-6">
              <p className="text-sm font-semibold text-blue-800 mb-2">Assistance Type Received:</p>
              
              {/* Acknowledgment Receipt Main Assistance Types - Display-only based on formData.assistanceType */}
              <div className="mb-3 flex flex-wrap gap-4 text-sm font-bold text-blue-900">
                <label className="flex items-center gap-1">
                    <input 
                        type="checkbox" 
                        readOnly 
                        checked={formData.assistanceType === "financial"} 
                        className={checkboxClass}
                    />
                    <span>Financial Assistance</span>
                </label>
                <label className="flex items-center gap-1">
                    <input 
                        type="checkbox" 
                        readOnly 
                        checked={formData.assistanceType === "medical"} 
                        className={checkboxClass}
                    />
                    <span>Medical Assistance</span>
                </label>
                <label className="flex items-center gap-1">
                    <input 
                        type="checkbox" 
                        readOnly 
                        checked={formData.assistanceType === "funeral"} 
                        className={checkboxClass}
                    />
                    <span>Funeral Assistance</span>
                </label>
              </div>
              
              {/* Acknowledgment Receipt Sub-Assistance Types */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6 text-xs mt-3 text-blue-700 font-medium">
                <label className="flex items-center gap-1">
                  <input 
                    type="checkbox" 
                    name="subtype-transportation" 
                    checked={formData.assistanceSubtype.includes('transportation')} 
                    onChange={handleChange} 
                    className={checkboxClass}
                  />
                  <span>Transportation Assistance</span>
                </label>
                <label className="flex items-center gap-1">
                  <input 
                    type="checkbox" 
                    name="subtype-cash" 
                    checked={formData.assistanceSubtype.includes('cash')} 
                    onChange={handleChange} 
                    className={checkboxClass}
                  />
                  <span>Cash Assistance for Support Services</span>
                </label>
                <label className="flex items-center gap-1">
                  <input 
                    type="checkbox" 
                    name="subtype-educational" 
                    checked={formData.assistanceSubtype.includes('educational')} 
                    onChange={handleChange} 
                    className={checkboxClass}
                  />
                  <span>Educational Assistance</span>
                </label>
                <label className="flex items-center gap-1">
                  <input 
                    type="checkbox" 
                    name="subtype-food" 
                    checked={formData.assistanceSubtype.includes('food')} 
                    onChange={handleChange} 
                    className={checkboxClass}
                  />
                  <span>Food Assistance</span>
                </label>
              </div>

              {/* Amount fields - FIX: text-center added for amountWords and placeholder updated */}
              <div className="flex flex-col gap-1 p-4 bg-white rounded-lg border border-blue-400 shadow-inner"> 
                  {/* Input Row */}
                  <div className="flex items-end gap-3">
                      {/* Amount in Words (Input line is now lower) */}
                      <div className="flex-1">
                          <input
                              type="text"
                              name="amountWords" 
                              value={formData.amountWords}
                              onChange={handleChange}
                              // FIX: Added a centered placeholder
                              placeholder="AMOUNT IN WORDS"
                              // Kept: text-center class
                              className="w-full border-b-2 border-blue-400 focus:border-blue-600 outline-none text-base font-black uppercase text-blue-900 text-center py-0" 
                          />
                      </div>
                      {/* Amount in Numbers */}
                      <div className="flex items-end gap-2">
                        <span className="text-lg font-black text-blue-800">Php</span>
                        <input
                          type="text"
                          name="amountNumber"
                          value={formData.amountNumber}
                          onChange={handleChange}
                          placeholder=".00"
                          // py-0 for lowest line
                          className="w-32 border-b-2 border-blue-400 focus:border-blue-700 outline-none px-2 py-0 text-xl font-black text-right"
                        />
                      </div>
                  </div>
                  {/* Label moved back inside and adjusted spacing */}
                  {/* <p className="text-xs text-gray-500 text-center mt-1">(Amount in words)</p>  */}
              </div>
            </div>

            {/* Acknowledgment Receipt Signatories - FIXED ALIGNMENT HERE */}
            <div className="grid grid-cols-3 gap-10 mt-8">
              {/* Tinanggap ni: */}
              <div className="text-center flex flex-col justify-end h-24">
                <p className="text-xs font-semibold text-blue-700 mb-1">Tinanggap ni:</p>
                <input
                  type="text"
                  name="tinanggapNi"
                  value={formData.tinanggapNi}
                  onChange={handleChange}
                  className="w-full border-b-2 border-blue-400 focus:border-blue-600 outline-none px-2 py-0 mb-0.5 text-sm font-bold text-blue-900" 
                />
                <p className="text-xs font-black uppercase text-blue-900">Beneficiary/Representative</p>
                <p className="text-[10px] text-gray-500">(Signature over Printed Name)</p>
              </div>
              {/* Binayaran ni: */}
              <div className="text-center flex flex-col justify-end h-24">
                <p className="text-xs font-semibold text-blue-700 mb-1">Binayaran ni:</p>
                <input
                  type="text"
                  name="binayaranNi"
                  value={formData.binayaranNi}
                  onChange={handleChange}
                  className="w-full border-b-2 border-blue-400 focus:border-blue-600 outline-none px-2 py-0 mb-0.5 text-sm font-bold text-blue-900" 
                />
                <p className="text-xs font-black uppercase text-blue-900">RDO / SDO</p>
                <p className="text-[10px] text-gray-500">(Signature over Printed Name)</p>
              </div>
              {/* Sinaksihan ni: */}
              <div className="text-center flex flex-col justify-end h-24">
                <p className="text-xs font-semibold text-blue-700 mb-1">Sinaksihan ni:</p>
                <input
                  type="text"
                  name="sinaksihan"
                  value={formData.sinaksihan}
                  onChange={handleChange}
                  className="w-full border-b-2 border-blue-400 focus:border-blue-600 outline-none px-2 py-0 mb-0.5 text-sm font-bold text-blue-900"
                />
                <p className="text-xs font-black uppercase text-blue-900">SWO / ADMIN</p>
                <p className="text-[10px] text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>
          </div>


          <div className="mt-6 text-right text-xs text-gray-500">
            <p>*E.O 163 series 2022</p>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 text-center border-t border-blue-100 pt-4 mt-4">
            <p>Page 1 of 1</p>
            <p className="mt-1">Field Office IV-A (CALABARZON) Alabang, Muntinlupa, Philippines</p>
            <p>Website: http://www.dswd.gov.ph Tel No: 8842-1430</p>
          </div>

          {/* FINAL CLOSING BAR */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 h-2 mt-4"></div>
          
          {/* PRINT BUTTON */}
          <div className="mt-8 mb-8 text-center print:hidden">
            <button
              onClick={handlePrint}
              // Logic to disable the button (LOGIC RETAINED)
              disabled={!areRequiredFieldsFilled(formData)}
              className="px-10 py-3 bg-green-600 text-white font-bold text-lg rounded-full shadow-2xl hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed transform hover:scale-105"
            >
              Print Certificate 🖨️
            </button>
            <p className="text-xs text-gray-500 mt-3">
              (Button is **disabled** until all required fields are filled.)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}