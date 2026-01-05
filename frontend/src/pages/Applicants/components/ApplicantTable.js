import React, { useState } from "react";
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
  MoreHorizontal,
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
  const [activeDropdown, setActiveDropdown] = useState(null);

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const IdentityBadge = ({ status }) => {
    if (!status) return null;

    const styles = {
      NEW: "bg-blue-50 text-blue-600 border-blue-200",
      REVIEWED: "bg-emerald-50 text-emerald-600 border-emerald-200",
      SUSPICIOUS: "bg-amber-50 text-amber-600 border-amber-200",
      BLOCKED: "bg-rose-50 text-rose-600 border-rose-200",
    };

    return (
      <span
        className={`flex-shrink-0 px-1.5 py-0.5 text-[7px] font-semibold rounded border uppercase tracking-wide opacity-90 ${
          styles[status] || styles.NEW
        }`}
      >
        {status}
      </span>
    );
  };

  const ActionMenu = ({ applicant, index }) => {
    const isOpen = activeDropdown === index;
    const [openUpward, setOpenUpward] = useState(false);
    const buttonRef = React.useRef(null);

    React.useEffect(() => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUpward(spaceBelow < 150);
      }
    }, [isOpen]);

    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={e => {
            e.stopPropagation();
            setActiveDropdown(isOpen ? null : index);
          }}
          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="More actions"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-[10000000]"
              onClick={() => setActiveDropdown(null)}
            />
            <div
              className={`absolute right-0 ${
                openUpward ? "bottom-8" : "top-8"
              } z-[10000001] w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1`}
            >
              <button
                onClick={e => {
                  e.stopPropagation();
                  openArchiveModal(applicant.id);
                  setActiveDropdown(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Archive className="w-4 h-4" />
                Archive
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  goPrintPage(`/print/${applicant.id}`);
                  setActiveDropdown(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto max-w-full">
        <table className="min-w-full divide-y divide-gray-200 text-sm table-fixed">
          <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-4 text-center w-[70px]">NO.</th>

              <th
                className="px-4 py-4 cursor-pointer w-[280px]"
                onClick={() => handleSort("full_name")}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Full Name
                  <SortIcon column="full_name" />
                </div>
              </th>

              <th
                className="px-4 py-4 cursor-pointer w-[160px]"
                onClick={() => handleSort("barangay")}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Barangay
                  <SortIcon column="barangay" />
                </div>
              </th>

              <th
                className="px-4 py-4 cursor-pointer w-[130px]"
                onClick={() => handleSort("city")}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  City
                  <SortIcon column="city" />
                </div>
              </th>

              <th
                className="px-4 py-4 cursor-pointer w-[140px]"
                onClick={() => handleSort("type_of_assistance")}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Assistance
                  <SortIcon column="type_of_assistance" />
                </div>
              </th>

              <th
                className="px-4 py-4 cursor-pointer w-[130px]"
                onClick={() => handleSort("date_filled")}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Filled
                  <SortIcon column="date_filled" />
                </div>
              </th>

              <th className="px-4 py-4 text-center w-[240px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {currentItems.map((applicant, index) => (
              <tr
                key={applicant.id}
                className={`transition-colors ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-blue-50`}
              >
                <td className="px-4 py-4 text-center text-gray-600 font-semibold">
                  {applicant.id}
                </td>

                <td
                  className="px-4 py-4 cursor-pointer max-w-[280px] relative"
                  onClick={() => openPreviewView(applicant)}
                >
                  <div className="pr-16">
                    <span
                      className="font-semibold text-gray-900 hover:text-indigo-600 truncate block transition-colors"
                      title={applicant.full_name}
                    >
                      {applicant.full_name}
                    </span>
                  </div>
                  <div className="absolute top-3 right-2">
                    <IdentityBadge status={applicant.identity_status} />
                  </div>
                </td>

                <td
                  className="px-4 py-4 text-gray-700 truncate max-w-[160px]"
                  title={applicant.barangay}
                >
                  {applicant.barangay}
                </td>

                <td
                  className="px-4 py-4 text-gray-700 truncate max-w-[130px]"
                  title={applicant.city}
                >
                  {applicant.city}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`inline-flex px-2.5 py-1 text-xs rounded-lg font-semibold ${
                      applicant.type_of_assistance === "Educational"
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : applicant.type_of_assistance === "Medical"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : applicant.type_of_assistance === "Burial"
                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {applicant.type_of_assistance}
                  </span>
                </td>

                <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                  {formatDate(applicant.date_filled)}
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => openPreviewView(applicant)}
                      className="px-2 py-1.5 text-xs border rounded-lg text-indigo-600 border-indigo-300 hover:bg-indigo-50 whitespace-nowrap transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>

                    <button
                      onClick={() => openEditView(applicant)}
                      className="px-2 py-1.5 text-xs border rounded-lg text-blue-600 border-blue-300 hover:bg-blue-50 whitespace-nowrap transition-colors flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>

                    <ActionMenu applicant={applicant} index={index} />
                  </div>
                </td>
              </tr>
            ))}

            {currentItems.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Users className="w-12 h-12 opacity-20" />
                    <p className="font-medium">No applicants found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
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
