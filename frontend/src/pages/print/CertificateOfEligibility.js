import React from "react";
import dswdLogo from "../../assets/dswd-logo.png"; // Assuming this path is correct

/**
 * CertificateOfEligibility Component
 * - Fixed: The amountWords input text is now center-aligned on its underline in both the COE and Acknowledgement Receipt sections by using a centered placeholder.
 */
export default function CertificateOfEligibility({ applicant }) {
  const formData = {
    qn: applicant?.id || "",
    timeStart: applicant?.date_filled
      ? new Date(applicant.date_filled).toLocaleTimeString()
      : "",
    timeEnd: "", // you can compute if needed
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
  };

  // Modern input classes
  const inputClass =
    "w-full border-gray-300 border focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-3 py-2 rounded-md text-xs transition duration-150 ease-in-out";
  const disabledInputClass =
    "w-full border-gray-300 border px-3 py-2 rounded-md text-xs bg-gray-100 cursor-not-allowed";
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
              <img src={dswdLogo} alt="DSWD Logo" className="w-28 object-contain" />
            </div>

            <div className="text-right text-xs leading-snug">
              <div className="font-bold uppercase text-blue-800 tracking-wider">
                CRISIS INTERVENTION SECTION
              </div>
              <div className="uppercase text-blue-700 font-semibold">
                FIELD OFFICE IV-CALABARZON
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                DSWD-PMB-GF-011 | REV 01 / 30 SEPT 2022
              </div>
            </div>
          </div>
          {/* END OF HEADER SECTION */}

          <div className="text-center mt-1 mb-6">
            <h2 className="text-2xl font-black tracking-widest uppercase text-blue-900">
              CERTIFICATE OF ELIGIBILITY
            </h2>
            <p className="text-sm text-blue-700 font-semibold italic mt-1">
              (Assistance Type)
            </p>
          </div>

          {/* QN PCN Time Date - FIXED ALIGNMENT */}
          <div className="grid grid-cols-2 gap-4 items-end mb-6 pb-4 border-b border-blue-200 text-sm">
            {/* Left Column: QN and PCN */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <label className="font-bold text-blue-700 w-10 shrink-0">QN:</label>
                <span className="text-sm font-semibold">{formData.qn}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="font-bold text-blue-700 w-10 shrink-0">PCN:</label>
                <div className="flex gap-1">
                  <span className="text-sm font-semibold"></span>
                </div>
              </div>
            </div>

            {/* Right Column: Date and Time */}
            <div className="flex flex-col items-end gap-3 text-xs">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <label className="font-bold text-blue-700">Time Start:</label>
                  <span className="text-sm font-semibold">{formData.timeStart}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-bold text-blue-700">Time End:</label>
                  <span className="text-sm font-semibold">{formData.timeEnd}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="font-bold text-blue-700">Date:</label>
                <span className="text-sm font-semibold">{`${formData.date.mm}/${formData.date.dd}/${formData.date.yyyy}`}</span>
              </div>
            </div>
          </div>

          {/* Client type / Walk-in / Referral / Off-site - FIXED ALIGNMENT */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 items-center text-xs mb-6 pb-4 border-b border-blue-100">
            <span className="font-bold text-blue-800 mr-2">Client Status:</span>
            <span className="text-sm font-semibold"></span>
            <div className="h-4 w-px bg-gray-300 mx-2"></div>
            <span className="font-bold text-blue-800 mr-2">Walk-In Type:</span>
            <span className="text-sm font-semibold"></span>
            <div className="h-4 w-px bg-gray-300 mx-2"></div>
            <span className="font-bold text-blue-800 mr-2">Referral:</span>
            <span className="text-sm font-semibold"></span>
          </div>

          {/* Main Certification Block */}
          <div className="bg-blue-50 p-5 rounded-xl mb-6 border-2 border-blue-300 shadow-md">
            <div className="mb-4">
              <p className="text-xs text-blue-800 font-semibold mb-1">
                This is to certify that:
              </p>
              <span className="w-full border-b-2 border-blue-500 bg-transparent focus:border-blue-700 outline-none px-2 py-2 text-sm font-semibold">
                {`${formData.beneficiary.firstName} ${formData.beneficiary.middleName} ${formData.beneficiary.lastName} ${formData.beneficiary.suffix}`}
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-4 p-2 bg-white rounded-lg border border-gray-200">
                <span className="text-xs text-gray-500">Kasarian (Sex):</span>
                <span className="text-sm font-medium text-blue-800">{formData.beneficiary.sex}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-800">Edad (Age):</span>
                <span className="w-20 border-b-2 border-blue-500 bg-transparent focus:border-blue-700 outline-none px-2 py-1 text-sm font-bold text-center">
                  {formData.beneficiary.age}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-blue-800 font-semibold mb-1">
                and presently residing at:
              </p>
              <span className="w-full border-b-2 border-blue-500 bg-transparent focus:border-blue-700 outline-none px-2 py-2 text-sm">
                {`${formData.beneficiary.address}, ${formData.beneficiary.barangay}, ${formData.beneficiary.city}, ${formData.beneficiary.province}`}
              </span>
              <p className="text-xs text-gray-500 text-right mt-1">
                Lungsod, Lalawigan (City, Province)
              </p>
            </div>

            <p className="text-xs text-blue-900 bg-blue-100 p-3 rounded-lg border-l-4 border-blue-600 font-medium">
              has been found **eligible for assistance** after the assessment and validation
              conducted, for him/herself or through the representation of his/her
            </p>

            <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
              <span className="text-sm font-semibold">
                {formData.representative.relationship}
              </span>
              <span className="text-sm font-semibold">
                {`${formData.representative.firstName} ${formData.representative.middleName} ${formData.representative.lastName} ${formData.representative.suffix}`}
              </span>
            </div>
          </div>

          {/* Records Section */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-blue-900 mb-4 pb-2 border-b-2 border-blue-300 uppercase tracking-wider">
              Confidential Records Filed at CID
            </h3>
            <div className="grid grid-cols-3 gap-y-2 gap-x-6 text-xs bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-semibold">General Intake Sheet</span>
              <span className="text-sm font-semibold">Medical Certificate/Abstract</span>
              <span className="text-sm font-semibold">Discharge Summary</span>
              <span className="text-sm font-semibold">Valid I.D. Presented</span>
              <span className="text-sm font-semibold">Prescriptions</span>
              <span className="text-sm font-semibold">Statement of Account</span>
              <span className="text-sm font-semibold">4Ps DSWD I.D.</span>
              <span className="text-sm font-semibold">Treatment Protocol</span>
              <span className="text-sm font-semibold">Quotation</span>
              <span className="text-sm font-semibold">Discharge Summary</span>
              <span className="text-sm font-semibold">Laboratory</span>
              <span className="text-sm font-semibold">Charge Slip</span>
              <span className="text-sm font-semibold">Funeral Contract</span>
              <span className="text-sm font-semibold">Death Certificate</span>
              <span className="text-sm font-semibold">Death Summary</span>
              <span className="text-sm font-semibold">Referral Letter</span>
              <span className="text-sm font-semibold">Social Case Study Report</span>
              <span className="text-sm font-semibold">Others_____________</span>
            </div>
          </div>

          {/* Recommendation/Amount Section */}
          <div className="bg-blue-100 border-2 border-blue-500 p-5 rounded-xl mb-8 shadow-inner">
            <p className="text-sm font-semibold text-blue-800 mb-3">
              The Client is hereby recommended to receive
            </p>

            {/* MAIN ASSISTANCE TYPE SECTION */}
            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-blue-900 mb-3">
                <span className="text-sm font-semibold">{formData.assistanceType}</span>
              </div>
            </div>

            {/* TOP SUB-TYPE CHECKBOXES (CONTROLLED BY STATE) */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4 text-xs font-semibold text-blue-800 bg-white p-3 rounded-lg border border-blue-200">
              <span className="text-sm font-semibold">Transportation Assistance</span>
              <span className="text-sm font-semibold">Cash Assistance for Support Services</span>
              <span className="text-sm font-semibold">Educational Assistance</span>
              <span className="text-sm font-semibold">Food Assistance</span>
            </div>

            <div className="bg-white p-4 rounded-xl border-4 border-blue-600 shadow-lg">
              <div className="mb-3">
                <label className="text-xs font-semibold text-blue-700">In the amount of</label>
                <div className="flex items-end gap-2 mt-1">
                  <span className="flex-1 border-b-2 border-blue-500 bg-transparent focus:border-blue-700 outline-none px-2 py-0 text-sm font-bold uppercase text-center">
                  </span>

                  <span className="text-lg font-bold text-blue-800">Php.</span>
                  <span className="w-32 border-b-2 border-blue-500 bg-transparent focus:border-blue-700 outline-none px-2 py-0 text-xl font-black text-right">
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-blue-900">Assistance for:</span>
                  <div className="text-gray-500 italic">
                    (Hospital bill/ Medicine/ Laboratory/ Household/ Chemotherapy/ Funeral
                    Bill/ Daily Needs/ Dialysis/ Prosthesis/ Therapy/ School expenses)
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-blue-700">CHARGEABLE AGAINST: PSP</span>
                  <span className="w-20 border-b-2 border-blue-500 bg-transparent focus:border-blue-700 outline-none px-2 py-1 text-sm font-bold text-center">
                    {formData.date.yyyy}
                  </span>
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
                <p className="text-xs font-black uppercase text-blue-900">
                  Beneficiary/Representative
                </p>
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
              <span className="w-full border-b-2 border-gray-400 text-center mb-2 py-12 text-xs font-bold uppercase">
              </span>
              <div className="pt-2">
                <p className="text-xs font-black uppercase text-blue-900">
                  APPROVED BY / SWAD TEAM LEADER
                </p>
                <p className="text-[10px] text-gray-500">
                  Approving Authority (Signature over Printed Name)
                </p>
              </div>
            </div>
          </div>

          <div className="border-t-4 border-blue-900 my-6 opacity-75" />

          {/* Acknowledgement Receipt Header (Dark Blue) */}
          <div className="bg-blue-900 text-white p-3 mb-4 rounded-t-lg shadow-xl">
            <h3 className="text-sm font-bold text-center uppercase tracking-wider">
              Acknowledgement Receipt
            </h3>
          </div>

          {/* Acknowledgement Receipt Body */}
          <div className="bg-blue-50 p-5 rounded-b-lg border border-blue-300">
            <div className="mb-6">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                Assistance Type Received:
              </p>

              {/* Acknowledgment Receipt Main Assistance Types - Display-only based on formData.assistanceType */}
              <div className="mb-3 flex flex-wrap gap-4 text-sm font-bold text-blue-900">
                <span className="text-sm font-semibold">{formData.assistanceType}</span>
              </div>

              {/* Acknowledgment Receipt Sub-Assistance Types */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6 text-xs mt-3 text-blue-700 font-medium">
                <span className="text-sm font-semibold">Transportation Assistance</span>
                <span className="text-sm font-semibold">Cash Assistance for Support Services</span>
                <span className="text-sm font-semibold">Educational Assistance</span>
                <span className="text-sm font-semibold">Food Assistance</span>
              </div>

              {/* Amount fields - FIX: text-center added for amountWords and placeholder updated */}
              <div className="flex flex-col gap-1 p-4 bg-white rounded-lg border border-blue-400 shadow-inner">
                {/* Input Row */}
                <div className="flex items-end gap-3">
                  {/* Amount in Words (Input line is now lower) */}
                  <div className="flex-1">
                    <span className="w-full border-b-2 border-blue-400 focus:border-blue-600 outline-none text-base font-black uppercase text-blue-900 text-center py-0">
                    </span>
                  </div>
                  {/* Amount in Numbers */}
                  <div className="flex items-end gap-2">
                    <span className="text-lg font-black text-blue-800">Php</span>
                    <span className="w-32 border-b-2 border-blue-400 focus:border-blue-700 outline-none px-2 py-0 text-xl font-black text-right">
                    </span>
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
                  className="w-full border-b-2 border-blue-400 focus:border-blue-600 outline-none px-2 py-0 mb-0.5 text-sm font-bold text-blue-900"
                />
                <p className="text-xs font-black uppercase text-blue-900">
                  Beneficiary/Representative
                </p>
                <p className="text-[10px] text-gray-500">(Signature over Printed Name)</p>
              </div>
              {/* Binayaran ni: */}
              <div className="text-center flex flex-col justify-end h-24">
                <p className="text-xs font-semibold text-blue-700 mb-1">Binayaran ni:</p>
                <input
                  type="text"
                  name="binayaranNi"
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
            <p className="mt-1">
              Field Office IV-A (CALABARZON) Alabang, Muntinlupa, Philippines
            </p>
            <p>Website: http://www.dswd.gov.ph Tel No: 8842-1430</p>
          </div>

          {/* FINAL CLOSING BAR */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 h-2 mt-4"></div>
        </div>
      </div>
    </div>
  );
}
