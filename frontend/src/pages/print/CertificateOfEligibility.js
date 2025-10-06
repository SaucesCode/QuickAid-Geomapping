import React, { useState, useEffect } from "react";

export default function CertificateOfEligibility() {
  const [formData, setFormData] = useState({
    qn: "",
    pon: "",
    // date parts (auto-filled on mount)
    dateMM: "",
    dateDD: "",
    year: "",

    // auto times (auto-managed)
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
    assistanceSubtype: [],
    amountWords: "",
    amountNumber: "",
    chargeableAgainst: "",
    // records
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

  // Autofill date (MM, DD, YYYY) on mount
  useEffect(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const yyyy = String(now.getFullYear());
    setFormData((prev) => ({ ...prev, dateMM: mm, dateDD: dd, year: yyyy }));
  }, []);

  // Helper: which fields are required for "completion"
  const requiredKeys = [
    "name",
    "age",
    "address",
    "assistanceType",
    "amountWords",
    "amountNumber",
  ];

  // Checks whether all required fields are non-empty
  const areRequiredFieldsFilled = (data) =>
    requiredKeys.every((k) => {
      const v = data[k];
      return typeof v === "string" ? v.trim() !== "" : Boolean(v);
    });

  // Generic input change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If timeStart is not set yet, set it when the user first interacts with an input
    if (!formData.timeStart) {
      const now = new Date();
      const formattedStart = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      // set immediately in state along with processing this change below
      setFormData((prev) => ({ ...prev, timeStart: formattedStart }));
    }

    // Handle checkboxes for records and assistance subtypes
    if (type === "checkbox") {
      if (name.startsWith("record-")) {
        const key = name.replace("record-", "");
        setFormData((prev) => ({
          ...prev,
          records: { ...prev.records, [key]: checked },
        }));
        return;
      }
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
      // other checkboxes mapped to boolean top-level fields
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // For normal inputs
    // Support date inputs names dateMM, dateDD, year, etc.
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // When all required fields are filled, set timeEnd (only once)
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
  }, [
    formData.name,
    formData.age,
    formData.address,
    formData.assistanceType,
    formData.amountWords,
    formData.amountNumber,
    formData.timeEnd,
  ]);

  // JSX below is your original layout (kept structure), with added bindings for date/time fields
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-200">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 h-3"></div>

        <div className="p-8">
          {/* HEADER SECTION */}
          <div className="flex justify-between items-start mb-2">
            {/* Left: DSWD Logo */}
            <div className="flex items-center">
              <img
                src={require("../../assets/dswd-logo.png")}
                alt="DSWD Logo"
                className="w-40 h-auto object-contain"
              />
            </div>

            {/* Right: Office Info */}
            <div className="text-right leading-tight">
              <p className="text-xs font-bold text-gray-800 uppercase">
                CRISIS INTERVENTION SECTION
              </p>
              <p className="text-xs font-semibold text-gray-700 uppercase">
                FIELD OFFICE IV–CALABARZON
              </p>
              <p className="text-[10px] text-gray-600">
                DSWD–PMB–GF–013 | REV 01 / 30 SEPT 2022
              </p>
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center mt-1 mb-6">
            <h2 className="text-lg font-extrabold text-gray-900 tracking-wider uppercase">
              CERTIFICATE OF ELIGIBILITY
            </h2>
            <p className="text-sm text-gray-700 italic">
              (
              {formData.assistanceType === "financial" && "Financial Assistance"}
              {formData.assistanceType === "medical" && "Medical Assistance"}
              {formData.assistanceType === "funeral" && "Funeral Assistance"}
              {!formData.assistanceType && "Assistance Type"}
              )
            </p>
          </div>

          {/* Reference Numbers Row */}
          <div className="flex items-center justify-between gap-4 mb-6 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="font-semibold">QN:</label>
                <input
                  type="text"
                  name="qn"
                  value={formData.qn}
                  onChange={handleChange}
                  className="w-24 border border-gray-400 focus:border-blue-600 outline-none px-2 py-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="font-semibold">PCN:</label>
                <div className="flex gap-1">
                  {[...Array(15)].map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength="1"
                      className="w-6 h-8 border border-gray-400 focus:border-blue-600 outline-none text-center"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold">Date:</label>
              {/* date MM */}
              <input
                type="text"
                name="dateMM"
                value={formData.dateMM}
                onChange={handleChange}
                className="w-16 border border-gray-400 px-2 py-1 text-center"
                placeholder="mm"
              />
              {/* date DD */}
              <input
                type="text"
                name="dateDD"
                value={formData.dateDD}
                onChange={handleChange}
                className="w-16 border border-gray-400 px-2 py-1 text-center"
                placeholder="dd"
              />
              {/* year */}
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-16 border border-gray-400 px-2 py-1 text-center bg-gray-100"
                readOnly
              />
            </div>
          </div>

          {/* Display timeStart and timeEnd near the top (auto-managed) */}
          <div className="flex items-center gap-6 mb-4 text-xs">
            <div className="flex items-center gap-2">
              <label className="font-semibold">Time Start:</label>
              <input
                type="text"
                name="timeStart"
                value={formData.timeStart}
                readOnly
                className="w-28 border border-gray-400 px-2 py-1 text-center bg-gray-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold">Time End:</label>
              <input
                type="text"
                name="timeEnd"
                value={formData.timeEnd}
                readOnly
                className="w-28 border border-gray-400 px-2 py-1 text-center bg-gray-100"
              />
            </div>
          </div>

          {/* Client Type Row */}
          <div className="flex items-center gap-4 mb-6 text-xs border-t border-b border-gray-300 py-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="clientType"
                value="new"
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span>New</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="clientType"
                value="returning"
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span>Returning</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="walkinType"
                value="onsite"
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span>On-Site</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="walkinType"
                value="walkin"
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span>Walk-In</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="referral" onChange={handleChange} className="w-4 h-4" />
              <span>Referral</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="walkinType"
                value="offsite"
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span>Off-Site</span>
            </label>
          </div>

          {/* Client Information */}
          <div className="bg-blue-50 p-5 rounded-lg mb-6 border border-blue-200">
            <div className="mb-3">
              <p className="text-xs text-gray-700 mb-1">This is to certify that:</p>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Kumpletuong Pangalan (First name, Middle name, Last name)"
                className="w-full border-b-2 border-blue-400 bg-white focus:border-blue-600 outline-none px-2 py-2 rounded"
              />
            </div>

            <div className="flex items-center gap-6 mb-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-1">
                  <input type="checkbox" name="sex" value="male" onChange={handleChange} />
                  <span className="text-sm">Male</span>
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" name="sex" value="female" onChange={handleChange} />
                  <span className="text-sm">Female</span>
                </label>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs text-gray-700">Kasarian (Sex)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-700">Edad (Age)</span>
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-20 border-b-2 border-blue-400 bg-white focus:border-blue-600 outline-none px-2 py-1 rounded"
                />
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-700 mb-1">and presently residing at:</p>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="QUEZON"
                className="w-full border-b-2 border-blue-400 bg-white focus:border-blue-600 outline-none px-2 py-2 rounded"
              />
              <p className="text-xs text-gray-500 text-right mt-1">Kumpletong Tirahan (Complete Address)</p>
            </div>

            <p className="text-xs text-gray-700 bg-white p-3 rounded border-l-4 border-blue-600">
              has been found eligible for assistance after the assessment and validation conducted, for him/herself or through the representation of his/her
            </p>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <input
                type="text"
                placeholder="Relasyon ng Kinatawan sa Benepisyaryo (Relationship of the Representative to Beneficiary)"
                className="border-b-2 border-blue-400 bg-white focus:border-blue-600 outline-none px-2 py-2 rounded text-xs"
              />
              <input
                type="text"
                placeholder="Buong Pangalan ng Benepisyaryo (Name of Beneficiary)"
                className="border-b-2 border-blue-400 bg-white focus:border-blue-600 outline-none px-2 py-2 rounded text-xs"
              />
            </div>
          </div>

          {/* Records Section */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
              Records of the case as the following is/are confidentially filed at the Crisis Intervention Division (CID)
            </p>
            <div className="grid grid-cols-3 gap-y-2 gap-x-6 text-xs">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-generalIntake" onChange={handleChange} />
                <span>General Intake Sheet</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-medical" onChange={handleChange} />
                <span>Medical Certificate/Abstract</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-dischargeSummary" onChange={handleChange} />
                <span>Discharge Summary</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-validId" onChange={handleChange} />
                <span>Valid I.D. Presented</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-prescriptions" onChange={handleChange} />
                <span>Prescriptions</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-laboratory" onChange={handleChange} />
                <span>Laboratory</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-dswdId" onChange={handleChange} />
                <span>4Ps DSWD I.D.</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-statementAccount" onChange={handleChange} />
                <span>Statement of Account</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-chargeSlip" onChange={handleChange} />
                <span>Charge Slip</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-justification" onChange={handleChange} />
                <span>Justification</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-treatmentProtocol" onChange={handleChange} />
                <span>Treatment Protocol</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-funeralContract" onChange={handleChange} />
                <span>Funeral Contract</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-quotation" onChange={handleChange} />
                <span>Quotation</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-deathCertificate" onChange={handleChange} />
                <span>Death Certificate</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-deathSummary" onChange={handleChange} />
                <span>Death Summary</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-referralLetter" onChange={handleChange} />
                <span>Referral Letter</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-socialCaseStudy" onChange={handleChange} />
                <span>Social Case Study Report</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="record-others" onChange={handleChange} />
                <span>Others_____________</span>
              </label>
            </div>
          </div>

          {/* Assistance Section */}
          <div className="bg-green-50 border-2 border-green-300 p-5 rounded-lg mb-6">
            <p className="text-xs text-gray-700 mb-3">The Client is hereby recommended to receive</p>

            <div className="mb-4">
              <label className="flex items-center gap-2 font-semibold text-xs mb-3">
                <input
                  type="radio"
                  name="assistanceType"
                  value="financial"
                  checked={formData.assistanceType === "financial"}
                  onChange={handleChange}
                />
                <span>Financial Assistance</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="assistanceType"
                    value="medical"
                    checked={formData.assistanceType === "medical"}
                    onChange={handleChange}
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
                  />
                  <span>Funeral Assistance</span>
                </label>
              </div>
            </div>

            <div className="flex gap-6 mb-4 text-xs">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="subtype-transportation" onChange={handleChange} />
                <span>Transportation Assistance</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="subtype-educational" onChange={handleChange} />
                <span>Educational Assistance</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="subtype-food" onChange={handleChange} />
                <span>Food Assistance</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="subtype-cash" onChange={handleChange} />
                <span>Cash Assistance for Support Services</span>
              </label>
            </div>

            <div className="bg-white p-4 rounded border-2 border-green-400">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold">assistance for</span>
                <div className="text-xs text-gray-500">
                  (Hospital bill/ Medicine/ Laboratory/ Household/ Chemotherapy/ Funeral Bill/ Daily Needs/ Dialysis/ Prosthesis/ Therapy/ School expenses)
                </div>
              </div>
              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-700">In the amount of</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    name="amountWords"
                    value={formData.amountWords}
                    onChange={handleChange}
                    placeholder="THOUSAND PESOS ONLY"
                    className="flex-1 border-b-2 border-green-500 bg-transparent focus:border-green-700 outline-none px-2 py-2 text-sm font-semibold"
                  />
                  <span className="text-sm">Php.</span>
                  <input
                    type="text"
                    name="amountNumber"
                    value={formData.amountNumber}
                    onChange={handleChange}
                    placeholder=".000"
                    className="w-32 border-b-2 border-green-500 bg-transparent focus:border-green-700 outline-none px-2 py-2 text-lg font-bold"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs">CHARGEABLE AGAINST: PSP</span>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-20 border-b-2 border-green-500 bg-transparent focus:border-green-700 outline-none px-2 py-1"
                />
                <span className="text-xs">(Year)</span>
              </div>
            </div>
          </div>

          {/* Signatories */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-12">Conforme:</p>
              <div className="border-t-2 border-gray-400 pt-2">
                <p className="text-xs font-semibold">Beneficiary/Representative</p>
                <p className="text-xs text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-12">Prepared by:</p>
              <div className="border-t-2 border-gray-400 pt-2">
                <p className="text-xs font-semibold">Social Worker</p>
                <p className="text-xs text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-12">Approved by:</p>
              <div className="border-t-2 border-gray-400 pt-2">
                <p className="text-xs font-semibold">MARYNEL B. CALABIT, RSW</p>
                <p className="text-xs font-semibold">SWAD TEAM LEADER</p>
                <p className="text-xs text-gray-500">Approving Authority</p>
                <p className="text-xs text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>
          </div>

          {/* Page Break */}
          <div className="border-t-2 border-gray-900 my-6"></div>

          {/* Acknowledgement Receipt */}
          <div className="bg-gray-900 text-white p-3 mb-4">
            <h3 className="text-sm font-bold text-center">Acknowledgement Receipt</h3>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg border border-gray-300">
            <div className="mb-6">
              <div className="mb-3">
                <span className="text-sm font-semibold block mb-2">
                  {formData.assistanceType === "financial" && "☑ Financial Assistance"}
                  {formData.assistanceType === "medical" && "☑ Medical Assistance"}
                  {formData.assistanceType === "funeral" && "☑ Funeral Assistance"}
                  {!formData.assistanceType && "Select Assistance Type"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 border-b-2 border-gray-400 text-center py-1">
                  <span className="text-sm font-bold">{formData.amountWords || "THOUSAND PESOS ONLY"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Php</span>
                  <input
                    type="text"
                    name="amountNumber"
                    value={formData.amountNumber}
                    onChange={handleChange}
                    placeholder=".000"
                    className="w-32 border-b-2 border-gray-400 bg-transparent focus:border-blue-600 outline-none px-2 py-1 text-sm font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6 text-xs">
              <span className="text-xs font-semibold text-gray-600 w-full">Additional Assistance Types:</span>
              <label className="flex items-center gap-1">
                <input type="checkbox" name="subtype-transportation" onChange={handleChange} />
                <span>Transportation Assistance</span>
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" name="subtype-educational" onChange={handleChange} />
                <span>Educational Assistance</span>
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" name="subtype-food" onChange={handleChange} />
                <span>Food Assistance</span>
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" name="subtype-cash" onChange={handleChange} />
                <span>Cash Assistance for Support Services</span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <p className="text-xs font-semibold mb-1">Tinanggap ni:</p>
                <input
                  type="text"
                  name="tinanggapNi"
                  value={formData.tinanggapNi}
                  onChange={handleChange}
                  className="w-full border-b-2 border-gray-400 focus:border-blue-600 outline-none px-2 py-8 mb-2"
                />
                <p className="text-xs">Beneficiary/Representative</p>
                <p className="text-xs text-gray-500">(Signature over Printed Name)</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold mb-1">Binayaran ni:</p>
                <input
                  type="text"
                  name="binayaranNi"
                  value={formData.binayaranNi}
                  onChange={handleChange}
                  className="w-full border-b-2 border-gray-400 focus:border-blue-600 outline-none px-2 py-8 mb-2"
                />
                <p className="text-xs">RDO / SDO</p>
                <p className="text-xs text-gray-500">(Signature over Printed Name)</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold mb-1">Sinaksihan ni:</p>
                <input
                  type="text"
                  name="sinaksihan"
                  value={formData.sinaksihan}
                  onChange={handleChange}
                  className="w-full border-b-2 border-gray-400 focus:border-blue-600 outline-none px-2 py-8 mb-2"
                />
                <p className="text-xs">SWO / ADMIN</p>
                <p className="text-xs text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-right text-xs text-gray-500">
            <p>*E.O 163 series 2022</p>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500 border-t pt-3">
            <p>Page 1 of 1</p>
            <p>Field Office IV-A (CALABARZON) Alagang Zapote Ext., Alabang, Muntinlupa, Philippines</p>
            <p>Website: http://www.dswd.gov.ph Tel No: 8842-1430</p>
          </div>

          {/* Footer Bar */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 h-3 mt-4"></div>
        </div>
      </div>
    </div>
  );
}
