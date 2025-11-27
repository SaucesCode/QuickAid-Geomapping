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
}) => {
  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="bg-white rounded-t-3xl shadow border border-blue-200 overflow-hidden">
      <div className="overflow-x-auto max-w-full">
        <table className="min-w-full divide-y divide-blue-100 text-sm table-fixed">
          <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-3 py-4 text-center w-[60px]">NO.</th>

              <th
                className="px-4 py-4 cursor-pointer w-[160px]"
                onClick={() => handleSort("full_name")}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Full Name
                  <SortIcon column="full_name" />
                </div>
              </th>

              <th
                className="px-4 py-4 cursor-pointer w-[150px]"
                onClick={() => handleSort("barangay")}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Barangay
                  <SortIcon column="barangay" />
                </div>
              </th>

              <th
                className="px-4 py-4 cursor-pointer w-[120px]"
                onClick={() => handleSort("city")}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  City
                  <SortIcon column="city" />
                </div>
              </th>

              <th
                className="px-4 py-4 cursor-pointer w-[110px]"
                onClick={() => handleSort("type_of_assistance")}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Assistance
                  <SortIcon column="type_of_assistance" />
                </div>
              </th>

              <th
                className="px-4 py-4 cursor-pointer w-[110px]"
                onClick={() => handleSort("date_filled")}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Filled
                  <SortIcon column="date_filled" />
                </div>
              </th>

              <th className="px-4 py-4 text-left w-[300px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-blue-100">
            {currentItems.map(applicant => (
              <tr key={applicant.id} className="hover:bg-blue-50">
                <td className="px-3 py-4 text-center text-gray-600 font-semibold">
                  {applicant.id}
                </td>

                <td
                  className="px-4 py-4 font-semibold cursor-pointer text-gray-900 hover:text-indigo-600 truncate max-w-[160px]"
                  onClick={() => openPreviewView(applicant)}
                  title={applicant.full_name}
                >
                  {applicant.full_name}
                </td>

                <td
                  className="px-4 py-4 text-gray-700 truncate max-w-[150px]"
                  title={applicant.barangay}
                >
                  {applicant.barangay}
                </td>

                <td
                  className="px-4 py-4 text-gray-700 truncate max-w-[120px]"
                  title={applicant.city}
                >
                  {applicant.city}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-xl font-semibold shadow ${
                      applicant.type_of_assistance === "Educational"
                        ? "bg-green-100 text-green-800"
                        : applicant.type_of_assistance === "Medical"
                        ? "bg-blue-100 text-blue-800"
                        : applicant.type_of_assistance === "Burial"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {applicant.type_of_assistance}
                  </span>
                </td>

                <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                  {formatDate(applicant.date_filled)}
                </td>

                <td className="px-4 py-4">
                  <div className="flex flex-nowrap gap-1">
                    <button
                      onClick={() => openPreviewView(applicant)}
                      className="px-2 py-1.5 text-xs border rounded-lg text-indigo-600 border-indigo-300 hover:bg-indigo-50 whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4 inline" /> View
                    </button>

                    <button
                      onClick={() => openEditView(applicant)}
                      className="px-2 py-1.5 text-xs border rounded-lg text-blue-600 border-blue-300 hover:bg-blue-50 whitespace-nowrap"
                    >
                      <Edit className="w-4 h-4 inline" /> Edit
                    </button>

                    <button
                      onClick={() => openArchiveModal(applicant.id)}
                      className="px-2 py-1.5 text-xs border rounded-lg text-red-600 border-red-300 hover:bg-red-50 whitespace-nowrap"
                    >
                      <Archive className="w-4 h-4 inline" /> Archive
                    </button>

                    <button
                      onClick={() => goPrintPage(`/print/${applicant.id}`)}
                      className="px-2 py-1.5 text-xs border rounded-lg text-gray-600 border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                    >
                      <Printer className="w-4 h-4 inline" /> Print
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {currentItems.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                  No applicants found
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
