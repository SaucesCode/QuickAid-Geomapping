import React from "react";
import {
  Edit,
  Archive,
  Printer,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const ApplicantTable = ({
  currentItems,
  sortConfig,
  handleSort,
  openPreviewView,
  openEditView,
  openArchiveModal,
  goPrintPage,
  formatPreviewDate,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th
                className="px-6 py-4 text-left cursor-pointer hover:bg-gray-200 transition-colors"
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
                className="px-6 py-4 text-left cursor-pointer hover:bg-gray-200 transition-colors"
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
                className="px-6 py-4 text-left cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() =>
                  handleSort("background_info.barangay_details.city_name")
                }
              >
                <div className="flex items-center gap-2">
                  City/Municipality
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
                className="px-6 py-4 text-left cursor-pointer hover:bg-gray-200 transition-colors"
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
                className="px-6 py-4 text-left cursor-pointer hover:bg-gray-200 transition-colors"
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
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((applicant, id) => (
                <tr key={id} className="hover:bg-gray-50 border-b border-gray-100">
                  <td
                    className="px-6 py-4 cursor-pointer text-teal-600 hover:text-teal-700 font-medium"
                    onClick={() => openPreviewView(applicant)}
                  >
                    {`${applicant.background_info?.first_name || ""} ${
                      applicant.background_info?.last_name || ""
                    }`}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {applicant.background_info?.barangay}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {applicant.background_info?.barangay_details?.city_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {applicant.type_of_assistance}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {formatPreviewDate(applicant.date_filled)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditView(applicant)}
                        className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openArchiveModal(applicant.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => goPrintPage(applicant)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Print"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">No applicants found</p>
                    <p className="text-sm mt-2">
                      Try adjusting your search or filters
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
