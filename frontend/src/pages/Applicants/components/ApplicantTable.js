import React from "react";
import { Edit, Archive, Printer, ChevronUp, ChevronDown, Eye } from "lucide-react";

const ApplicantTable = ({
  currentItems,
  sortConfig,
  handleSort,
  openPreviewView,
  openEditView,
  openArchiveModal,
  goPrintPage,
  formatDate,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th
                className="text-left px-6 py-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort("background_info.first_name")}
              >
                <div className="flex items-center gap-2">
                  Name
                  {sortConfig.key === "background_info.first_name" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </div>
              </th>
              <th
                className="text-left px-6 py-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort("background_info.barangay")}
              >
                <div className="flex items-center gap-2">
                  Barangay
                  {sortConfig.key === "background_info.barangay" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </div>
              </th>
              <th
                className="text-left px-6 py-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort("background_info.barangay_details.city_name")}
              >
                <div className="flex items-center gap-2">
                  City or Municipality
                  {sortConfig.key ===
                    "background_info.barangay_details.city_name" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </div>
              </th>
              <th
                className="text-left px-6 py-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort("type_of_assistance")}
              >
                <div className="flex items-center gap-2">
                  Assistance
                  {sortConfig.key === "type_of_assistance" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </div>
              </th>
              <th
                className="text-left px-6 py-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort("date_filled")}
              >
                <div className="flex items-center gap-2">
                  Date Filled
                  {sortConfig.key === "date_filled" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </div>
              </th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((applicant, id) => (
                <tr key={id} className="hover:bg-gray-50 transition-colors">
                  <td
                    className="px-6 py-4 text-teal-600 hover:text-teal-700 cursor-pointer font-medium"
                    onClick={() => openPreviewView(applicant)}
                  >
                    {`${applicant.background_info?.first_name || ""} ${
                      applicant.background_info?.last_name || ""
                    }`}
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {applicant.background_info?.barangay}
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {applicant.background_info?.barangay_details?.city_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {applicant.type_of_assistance}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(applicant.date_filled)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPreviewView(applicant)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => openEditView(applicant)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => openArchiveModal(applicant.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Archive className="w-4 h-4" />
                        Archive
                      </button>
                      <button
                        onClick={() => goPrintPage(applicant)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                        Print
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <Archive className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg font-medium">
                      No applicants found
                    </p>
                    <p className="text-gray-400 text-sm">
                      Try adjusting your search terms
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicantTable;