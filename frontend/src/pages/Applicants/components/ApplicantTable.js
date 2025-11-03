import React from "react";
import {
  Edit,
  Archive,
  Printer,
  ChevronUp,
  ChevronDown,
  Eye,
  Users,
  MapPin,
  Building2,
  Calendar,
  FileText,
} from "lucide-react";

const ApplicantTable = ({
  currentItems,
  sortConfig,
  handleSort,
  openPreviewView,
  openEditView,
  openArchiveModal,
  goPrintPage,
  formatDate,
  // NOTE: If the parent component passes pagination details, you can calculate the actual index using:
  // (indexOfFirstItem || 0) + id + 1
}) => {
  return (
    // Outer Card Style copied from ApplicantForm.js table container
    <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-blue-100 table-fixed text-sm align-middle">
          {/* Table Header: Gradient Background with White Text */}
          <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold uppercase tracking-wider">
            <tr>
              {/* 1. ADDED # COLUMN HEADER with style from ApplicantForm.js */}
              <th className="px-6 py-4 text-left w-[50px] align-middle">
                <div className="flex items-center justify-center">NO.</div>
              </th>

              <th
                className="px-6 py-4 text-left w-1/5 align-middle cursor-pointer"
                onClick={() => handleSort("background_info.first_name")}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Full Name
                  {sortConfig.key === "background_info.first_name" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left w-1/6 align-middle cursor-pointer"
                onClick={() => handleSort("background_info.barangay")}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
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
                className="px-6 py-4 text-left w-1/6 align-middle cursor-pointer"
                onClick={() => handleSort("background_info.barangay_details.city_name")}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  City
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
                className="px-6 py-4 text-left w-1/6 align-middle cursor-pointer"
                onClick={() => handleSort("type_of_assistance")}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Assistance Type
                  {sortConfig.key === "type_of_assistance" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left w-[120px] align-middle cursor-pointer"
                onClick={() => handleSort("date_filled")}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Filled
                  {sortConfig.key === "date_filled" &&
                    (sortConfig.direction === "ascending" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </div>
              </th>
              <th className="px-6 py-4 text-left w-auto align-middle">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100 text-gray-800">
            {currentItems.length > 0 ? (
              currentItems.map((applicant, id) => (
                <tr
                  key={id}
                  // Row Hover: Very light blue, with cursor pointer
                  className="hover:bg-blue-50/50 transition-all duration-150 group"
                >
                  {/* 2. ADDED # COLUMN CELL with style from ApplicantForm.js */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors font-semibold text-gray-600">
                      {id + 1}
                    </div>
                  </td>

                  {/* Full Name */}
                  <td
                    className="px-6 py-4 align-middle font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer group-hover:text-indigo-600"
                    onClick={() => openPreviewView(applicant)} // Added click handler to match behavior
                  >
                    {`${applicant.background_info?.first_name || ""} ${
                      applicant.background_info?.last_name || ""
                    }`}
                  </td>
                  {/* Barangay (with icon) */}
                  <td className="px-6 py-4 align-middle text-gray-700">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="truncate">{applicant.background_info?.barangay}</span>
                    </div>
                  </td>
                  {/* City (with icon) */}
                  <td className="px-6 py-4 align-middle text-gray-700">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="truncate">
                        {applicant.background_info?.barangay_details?.city_name || "N/A"}
                      </span>
                    </div>
                  </td>
                  {/* Assistance Type (Styled Tag) */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md
                          ${
                            // Matching the ApplicantForm.js color logic exactly
                            applicant.type_of_assistance?.toLowerCase() === "educational"
                              ? "bg-green-100 text-green-800"
                              : applicant.type_of_assistance?.toLowerCase() === "medical"
                              ? "bg-blue-100 text-blue-800"
                              : applicant.type_of_assistance?.toLowerCase() === "burial"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {applicant.type_of_assistance || "N/A"}
                      </span>
                    </div>
                  </td>
                  {/* Date Filled (with icon) */}
                  <td className="px-6 py-4 align-middle text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="truncate">{formatDate(applicant.date_filled)}</span>
                    </div>
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPreviewView(applicant)}
                        // Consistent action button style
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-300"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => openEditView(applicant)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => openArchiveModal(applicant.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors border border-red-300"
                      >
                        <Archive className="w-4 h-4" />
                        Archive
                      </button>
                      <button
                        onClick={() => goPrintPage(applicant)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors border border-gray-300"
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
                <td colSpan="7" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    {/* Empty State Icon: Blue-indigo gradient for consistency */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg mb-4">
                      <Archive className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-blue-700 text-lg font-bold">
                      No applicants found
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Try adjusting your search or filters.
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