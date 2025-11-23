// GeneralIntakeSheet.jsx
import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dswdLogo from "../../assets/dswd-logo.png";

const toTitleCase = str => {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(" ")
    .map(function (word) {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

export default function GeneralIntakeSheet({ applicant }) {
  // Initial data derived from props or defaults
  const initialFormData = {
    beneficiary: {
      lastName: applicant?.background_info?.last_name || "",
      firstName: applicant?.background_info?.first_name || "",
      middleName: applicant?.background_info?.middle_initial || "",
      suffix: applicant?.background_info?.suffix || "",
      houseNo: applicant?.background_info?.street_address || "",
      barangay: applicant?.background_info?.barangay || "",
      city: applicant?.background_info?.barangay_details?.city_name || "",
      province: applicant?.background_info?.barangay_details?.province_name || "QUEZON",
      region: applicant?.background_info?.barangay_details?.region_name || "IV-A",
      mobileNo: applicant?.contact_number || "",
      birthdate: applicant?.background_info?.birthday || "",
      age: applicant?.background_info?.birthday
        ? Math.floor(
            (new Date() - new Date(applicant.background_info.birthday)) /
              (1000 * 60 * 60 * 24 * 365.25)
          )
        : "",
      gender: applicant?.background_info?.sex || "",
      civilStatus: applicant?.background_info?.civil_status || "",
      occupation: applicant?.background_info?.occupation || "",
      monthlySalary: applicant?.background_info?.monthly_income || "",
    },
    representative: applicant?.representative
      ? (() => {
          const addr = applicant.representative.background_info?.street_address || "";
          const parts = addr.split(",").map(p => p.trim());

          return {
            lastName: applicant.representative.background_info?.last_name || "",
            firstName: applicant.representative.background_info?.first_name || "",
            middleName: applicant.representative.background_info?.middle_initial || "",
            suffix: applicant.representative.background_info?.suffix || "",
            houseNo: parts[0] || "",
            barangay: parts[1] || "",
            city: parts[2] || "",
            province: parts[3] || "QUEZON",
            region:
              applicant.representative.background_info?.barangay_details?.region_name ||
              "IV-A",
            mobileNo: applicant.representative.background_info?.contact_number || "",
            birthdate: applicant.representative.background_info?.birthday || "",
            age: applicant.representative.background_info?.birthday
              ? Math.floor(
                  (new Date() - new Date(applicant.representative.background_info.birthday)) /
                    (1000 * 60 * 60 * 24 * 365.25)
                )
              : "",
            gender: applicant.representative.background_info?.sex || "",
            civilStatus: applicant.representative.background_info?.civil_status || "",
            occupation: applicant.representative.background_info?.occupation || "",
            monthlySalary: applicant.representative.background_info?.monthly_income || "",
            relationship: applicant.representative?.relationship || "",
          };
        })()
      : {
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
          relationship: "",
        },
    date: {
      mm: applicant?.date_filled ? new Date(applicant.date_filled).getMonth() + 1 : "",
      dd: applicant?.date_filled ? new Date(applicant.date_filled).getDate() : "",
      yyyy: applicant?.date_filled ? new Date(applicant.date_filled).getFullYear() : "",
    },
    timeStart: applicant?.date_filled
      ? new Date(applicant.date_filled).toLocaleTimeString()
      : "",
    typeOfAssistance: applicant?.type_of_assistance || "",
    applicantType: applicant?.applicant_type || "",
    familyMembers: applicant?.family_composition || [],
    approvingAuthorityName: "",
    approvingAuthorityDesignation: "SWAD TEAM LEADER",
    fundSource: "PSP 2023",
  };

  // State initialization
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = "QuickAid | General Intake Sheet";

    const handleBeforePrint = () => {
      document.title = "";
    };

    const handleAfterPrint = () => {
      document.title = "QuickAid | General Intake Sheet";
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      document.title = originalTitle;
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  const handleGeneralChange = (field, value) => {
    let newValue = value;
    if (field === "approvingAuthorityName") {
      newValue = value.toUpperCase();
    }

    setFormData(prevFormData => ({
      ...prevFormData,
      [field]: newValue,
    }));
  };

  const contentRef = useRef();

  const handleFamilyMemberChange = (index, field, value) => {
    let newValue = value;

    if (field === "name") {
      newValue = toTitleCase(value);
    } else if (["relationship", "occupation", "monthly_income"].includes(field)) {
      newValue = value.toUpperCase();
    }

    setFormData(prevFormData => {
      const updatedMembers = prevFormData.familyMembers.map((member, i) =>
        i === index ? { ...member, [field]: newValue } : member
      );
      return {
        ...prevFormData,
        familyMembers: updatedMembers,
      };
    });
  };

  const spanClass = "w-full px-2 py-1 text-[10px]";
  const placeholderSpanClass = "w-full px-2 py-1 text-[10px] text-gray-400";

  const renderValue = (value, placeholder) => {
    return value ? (
      <span className={spanClass}>{value}</span>
    ) : (
      <span className={placeholderSpanClass}>{placeholder}</span>
    );
  };

  const renderCheckbox = checked => {
    // MODIFICATION: Reduced checkbox size
    return (
      <span className="form-checkbox text-blue-600 rounded text-[10px]">
        {checked ? "[✔]" : "[ ]"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 font-sans print:p-0">
      <div className="max-w-[200mm] mx-auto bg-white shadow-xl print:shadow-none border border-blue-100 print:border-0">
        <div className="p-2">
          {/* Header row */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <img src={dswdLogo} alt="DSWD Logo" className="w-32 object-contain" />
            </div>

            <div className="text-right text-[8px] leading-tight">
              <div className="font-bold uppercase text-blue-800 tracking-wider">
                CRISIS INTERVENTION SECTION
              </div>
              <div className="uppercase text-blue-700 font-semibold">
                FIELD OFFICE IV-CALABARZON
              </div>
              <div className="text-[7px] text-gray-500 mt-0.5">
                DSWD-PMB-GF-011 | REV 01 / 30 SEPT 2022
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-2">
            <h1 className="text-lg font-black tracking-widest uppercase text-blue-900">
              GENERAL INTAKE SHEET
            </h1>
            <div className="mt-1 bg-blue-800 text-white text-[9px] py-1 rounded-sm shadow-md">
              MAARING MAGPATULONG SUMAGOT SA DSWD PERSONNEL
            </div>
          </div>

          {/* QN PCN Time Date */}
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-blue-200 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <label className="font-bold text-blue-700 text-xs">QN:</label>
                {renderValue(formData.beneficiary.qn, "QN")}
              </div>

              <div className="flex items-center gap-1">
                <label className="font-bold text-blue-700 text-xs">PCN:</label>
                <div className="flex gap-0.5">
                  {Array(15)
                    .fill("")
                    .map((_, i) => (
                      <span
                        key={i}
                        className="w-4 h-5 text-center border border-gray-300 rounded-sm text-[8px]"
                      ></span>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <label className="font-bold text-blue-700 text-[10px]">Time Start:</label>
                <span className="text-[10px]">{formData.timeStart}</span>
              </div>

              <div className="flex items-center gap-1">
                <label className="font-bold text-blue-700 text-[10px]">Date:</label>
                <span className="text-[10px]">
                  {`${formData.date.mm}/${formData.date.dd}/${formData.date.yyyy}`}
                </span>
              </div>
            </div>
          </div>

          {/* Client type / Walk-in / Referral / Off-site */}
          <div className="flex gap-4 items-center text-[10px] mb-2 pb-1 border-b border-blue-100">
            <label className="flex items-center gap-1 text-blue-800 font-medium">
              {renderCheckbox(formData.applicantType === "new")}
              <span>New</span>
            </label>

            <label className="flex items-center gap-1 text-blue-800 font-medium">
              {renderCheckbox(formData.applicantType === "returning")}
              <span>Returning</span>
            </label>
            <div className="h-3 w-px bg-gray-300 mx-1"></div>
            <span className="font-semibold text-blue-800">Walk-In Type:</span>
            <span className="text-[10px] font-medium"></span>
            <div className="h-3 w-px bg-gray-300 mx-1"></div>
            <span className="font-semibold text-blue-800">Referral:</span>
            <span className="text-[10px] font-medium"></span>
          </div>

          {/* Beneficiary Section */}
          <div className="bg-blue-700 text-white text-[10px] px-2 py-1 mb-1 uppercase font-bold tracking-wider rounded-t-lg shadow-md">
            Impormasyon ng Benepisyaryo (Beneficiary's Identifying Information)
          </div>

          <div className="grid grid-cols-4 gap-2 mb-1 text-[10px]">
            {renderValue(formData.beneficiary.lastName, "Apelyido (Last Name)")}
            {renderValue(formData.beneficiary.firstName, "Unang Pangalan (First Name)")}
            {renderValue(formData.beneficiary.middleName, "Gitnang Pangalan (Middle Name)")}
            {renderValue(formData.beneficiary.suffix, "Ext. (Sr./Jr./II)")}
          </div>

          <div className="grid grid-cols-5 gap-2 mb-1 text-[10px]">
            {renderValue(formData.beneficiary.houseNo, "House No./Street/Purok")}
            {renderValue(formData.beneficiary.barangay, "Barangay")}
            {renderValue(formData.beneficiary.city, "City/Municipality")}
            {renderValue(formData.beneficiary.province, "Province")}
            {renderValue(formData.beneficiary.region, "Region")}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2 text-[10px]">
            {renderValue(formData.beneficiary.mobileNo, "Numero ng Telepono")}
            {renderValue(formData.beneficiary.birthdate, "Kapanganakan (MM/DD/YYYY)")}
            {renderValue(formData.beneficiary.age, "Edad")}
            {renderValue(formData.beneficiary.gender, "Kasarian")}
            {renderValue(formData.beneficiary.civilStatus, "Civil Status")}
            {renderValue(formData.beneficiary.occupation, "Trabaho")}
            {renderValue(formData.beneficiary.monthlySalary, "Buwanang Kita")}
          </div>

          {/* Representative Section */}
          <div className="bg-blue-700 text-white text-[10px] px-2 py-1 mb-1 uppercase font-bold tracking-wider rounded-t-lg shadow-md">
            Impormasyon ng Kinatawan (Representative's Identifying Information)
          </div>

          <div className="grid grid-cols-4 gap-2 mb-1 text-[10px]">
            {renderValue(formData.representative.lastName, "Apelyido (Last Name)")}
            {renderValue(formData.representative.firstName, "Unang Pangalan (First Name)")}
            {renderValue(formData.representative.middleName, "Gitnang Pangalan (Middle Name)")}
            {renderValue(formData.representative.suffix, "Ext. (Sr./Jr./II)")}
          </div>

          <div className="grid grid-cols-5 gap-2 mb-1 text-[10px]">
            {renderValue(formData.representative.houseNo, "House No./Street/Purok")}
            {renderValue(formData.representative.barangay, "Barangay")}
            {renderValue(formData.representative.city, "City/Municipality")}
            {renderValue(formData.representative.province, "Province")}
            {renderValue(formData.representative.region, "Region")}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1 text-[10px]">
            {renderValue(formData.representative.mobileNo, "Numero ng Telepono")}
            {renderValue(formData.representative.birthdate, "Kapanganakan (MM/DD/YYYY)")}
            {renderValue(formData.representative.age, "Edad")}
            {renderValue(formData.representative.gender, "Kasarian")}
            {renderValue(formData.representative.civilStatus, "Civil Status")}
            {renderValue(formData.representative.occupation, "Trabaho")}
            {renderValue(formData.representative.monthlySalary, "Buwanang Kita")}
          </div>

          <div className="mb-2 text-[10px]">
            {renderValue(
              formData.representative.relationship,
              "Relasyon sa Benepisyaryo (Relationship to the Beneficiary)"
            )}
          </div>

          {/* Time End placement (right aligned) */}
          <div className="flex justify-end mb-3 text-[10px]">
            <div className="flex items-end gap-1">
              <label className="font-bold text-blue-700">Time End:</label>
              <span className="w-24 h-[10px] border-b border-gray-400"></span>
            </div>
          </div>

          {/* Page break visual */}
          <div className="border-t-4 border-blue-900 my-3 opacity-75" />

          {/* DSWD Only Header */}
          <div className="bg-blue-100 italic text-[9px] px-2 py-1 mb-2 border border-blue-300 rounded-lg text-blue-800">
            Huwağ susulatan ang DSWD lamang ang pwede gumit (Do not write below this part, for
            DSWD's use only)
          </div>

          {/* FAMILY COMPOSITION */}
          <div className="bg-blue-700 text-white text-[10px] py-1 px-2 mb-2 uppercase font-bold tracking-wider rounded-t-lg shadow-md">
            Komposisyon ng Pamilya (Family Composition)
          </div>

          {/* Family Composition Table with 1 empty row */}
          <div className="mb-2">
            <table className="w-full text-[10px] border border-gray-400 border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-100 text-blue-800 font-semibold">
                  <th className="border-r border-b border-gray-400 px-2 py-1 text-left">
                    Buong Pangalan (Complete Name)
                  </th>
                  <th className="border-r border-b border-gray-400 px-2 py-1 text-left">
                    Relasyon sa Benepisyaryo
                  </th>
                  <th className="border-r border-b border-gray-400 px-2 py-1">Edad</th>
                  <th className="border-r border-b border-gray-400 px-2 py-1 text-left">
                    Trabaho
                  </th>
                  <th className="border-b border-gray-400 px-2 py-1 text-left">
                    Buwanang Kita
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border-r border-b border-gray-400 px-2 py-2"></td>
                  <td className="border-r border-b border-gray-400 px-2 py-2"></td>
                  <td className="border-r border-b border-gray-400 px-2 py-2"></td>
                  <td className="border-r border-b border-gray-400 px-2 py-2"></td>
                  <td className="border-b border-gray-400 px-2 py-2"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SIGNATORIES */}
          <div className="grid grid-cols-3 gap-8 mb-4">
            <div className="text-center">
              <div className="border-t-2 border-blue-500 pt-1 mt-4">
                <p className="text-[10px] font-black uppercase text-blue-900">
                  Buong Pangalan at Pirma
                </p>
                <p className="text-[8px] text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>

            <div className="text-center">
              <div className="w-full border-b-2 border-blue-500 text-center mb-1 py-8 text-sm font-bold text-blue-900 focus:border-blue-700 outline-none"></div>
              <div className="pt-1">
                <p className="text-[10px] font-black uppercase text-blue-900">Social Worker</p>
                <p className="text-[8px] text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>

            <div className="text-center mt-2">
              <input
                type="text"
                value={formData.approvingAuthorityName}
                onChange={e => handleGeneralChange("approvingAuthorityName", e.target.value)}
                className="w-full text-center mb-1 py-1 text-[10px] font-black text-blue-900 uppercase focus:outline-none bg-transparent"
                placeholder=" "
              />

              <div className="border-t-2 border-blue-500 pt-1">
                <p className="text-[10px] font-black uppercase text-blue-900">
                  Approving Authority
                </p>
                <p className="text-[8px] text-gray-500">(Signature over Printed Name)</p>
              </div>

              <div className="text-[9px] font-semibold text-blue-800 uppercase mt-1">
                {formData.approvingAuthorityDesignation}
              </div>
            </div>
          </div>

          <div className="text-gray-500 text-center pt-0 mt-0 overflow-hidden">
            <div className="text-[8px] transform scale-y-50 scale-x-75 -translate-y-2 origin-bottom">
              <div className="mt-0.5 text-right text-[8px] text-gray-500 mb-1">
                <p>*E.O 163 series 2022</p>
              </div>

              <div className="text-center border-t border-blue-100 pt-0 mt-0">
                <p className="leading-tight mb-0">Page 1 of 1</p>
                <p className="leading-tight mt-0 mb-0">
                  Field Office IV-A (CALABARZON) Alabang, Muntinlupa, Philippines
                </p>
                <p className="leading-tight mt-0">
                  Website: http://www.dswd.gov.ph Tel No: 8842-1430
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FINAL CLOSING BAR */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 h-2 mt-2"></div>
      </div>
    </div>
  );
}
