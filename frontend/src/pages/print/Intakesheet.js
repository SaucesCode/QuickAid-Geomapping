// GeneralIntakeSheet.jsx
import React, { useState, useEffect } from "react";

/**
 * GeneralIntakeSheet
 * - Tailwind CSS based
 * - Autofill date
 * - timeStart -> set on first input event (once)
 * - timeEnd -> set once required fields are filled (once)
 *
 * Adjust: require("../../assets/dswd-logo.png") path if your assets folder differs.
 */

export default function GeneralIntakeSheet() {
  const [formData, setFormData] = useState({
    qn: "",
    pcn: Array(15).fill(""),
    timeStart: "",
    date: { mm: "", dd: "", yyyy: "" },
    clientType: "",
    walkInType: "",
    // Beneficiary Info
    beneficiary: {
      lastName: "",
      firstName: "",
      middleName: "",
      suffix: "",
      houseNo: "",
      barangay: "",
      city: "",
      province: "QUEZON",
      region: "IV-A",
      mobileNo: "",
      birthdate: "",
      age: "",
      gender: "",
      civilStatus: "",
      occupation: "",
      monthlySalary: ""
    },
    // Representative Info
    representative: {
      lastName: "",
      firstName: "",
      middleName: "",
      suffix: "",
      houseNo: "",
      barangay: "",
      city: "",
      province: "QUEZON",
      region: "IV-A",
      mobileNo: "",
      birthdate: "",
      age: "",
      gender: "",
      civilStatus: "",
      occupation: "",
      monthlySalary: "",
      relationship: ""
    },
    timeEnd: "",
    // Beneficiary Category
    targetSector: {
      fhona: false,
      sc: false,
      wedc: false,
      ypdc: false,
      ynsp: false,
      pwd: false,
      plhiv: false,
      cnsp: false
    },
    subCategory: {
      soloParents: false,
      indigenous: false,
      recovering: false,
      fourPs: false,
      streetDwellers: false,
      psychosocial: false,
      stateless: false,
      others: ""
    },
    // Family Composition
    familyMembers: [
      { name: "", relationship: "", age: "", occupation: "", monthlySalary: "" }
    ],
    // Assistance Types
    financialAssistance: {
      medical: false,
      funeral: false,
      transportation: false,
      educational: false,
      foodAssistance: false,
      cashAssistance: false,
      otherSupportServices: false
    },
    materialAssistance: {
      familyFoodPacks: false,
      otherFoodItems: false,
      hygieneSleepingKits: false,
      assistiveDevice: false
    },
    psychosocialSupport: {
      pfa: false,
      socialWorkCounseling: false
    },
    referral: {
      enabled: false,
      details: ""
    },
    provided: "",
    amount: ",000",
    fundSource: "PSP 2023",
    socialWorkerAssessment: "",
    interviewedBy: "",
    reviewedBy: "MARYNEL B. CALABIT\nSWAD TEAM LEADER"
  });

  // -------------------------
  // Autofill current date
  // -------------------------
  useEffect(() => {
    const today = new Date();
    setFormData(prev => ({
      ...prev,
      date: {
        mm: String(today.getMonth() + 1).padStart(2, "0"),
        dd: String(today.getDate()).padStart(2, "0"),
        yyyy: String(today.getFullYear())
      }
    }));
  }, []);

  // -------------------------
  // timeStart: set when user first types into any input (once)
  // uses a document-level listener capturing input events
  // -------------------------
  useEffect(() => {
    const onFirstInput = (e) => {
      setFormData(prev => {
        if (prev.timeStart) return prev;
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });
        return { ...prev, timeStart: formattedTime };
      });
      // remove listener after it fires
      document.removeEventListener("input", onFirstInput, true);
    };

    document.addEventListener("input", onFirstInput, true);
    return () => document.removeEventListener("input", onFirstInput, true);
  }, []);

  // -------------------------
  // timeEnd: set once when required fields are all filled (once)
  // Customize requiredFields variable to include the fields that must be filled
  // -------------------------
  useEffect(() => {
    const requiredFields = [
      formData.qn,
      formData.clientType,
      formData.walkInType,
      formData.beneficiary.lastName,
      formData.beneficiary.firstName,
      formData.beneficiary.barangay,
      formData.beneficiary.city,
      formData.interviewedBy
    ];

    const allFilled = requiredFields.every(v => {
      if (typeof v === "string") return v.trim() !== "";
      if (typeof v === "boolean") return v === true; // rarely used
      return v !== null && v !== undefined;
    });

    if (allFilled && !formData.timeEnd) {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
      setFormData(prev => ({ ...prev, timeEnd: formattedTime }));
    }
  }, [
    formData.qn,
    formData.clientType,
    formData.walkInType,
    formData.beneficiary.firstName,
    formData.beneficiary.lastName,
    formData.beneficiary.barangay,
    formData.beneficiary.city,
    formData.interviewedBy,
    formData.timeEnd
  ]);

  // -------------------------
  // Generic change handler
  // -------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // nested fields handling
    if (name.startsWith("beneficiary.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({ ...prev, beneficiary: { ...prev.beneficiary, [field]: value } }));
      return;
    }
    if (name.startsWith("representative.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({ ...prev, representative: { ...prev.representative, [field]: value } }));
      return;
    }
    if (name.startsWith("targetSector.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({ ...prev, targetSector: { ...prev.targetSector, [field]: checked } }));
      return;
    }
    if (name.startsWith("subCategory.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({ ...prev, subCategory: { ...prev.subCategory, [field]: type === "checkbox" ? checked : value } }));
      return;
    }
    if (name.startsWith("financialAssistance.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({ ...prev, financialAssistance: { ...prev.financialAssistance, [field]: checked } }));
      return;
    }
    if (name.startsWith("materialAssistance.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({ ...prev, materialAssistance: { ...prev.materialAssistance, [field]: checked } }));
      return;
    }
    if (name.startsWith("psychosocialSupport.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({ ...prev, psychosocialSupport: { ...prev.psychosocialSupport, [field]: checked } }));
      return;
    }
    if (name.startsWith("date.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({ ...prev, date: { ...prev.date, [field]: value } }));
      return;
    }
    if (name.startsWith("referral.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({ ...prev, referral: { ...prev.referral, [field]: type === "checkbox" ? checked : value } }));
      return;
    }
    if (name.startsWith("provided.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({ ...prev, provided: { ...(prev.provided || {}), [field]: value } }));
      return;
    }

    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // limit PCN input to one char each box
  const handlePCNChange = (index, value) => {
    const newPCN = [...formData.pcn];
    newPCN[index] = value.slice(0, 1);
    setFormData(prev => ({ ...prev, pcn: newPCN }));
  };

  const addFamilyMember = () => {
    setFormData(prev => ({ ...prev, familyMembers: [...prev.familyMembers, { name: "", relationship: "", age: "", occupation: "", monthlySalary: "" }] }));
  };

  const updateFamilyMember = (index, field, value) => {
    const newMembers = [...formData.familyMembers];
    newMembers[index][field] = value;
    setFormData(prev => ({ ...prev, familyMembers: newMembers }));
  };

  const handlePrint = () => {
    window.print();
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white border border-gray-200 shadow-lg">
        <div className="h-3 bg-gradient-to-r from-blue-700 to-blue-900" />

        <div className="p-6 print:p-4">
          {/* Header row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <img
                src={require("../../assets/dswd-logo.png")}
                alt="DSWD Logo"
                className="w-32 object-contain"
              />
            </div>

            <div className="text-right text-xs leading-tight">
              <div className="font-bold uppercase text-gray-800">CRISIS INTERVENTION SECTION</div>
              <div className="uppercase text-gray-700">FIELD OFFICE IV-CALABARZON</div>
              <div className="text-[10px] text-gray-600">DSWD-PMB-GF-011 | REV 01 / 30 SEPT 2022</div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-extrabold tracking-wide uppercase">GENERAL INTAKE SHEET</h1>
            <div className="mt-2 bg-gray-800 text-white text-xs py-1">MAARING MAGPATULONG SUMAGOT SA DSWD PERSONNEL</div>
          </div>

          {/* QN PCN Time Date */}
          <div className="flex items-center justify-between mb-4 border-b pb-3 text-xs">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="font-semibold">QN:</label>
                <input name="qn" value={formData.qn} onChange={handleChange} className="w-28 border px-2 py-1 text-xs" />
              </div>

              <div className="flex items-center gap-2">
                <label className="font-semibold">PCN:</label>
                <div className="flex gap-1">
                  {formData.pcn.map((digit, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handlePCNChange(i, e.target.value)}
                      className="w-6 h-8 text-center border"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="font-semibold">Time Start:</label>
                <input name="timeStart" value={formData.timeStart} onChange={handleChange} readOnly className="w-28 border px-2 py-1 bg-gray-100 text-xs" />
              </div>

              <div className="flex items-center gap-2">
                <label className="font-semibold">Date:</label>
                <input name="date.mm" value={formData.date.mm} onChange={handleChange} placeholder="mm" className="w-12 border px-2 py-1 text-center text-xs" />
                <input name="date.dd" value={formData.date.dd} onChange={handleChange} placeholder="dd" className="w-12 border px-2 py-1 text-center text-xs" />
                <input name="date.yyyy" value={formData.date.yyyy} onChange={handleChange} className="w-16 border px-2 py-1 text-center text-xs" />
              </div>
            </div>
          </div>

          {/* Client type / Walk-in / Referral / Off-site */}
          <div className="flex gap-6 items-center text-xs mb-4 border-b pb-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.clientType === "new"} onChange={() => setFormData(p => ({ ...p, clientType: "new" }))} />
              <span>New</span>
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.clientType === "returning"} onChange={() => setFormData(p => ({ ...p, clientType: "returning" }))} />
              <span>Returning</span>
            </label>

            <label className="flex items-center gap-2">
              <input type="radio" name="walkInType" value="onsite" checked={formData.walkInType === "onsite"} onChange={handleChange} />
              <span>On-Site</span>
            </label>

            <label className="flex items-center gap-2">
              <input type="radio" name="walkInType" value="walkin" checked={formData.walkInType === "walkin"} onChange={handleChange} />
              <span>Walk-in</span>
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" name="referral.enabled" checked={formData.referral.enabled} onChange={(e) => setFormData(prev => ({ ...prev, referral: { ...prev.referral, enabled: e.target.checked } }))} />
              <span>Referral</span>
            </label>

            <label className="flex items-center gap-2">
              <input type="radio" name="walkInType" value="offsite" checked={formData.walkInType === "offsite"} onChange={handleChange} />
              <span>Off-Site</span>
            </label>
          </div>

          {/* Beneficiary Section */}
          <div className="bg-gray-800 text-white text-xs px-2 py-1 mb-3 uppercase">Impormasyon ng Benepisyaryo (Beneficiary's Identifying Information)</div>

          <div className="grid grid-cols-4 gap-3 mb-3 text-xs">
            <input name="beneficiary.lastName" value={formData.beneficiary.lastName} onChange={handleChange} placeholder="Apelyido (Last Name)" className="border px-2 py-1" />
            <input name="beneficiary.firstName" value={formData.beneficiary.firstName} onChange={handleChange} placeholder="Unang Pangalan (First Name)" className="border px-2 py-1" />
            <input name="beneficiary.middleName" value={formData.beneficiary.middleName} onChange={handleChange} placeholder="Gitnang Pangalan (Middle Name)" className="border px-2 py-1" />
            <input name="beneficiary.suffix" value={formData.beneficiary.suffix} onChange={handleChange} placeholder="Ext. (Sr./Jr./II)" className="border px-2 py-1" />
          </div>

          <div className="grid grid-cols-5 gap-3 mb-3 text-xs">
            <input name="beneficiary.houseNo" value={formData.beneficiary.houseNo} onChange={handleChange} placeholder="House No./Street/Purok" className="border px-2 py-1" />
            <input name="beneficiary.barangay" value={formData.beneficiary.barangay} onChange={handleChange} placeholder="Barangay" className="border px-2 py-1" />
            <input name="beneficiary.city" value={formData.beneficiary.city} onChange={handleChange} placeholder="City/Municipality" className="border px-2 py-1" />
            <input name="beneficiary.province" value={formData.beneficiary.province} onChange={handleChange} className="border px-2 py-1 bg-gray-50" />
            <input name="beneficiary.region" value={formData.beneficiary.region} onChange={handleChange} className="border px-2 py-1 bg-gray-50" />
          </div>

          <div className="grid grid-cols-7 gap-2 mb-6 text-xs">
            <input name="beneficiary.mobileNo" value={formData.beneficiary.mobileNo} onChange={handleChange} placeholder="Numero ng Telepono" className="border px-2 py-1" />
            <input name="beneficiary.birthdate" value={formData.beneficiary.birthdate} onChange={handleChange} placeholder="Kapanganakan" className="border px-2 py-1" />
            <input name="beneficiary.age" value={formData.beneficiary.age} onChange={handleChange} placeholder="Edad" className="border px-2 py-1" />
            <input name="beneficiary.gender" value={formData.beneficiary.gender} onChange={handleChange} placeholder="Kasarian" className="border px-2 py-1" />
            <input name="beneficiary.civilStatus" value={formData.beneficiary.civilStatus} onChange={handleChange} placeholder="Civil Status" className="border px-2 py-1" />
            <input name="beneficiary.occupation" value={formData.beneficiary.occupation} onChange={handleChange} placeholder="Trabaho" className="border px-2 py-1" />
            <input name="beneficiary.monthlySalary" value={formData.beneficiary.monthlySalary} onChange={handleChange} placeholder="Buwanang Kita" className="border px-2 py-1" />
          </div>

          {/* Representative Section */}
          <div className="bg-gray-800 text-white text-xs px-2 py-1 mb-3 uppercase">Impormasyon ng Kinatawan (Representative's Identifying Information)</div>

          <div className="grid grid-cols-4 gap-3 mb-3 text-xs">
            <input name="representative.lastName" value={formData.representative.lastName} onChange={handleChange} placeholder="Apelyido (Last Name)" className="border px-2 py-1" />
            <input name="representative.firstName" value={formData.representative.firstName} onChange={handleChange} placeholder="Unang Pangalan (First Name)" className="border px-2 py-1" />
            <input name="representative.middleName" value={formData.representative.middleName} onChange={handleChange} placeholder="Gitnang Pangalan (Middle Name)" className="border px-2 py-1" />
            <input name="representative.suffix" value={formData.representative.suffix} onChange={handleChange} placeholder="Ext. (Sr./Jr./II)" className="border px-2 py-1" />
          </div>

          <div className="grid grid-cols-5 gap-3 mb-3 text-xs">
            <input name="representative.houseNo" value={formData.representative.houseNo} onChange={handleChange} placeholder="House No./Street/Purok" className="border px-2 py-1" />
            <input name="representative.barangay" value={formData.representative.barangay} onChange={handleChange} placeholder="Barangay" className="border px-2 py-1" />
            <input name="representative.city" value={formData.representative.city} onChange={handleChange} placeholder="City/Municipality" className="border px-2 py-1" />
            <input name="representative.province" value={formData.representative.province} onChange={handleChange} className="border px-2 py-1 bg-gray-50" />
            <input name="representative.region" value={formData.representative.region} onChange={handleChange} className="border px-2 py-1 bg-gray-50" />
          </div>

          <div className="grid grid-cols-7 gap-2 mb-6 text-xs">
            <input name="representative.mobileNo" value={formData.representative.mobileNo} onChange={handleChange} placeholder="Numero ng Telepono" className="border px-2 py-1" />
            <input name="representative.birthdate" value={formData.representative.birthdate} onChange={handleChange} placeholder="Kapanganakan" className="border px-2 py-1" />
            <input name="representative.age" value={formData.representative.age} onChange={handleChange} placeholder="Edad" className="border px-2 py-1" />
            <input name="representative.gender" value={formData.representative.gender} onChange={handleChange} placeholder="Kasarian" className="border px-2 py-1" />
            <input name="representative.civilStatus" value={formData.representative.civilStatus} onChange={handleChange} placeholder="Civil Status" className="border px-2 py-1" />
            <input name="representative.occupation" value={formData.representative.occupation} onChange={handleChange} placeholder="Trabaho" className="border px-2 py-1" />
            <input name="representative.monthlySalary" value={formData.representative.monthlySalary} onChange={handleChange} placeholder="Buwanang Kita" className="border px-2 py-1" />
          </div>

          <div className="mb-6 text-xs">
            <input name="representative.relationship" value={formData.representative.relationship} onChange={handleChange} placeholder="Relasyon sa Benepisyaryo (Relationship to the Beneficiary)" className="w-full border px-2 py-1" />
          </div>

          {/* Time End placement (right aligned) */}
          <div className="flex justify-end mb-6 text-xs">
            <div className="flex items-center gap-2">
              <label className="font-semibold">Time End:</label>
              <input name="timeEnd" value={formData.timeEnd} readOnly onChange={handleChange} className="w-32 border px-2 py-1 bg-gray-100" />
            </div>
          </div>

          {/* Page break visual */}
          <div className="border-t-2 border-gray-800 my-6" />

          {/* DSWD Only Header */}
          <div className="bg-gray-200 italic text-xs px-2 py-1 mb-3">Huwag susulatan ang DSWD lamang ang pwede gumamit (Do not write below this part, for DSWD's use only)</div>

          {/* BENEFICIARY CATEGORY & SOCIAL WORKER ASSESSMENT */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Left: Beneficiary Category */}
            <div>
              <h3 className="font-bold text-sm mb-2">Beneficiary Category</h3>

              <div className="text-xs mb-3">
                <p className="font-semibold mb-2">Target Sector:</p>
                <div className="grid grid-cols-2 gap-1">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="targetSector.fhona" checked={formData.targetSector.fhona} onChange={handleChange} />
                    <span>FHONA</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="targetSector.sc" checked={formData.targetSector.sc} onChange={handleChange} />
                    <span>SC</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="targetSector.wedc" checked={formData.targetSector.wedc} onChange={handleChange} />
                    <span>WEDC</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="targetSector.ypdc" checked={formData.targetSector.ypdc} onChange={handleChange} />
                    <span>YPDC</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="targetSector.ynsp" checked={formData.targetSector.ynsp} onChange={handleChange} />
                    <span>YNSP</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="targetSector.pwd" checked={formData.targetSector.pwd} onChange={handleChange} />
                    <span>PWD</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="targetSector.plhiv" checked={formData.targetSector.plhiv} onChange={handleChange} />
                    <span>PLHIV</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="targetSector.cnsp" checked={formData.targetSector.cnsp} onChange={handleChange} />
                    <span>CNSP</span>
                  </label>
                </div>
              </div>

              <div className="mt-2 text-xs">
                <p className="font-semibold mb-2">Specify Sub-Category:</p>
                <div className="grid grid-cols-2 gap-1">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="subCategory.soloParents" checked={formData.subCategory.soloParents} onChange={handleChange} />
                    <span>Solo Parents</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="subCategory.indigenous" checked={formData.subCategory.indigenous} onChange={handleChange} />
                    <span>Indigenous People</span>
                  </label>
                  <label className="flex items-center gap-2 col-span-2">
                    <input type="checkbox" name="subCategory.recovering" checked={formData.subCategory.recovering} onChange={handleChange} />
                    <span>Recovering Person who used drugs</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="subCategory.fourPs" checked={formData.subCategory.fourPs} onChange={handleChange} />
                    <span>4PS DSWD Beneficiary</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="subCategory.streetDwellers" checked={formData.subCategory.streetDwellers} onChange={handleChange} />
                    <span>Street Dwellers</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="subCategory.psychosocial" checked={formData.subCategory.psychosocial} onChange={handleChange} />
                    <span>Psychosocial/Mental/Learning Disability</span>
                  </label>
                  <label className="flex items-center gap-2 col-span-2">
                    <input type="checkbox" name="subCategory.stateless" checked={formData.subCategory.stateless} onChange={handleChange} />
                    <span>Stateless Person/Asylum Seekers/Refugees</span>
                  </label>

                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" onChange={(e) => handleChange({ target: { name: "subCategory.others", value: e.target.checked ? formData.subCategory.others : "", type: "text" } })} />
                    <span>Others:</span>
                    <input type="text" name="subCategory.others" value={formData.subCategory.others} onChange={handleChange} className="flex-1 border-b px-1 text-xs" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Social worker's Assessment */}
            <div className="bg-blue-50 border border-blue-300 rounded p-3 text-xs">
              <h3 className="font-bold mb-2">Social worker's Assessment</h3>
              <textarea
                name="socialWorkerAssessment"
                value={formData.socialWorkerAssessment}
                onChange={handleChange}
                rows={12}
                className="w-full border rounded px-2 py-2 text-xs"
                placeholder="Based on the information gathered and assessment of the undersigned, the client is found eligible for the provision of financial assistance. Family's financial means and resources has been exhausted, while other relatives could not extend any help as they have their own family to support. The assistance to be extended to client could support the family's needs. Hence, provision of financial assistance is being recommended."
              />
            </div>
          </div>

          {/* FAMILY COMPOSITION */}
          <div className="bg-gray-800 text-white text-xs py-1 px-2 mb-3 uppercase">Komposisyon ng Pamilya (Family Composition)</div>

          <div className="mb-4">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-2 py-1">Buong Pangalan (Complete Name)</th>
                  <th className="border px-2 py-1">Relasyon sa Benepisyaryo</th>
                  <th className="border px-2 py-1">Edad</th>
                  <th className="border px-2 py-1">Trabaho</th>
                  <th className="border px-2 py-1">Buwanang Kita</th>
                </tr>
              </thead>
              <tbody>
                {formData.familyMembers.map((member, index) => (
                  <tr key={index}>
                    <td className="border p-0">
                      <input type="text" value={member.name} onChange={(e) => updateFamilyMember(index, "name", e.target.value)} className="w-full px-2 py-1 border-0 text-xs" />
                    </td>
                    <td className="border p-0">
                      <input type="text" value={member.relationship} onChange={(e) => updateFamilyMember(index, "relationship", e.target.value)} className="w-full px-2 py-1 border-0 text-xs" />
                    </td>
                    <td className="border p-0">
                      <input type="text" value={member.age} onChange={(e) => updateFamilyMember(index, "age", e.target.value)} className="w-full px-2 py-1 border-0 text-xs" />
                    </td>
                    <td className="border p-0">
                      <input type="text" value={member.occupation} onChange={(e) => updateFamilyMember(index, "occupation", e.target.value)} className="w-full px-2 py-1 border-0 text-xs" />
                    </td>
                    <td className="border p-0">
                      <input type="text" value={member.monthlySalary} onChange={(e) => updateFamilyMember(index, "monthlySalary", e.target.value)} className="w-full px-2 py-1 border-0 text-xs" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={addFamilyMember} className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded">+ Add Family Member</button>
          </div>

          {/* ASSISTANCE TYPES */}
          <div className="grid grid-cols-3 gap-6 mb-6 text-xs">
            <div>
              <div className="font-semibold mb-2">Financial Assistance:</div>
              <div className="ml-4 space-y-2">
                <label className="flex items-center gap-2"><input type="checkbox" name="financialAssistance.medical" checked={formData.financialAssistance.medical} onChange={handleChange} /> Medical</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="financialAssistance.funeral" checked={formData.financialAssistance.funeral} onChange={handleChange} /> Funeral</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="financialAssistance.transportation" checked={formData.financialAssistance.transportation} onChange={handleChange} /> Transportation</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="financialAssistance.educational" checked={formData.financialAssistance.educational} onChange={handleChange} /> Educational</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="financialAssistance.foodAssistance" checked={formData.financialAssistance.foodAssistance} onChange={handleChange} /> Food Assistance</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="financialAssistance.cashAssistance" checked={formData.financialAssistance.cashAssistance} onChange={handleChange} /> Cash Assistance</label>
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2">Material Assistance:</div>
              <div className="ml-4 space-y-2">
                <label className="flex items-center gap-2"><input type="checkbox" name="materialAssistance.familyFoodPacks" checked={formData.materialAssistance.familyFoodPacks} onChange={handleChange} /> Family Food Packs</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="materialAssistance.otherFoodItems" checked={formData.materialAssistance.otherFoodItems} onChange={handleChange} /> Other Food Items</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="materialAssistance.hygieneSleepingKits" checked={formData.materialAssistance.hygieneSleepingKits} onChange={handleChange} /> Hygiene & Sleeping Kits</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="materialAssistance.assistiveDevice" checked={formData.materialAssistance.assistiveDevice} onChange={handleChange} /> Assistive Device & Technologies</label>
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2">Psychosocial Support:</div>
              <div className="ml-4 space-y-2">
                <label className="flex items-center gap-2"><input type="checkbox" name="psychosocialSupport.pfa" checked={formData.psychosocialSupport.pfa} onChange={handleChange} /> Psychological First Aid (PFA)</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="psychosocialSupport.socialWorkCounseling" checked={formData.psychosocialSupport.socialWorkCounseling} onChange={handleChange} /> Social Work Counseling</label>
              </div>

              <div className="mt-4">
                <div className="font-semibold mb-2">Referral:</div>
                <div className="ml-4">
                  <input type="text" name="referral.details" value={formData.referral.details} onChange={handleChange} className="w-full border-b px-1 text-xs" placeholder="Referral details" />
                </div>
              </div>
            </div>
          </div>

          {/* PROVIDED SECTION */}
          <div className="bg-green-50 border border-green-400 rounded p-3 mb-6 text-xs">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Provided</h3>
              <div className="text-sm font-semibold">Fund Source: <span className="font-normal">{formData.fundSource}</span></div>
            </div>

            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-2 py-1 w-12">#</th>
                  <th className="border px-2 py-1">Description</th>
                  <th className="border px-2 py-1 w-32">Amount</th>
                  <th className="border px-2 py-1 w-32">Fund Source</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1 text-center">1</td>
                  <td className="border p-0">
                    <input name="provided" value={formData.provided} onChange={handleChange} placeholder="Hospital bill/ Medicines/ Laboratories/ Hemodialysis/ Chemotherapy/ Funeral Bill/ Daily Needs/ Operation Procedure/ Therapy/ School expenses/ Transportation expenses" className="w-full px-2 py-1 border-0 text-xs" />
                  </td>
                  <td className="border p-0">
                    <input name="amount" value={formData.amount} onChange={handleChange} className="w-full px-2 py-1 border-0 text-center text-xs" />
                  </td>
                  <td className="border p-0">
                    <input name="fundSource" value={formData.fundSource} onChange={handleChange} className="w-full px-2 py-1 border-0 text-center text-xs" />
                  </td>
                </tr>

                <tr>
                  <td className="border px-2 py-1 text-center">2</td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                </tr>

                <tr>
                  <td className="border px-2 py-1 text-center">3</td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* DECLARATION */}
          <div className="bg-gray-100 border border-gray-300 p-3 mb-6 text-xs italic">
            I certify under oath that I personally accomplished the GIS Form and all the information provided herein is TRUE, CORRECT, VALID, and COMPLETE pursuant to existing laws, rules, and regulations. Furthermore, I fully understand and agree that any MISINTERPRETATION and information/data to DEFRAUD the government, including attached documents, shall cause the filing of appropriate case/s against me.*
          </div>

          {/* SIGNATORIES */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 mt-12">
                <p className="text-xs font-semibold">Buong Pangalan at Pirma</p>
                <p className="text-xs text-gray-600">(Signature over Printed Name)</p>
              </div>
            </div>

            <div className="text-center">
              <input name="interviewedBy" value={formData.interviewedBy} onChange={handleChange} className="w-full border-b-2 border-gray-400 text-center mb-2 py-12 text-xs" placeholder="Social worker name" />
              <div className="pt-2">
                <p className="text-xs font-semibold">Social Worker</p>
                <p className="text-xs text-gray-600">(Signature over Printed Name)</p>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-2 py-8 text-xs font-bold whitespace-pre-line">{formData.reviewedBy}</div>
              <div className="border-t-2 border-gray-400 pt-2">
                <p className="text-xs font-semibold">Approving Authority</p>
                <p className="text-xs text-gray-600">(Signature over Printed Name)</p>
              </div>
            </div>
          </div>

          {/* Print button
          <div className="flex justify-center mb-6">
            <button onClick={handlePrint} className="bg-blue-700 text-white px-4 py-2 rounded text-xs hover:bg-blue-800">Print / Save as PDF</button>
          </div> */}

          {/* Footer */}
          <div className="text-xs text-gray-600 text-center border-t pt-4">
            <p>Page 1 of 1</p>
            <p className="mt-2">Field Office IV-A (CALABARZON) Alagang Zapote Ext., Alabang, Muntinlupa, Philippines</p>
            <p>Website: http://www.dswd.gov.ph Tel No: 8842-1126</p>
          </div>
        </div>

        <div className="h-3 bg-gradient-to-r from-blue-700 to-blue-900" />
      </div>
    </div>
  );
}
