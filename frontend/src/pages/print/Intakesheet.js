// GeneralIntakeSheet.jsx
import React from "react";
import dswdLogo from "../../assets/dswd-logo.png";

/**
 * GeneralIntakeSheet
 * - Tailwind CSS based
 * - Displays applicant data
 */

export default function GeneralIntakeSheet({ applicant }) {
  const formData = {
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
    reviewedBy: "MARYNEL B. CALABIT\nSWAD TEAM LEADER",
    fundSource: "PSP 2023",
  };

  const spanClass = "w-full px-3 py-2 text-xs";
  const placeholderSpanClass = "w-full px-3 py-2 text-xs text-gray-400";

  const renderValue = (value, placeholder) => {
    return value ? (
      <span className={spanClass}>{value}</span>
    ) : (
      <span className={placeholderSpanClass}>{placeholder}</span>
    );
  };

  const renderCheckbox = checked => {
    return (
      <span className="form-checkbox text-blue-600 rounded">{checked ? "[✔]" : "[ ]"}</span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden border border-blue-100">
        <div className="p-10">
          {/* Header row */}
          <div className="flex items-start justify-between mb-6">
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

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black tracking-widest uppercase text-blue-900">
              GENERAL INTAKE SHEET
            </h1>
            <div className="mt-3 bg-blue-800 text-white text-xs py-1.5 rounded-sm shadow-md">
              MAARING MAGPATULONG SUMAGOT SA DSWD PERSONNEL
            </div>
          </div>

          {/* QN PCN Time Date */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-200 text-sm">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <label className="font-bold text-blue-700">QN:</label>
                {renderValue(applicant?.id, "QN")}
              </div>

              <div className="flex items-center gap-2">
                <label className="font-bold text-blue-700">PCN:</label>
                <div className="flex gap-1">
                  {Array(15)
                    .fill("")
                    .map((_, i) => (
                      <span
                        key={i}
                        className="w-5 h-7 text-center border border-gray-300 rounded-sm"
                      ></span>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <label className="font-bold text-blue-700">Time Start:</label>
                {renderValue(formData.timeStart)}
              </div>

              <div className="flex items-center gap-2">
                <label className="font-bold text-blue-700">Date:</label>
                {renderValue(
                  `${formData.date.mm}/${formData.date.dd}/${formData.date.yyyy}`,
                  "MM/DD/YYYY"
                )}
              </div>
            </div>
          </div>

          {/* Client type / Walk-in / Referral / Off-site */}
          <div className="flex gap-6 items-center text-xs mb-6 pb-4 border-b border-blue-100">
            <label className="flex items-center gap-2 text-blue-800 font-medium">
              {renderCheckbox(formData.applicantType === "new")}
              <span>New</span>
            </label>

            <label className="flex items-center gap-2 text-blue-800 font-medium">
              {renderCheckbox(formData.applicantType === "returning")}
              <span>Returning</span>
            </label>
            <div className="h-4 w-px bg-gray-300 mx-2"></div>
            {/* Add logic for walkInType if available in applicant data */}
          </div>

          {/* Beneficiary Section */}
          <div className="bg-blue-700 text-white text-xs px-3 py-2 mb-4 uppercase font-bold tracking-wider rounded-t-lg shadow-md">
            Impormasyon ng Benepisyaryo (Beneficiary's Identifying Information)
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4 text-xs">
            {renderValue(formData.beneficiary.lastName, "Apelyido (Last Name)")}
            {renderValue(formData.beneficiary.firstName, "Unang Pangalan (First Name)")}
            {renderValue(formData.beneficiary.middleName, "Gitnang Pangalan (Middle Name)")}
            {renderValue(formData.beneficiary.suffix, "Ext. (Sr./Jr./II)")}
          </div>

          <div className="grid grid-cols-5 gap-4 mb-4 text-xs">
            {renderValue(formData.beneficiary.houseNo, "House No./Street/Purok")}
            {renderValue(formData.beneficiary.barangay, "Barangay")}
            {renderValue(formData.beneficiary.city, "City/Municipality")}
            {renderValue(formData.beneficiary.province, "Province")}
            {renderValue(formData.beneficiary.region, "Region")}
          </div>

          <div className="grid grid-cols-7 gap-3 mb-6 text-xs">
            {renderValue(formData.beneficiary.mobileNo, "Numero ng Telepono")}
            {renderValue(formData.beneficiary.birthdate, "Kapanganakan (MM/DD/YYYY)")}
            {renderValue(formData.beneficiary.age, "Edad")}
            {renderValue(formData.beneficiary.gender, "Kasarian")}
            {renderValue(formData.beneficiary.civilStatus, "Civil Status")}
            {renderValue(formData.beneficiary.occupation, "Trabaho")}
            {renderValue(formData.beneficiary.monthlySalary, "Buwanang Kita")}
          </div>

          {/* Representative Section */}
          <div className="bg-blue-700 text-white text-xs px-3 py-2 mb-4 uppercase font-bold tracking-wider rounded-t-lg shadow-md">
            Impormasyon ng Kinatawan (Representative's Identifying Information)
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4 text-xs">
            {renderValue(formData.representative.lastName, "Apelyido (Last Name)")}
            {renderValue(formData.representative.firstName, "Unang Pangalan (First Name)")}
            {renderValue(formData.representative.middleName, "Gitnang Pangalan (Middle Name)")}
            {renderValue(formData.representative.suffix, "Ext. (Sr./Jr./II)")}
          </div>

          <div className="grid grid-cols-5 gap-4 mb-4 text-xs">
            {renderValue(formData.representative.houseNo, "House No./Street/Purok")}
            {renderValue(formData.representative.barangay, "Barangay")}
            {renderValue(formData.representative.city, "City/Municipality")}
            {renderValue(formData.representative.province, "Province")}
            {renderValue(formData.representative.region, "Region")}
          </div>

          <div className="grid grid-cols-7 gap-3 mb-4 text-xs">
            {renderValue(formData.representative.mobileNo, "Numero ng Telepono")}
            {renderValue(formData.representative.birthdate, "Kapanganakan (MM/DD/YYYY)")}
            {renderValue(formData.representative.age, "Edad")}
            {renderValue(formData.representative.gender, "Kasarian")}
            {renderValue(formData.representative.civilStatus, "Civil Status")}
            {renderValue(formData.representative.occupation, "Trabaho")}
            {renderValue(formData.representative.monthlySalary, "Buwanang Kita")}
          </div>

          <div className="mb-6 text-xs">
            {renderValue(
              formData.representative.relationship,
              "Relasyon sa Benepisyaryo (Relationship to the Beneficiary)"
            )}
          </div>

          {/* Time End placement (right aligned) */}
          <div className="flex justify-end mb-8 text-sm">
            <div className="flex items-center gap-2">
              <label className="font-bold text-blue-700">Time End:</label>
              {/* Add logic for timeEnd if available */}
            </div>
          </div>

          {/* Page break visual */}
          <div className="border-t-4 border-blue-900 my-8 opacity-75" />

          {/* DSWD Only Header (Lighter Blue for contrast) */}
          <div className="bg-blue-100 italic text-xs px-3 py-2 mb-4 border border-blue-300 rounded-lg text-blue-800">
            Huwag susulatan ang DSWD lamang ang pwede gumamit (Do not write below this part,
            for DSWD's use only)
          </div>

          {/* FAMILY COMPOSITION */}
          <div className="bg-blue-700 text-white text-xs py-2 px-3 mb-4 uppercase font-bold tracking-wider rounded-t-lg shadow-md">
            Komposisyon ng Pamilya (Family Composition)
          </div>

          <div className="mb-6">
            <table className="w-full text-xs border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-100 text-blue-800 font-semibold">
                  <th className="border-r border-b border-blue-200 px-4 py-2 text-left">
                    Buong Pangalan (Complete Name)
                  </th>
                  <th className="border-r border-b border-blue-200 px-4 py-2 text-left">
                    Relasyon sa Benepisyaryo
                  </th>
                  <th className="border-r border-b border-blue-200 px-4 py-2">Edad</th>
                  <th className="border-r border-b border-blue-200 px-4 py-2 text-left">
                    Trabaho
                  </th>
                  <th className="border-b border-blue-200 px-4 py-2 text-left">
                    Buwanang Kita
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.familyMembers.map((member, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border-r border-b border-gray-200 p-2">{member.name}</td>
                    <td className="border-r border-b border-gray-200 p-2">
                      {member.relationship}
                    </td>
                    <td className="border-r border-b border-gray-200 p-2">{member.age}</td>
                    <td className="border-r border-b border-gray-200 p-2">
                      {member.occupation}
                    </td>
                    <td className="border-b border-gray-200 p-2">{member.monthly_income}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ... (rest of the form converted to spans) ... */}

          {/* SIGNATORIES */}
          <div className="grid grid-cols-3 gap-10 mb-8">
            <div className="text-center">
              <div className="border-t-2 border-blue-500 pt-2 mt-12">
                <p className="text-xs font-black uppercase text-blue-900">
                  Buong Pangalan at Pirma
                </p>
                <p className="text-[10px] text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>

            <div className="text-center">
              <div className="w-full border-b-2 border-blue-500 text-center mb-2 py-12 text-sm font-bold text-blue-900 focus:border-blue-700 outline-none">
                {/* Social worker name */}
              </div>
              <div className="pt-2">
                <p className="text-xs font-black uppercase text-blue-900">Social Worker</p>
                <p className="text-[10px] text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-2 py-8 text-sm font-black whitespace-pre-line text-blue-900 uppercase">
                {formData.reviewedBy}
              </div>
              <div className="border-t-2 border-blue-500 pt-2">
                <p className="text-xs font-black uppercase text-blue-900">
                  Approving Authority
                </p>
                <p className="text-[10px] text-gray-500">(Signature over Printed Name)</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 text-center border-t border-blue-100 pt-4">
            <p>Page 1 of 1</p>
            <p className="mt-1">
              Field Office IV-A (CALABARZON) Alagang Zapote Ext., Alabang, Muntinlupa,
              Philippines
            </p>
            <p>Website: http://www.dswd.gov.ph Tel No: 8842-1126</p>
          </div>
        </div>

        {/* FINAL CLOSING BAR */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 h-2 mt-4"></div>
      </div>
    </div>
  );
}
