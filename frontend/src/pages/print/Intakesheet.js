// GeneralIntakeSheet.jsx
import React, { useState, useEffect, useCallback } from "react";
import dswdLogo from "../../assets/dswd-logo.png"; 

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
  // Function to check if required fields are filled (LOGIC RETAINED)
  // -------------------------
  const areRequiredFieldsFilled = useCallback((data) => {
    const requiredKeys = [
      data.qn,
      data.clientType,
      data.walkInType,
      data.beneficiary.lastName,
      data.beneficiary.firstName,
      data.beneficiary.barangay,
      data.beneficiary.city,
      data.interviewedBy
    ];

    // Check if all fields in the array are non-empty strings
    const allTextFilled = requiredKeys.every(v => typeof v === "string" && v.trim() !== "");

    return allTextFilled;
  }, []);

  // -------------------------
  // Autofill current date (LOGIC RETAINED)
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
  // timeStart: set when user first types (LOGIC RETAINED)
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
  // timeEnd: set once when required fields are all filled (LOGIC RETAINED)
  // -------------------------
  useEffect(() => {
    if (areRequiredFieldsFilled(formData) && !formData.timeEnd) {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
      setFormData(prev => ({ ...prev, timeEnd: formattedTime }));
    }
  }, [formData, areRequiredFieldsFilled]);


  // -------------------------
  // Generic change handler (LOGIC RETAINED)
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

  // limit PCN input to one char each box (LOGIC RETAINED)
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
    if (areRequiredFieldsFilled(formData)) {
      alert("Printing General Intake Sheet...");
      window.print();
    } else {
      alert("Please fill in all required fields before printing.");
    }
  };

  // Modern input classes
  const inputClass = "w-full border-gray-300 border focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-3 py-2 rounded-md text-xs transition duration-150 ease-in-out";
  const disabledInputClass = "w-full border-gray-300 border px-3 py-2 rounded-md text-xs bg-gray-100 cursor-not-allowed";

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden border border-blue-100">
        <div className="p-10">
          {/* Header row */}
          <div className="flex items-start justify-between mb-6">
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

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black tracking-widest uppercase text-blue-900">GENERAL INTAKE SHEET</h1>
            {/* Dark Blue Bar for Instruction */}
            <div className="mt-3 bg-blue-800 text-white text-xs py-1.5 rounded-sm shadow-md">MAARING MAGPATULONG SUMAGOT SA DSWD PERSONNEL</div>
          </div>

          {/* QN PCN Time Date */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-200 text-sm">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <label className="font-bold text-blue-700">QN:</label>
                <input name="qn" value={formData.qn} onChange={handleChange} className={inputClass.replace('w-full', 'w-24')} />
              </div>

              <div className="flex items-center gap-2">
                <label className="font-bold text-blue-700">PCN:</label>
                <div className="flex gap-1">
                  {formData.pcn.map((digit, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handlePCNChange(i, e.target.value)}
                      className="w-5 h-7 text-center border border-gray-300 rounded-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition duration-150 text-xs"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <label className="font-bold text-blue-700">Time Start:</label>
                <input name="timeStart" value={formData.timeStart} onChange={handleChange} readOnly className={disabledInputClass.replace('w-full', 'w-24')} />
              </div>

              <div className="flex items-center gap-2">
                <label className="font-bold text-blue-700">Date:</label>
                <input name="date.mm" value={formData.date.mm} onChange={handleChange} placeholder="MM" className={inputClass.replace('w-full', 'w-10')} />
                <input name="date.dd" value={formData.date.dd} onChange={handleChange} placeholder="DD" className={inputClass.replace('w-full', 'w-10')} />
                <input name="date.yyyy" value={formData.date.yyyy} onChange={handleChange} placeholder="YYYY" className={inputClass.replace('w-full', 'w-14')} />
              </div>
            </div>
          </div>

          {/* Client type / Walk-in / Referral / Off-site */}
          <div className="flex gap-6 items-center text-xs mb-6 pb-4 border-b border-blue-100">
            <label className="flex items-center gap-2 text-blue-800 font-medium">
              <input type="checkbox" checked={formData.clientType === "new"} onChange={() => setFormData(p => ({ ...p, clientType: "new" }))} className="form-checkbox text-blue-600" />
              <span>New</span>
            </label>

            <label className="flex items-center gap-2 text-blue-800 font-medium">
              <input type="checkbox" checked={formData.clientType === "returning"} onChange={() => setFormData(p => ({ ...p, clientType: "returning" }))} className="form-checkbox text-blue-600" />
              <span>Returning</span>
            </label>
            <div className="h-4 w-px bg-gray-300 mx-2"></div>
            <label className="flex items-center gap-2 text-blue-800 font-medium">
              <input type="radio" name="walkInType" value="onsite" checked={formData.walkInType === "onsite"} onChange={handleChange} className="form-radio text-blue-600" />
              <span>On-Site</span>
            </label>

            <label className="flex items-center gap-2 text-blue-800 font-medium">
              <input type="radio" name="walkInType" value="walkin" checked={formData.walkInType === "walkin"} onChange={handleChange} className="form-radio text-blue-600" />
              <span>Walk-in</span>
            </label>

            <label className="flex items-center gap-2 text-blue-800 font-medium">
              <input type="checkbox" name="referral.enabled" checked={formData.referral.enabled} onChange={(e) => setFormData(prev => ({ ...prev, referral: { ...prev.referral, enabled: e.target.checked } }))} className="form-checkbox text-blue-600" />
              <span>Referral</span>
            </label>

            <label className="flex items-center gap-2 text-blue-800 font-medium">
              <input type="radio" name="walkInType" value="offsite" checked={formData.walkInType === "offsite"} onChange={handleChange} className="form-radio text-blue-600" />
              <span>Off-Site</span>
            </label>
          </div>

          {/* Beneficiary Section */}
          <div className="bg-blue-700 text-white text-xs px-3 py-2 mb-4 uppercase font-bold tracking-wider rounded-t-lg shadow-md">Impormasyon ng Benepisyaryo (Beneficiary's Identifying Information)</div>

          <div className="grid grid-cols-4 gap-4 mb-4 text-xs">
            <input name="beneficiary.lastName" value={formData.beneficiary.lastName} onChange={handleChange} placeholder="Apelyido (Last Name)" className={inputClass} />
            <input name="beneficiary.firstName" value={formData.beneficiary.firstName} onChange={handleChange} placeholder="Unang Pangalan (First Name)" className={inputClass} />
            <input name="beneficiary.middleName" value={formData.beneficiary.middleName} onChange={handleChange} placeholder="Gitnang Pangalan (Middle Name)" className={inputClass} />
            <input name="beneficiary.suffix" value={formData.beneficiary.suffix} onChange={handleChange} placeholder="Ext. (Sr./Jr./II)" className={inputClass} />
          </div>

          <div className="grid grid-cols-5 gap-4 mb-4 text-xs">
            <input name="beneficiary.houseNo" value={formData.beneficiary.houseNo} onChange={handleChange} placeholder="House No./Street/Purok" className={inputClass} />
            <input name="beneficiary.barangay" value={formData.beneficiary.barangay} onChange={handleChange} placeholder="Barangay" className={inputClass} />
            <input name="beneficiary.city" value={formData.beneficiary.city} onChange={handleChange} placeholder="City/Municipality" className={inputClass} />
            <input name="beneficiary.province" value={formData.beneficiary.province} onChange={handleChange} readOnly className={disabledInputClass} />
            <input name="beneficiary.region" value={formData.beneficiary.region} onChange={handleChange} readOnly className={disabledInputClass} />
          </div>

          <div className="grid grid-cols-7 gap-3 mb-6 text-xs">
            <input name="beneficiary.mobileNo" value={formData.beneficiary.mobileNo} onChange={handleChange} placeholder="Numero ng Telepono" className={inputClass} />
            <input name="beneficiary.birthdate" value={formData.beneficiary.birthdate} onChange={handleChange} placeholder="Kapanganakan (MM/DD/YYYY)" className={inputClass} />
            <input name="beneficiary.age" value={formData.beneficiary.age} onChange={handleChange} placeholder="Edad" className={inputClass} />
            <input name="beneficiary.gender" value={formData.beneficiary.gender} onChange={handleChange} placeholder="Kasarian" className={inputClass} />
            <input name="beneficiary.civilStatus" value={formData.beneficiary.civilStatus} onChange={handleChange} placeholder="Civil Status" className={inputClass} />
            <input name="beneficiary.occupation" value={formData.beneficiary.occupation} onChange={handleChange} placeholder="Trabaho" className={inputClass} />
            <input name="beneficiary.monthlySalary" value={formData.beneficiary.monthlySalary} onChange={handleChange} placeholder="Buwanang Kita" className={inputClass} />
          </div>

          {/* Representative Section */}
          <div className="bg-blue-700 text-white text-xs px-3 py-2 mb-4 uppercase font-bold tracking-wider rounded-t-lg shadow-md">Impormasyon ng Kinatawan (Representative's Identifying Information)</div>

          <div className="grid grid-cols-4 gap-4 mb-4 text-xs">
            <input name="representative.lastName" value={formData.representative.lastName} onChange={handleChange} placeholder="Apelyido (Last Name)" className={inputClass} />
            <input name="representative.firstName" value={formData.representative.firstName} onChange={handleChange} placeholder="Unang Pangalan (First Name)" className={inputClass} />
            <input name="representative.middleName" value={formData.representative.middleName} onChange={handleChange} placeholder="Gitnang Pangalan (Middle Name)" className={inputClass} />
            <input name="representative.suffix" value={formData.representative.suffix} onChange={handleChange} placeholder="Ext. (Sr./Jr./II)" className={inputClass} />
          </div>

          <div className="grid grid-cols-5 gap-4 mb-4 text-xs">
            <input name="representative.houseNo" value={formData.representative.houseNo} onChange={handleChange} placeholder="House No./Street/Purok" className={inputClass} />
            <input name="representative.barangay" value={formData.representative.barangay} onChange={handleChange} placeholder="Barangay" className={inputClass} />
            <input name="representative.city" value={formData.representative.city} onChange={handleChange} placeholder="City/Municipality" className={inputClass} />
            <input name="representative.province" value={formData.representative.province} onChange={handleChange} readOnly className={disabledInputClass} />
            <input name="representative.region" value={formData.representative.region} onChange={handleChange} readOnly className={disabledInputClass} />
          </div>

          <div className="grid grid-cols-7 gap-3 mb-4 text-xs">
            <input name="representative.mobileNo" value={formData.representative.mobileNo} onChange={handleChange} placeholder="Numero ng Telepono" className={inputClass} />
            <input name="representative.birthdate" value={formData.representative.birthdate} onChange={handleChange} placeholder="Kapanganakan (MM/DD/YYYY)" className={inputClass} />
            <input name="representative.age" value={formData.representative.age} onChange={handleChange} placeholder="Edad" className={inputClass} />
            <input name="representative.gender" value={formData.representative.gender} onChange={handleChange} placeholder="Kasarian" className={inputClass} />
            <input name="representative.civilStatus" value={formData.representative.civilStatus} onChange={handleChange} placeholder="Civil Status" className={inputClass} />
            <input name="representative.occupation" value={formData.representative.occupation} onChange={handleChange} placeholder="Trabaho" className={inputClass} />
            <input name="representative.monthlySalary" value={formData.representative.monthlySalary} onChange={handleChange} placeholder="Buwanang Kita" className={inputClass} />
          </div>

          <div className="mb-6 text-xs">
            <input name="representative.relationship" value={formData.representative.relationship} onChange={handleChange} placeholder="Relasyon sa Benepisyaryo (Relationship to the Beneficiary)" className={inputClass} />
          </div>

          {/* Time End placement (right aligned) */}
          <div className="flex justify-end mb-8 text-sm">
            <div className="flex items-center gap-2">
              <label className="font-bold text-blue-700">Time End:</label>
              <input name="timeEnd" value={formData.timeEnd} readOnly onChange={handleChange} className={disabledInputClass.replace('w-full', 'w-32')} />
            </div>
          </div>

          {/* Page break visual */}
          <div className="border-t-4 border-blue-900 my-8 opacity-75" />

          {/* DSWD Only Header (Lighter Blue for contrast) */}
          <div className="bg-blue-100 italic text-xs px-3 py-2 mb-4 border border-blue-300 rounded-lg text-blue-800">Huwag susulatan ang DSWD lamang ang pwede gumamit (Do not write below this part, for DSWD's use only)</div>

          {/* BENEFICIARY CATEGORY & SOCIAL WORKER ASSESSMENT */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Left: Beneficiary Category */}
            <div>
              <h3 className="font-black text-sm mb-3 text-blue-800 uppercase tracking-wider">Beneficiary Category</h3>

              <div className="text-xs mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold mb-2 text-blue-700">Target Sector:</p>
                <div className="grid grid-cols-2 gap-2">
                  {/* ... Checkboxes with blue focus ... */}
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="targetSector.fhona" checked={formData.targetSector.fhona} onChange={handleChange} className="form-checkbox text-blue-600 rounded" />
                    <span>FHONA (Families Headed by Other Nieces/Nephews)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="targetSector.sc" checked={formData.targetSector.sc} onChange={handleChange} className="form-checkbox text-blue-600 rounded" />
                    <span>SC (Senior Citizens)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="targetSector.wedc" checked={formData.targetSector.wedc} onChange={handleChange} className="form-checkbox text-blue-600 rounded" />
                    <span>WEDC (Women in Especially Difficult Circumstances)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="targetSector.ypdc" checked={formData.targetSector.ypdc} onChange={handleChange} className="form-checkbox text-blue-600 rounded" />
                    <span>YPDC (Youth in Especially Difficult Circumstances)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="targetSector.ynsp" checked={formData.targetSector.ynsp} onChange={handleChange} className="form-checkbox text-blue-600 rounded" />
                    <span>YNSP (Children Not in School)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="targetSector.pwd" checked={formData.targetSector.pwd} onChange={handleChange} className="form-checkbox text-blue-600 rounded" />
                    <span>PWD (Persons with Disability)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="targetSector.plhiv" checked={formData.targetSector.plhiv} onChange={handleChange} className="form-checkbox text-blue-600 rounded" />
                    <span>PLHIV (People Living with HIV)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="targetSector.cnsp" checked={formData.targetSector.cnsp} onChange={handleChange} className="form-checkbox text-blue-600 rounded" />
                    <span>CNSP (Children Not Separated from Parents)</span>
                  </label>
                </div>
              </div>

              <div className="mt-4 text-xs p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold mb-2 text-blue-700">Specify Sub-Category:</p>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="subCategory.soloParents" checked={formData.subCategory.soloParents} onChange={handleChange} className="form-checkbox text-blue-600 rounded" />
                    <span>Solo Parents</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="subCategory.indigenous" checked={formData.subCategory.indigenous} onChange={handleChange} className="form-checkbox text-blue-600 rounded" />
                    <span>Indigenous People</span>
                  </label>
                  <label className="flex items-center gap-2 col-span-2">
                    <input type="checkbox" name="subCategory.recovering" checked={formData.subCategory.recovering} onChange={handleChange} className="form-checkbox text-blue-600 rounded" />
                    <span>Recovering Person who used drugs</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="subCategory.fourPs" checked={formData.subCategory.fourPs} onChange={handleChange} className="form-checkbox text-blue-600 rounded" />
                    <span>4PS DSWD Beneficiary</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="subCategory.streetDwellers" checked={formData.subCategory.streetDwellers} onChange={handleChange} className="form-checkbox text-blue-600 rounded" />
                    <span>Street Dwellers</span>
                  </label>
                  <label className="flex items-center gap-2 col-span-2">
                    <input type="checkbox" name="subCategory.psychosocial" checked={formData.subCategory.psychosocial} onChange={handleChange} className="form-checkbox text-blue-600 rounded" />
                    <span>Psychosocial/Mental/Learning Disability</span>
                  </label>
                  <label className="flex items-center gap-2 col-span-2">
                    <input type="checkbox" name="subCategory.stateless" checked={formData.subCategory.stateless} onChange={handleChange} className="form-checkbox text-blue-600 rounded" />
                    <span>Stateless Person/Asylum Seekers/Refugees</span>
                  </label>

                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" onChange={(e) => handleChange({ target: { name: "subCategory.others", value: e.target.checked ? formData.subCategory.others : "", type: "text" } })} className="form-checkbox text-blue-600 rounded" />
                    <span>Others:</span>
                    <input type="text" name="subCategory.others" value={formData.subCategory.others} onChange={handleChange} className="flex-1 border-b border-gray-300 focus:border-blue-500 outline-none px-1 text-xs" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Social worker's Assessment */}
            <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-4 shadow-inner text-sm">
              <h3 className="font-black mb-3 text-blue-800 uppercase tracking-wider">Social worker's Assessment</h3>
              <textarea
                name="socialWorkerAssessment"
                value={formData.socialWorkerAssessment}
                onChange={handleChange}
                rows={14}
                className="w-full border-gray-300 border rounded-lg p-3 text-xs resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Based on the information gathered and assessment of the undersigned, the client is found eligible for the provision of financial assistance. Family's financial means and resources has been exhausted, while other relatives could not extend any help as they have their own family to support. The assistance to be extended to client could support the family's needs. Hence, provision of financial assistance is being recommended."
              />
            </div>
          </div>

          {/* FAMILY COMPOSITION */}
          <div className="bg-blue-700 text-white text-xs py-2 px-3 mb-4 uppercase font-bold tracking-wider rounded-t-lg shadow-md">Komposisyon ng Pamilya (Family Composition)</div>

          <div className="mb-6">
            <table className="w-full text-xs border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-100 text-blue-800 font-semibold">
                  <th className="border-r border-b border-blue-200 px-4 py-2 text-left">Buong Pangalan (Complete Name)</th>
                  <th className="border-r border-b border-blue-200 px-4 py-2 text-left">Relasyon sa Benepisyaryo</th>
                  <th className="border-r border-b border-blue-200 px-4 py-2">Edad</th>
                  <th className="border-r border-b border-blue-200 px-4 py-2 text-left">Trabaho</th>
                  <th className="border-b border-blue-200 px-4 py-2 text-left">Buwanang Kita</th>
                </tr>
              </thead>
              <tbody>
                {formData.familyMembers.map((member, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border-r border-b border-gray-200 p-0">
                      <input type="text" value={member.name} onChange={(e) => updateFamilyMember(index, "name", e.target.value)} className="w-full px-4 py-2 border-0 text-xs bg-transparent focus:ring-0 focus:border-blue-500" />
                    </td>
                    <td className="border-r border-b border-gray-200 p-0">
                      <input type="text" value={member.relationship} onChange={(e) => updateFamilyMember(index, "relationship", e.target.value)} className="w-full px-4 py-2 border-0 text-xs bg-transparent focus:ring-0 focus:border-blue-500" />
                    </td>
                    <td className="border-r border-b border-gray-200 p-0">
                      <input type="text" value={member.age} onChange={(e) => updateFamilyMember(index, "age", e.target.value)} className="w-full px-4 py-2 border-0 text-xs text-center bg-transparent focus:ring-0 focus:border-blue-500" />
                    </td>
                    <td className="border-r border-b border-gray-200 p-0">
                      <input type="text" value={member.occupation} onChange={(e) => updateFamilyMember(index, "occupation", e.target.value)} className="w-full px-4 py-2 border-0 text-xs bg-transparent focus:ring-0 focus:border-blue-500" />
                    </td>
                    <td className="border-b border-gray-200 p-0">
                      <input type="text" value={member.monthlySalary} onChange={(e) => updateFamilyMember(index, "monthlySalary", e.target.value)} className="w-full px-4 py-2 border-0 text-xs bg-transparent focus:ring-0 focus:border-blue-500" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={addFamilyMember} className="mt-3 px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md">+ Add Family Member</button>
          </div>

          {/* ASSISTANCE TYPES */}
          <div className="grid grid-cols-3 gap-8 mb-8 text-sm">
            <div>
              <div className="font-black mb-3 text-blue-800 uppercase tracking-wider">Financial Assistance:</div>
              <div className="ml-4 space-y-2 text-xs">
                <label className="flex items-center gap-2"><input type="checkbox" name="financialAssistance.medical" checked={formData.financialAssistance.medical} onChange={handleChange} className="form-checkbox text-blue-600 rounded" /> Medical</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="financialAssistance.funeral" checked={formData.financialAssistance.funeral} onChange={handleChange} className="form-checkbox text-blue-600 rounded" /> Funeral</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="financialAssistance.transportation" checked={formData.financialAssistance.transportation} onChange={handleChange} className="form-checkbox text-blue-600 rounded" /> Transportation</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="financialAssistance.educational" checked={formData.financialAssistance.educational} onChange={handleChange} className="form-checkbox text-blue-600 rounded" /> Educational</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="financialAssistance.foodAssistance" checked={formData.financialAssistance.foodAssistance} onChange={handleChange} className="form-checkbox text-blue-600 rounded" /> Food Assistance</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="financialAssistance.cashAssistance" checked={formData.financialAssistance.cashAssistance} onChange={handleChange} className="form-checkbox text-blue-600 rounded" /> Cash Assistance</label>
              </div>
            </div>

            <div>
              <div className="font-black mb-3 text-blue-800 uppercase tracking-wider">Material Assistance:</div>
              <div className="ml-4 space-y-2 text-xs">
                <label className="flex items-center gap-2"><input type="checkbox" name="materialAssistance.familyFoodPacks" checked={formData.materialAssistance.familyFoodPacks} onChange={handleChange} className="form-checkbox text-blue-600 rounded" /> Family Food Packs</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="materialAssistance.otherFoodItems" checked={formData.materialAssistance.otherFoodItems} onChange={handleChange} className="form-checkbox text-blue-600 rounded" /> Other Food Items</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="materialAssistance.hygieneSleepingKits" checked={formData.materialAssistance.hygieneSleepingKits} onChange={handleChange} className="form-checkbox text-blue-600 rounded" /> Hygiene & Sleeping Kits</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="materialAssistance.assistiveDevice" checked={formData.materialAssistance.assistiveDevice} onChange={handleChange} className="form-checkbox text-blue-600 rounded" /> Assistive Device & Technologies</label>
              </div>
            </div>

            <div>
              <div className="font-black mb-3 text-blue-800 uppercase tracking-wider">Psychosocial Support:</div>
              <div className="ml-4 space-y-2 text-xs">
                <label className="flex items-center gap-2"><input type="checkbox" name="psychosocialSupport.pfa" checked={formData.psychosocialSupport.pfa} onChange={handleChange} className="form-checkbox text-blue-600 rounded" /> Psychological First Aid (PFA)</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="psychosocialSupport.socialWorkCounseling" checked={formData.psychosocialSupport.socialWorkCounseling} onChange={handleChange} className="form-checkbox text-blue-600 rounded" /> Social Work Counseling</label>
              </div>

              <div className="mt-4">
                <div className="font-black mb-2 text-blue-800 uppercase tracking-wider">Referral:</div>
                <div className="ml-4">
                  <input type="text" name="referral.details" value={formData.referral.details} onChange={handleChange} className="w-full border-b border-gray-300 focus:border-blue-500 outline-none px-1 text-xs" placeholder="Referral details" />
                </div>
              </div>
            </div>
          </div>

          {/* PROVIDED SECTION (Changed from green to a complementary indigo/blue) */}
          <div className="bg-indigo-50 border border-indigo-400 rounded-xl p-4 mb-8 text-sm shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-black text-indigo-800 uppercase tracking-wider">Provided</h3>
              <div className="text-sm font-semibold text-indigo-700">Fund Source: <span className="font-medium text-indigo-900">{formData.fundSource}</span></div>
            </div>

            <table className="w-full text-xs border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-indigo-200 text-indigo-900 font-bold">
                  <th className="border-r border-b border-indigo-300 px-3 py-2 w-16">#</th>
                  <th className="border-r border-b border-indigo-300 px-3 py-2">Description</th>
                  <th className="border-r border-b border-indigo-300 px-3 py-2 w-36">Amount</th>
                  <th className="border-b border-indigo-300 px-3 py-2 w-36">Fund Source</th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1 */}
                <tr className="bg-white">
                  <td className="border-r border-b border-indigo-200 px-3 py-2 text-center">1</td>
                  <td className="border-r border-b border-indigo-200 p-0">
                    <input name="provided" value={formData.provided} onChange={handleChange} placeholder="Hospital bill/ Medicines/ Funeral Bill/ etc." className="w-full px-3 py-2 border-0 text-xs bg-transparent focus:ring-0 focus:border-indigo-500" />
                  </td>
                  <td className="border-r border-b border-indigo-200 p-0">
                    <input name="amount" value={formData.amount} onChange={handleChange} className="w-full px-3 py-2 border-0 text-center text-xs bg-transparent focus:ring-0 focus:border-indigo-500" />
                  </td>
                  <td className="border-b border-indigo-200 p-0">
                    <input name="fundSource" value={formData.fundSource} onChange={handleChange} className="w-full px-3 py-2 border-0 text-center text-xs bg-transparent focus:ring-0 focus:border-indigo-500" />
                  </td>
                </tr>
                {/* Row 2 */}
                <tr className="bg-gray-50">
                  <td className="border-r border-b border-indigo-200 px-3 py-2 text-center">2</td>
                  <td className="border-r border-b border-indigo-200 px-3 py-2"></td>
                  <td className="border-r border-b border-indigo-200 px-3 py-2"></td>
                  <td className="border-b border-indigo-200 px-3 py-2"></td>
                </tr>
                {/* Row 3 */}
                <tr className="bg-white">
                  <td className="border-r border-b border-indigo-200 px-3 py-2 text-center">3</td>
                  <td className="border-r border-b border-indigo-200 px-3 py-2"></td>
                  <td className="border-r border-b border-indigo-200 px-3 py-2"></td>
                  <td className="border-b border-indigo-200 px-3 py-2"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* DECLARATION (Lighter Blue Box) */}
          <div className="bg-blue-50 border border-blue-400 p-4 mb-8 text-xs italic rounded-lg text-blue-900">
            <span className="font-semibold">DECLARATION:</span> I certify under oath that I personally accomplished the GIS Form and all the information provided herein is TRUE, CORRECT, VALID, and COMPLETE pursuant to existing laws, rules, and regulations. Furthermore, I fully understand and agree that any MISINTERPRETATION and information/data to DEFRAUD the government, including attached documents, shall cause the filing of appropriate case/s against me.*
          </div>

          {/* SIGNATORIES */}
          <div className="grid grid-cols-3 gap-10 mb-8">
            <div className="text-center">
              <div className="border-t-2 border-blue-500 pt-2 mt-12">
                <p className="text-xs font-black uppercase text-blue-900">Buong Pangalan at Pirma</p>
                <p className="text-[10px] text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>

            <div className="text-center">
              <input name="interviewedBy" value={formData.interviewedBy} onChange={handleChange} className="w-full border-b-2 border-blue-500 text-center mb-2 py-12 text-sm font-bold text-blue-900 focus:border-blue-700 outline-none" placeholder="Social worker name" />
              <div className="pt-2">
                <p className="text-xs font-black uppercase text-blue-900">Social Worker</p>
                <p className="text-[10px] text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-2 py-8 text-sm font-black whitespace-pre-line text-blue-900 uppercase">{formData.reviewedBy}</div>
              <div className="border-t-2 border-blue-500 pt-2">
                <p className="text-xs font-black uppercase text-blue-900">Approving Authority</p>
                <p className="text-[10px] text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 text-center border-t border-blue-100 pt-4">
            <p>Page 1 of 1</p>
            <p className="mt-1">Field Office IV-A (CALABARZON) Alagang Zapote Ext., Alabang, Muntinlupa, Philippines</p>
            <p>Website: http://www.dswd.gov.ph Tel No: 8842-1126</p>
          </div>
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
            Print Intake Sheet 🖨️
          </button>
          <p className="text-xs text-gray-500 mt-3">
            (Button is **disabled** until all required fields are filled.)
          </p>
        </div>
      </div>
    </div>
  );
}