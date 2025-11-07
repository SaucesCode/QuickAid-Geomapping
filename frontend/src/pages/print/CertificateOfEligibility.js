import React, { useState, useRef,useCallback } from "react";
import dswdLogo from "../../assets/dswd-logo.png";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function CertificateOfEligibility({ applicant }) {

  const contentRef = useRef(null);

  
  const initialFormData = {
    qn: applicant?.id || "",
    timeStart: applicant?.date_filled
      ? new Date(applicant.date_filled).toLocaleTimeString()
      : "",
    timeEnd: "",
    date: {
      mm: applicant?.date_filled ? new Date(applicant.date_filled).getMonth() + 1 : "",
      dd: applicant?.date_filled ? new Date(applicant.date_filled).getDate() : "",
      yyyy: applicant?.date_filled ? new Date(applicant.date_filled).getFullYear() : "",
    },
    beneficiary: {
      firstName: applicant?.background_info?.first_name || "",
      middleName: applicant?.background_info?.middle_initial || "",
      lastName: applicant?.background_info?.last_name || "",
      suffix: applicant?.background_info?.suffix || "",
      sex: applicant?.background_info?.sex || "",
      age: applicant?.background_info?.birthday
  ? Math.floor(
      (new Date() - new Date(applicant.background_info.birthday)) /
      (1000 * 60 * 60 * 24 * 365.25)
    )
  : "",

      address: applicant?.background_info?.street_address || "",
      barangay: applicant?.background_info?.barangay || "",
      city: applicant?.background_info?.barangay_details?.city_name || "",
      province: applicant?.background_info?.barangay_details?.province_name || "",
    },
    representative: applicant?.representative
      ? (() => {
          const repAddr = applicant.representative.background_info?.street_address || "";
          const parts = repAddr.split(",").map(p => p.trim());
          return {
            firstName: applicant.representative.background_info?.first_name || "",
            middleName: applicant.representative.background_info?.middle_initial || "",
            lastName: applicant.representative.background_info?.last_name || "",
            suffix: applicant.representative.background_info?.suffix || "",
            relationship: applicant.representative?.relationship || "",
            houseNo: parts[0] || "",
            barangay: parts[1] || "",
            city: parts[2] || "",
            province: parts[3] || "QUEZON",
            sex: applicant.representative.background_info?.sex || "",
            age: applicant.representative.background_info?.birthday
              ? Math.floor(
                  (new Date() - new Date(applicant.representative.background_info.birthday)) /
                    (1000 * 60 * 60 * 24 * 365.25)
                )
              : "",
          };
        })()
      : {
          firstName: "",
          middleName: "",
          lastName: "",
          suffix: "",
          relationship: "",
          houseNo: "",
          barangay: "",
          city: "",
          province: "QUEZON",
          sex: "",
          age: "",
        },
    assistanceType: applicant?.type_of_assistance || "",
    amountWords: "",
    amountNumber: "",
    assistancePurpose: "",
  };

  
  const [formData, setFormData] = useState(initialFormData);
  const [checkedRecords, setCheckedRecords] = useState({
    medical: false,
    generalIntake: false,
    dischargeSummary: false,
    validId: false,
    prescriptions: false,
    statementAccount: false,
    dswdId: false,
    treatmentProtocol: false,
    quotation: false,
    laboratory: false,
    chargeSlip: false,
    funeralContract: false,
    deathCertificate: false,
    deathSummary: false,
    justification: false,
    referralMSWO: false,
    waiverConfidentiality: false,
    referralLetter: false,
    socialCaseStudy: false,
    others: false,
  });

  // --- NEW STATE for the image's recommendation section ---
  const [checkedMainType, setCheckedMainType] = useState(null);
  const [checkedSubTypesImage, setCheckedSubTypesImage] = useState({
    transportation: false,
    cashSupport: false,
    educational: false,
    food: false,
  });

  // LOGIC TO SET ASSISTANCE TYPE
  const handleRecordChange = useCallback((recordName, isChecked) => {
    setCheckedRecords((prev) => ({
      ...prev,
      [recordName]: isChecked,
    }));

    if (recordName === 'medical') {
      if (isChecked) {
        setFormData((prev) => ({
          ...prev,
          assistanceType: "Medical Assistance",
        }));
        setCheckedMainType("Medical Assistance");
      } else if (formData.assistanceType === "Medical Assistance") {
        setFormData((prev) => ({
          ...prev,
          assistanceType: "",
        }));
        setCheckedMainType(null);
      }
    }
  }, [formData.assistanceType]);

  // --- NEW HANDLER for the image's recommendation section ---
  const handleImageCheckboxChange = useCallback((type, name, isChecked) => {
    if (type === 'main') {
      setCheckedMainType(isChecked ? name : null);
      setFormData((prev) => ({
        ...prev,
        assistanceType: isChecked ? name : "",
      }));
    } else if (type === 'sub') {
      setCheckedSubTypesImage((prev) => ({
        ...prev,
        [name]: isChecked,
      }));
    }
  }, []);

  // --- UTILITY COMPONENTS ---
  const checkboxClass = "form-checkbox text-blue-600 rounded focus:ring-blue-500";
  const radioClass = "form-radio text-blue-600 focus:ring-blue-500";
  const nonInputClass = "w-full border-b-2 border-blue-500 bg-transparent px-2 py-0.5 text-sm font-semibold text-blue-900";

  const ChecklistItem = ({ label, recordName, isOther = false }) => (
    <div className="flex items-center space-x-2 text-xs">
      <input
        type="checkbox"
        className={checkboxClass}
        checked={checkedRecords[recordName]}
        onChange={(e) => handleRecordChange(recordName, e.target.checked)}
      />
      <label className="text-sm font-medium text-gray-800 flex items-center">
        {label}
      </label>
      {isOther && (
        <span className="flex-1 min-w-[50px] border-b border-gray-400 outline-none px-1 text-xs bg-transparent">
          (Specify)
        </span>
      )}
    </div>
  );
  const pdf = new jsPDF({ compress: true });

  const MainRadio = ({ label, name }) => (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        id={`main-${name}`}
        name="main-assistance-type"
        className={radioClass}
        checked={checkedMainType === name}
        onChange={(e) => handleImageCheckboxChange('main', name, e.target.checked)}
      />
      <label htmlFor={`main-${name}`} className="text-sm font-medium text-black">
        {label}
      </label>
    </div>
  );

  const SubCheckbox = ({ label, name }) => (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={`sub-${name}`}
        className={checkboxClass}
        checked={checkedSubTypesImage[name]}
        onChange={(e) => handleImageCheckboxChange('sub', name, e.target.checked)}
      />
      <label htmlFor={`sub-${name}`} className="text-sm font-medium text-black">
        {label}
      </label>
      </div>
  );

  // Function to create the PCN boxes array
  const renderPcnBoxes = () => {
    const boxCount = 15; // As per the image snippet
    // You would typically get the PCN from formData and map its digits, but here we just render empty boxes.
    const pcn = new Array(boxCount).fill(""); 

    return pcn.map((_, index) => (
      <div
        key={index}
        className="w-5 h-6 border border-gray-400 bg-white flex items-center justify-center text-sm font-bold text-blue-900"
      >
        {/* You could display pcn[index] here if you were populating it */}
      </div>
    ));
  };


  return (
    <div ref={contentRef} className="min-h-screen bg-gray-50 p-6 font-sans">
    <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden border border-blue-100">
      <div className="p-8">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {/* Increased size of logo to match typical document size, adjust as needed */}
              <img src={dswdLogo} alt="DSWD Logo" className="w-40 object-contain" /> 
            </div>

            <div className="text-right text-[10px] leading-snug">
              <div className="font-semibold uppercase text-blue-800 tracking-wider">
                CRISIS INTERVENTION SECTION
              </div>
              <div className="uppercase text-blue-700 font-medium">
                FIELD OFFICE IV-CALABARZON
              </div>
              <div className="text-[9px] text-gray-500 mt-1">
                DSWD-PMB-GF-011 | REV 01 / 30 SEPT 2022
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-black tracking-widest uppercase text-blue-900">
              CERTIFICATE OF ELIGIBILITY
            </h2>
            <p className="text-sm text-blue-700 font-semibold italic mt-1">
              ({formData.assistanceType || "Assistance Type"})
            </p>
          </div>

          {/* --- QN PCN Time Date --- */}
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-blue-200 text-sm">
            
            {/* Left Section: QN and PCN */}
            <div className="flex items-center gap-6">
                
                {/* QN Field (Styled to look like the image, though image only shows label) */}
                <div className="flex items-center gap-2">
                    <label className="text-lg font-bold text-blue-900 uppercase">QN:</label>
                    {/* Placeholder for QN value in a defined area */}
                    <div className="text-sm font-medium border-b border-gray-400 w-16 text-center">
                        {formData.qn}
                    </div>
                </div>

                {/* PCN Field (Grid of boxes) */}
                <div className="flex items-center gap-2">
                    <label className="text-lg font-bold text-blue-900 uppercase">PCN:</label>
                    <div className="flex gap-1">
                        {renderPcnBoxes()} {/* Renders 15 empty boxes */}
                    </div>
                </div>
            </div>

            {/* Right Section: Time and Date (Retained original styling) */}
            <div className="flex flex-col items-end gap-2 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-blue-700">Time Start:</label>
                  <span className="text-sm font-medium">{formData.timeStart}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-blue-700">Time End:</label>
                  <span className="text-sm font-medium">{formData.timeEnd}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="font-semibold text-blue-700">Date:</label>
                <span className="text-sm font-medium">{`${formData.date.mm}/${formData.date.dd}/${formData.date.yyyy}`}</span>
              </div>
            </div>
          </div>
          {/* --- END QN PCN Time Date --- */}

          {/* Client type / Walk-in / Referral / Off-site */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-xs mb-5 pb-3 border-b border-blue-100">
            <span className="font-semibold text-blue-800 mr-2">Client Status:</span>
            <span className="text-sm font-medium"></span>
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            <span className="font-semibold text-blue-800 mr-2">Walk-In Type:</span>
            <span className="text-sm font-medium"></span>
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            <span className="font-semibold text-blue-800 mr-2">Referral:</span>
            <span className="text-sm font-medium"></span>
          </div>

          {/* Main Certification Block */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-300 shadow-sm">
            <div className="mb-3">
              <p className="text-xs text-blue-800 font-semibold mb-1">
                This is to certify that:
              </p>
              <span className={nonInputClass}>
                {`${formData.beneficiary.firstName} ${formData.beneficiary.middleName} ${formData.beneficiary.lastName} ${formData.beneficiary.suffix}`}
              </span>
            </div>

            <div className="flex items-center justify-between mb-3 text-sm">
              <div className="flex gap-3 p-1 bg-white rounded-md border border-gray-200">
                <span className="text-xs text-gray-500">Kasarian (Sex):</span>
                <span className="text-sm font-medium text-blue-800">{formData.beneficiary.sex}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-800">Edad (Age):</span>
                <span className="w-16 border-b-2 border-blue-500 bg-transparent px-2 py-0.5 text-sm font-semibold text-center text-blue-900">
                  {formData.beneficiary.age}
                </span>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs text-blue-800 font-semibold mb-1">
                and presently residing at:
              </p>
              <span className={nonInputClass}>
                {`${formData.beneficiary.address}, ${formData.beneficiary.barangay}, ${formData.beneficiary.city}, ${formData.beneficiary.province}`}
              </span>
              <p className="text-[10px] text-gray-500 text-right mt-1">
                Lungsod, Lalawigan (City, Province)
              </p>
            </div>

            <p className="text-xs text-blue-900 bg-blue-100 p-2 rounded-md border-l-4 border-blue-600 font-medium">
              has been found eligible for assistance after the assessment and validation
              conducted, for him/herself or through the representation of his/her
            </p>

            <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
              <span className="text-sm font-semibold text-blue-900">
                {formData.representative.relationship}
              </span>
              <span className="text-sm font-semibold text-blue-900">
                {`${formData.representative.firstName} ${formData.representative.middleName} ${formData.representative.lastName} ${formData.representative.suffix}`}
              </span>
            </div>
          </div>

          {/* --- Records Section --- */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-blue-900 mb-3 pb-1 border-b-2 border-blue-300 uppercase tracking-wider">
              Confidential Records Filed at CID
            </h3>
            <div className="grid grid-cols-3 gap-y-2 gap-x-4 text-xs bg-gray-50 p-3 rounded-md">
              <ChecklistItem label="General Intake Sheet" recordName="generalIntake" />
              <ChecklistItem label="Medical Certificate/Abstract" recordName="medical" />
              <ChecklistItem label="Discharge Summary" recordName="dischargeSummary" />

              <ChecklistItem label="Justification" recordName="justification" />
              <ChecklistItem label="Referral Letter from MSWO" recordName="referralMSWO" />
              <ChecklistItem label="Waiver of Confidentiality" recordName="waiverConfidentiality" />

              <ChecklistItem label="Valid I.D. Presented" recordName="validId" />
              <ChecklistItem label="Prescriptions" recordName="prescriptions" />
              <ChecklistItem label="Statement of Account" recordName="statementAccount" />
              <ChecklistItem label="4Ps DSWD I.D." recordName="dswdId" />
              <ChecklistItem label="Treatment Protocol" recordName="treatmentProtocol" />
              <ChecklistItem label="Quotation" recordName="quotation" />
              <ChecklistItem label="Laboratory" recordName="laboratory" />
              <ChecklistItem label="Charge Slip" recordName="chargeSlip" />
              <ChecklistItem label="Funeral Contract" recordName="funeralContract" />
              <ChecklistItem label="Death Certificate" recordName="deathCertificate" />
              <ChecklistItem label="Death Summary" recordName="deathSummary" />
              <ChecklistItem label="Referral Letter" recordName="referralLetter" />
              <ChecklistItem label="Social Case Study Report" recordName="socialCaseStudy" />
              <ChecklistItem label="Others" recordName="others" isOther={true} />
            </div>
          </div>

          <hr className="my-5 border-blue-100" />

          <div className="bg-blue-100/50 p-4 rounded-lg mb-6 border border-blue-300">
            <p className="text-sm font-semibold text-blue-800 mb-3">
              The Client is hereby recommended to receive
            </p>

            {/* ROW 1: MAIN ASSISTANCE TYPE - RADIO BUTTONS */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-black mb-3">
              <MainRadio label="Financial Assistance" name="Financial Assistance" />
              <MainRadio label="Medical Assistance" name="Medical Assistance" />
              <MainRadio label="Funeral Assistance" name="Funeral Assistance" />
            </div>

            {/* ROW 2: SUB-ASSISTANCE TYPE - CHECKBOXES */}
            <div className="bg-white p-3 rounded-lg shadow-inner mb-5">
              <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
                <SubCheckbox label="Transportation Assistance" name="transportation" />
                <SubCheckbox label="Cash Assistance for Support Services" name="cashSupport" />
                <SubCheckbox label="Educational Assistance" name="educational" />
                <SubCheckbox label="Food Assistance" name="food" />
              </div>
            </div>

            {/* AMOUNT AND CHARGEABLE AGAINST SECTION */}
            <div className="bg-white p-4 rounded-lg shadow-lg ring-1 ring-blue-600">

              {/* In the amount of */}
              <div className="mb-3">
                <span className="text-blue-700 font-semibold">In the amount of</span>

                {/* Amount Section */}
                <div className="flex items-end gap-2 mt-1">
                  {/* Amount in words */}
                  <div className="flex-1 text-blue-900 text-center uppercase pb-1 font-semibold">
                    {formData.amountWords || " "}
                  </div>

                  <span className="text-lg font-bold text-blue-800">Php.</span>

                  {/* Amount number */}
                  <div className="w-24 text-blue-900 text-center uppercase pb-1 font-semibold">
                    {formData.amountNumber || ""}
                  </div>

                  <span className="text-lg font-bold text-blue-800">.00</span>
                </div>
                
                {/* Single blue line under entire amount section */}
                <div className="w-full border-b-2 border-blue-500 mt-1"></div>

              </div>

              {/* Assistance for - Single Line */}
              <div className="mb-3">
                <span className="text-blue-700 font-semibold">Assistance for:</span>
                <p className="text-[10px] text-gray-600 mt-1 mb-1">
                  (Hospital bill/ Medicine/ Laboratory/ Household/ Chemotherapy/ Funeral Bill/ Daily Needs/ Dialysis/ Prosthesis/ Therapy/ School expenses)
                </p>
                {/* Assistance Purpose Line */}
                <div className="w-full text-blue-900 uppercase bg-transparent text-sm font-semibold pb-1">
                  {formData.assistancePurpose || ""}
                </div>
                <div className="w-full border-b-2 border-blue-500"></div>
              </div>

              {/* Chargeable Against */}
              <div className="mt-1 flex items-center">
                <span className="text-blue-700 font-bold uppercase mr-2">CHARGEABLE AGAINST: PSP</span>
                <span className="w-16 pb-[2px] border-b-2 border-blue-500 text-sm font-semibold text-blue-900 text-center">
                  2025
                </span>
                <span className="ml-1 text-sm text-gray-500">(Year)</span>
              </div>
            </div>
          </div>

          {/* SIGNATORIES - COE */}
          <div className="grid grid-cols-3 gap-8 mb-6 pt-3 border-t border-blue-200">
            <div className="text-center">
              <p className="text-xs text-blue-700 mb-10">Conforme:</p>
              <div className="border-t-2 border-blue-500 pt-2 h-16 flex flex-col justify-end">
                <p className="text-xs font-bold uppercase text-blue-900">
                  BENEFICIARY/REPRESENTATIVE
                </p>
                <p className="text-[9px] text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-700 mb-10">Prepared by:</p>
              <div className="border-t-2 border-blue-500 pt-2 h-16 flex flex-col justify-end">
                <p className="text-xs font-bold uppercase text-blue-900">Social Worker</p>
                <p className="text-[9px] text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-700 mb-10">Approved by:</p>
              <div className="border-t-2 border-blue-500 pt-2 h-16 flex flex-col justify-end">
                <p className="text-xs font-bold uppercase text-blue-900">
                  SWAD TEAM LEADER
                </p>
                <p className="text-[9px] text-gray-500">
                  Approving Authority (Signature over Printed Name)
                </p>
              </div>
            </div>
          </div>

          {/* Acknowledgement Receipt Header */}
          <div className="bg-blue-900 text-white p-2 mb-3 rounded-t-lg shadow-md">
            <h3 className="text-sm font-bold text-center uppercase tracking-wider">
              ACKNOWLEDGEMENT RECEIPT
            </h3>
          </div>

          <div className="bg-blue-100/30 p-4 rounded-b-lg border border-blue-300">
            <div className="mb-4">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                Assistance Type Received:
              </p>

              {/* Assistance Type Checkboxes */}
              <div className="grid grid-cols-3 gap-y-2 gap-x-5 text-sm font-medium text-black">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="rec-financial" className={checkboxClass} checked={checkedMainType === "Financial Assistance"} onChange={(e) => handleImageCheckboxChange('main', 'Financial Assistance', e.target.checked)} />
                  <label htmlFor="rec-financial">Financial Assistance</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="rec-medical" className={checkboxClass} checked={checkedMainType === "Medical Assistance"} onChange={(e) => handleImageCheckboxChange('main', 'Medical Assistance', e.target.checked)} />
                  <label htmlFor="rec-medical">Medical Assistance</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="rec-funeral" className={checkboxClass} checked={checkedMainType === "Funeral Assistance"} onChange={(e) => handleImageCheckboxChange('main', 'Funeral Assistance', e.target.checked)} />
                  <label htmlFor="rec-funeral">Funeral Assistance</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="rec-transportation" className={checkboxClass} checked={checkedSubTypesImage.transportation} onChange={(e) => handleImageCheckboxChange('sub', 'transportation', e.target.checked)} />
                  <label htmlFor="rec-transportation">Transportation Assistance</label>
                </div>
                <div></div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="rec-cashsupport" className={checkboxClass} checked={checkedSubTypesImage.cashSupport} onChange={(e) => handleImageCheckboxChange('sub', 'cashSupport', e.target.checked)} />
                  <label htmlFor="rec-cashsupport">Cash Assistance for Support Services</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="rec-educational" className={checkboxClass} checked={checkedSubTypesImage.educational} onChange={(e) => handleImageCheckboxChange('sub', 'educational', e.target.checked)} />
                  <label htmlFor="rec-educational">Educational Assistance</label>
                </div>
                <div></div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="rec-food" className={checkboxClass} checked={checkedSubTypesImage.food} onChange={(e) => handleImageCheckboxChange('sub', 'food', e.target.checked)} />
                  <label htmlFor="rec-food">Food Assistance</label>
                </div>
              </div>

              {/* Amount fields */}
              <div className="flex flex-col justify-end mt-4 text-left">
  <span className="text-blue-700 font-semibold mt-4">In the amount of</span>
  <div className="flex items-end gap-2">
    <div className="flex-1 w-full text-blue-900 uppercase bg-transparent text-sm font-semibold pb-1">
      {formData.amountWords || ""}
    </div>


                  <span className="text-lg font-bold text-blue-900 pr-1">Php</span>
                  <div className="w-28 text-blue-900 uppercase bg-transparent text-lg font-bold text-center pb-1">
                    {formData.amountNumber || ""}
                  </div>
                  <span className="text-lg font-bold text-blue-800">.00</span>
                </div>
                <div className="w-full border-b-2 border-blue-500"></div>
              </div>
            
                
                {/* Removed the extra blue line here to match the image precisely */}
            
            </div>

            {/* Acknowledgment Receipt Signatories */}
            <div className="grid grid-cols-3 gap-6 mt-12 text-blue-900">
              <div className="text-center flex flex-col justify-end">
                <p className="text-sm font-semibold text-blue-700 mb-6">Tinanggap ni:</p>
                <div className="w-full border-b-2 border-blue-500 pt-2 mb-2"></div>
                <p className="text-xs font-bold uppercase">
                  BENEFICIARY/REPRESENTATIVE
                </p>
                <p className="text-[9px] text-gray-500">(Signature over Printed Name)</p>
              </div>
              <div className="text-center flex flex-col justify-end">
                <p className="text-sm font-semibold text-blue-700 mb-6">Binayaran ni:</p>
                <div className="w-full border-b-2 border-blue-500 pt-2 mb-2"></div>
                <p className="text-xs font-bold uppercase">RDO / SDO</p>
                <p className="text-[9px] text-gray-500">(Signature over Printed Name)</p>
              </div>
              <div className="text-center flex flex-col justify-end">
                <p className="text-sm font-semibold text-blue-700 mb-6">Sinaksihan ni:</p>
                <div className="w-full border-b-2 border-blue-500 pt-2 mb-2"></div>
                <p className="text-xs font-bold uppercase">SWO / ADMIN</p>
                <p className="text-[9px] text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>
          </div>

          <div className="mt-5 text-right text-xs text-gray-500">
            <p>*E.O 163 series 2022</p>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 text-center border-t border-blue-100 pt-3 mt-3">
            <p>Page 1 of 1</p>
            <p className="mt-1">
              Field Office IV-A (CALABARZON) Alabang, Muntinlupa, Philippines
            </p>
            <p>Website: http://www.dswd.gov.ph Tel No: 8842-1430</p>
          </div>

          {/* FINAL CLOSING BAR */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 h-1 mt-3"></div>
        </div>
      </div>
    </div>
  );
}