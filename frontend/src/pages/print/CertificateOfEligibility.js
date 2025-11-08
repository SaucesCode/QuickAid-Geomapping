import React, { useState, useRef, useCallback } from "react";
import dswdLogo from "../../assets/dswd-logo.png";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function CertificateOfEligibility({ applicant }) {
  const contentRef = useRef(null);

  // Helper function to safely get representative address details
  const getRepresentativeAddress = (rep) => {
    if (rep?.background_info?.barangay_details) {
      // Use structured data if available (preferred method)
      return {
        barangay: rep.background_info.barangay || "",
        city: rep.background_info.barangay_details.city_name || "",
        province: rep.background_info.barangay_details.province_name || "QUEZON",
      };
    } else if (rep?.background_info?.street_address) {
      // Fallback to fragile comma-split logic if only street_address is present
      const repAddr = rep.background_info.street_address;
      const parts = repAddr.split(",").map(p => p.trim());
      // Assuming structure: [House/Street No., Barangay, City, Province]
      return {
        houseNo: parts[0] || "", // Keeping houseNo if needed
        barangay: parts[1] || "",
        city: parts[2] || "",
        province: parts[3] || "QUEZON",
      };
    }
    return {
      houseNo: "",
      barangay: "",
      city: "",
      province: "QUEZON",
    };
  };

  const repAddressDetails = applicant?.representative ? getRepresentativeAddress(applicant.representative) : {};

  const initialFormData = {
    qn: applicant?.id || "",
    timeStart: applicant?.date_filled
      ? new Date(applicant.date_filled).toLocaleTimeString()
      : "",
    timeEnd: applicant?.time_end || "",
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
      ? {
          firstName: applicant.representative.background_info?.first_name || "",
          middleName: applicant.representative.background_info?.middle_initial || "",
          lastName: applicant.representative.background_info?.last_name || "",
          suffix: applicant.representative.background_info?.suffix || "",
          relationship: applicant.representative?.relationship || "",
          houseNo: repAddressDetails.houseNo || "",
          barangay: repAddressDetails.barangay || "",
          city: repAddressDetails.city || "",
          province: repAddressDetails.province || "QUEZON",
          sex: applicant.representative.background_info?.sex || "",
          age: applicant.representative.background_info?.birthday
            ? Math.floor(
                (new Date() - new Date(applicant.representative.background_info.birthday)) /
                  (1000 * 60 * 60 * 24 * 365.25)
              )
            : "",
        }
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

  const initialMainType = initialFormData.assistanceType || null;
  const [checkedMainType, setCheckedMainType] = useState(initialMainType);
  
  const [checkedSubTypesImage, setCheckedSubTypesImage] = useState({
    transportation: false,
    cashSupport: false,
    educational: false,
    food: false,
  });

  const handleRecordChange = useCallback((recordName, isChecked) => {
    setCheckedRecords((prev) => ({
      ...prev,
      [recordName]: isChecked,
    }));

    if (recordName === 'medical') {
      const type = "Medical Assistance";
      if (isChecked) {
        setFormData((prev) => ({
          ...prev,
          assistanceType: type,
        }));
        setCheckedMainType(type);
      } else if (checkedMainType === type) {
        setFormData((prev) => ({
          ...prev,
          assistanceType: "",
        }));
        setCheckedMainType(null);
      }
    }
  }, [checkedMainType]);

  const handleImageCheckboxChange = useCallback((type, name, isChecked) => {
    if (type === 'main') {
      setCheckedMainType(isChecked ? name : null);
      setFormData((prev) => ({
        ...prev,
        assistanceType: isChecked ? name : "",
      }));
      if (name === 'Medical Assistance') {
        setCheckedRecords((prev) => ({
          ...prev,
          medical: isChecked,
        }));
      }
    } else if (type === 'sub') {
      setCheckedSubTypesImage((prev) => ({
        ...prev,
        [name]: isChecked,
      }));
    }
  }, []);

  const handleGeneratePdf = async () => {
    const content = contentRef.current;
    if (!content) return;

    // Use a high scale for better resolution (DPI)
    const scale = 3; 
    const canvas = await html2canvas(content, {
      scale: scale,
      logging: false, // Set to false for cleaner console
      useCORS: true,
      // Ensure the content is captured completely
      windowWidth: content.offsetWidth,
      windowHeight: content.offsetHeight,
      scrollX: 0,
      scrollY: 0,
    });

    // CRITICAL FIX 1: Use PNG for lossless quality
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const imgProps = pdf.getImageProperties(imgData);
    
    // CRITICAL FIX 2: Force the image width to be the full width of the PDF page.
    const imgWidth = pageWidth; 
    // Calculate the corresponding height based on the captured content's aspect ratio.
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    // CRITICAL FIX 3: Multi-page slicing logic for full-width image without margins.
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add remaining pages, slicing the image correctly
    while (heightLeft > 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }
    
    // Save the PDF
    pdf.save(`COE_${formData.beneficiary.lastName}_${formData.qn}.pdf`);
  };

  const checkboxClass = "form-checkbox text-blue-600 rounded focus:ring-blue-500 w-3 h-3";
  const radioClass = "form-radio text-blue-600 focus:ring-blue-500 w-3 h-3";

  const ChecklistItem = ({ label, recordName, isOther = false }) => (
    <div className="flex items-center space-x-1 text-[9px]">
      <input
        type="checkbox"
        className={checkboxClass}
        checked={checkedRecords[recordName]}
        onChange={(e) => handleRecordChange(recordName, e.target.checked)}
      />
      <label className="text-[7px] font-medium text-gray-800 flex items-center"> {/* Reduced label font size */}
        {label}
      </label>
      {isOther && (
        <span className="flex-1 min-w-[30px] border-b border-gray-400 outline-none px-1 text-[7px] bg-transparent"> {/* Reduced min-width and font size */}
          (Specify)
        </span>
      )}
    </div>
  );

  const MainRadio = ({ label, name }) => (
    <div className="flex items-center space-x-1">
      <input
        type="radio"
        id={`main-${name}`}
        name="main-assistance-type"
        className={radioClass}
        checked={checkedMainType === name}
        onChange={(e) => handleImageCheckboxChange('main', name, e.target.checked)}
      />
      <label htmlFor={`main-${name}`} className="text-[9px] font-medium text-black">
        {label}
      </label>
    </div>
  );

  const SubCheckbox = ({ label, name }) => (
    <div className="flex items-center space-x-1">
      <input
        type="checkbox"
        id={`sub-${name}`}
        className={checkboxClass}
        checked={checkedSubTypesImage[name]}
        onChange={(e) => handleImageCheckboxChange('sub', name, e.target.checked)}
      />
      <label htmlFor={`sub-${name}`} className="text-[9px] font-medium text-black">
        {label}
      </label>
    </div>
  );

  const renderPcnBoxes = () => {
    const boxCount = 15;
    const pcn = new Array(boxCount).fill("");

    return pcn.map((_, index) => (
      <div
        key={index}
        className="w-4 h-5 border border-gray-400 bg-white flex items-center justify-center text-[10px] font-bold text-blue-900"
      >
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 font-sans print:p-0">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-adjust: exact;
          }
        }
      `}</style>
      
      {/* Set max-w to full width minus margin for better fit */}
      <div ref={contentRef} className="max-w-[200mm] mx-auto bg-white shadow-xl print:shadow-none border border-blue-100 print:border-0">
        <div className="p-2 print:p-2"> {/* Reduced padding from p-3 to p-2 */}
          {/* Header */}
          <div className="flex items-center justify-between mb-1"> {/* Reduced mb-1.5 to mb-1 */}
            <div className="flex items-center space-x-2">
              <img src={dswdLogo} alt="DSWD Logo" className="w-32 object-contain" />
            </div>
            <div className="text-right text-[8px] leading-tight">
              <div className="font-semibold uppercase text-blue-800 tracking-wider">
                CRISIS INTERVENTION SECTION
              </div>
              <div className="uppercase text-blue-700 font-medium">
                FIELD OFFICE IV-CALABARZON
              </div>
              <div className="text-[7px] text-gray-500 mt-0.5">
                DSWD-PMB-GF-011 | REV 01 / 30 SEPT 2022
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-1"> {/* Reduced mb-1.5 to mb-1 */}
            <h2 className="text-lg font-black tracking-widest uppercase text-blue-900">
              CERTIFICATE OF ELIGIBILITY
            </h2>
            <p className="text-[10px] text-blue-700 font-semibold italic">
              ({formData.assistanceType || "Assistance Type"})
            </p>
          </div>

          {/* QN PCN Time Date */}
          <div className="flex justify-between items-center mb-1 pb-0.5 border-b border-blue-200 text-[10px]"> {/* Reduced mb-1.5 to mb-1, pb-1 to pb-0.5 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <label className="text-xs font-bold text-blue-900 uppercase">QN:</label>
                <div className="text-[10px] font-medium border-b border-gray-400 w-12 text-center">
                  {formData.qn}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <label className="text-xs font-bold text-blue-900 uppercase">PCN:</label>
                <div className="flex gap-0.5">
                  {renderPcnBoxes()}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 text-[9px]">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <label className="font-semibold text-blue-700">Time Start:</label>
                  <span className="text-[10px] font-medium">{formData.timeStart}</span>
                </div>
                <div className="flex items-center gap-1">
                  <label className="font-semibold text-blue-700">Time End:</label>
                  <span className="text-[10px] font-medium">{formData.timeEnd}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <label className="font-semibold text-blue-700">Date:</label>
                <span className="text-[10px] font-medium">{`${formData.date.mm}/${formData.date.dd}/${formData.date.yyyy}`}</span>
              </div>
            </div>
          </div>

          {/* Client Status */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 items-center text-[9px] mb-1 pb-0.5 border-b border-blue-100"> {/* Reduced mb-1.5 to mb-1, pb-1 to pb-0.5 */}
            <span className="font-semibold text-blue-800">Client Status:</span>
            <span className="text-[10px] font-medium"></span>
            <div className="h-3 w-px bg-gray-300"></div>
            <span className="font-semibold text-blue-800">Walk-In Type:</span>
            <span className="text-[10px] font-medium"></span>
            <div className="h-3 w-px bg-gray-300"></div>
            <span className="font-semibold text-blue-800">Referral:</span>
            <span className="text-[10px] font-medium"></span>
          </div>

          {/* Main Certification Block */}
          <div className="bg-blue-50 p-1.5 rounded mb-1 border border-blue-300"> {/* Reduced mb-1.5 to mb-1 */}
            <p className="text-[8px] text-blue-800 font-semibold mb-0.5">
              This is to certify that:
            </p>

            <div className="flex items-end gap-2 mb-1">
              <div className="flex-1">
                <div className="border-b-2 border-blue-500 px-1 pb-0.5">
                  <span className="text-sm font-bold text-blue-900 uppercase leading-tight">
                    {`${formData.beneficiary.firstName} ${formData.beneficiary.middleName} ${formData.beneficiary.lastName} ${formData.beneficiary.suffix}`.trim()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-white px-1 py-0 rounded border border-blue-200">
                <span className="text-[8px] text-gray-600">Kasarian (Sex):</span>
                <span className="text-xs font-semibold text-blue-900">{formData.beneficiary.sex}</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[8px] font-semibold text-blue-800">Edad (Age):</span>
                <div className="border-b-2 border-blue-500 w-8 text-center">
                  <span className="text-xs font-bold text-blue-900">{formData.beneficiary.age}</span>
                </div>
              </div>
            </div>

            <div className="mb-1">
              <p className="text-[8px] text-blue-800 font-semibold mb-0.5">
                and presently residing at:
              </p>
              <div className="border-b-2 border-blue-500 px-1 pb-0.5">
                <span className="text-xs font-semibold text-blue-900">
                  {`${formData.beneficiary.address}, ${formData.beneficiary.barangay}, ${formData.beneficiary.city}, ${formData.beneficiary.province}`}
                </span>
              </div>
              <p className="text-[7px] text-gray-500 text-right mt-0.5">
                Lungsod, Lalawigan (City, Province)
              </p>
            </div>

            <p className="text-[8px] text-blue-900 bg-blue-100 p-1 rounded border-l-4 border-blue-600 font-medium mb-1">
              has been found eligible for assistance after the assessment and validation
              conducted, for him/herself or through the representation of his/her
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[8px] text-gray-600">Relationship:</span>
                <div className="border-b border-blue-500 mt-0.5 pb-0.5">
                  <span className="font-semibold text-blue-900 text-[10px]">
                    {formData.representative.relationship}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[8px] text-gray-600">Representative Name:</span>
                <div className="border-b border-blue-500 mt-0.5 pb-0.5">
                  <span className="font-semibold text-blue-900 text-[10px]">
                    {`${formData.representative.firstName} ${formData.representative.middleName} ${formData.representative.lastName} ${formData.representative.suffix}`.trim()}
                  </span>
                </div>
              </div>
            </div>
            {/* The following section was unnecessarily large for a single-line statement. */}
          </div>

          {/* Records Section - 4 COLUMNS */}
          <div className="mb-1"> {/* Reduced mb-1.5 to mb-1 */}
            <h3 className="text-[9px] font-bold text-blue-900 mb-0.5 pb-0.5 border-b border-blue-300 uppercase tracking-wider">
              Confidential Records Filed at CID
            </h3>
            {/* MODIFICATION: Reduced gap-y and gap-x for a smaller container */}
            <div className="grid grid-cols-4 gap-y-0 gap-x-0.5 text-[9px] bg-gray-50 p-1 rounded"> 
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

          <hr className="my-1 border-blue-100" /> {/* Reduced my-1.5 to my-1 */}

          {/* Recommendation Section */}
          <div className="bg-blue-100/50 p-1.5 rounded mb-1 border border-blue-300"> {/* Reduced mb-1.5 to mb-1 */}
            <p className="text-[9px] font-semibold text-blue-800 mb-0.5">
              The Client is hereby recommended to receive
            </p>

            <div className="flex flex-wrap items-center gap-2 text-[9px] font-medium text-black mb-0.5">
              <MainRadio label="Financial Assistance" name="Financial Assistance" />
              <MainRadio label="Medical Assistance" name="Medical Assistance" />
              <MainRadio label="Funeral Assistance" name="Funeral Assistance" />
            </div>

            <div className="bg-white p-1.5 rounded mb-1.5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[9px]">
                <SubCheckbox label="Transportation Assistance" name="transportation" />
                <SubCheckbox label="Cash Assistance for Support Services" name="cashSupport" />
                <SubCheckbox label="Educational Assistance" name="educational" />
                <SubCheckbox label="Food Assistance" name="food" />
              </div>
            </div>

            <div className="bg-white p-1.5 rounded ring-1 ring-blue-600">
              <div className="mb-0.5">
                <span className="text-blue-700 font-semibold text-[9px]">In the amount of</span>
                <div className="flex items-end gap-1 mt-0.5">
                  <div className="flex-1 text-blue-900 text-center uppercase pb-0.5 font-semibold text-[9px]">
                    {formData.amountWords || " "}
                  </div>
                  <span className="text-xs font-bold text-blue-800">Php.</span>
                  <div className="w-16 text-blue-900 text-center uppercase pb-0.5 font-semibold text-[9px]">
                    {formData.amountNumber || ""}
                  </div>
                  <span className="text-xs font-bold text-blue-800">.00</span>
                </div>
                <div className="w-full border-b border-blue-500 mt-0.5"></div>
              </div>

              <div className="mb-0.5">
                <span className="text-blue-700 font-semibold text-[9px]">Assistance for:</span>
                <p className="text-[7px] text-gray-600 mt-0.5 mb-0.5">
                  (Hospital bill/ Medicine/ Laboratory/ Household/ Chemotherapy/ Funeral Bill/ Daily Needs/ Dialysis/ Prosthesis/ Therapy/ School expenses)
                </p>
                <div className="w-full text-blue-900 uppercase bg-transparent text-[9px] font-semibold pb-0.5">
                  {formData.assistancePurpose || ""}
                </div>
                <div className="w-full border-b border-blue-500"></div>
              </div>

              <div className="mt-0.5 flex items-center">
                <span className="text-blue-700 font-bold uppercase text-[8px] mr-1">CHARGEABLE AGAINST: PSP</span>
                <span className="w-10 pb-[1px] border-b border-blue-500 text-[9px] font-semibold text-blue-900 text-center">
                  2025
                </span>
                <span className="ml-1 text-[7px] text-gray-500">(Year)</span>
              </div>
            </div>
          </div>

          {/* Signatories COE */}
          <div className="grid grid-cols-3 gap-3 mb-1 pt-0.5 border-t border-blue-200"> {/* Reduced mb-1.5 to mb-1, pt-1 to pt-0.5 */}
            <div className="text-center">
              <p className="text-[8px] text-blue-700 mb-2">Conforme:</p> {/* Reduced mb-4 to mb-2 */}
              <div className="border-t border-blue-500 mb-1"></div>
              <div className="flex flex-col justify-start pt-0.5">
                <p className="text-[8px] font-bold uppercase text-blue-900 text-center leading-none mb-0">
                  BENEFICIARY/REPRESENTATIVE
                </p>
                <p className="text-[6px] text-gray-500 text-center leading-none mt-0">(Signature over Printed Name)</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[8px] text-blue-700 mb-2">Prepared by:</p> {/* Reduced mb-4 to mb-2 */}
              <div className="border-t border-blue-500 mb-1"></div>
              <div className="flex flex-col justify-start pt-0.5">
                <p className="text-[8px] font-bold uppercase text-blue-900 text-center leading-none mb-0">Social Worker</p>
                <p className="text-[6px] text-gray-500 text-center leading-none mt-0">(Signature over Printed Name)</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[8px] text-blue-700 mb-2">Approved by:</p> {/* Reduced mb-4 to mb-2 */}
              <div className="border-t border-blue-500 mb-1"></div>
              <div className="flex flex-col justify-start pt-0.5">
                <p className="text-[8px] font-bold uppercase text-blue-900 text-center leading-none mb-0">
                  SWAD TEAM LEADER
                </p>
                <p className="text-[6px] text-gray-500 text-center leading-none mt-0">
                  Approving Authority (Signature over Printed Name)
                </p>
              </div>
            </div>
          </div>

          {/* Acknowledgement Receipt */}
          <div className="bg-blue-900 text-white p-0.5 mb-1 rounded-t shadow-md">
            <h3 className="text-[9px] font-bold text-center uppercase tracking-wider">
              ACKNOWLEDGEMENT RECEIPT
            </h3>
            {/* The following section was unnecessarily large for a single-line statement. */}
          </div>

          <div className="bg-blue-100/30 p-1.5 rounded-b border border-blue-300 mb-1"> {/* Reduced mb-1.5 to mb-1 */}
            <div className="mb-1.5">
              <p className="text-[9px] font-semibold text-blue-800 mb-0.5">
                Assistance Type Received:
              </p>

              <div className="grid grid-cols-3 gap-y-0.5 gap-x-2 text-[9px] font-medium text-black">
                <div className="flex items-center space-x-1">
                  <input type="checkbox" id="rec-financial" className={checkboxClass} checked={checkedMainType === "Financial Assistance"} onChange={(e) => handleImageCheckboxChange('main', 'Financial Assistance', e.target.checked)} />
                  <label htmlFor="rec-financial" className="text-[8px]">Financial Assistance</label>
                </div>
                <div className="flex items-center space-x-1">
                  <input type="checkbox" id="rec-medical" className={checkboxClass} checked={checkedMainType === "Medical Assistance"} onChange={(e) => handleImageCheckboxChange('main', 'Medical Assistance', e.target.checked)} />
                  <label htmlFor="rec-medical" className="text-[8px]">Medical Assistance</label>
                </div>
                <div className="flex items-center space-x-1">
                  <input type="checkbox" id="rec-funeral" className={checkboxClass} checked={checkedMainType === "Funeral Assistance"} onChange={(e) => handleImageCheckboxChange('main', 'Funeral Assistance', e.target.checked)} />
                  <label htmlFor="rec-funeral" className="text-[8px]">Funeral Assistance</label>
                </div>
                <div className="flex items-center space-x-1">
                  <input type="checkbox" id="rec-transportation" className={checkboxClass} checked={checkedSubTypesImage.transportation} onChange={(e) => handleImageCheckboxChange('sub', 'transportation', e.target.checked)} />
                  <label htmlFor="rec-transportation" className="text-[8px]">Transportation Assistance</label>
                </div>
                <div></div>
                <div className="flex items-center space-x-1">
                  <input type="checkbox" id="rec-cashsupport" className={checkboxClass} checked={checkedSubTypesImage.cashSupport} onChange={(e) => handleImageCheckboxChange('sub', 'cashSupport', e.target.checked)} />
                  <label htmlFor="rec-cashsupport" className="text-[8px]">Cash Assistance for Support Services</label>
                </div>
                <div className="flex items-center space-x-1">
                  <input type="checkbox" id="rec-educational" className={checkboxClass} checked={checkedSubTypesImage.educational} onChange={(e) => handleImageCheckboxChange('sub', 'educational', e.target.checked)} />
                  <label htmlFor="rec-educational" className="text-[8px]">Educational Assistance</label>
                </div>
                <div></div>
                <div className="flex items-center space-x-1">
                  <input type="checkbox" id="rec-food" className={checkboxClass} checked={checkedSubTypesImage.food} onChange={(e) => handleImageCheckboxChange('sub', 'food', e.target.checked)} />
                  <label htmlFor="rec-food" className="text-[8px]">Food Assistance</label>
                </div>
              </div>

              <div className="flex flex-col justify-end mt-1.5 text-left">
                <span className="text-blue-700 font-semibold text-[9px] mt-1">In the amount of</span>
                <div className="flex items-end gap-1">
                  <div className="flex-1 w-full text-blue-900 uppercase bg-transparent text-[9px] font-semibold pb-0.5">
                    {formData.amountWords || ""}
                  </div>
                  <span className="text-xs font-bold text-blue-900 pr-0.5">Php</span>
                  <div className="w-20 text-blue-900 uppercase bg-transparent text-xs font-bold text-center pb-0.5">
                    {formData.amountNumber || ""}
                  </div>
                  <span className="text-xs font-bold text-blue-800">.00</span>
                </div>
                <div className="w-full border-b border-blue-500"></div>
              </div>
            </div>

            {/* Acknowledgment Signatories */}
            {/* MODIFICATION: Reduced mt-4 to mt-2 for smaller spacing */}
            <div className="grid grid-cols-3 gap-2 mt-2 text-blue-900">
              <div className="text-center flex flex-col justify-end">
                <p className="text-[8px] font-semibold text-blue-700 mb-2">Tinanggap ni:</p> {/* Already mb-2 */}
                <div className="w-full border-b border-blue-500 mb-1"></div>
                <div className="flex flex-col justify-start pt-0.5">
                  <p className="text-[8px] font-bold uppercase text-center leading-none mb-0">
                    BENEFICIARY/REPRESENTATIVE
                  </p>
                  <p className="text-[6px] text-gray-500 text-center leading-none mt-0">(Signature over Printed Name)</p>
                </div>
              </div>
              <div className="text-center flex flex-col justify-end">
                <p className="text-[8px] font-semibold text-blue-700 mb-2">Binayaran ni:</p> {/* Already mb-2 */}
                <div className="w-full border-b border-blue-500 mb-1"></div>
                <div className="flex flex-col justify-start pt-0.5">
                  <p className="text-[8px] font-bold uppercase text-center leading-none mb-0">RDO / SDO</p>
                  <p className="text-[6px] text-gray-500 text-center leading-none mt-0">(Signature over Printed Name)</p>
                </div>
              </div>
              <div className="text-center flex flex-col justify-end">
                <p className="text-[8px] font-semibold text-blue-700 mb-2">Sinaksihan ni:</p> {/* Already mb-2 */}
                <div className="w-full border-b border-blue-500 mb-1"></div>
                <div className="flex flex-col justify-start pt-0.5">
                  <p className="text-[8px] font-bold uppercase text-center leading-none mb-0">SWO / ADMIN</p>
                  <p className="text-[6px] text-gray-500 text-center leading-none mt-0">(Signature over Printed Name)</p>
                </div>
              </div>
            </div>
          </div>

          
          <div className="text-gray-500 text-center pt-0 mt-0 overflow-hidden">
            {/* The scale-y-50 and scale-x-75 force the entire content to shrink, which should guarantee a fit and make the footer "ultra small" as requested. */}
            <div className="text-[8px] transform scale-y-50 scale-x-75 -translate-y-2 origin-bottom">
              
              {/* E.O. NOTE - Now inside the scaled block */}
              <div className="mt-0.5 text-right text-[8px] text-gray-500 mb-1">
                <p>*E.O 163 series 2022</p>
              </div>

              <div className="text-center border-t border-blue-100 pt-0 mt-0">
                <p className="leading-tight mb-0">Page 1 of 1</p>
                <p className="leading-tight mt-0 mb-0">
                  Field Office IV-A (CALABARZON) Alabang, Muntinlupa, Philippines
                </p>
                <p className="leading-tight mt-0">Website: http://www.dswd.gov.ph Tel No: 8842-1430</p>
              </div>
            </div>
          </div>

          {/* FINAL CLOSING BAR */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 h-1 mt-1"></div> {/* Reduced mt-1.5 to mt-1 */}
        </div>
      </div>
    </div>
  );
}