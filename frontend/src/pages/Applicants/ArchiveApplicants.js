import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api";
import {
  Search,
  Archive,
  RotateCcw,
  Eye,
  X,
  Check,
  AlertCircle,
  FileText,
  History,
  Loader2,
  Users, // ADDED for table row
  MapPin, // ADDED for table row
  Building2, // ADDED for table row
  Calendar, // ADDED for table row
} from "lucide-react";
import PreviewModal from "./components/PreviewModal";
import Pagination from "../../components/Pagination";
import ApplicantsFilter from "./components/ApplicantFilter";

// --- Skeleton Loader (UPDATED TO INCLUDE # COLUMN) ---
const SkeletonRow = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    <td className="px-3 py-4">
      <div className="h-4 bg-gray-200 rounded w-6 mx-auto"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-40 sm:w-56"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-100 rounded w-24 sm:w-32"></div>
    </td>
    <td className="px-6 py-4 hidden sm:table-cell">
      <div className="h-4 bg-gray-100 rounded w-28"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 bg-gray-200 rounded-lg w-20"></div>
    </td>
    <td className="px-6 py-4 hidden md:table-cell">
      <div className="h-4 bg-gray-100 rounded w-24"></div>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="h-9 w-16 bg-gray-200 rounded-lg"></div>
        <div className="h-9 w-24 bg-blue-300 rounded-lg"></div>
      </div>
    </td>
  </tr>
);

// --- Main Component ---
const ArchiveApplicants = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    city: "",
    barangay: "",
    type: "",
    start: "",
    end: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [previewView, setPreviewView] = useState(false);
  const [previewApplicant, setPreviewApplicant] = useState(null);
  const [restoreModal, setRestoreModal] = useState({ show: false, applicantId: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    data: archivedApplicants = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["archived-applicants", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.city) params.append("city", filters.city);
      if (filters.barangay) params.append("barangay", filters.barangay);
      if (filters.type) params.append("type", filters.type);
      if (filters.start && filters.end) {
        params.append("start_date", filters.start);
        params.append("end_date", filters.end);
      }

      const res = await api.get(`/list-archived-applicants/?${params.toString()}`);
      return res.data.results || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const restoreApplicant = async applicantId => {
    await api.post(`/restore-applicant/${applicantId}/`);
  };

  // 🔹 Mutation for restoring applicant (NO CHANGES)
  const restoreMutation = useMutation({
    mutationFn: restoreApplicant,
    onSuccess: () => {
      queryClient.invalidateQueries(["archived-applicants"]);
      setRestoreModal({ show: false, applicantId: null });
      alert("✅ Applicant restored successfully!");
    },
    onError: () => {
      alert("❌ Failed to restore applicant. Please try again.");
    },
  });

  // 🔹 Modal handlers (NO CHANGES)
  const openPreviewView = applicant => {
    setPreviewApplicant(applicant);
    setPreviewView(true);
    document.body.classList.add("dialog-open");
  };

  const closePreviewView = () => {
    setPreviewApplicant(null);
    setPreviewView(false);
    document.body.classList.remove("dialog-open");
  };

  const openRestoreModal = id => {
    setRestoreModal({ show: true, applicantId: id });
    document.body.classList.add("dialog-open");
  };

  const closeRestoreModal = () => {
    setRestoreModal({ show: false, applicantId: null });
    document.body.classList.remove("dialog-open");
  };

  const handleRestore = () => {
    if (!restoreModal.applicantId) return;
    restoreMutation.mutate(restoreModal.applicantId);
  };

  // 🔹 Filter logic (NO CHANGES)
  const filteredApplicants = archivedApplicants.filter(a => {
    const keyword = searchTerm.toLowerCase();
    return (
      (a.background_info?.first_name || "").toLowerCase().includes(keyword) ||
      (a.background_info?.last_name || "").toLowerCase().includes(keyword) ||
      (a.background_info?.barangay || "").toLowerCase().includes(keyword) ||
      (a.background_info?.city || "").toLowerCase().includes(keyword) ||
      (a.type_of_assistance || "").toLowerCase().includes(keyword)
    );
  });

  // 🔹 Pagination (NO CHANGES)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);

  // 🔹 Date Formatter (NO CHANGES)
  const formatPreviewDate = dateStr => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    document.title = "Quickaid | Archive Applicants";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);

  return (
    // Consistent Dashboard Background (NO CHANGES)
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background gradients (NO CHANGES) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header (Consistent Card Style) */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Archive className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 leading-tight">
                  Archived Applicants
                </h1>
                <p className="text-gray-600 text-lg mt-1 flex items-center gap-2">
                  Manage and restore archived applicant records
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 sm:mt-6">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-blue-100/70 text-blue-700 rounded-full border border-blue-200 text-sm font-semibold">
                <History className="w-4 h-4 text-blue-600" />
                <span>{archivedApplicants.length} Archived Records</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <ApplicantsFilter filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Search Bar (Consistent Card Style) */}
        <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search archived applicants..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                // Consistent Input Styling
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 placeholder-gray-400 text-sm outline-none shadow-sm bg-gray-50 transition-all duration-200"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="p-3 text-gray-500 hover:text-indigo-700 hover:bg-indigo-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Table (Copied styling from ApplicantForm.js) */}
        <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 overflow-hidden">
          <div className="overflow-x-auto">
            {/* MODIFIED: Table and Header styles to match ApplicantForm.js, including # column */}
            <table className="min-w-full divide-y divide-blue-100 table-fixed text-sm align-middle">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold uppercase tracking-wider">
                  {/* ADDED # COLUMN */}
                  <th className="px-3 py-4 text-center w-[50px] align-middle">No.</th>
                  
                  <th className="px-6 py-4 text-left w-[20%] align-middle">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Full Name
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left w-[15%] align-middle">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Barangay
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left w-[15%] align-middle">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      City/Municipality
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left w-[15%] align-middle">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Assistance
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left w-[120px] align-middle">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date Filled
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left w-auto align-middle">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-blue-100 text-gray-800">
                {isLoading ? (
                  Array.from({ length: itemsPerPage }).map((_, index) => (
                    <SkeletonRow key={index} />
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-red-500">
                      Failed to load archived applicants.
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((applicant, index) => (
                    <tr
                      key={applicant.id}
                      className="hover:bg-blue-50/50 transition-all duration-150 group cursor-pointer"
                    >
                      {/* ADDED # CELL */}
                      <td className="px-3 py-4 text-center font-medium text-gray-500 align-middle">
                        {indexOfFirstItem + index + 1}
                      </td>

                      {/* Name */}
                      <td
                        onClick={() => openPreviewView(applicant)}
                        className="px-6 py-4 font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 whitespace-nowrap overflow-hidden text-ellipsis align-middle"
                      >
                        {`${applicant.background_info?.first_name || ""} ${
                          applicant.background_info?.last_name || ""
                        }`}
                      </td>

                      {/* Barangay */}
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{applicant.background_info?.barangay || "—"}</span>
                        </div>
                      </td>

                      {/* City/Municipality */}
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{applicant.background_info?.barangay_details?.city_name || "—"}</span>
                        </div>
                      </td>

                      {/* Assistance - Pill Styling */}
                      <td className="px-6 py-4 align-middle">
                        {(() => {
                          const type = applicant.type_of_assistance?.toLowerCase();

                          let bgClass = "";
                          let textColor = "";

                          if (type === "educational") {
                            bgClass = "bg-green-100";
                            textColor = "text-green-700";
                          } else if (type === "burial") {
                            bgClass = "bg-yellow-100";
                            textColor = "text-yellow-800";
                          } else if (type === "medical") {
                            bgClass = "bg-blue-100";
                            textColor = "text-blue-700";
                          } else {
                            bgClass = "bg-gray-100";
                            textColor = "text-gray-700";
                          }

                          return (
                            <span
                              className={`inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold shadow-md ${bgClass} ${textColor}`}
                            >
                              
                              {applicant.type_of_assistance}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Date Filled */}
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{formatPreviewDate(applicant.date_filled)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openPreviewView(applicant)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 rounded-lg border border-indigo-300 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => openRestoreModal(applicant.id)}
                            disabled={restoreMutation.isPending}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200 shadow
                              ${
                                restoreMutation.isPending
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                              }`}
                          >
                            <RotateCcw className="w-4 h-4" />
                            Restore
                          </button>
                        </div>
                      </td>
                    </tr >
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center text-blue-700 bg-blue-50">
                      No archived applicants found.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

          {!isLoading && filteredApplicants.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              handleItemsPerPageChange={e => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              totalItems={filteredApplicants.length}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
            />
          )}
        </div>

        {/* Preview Modal (Requires external PreviewModal component) */}
        {previewView && (
          <PreviewModal
            previewApplicant={previewApplicant}
            closePreviewView={closePreviewView}
            formatDate={formatPreviewDate}
          />
        )}

        {/* Restore Modal */}
        {restoreModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-blue-200 overflow-hidden">
              <div className="flex items-center gap-4 p-5 border-b border-blue-100 bg-blue-50">
                {/* MODIFIED: Use consistent gradient for modal icon (from-blue-600 to-indigo-700) */}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg">
                  <RotateCcw className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-blue-900">Confirm Restore</h2>
              </div>

              <div className="p-5">
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <p className="text-blue-700 text-sm leading-relaxed">
                    Are you sure you want to restore this applicant? This will move the record
                    back to the active applicants list.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-5 border-t border-blue-100 bg-gray-50">
                <button
                  onClick={closeRestoreModal}
                  className="px-5 py-2 text-gray-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-xl transition-colors border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  disabled={restoreMutation.isPending}
                  // Consistent Primary Gradient Button Style (NO CHANGE)
                  className={`inline-flex items-center gap-2 px-5 py-2 font-bold text-white rounded-xl shadow-md transition-all duration-300 transform disabled:opacity-50 disabled:shadow-none
                    ${
                      restoreMutation.isPending
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-400/50 hover:shadow-lg hover:scale-[1.02]"
                    }`}
                >
                  {restoreMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {restoreMutation.isPending ? "Restoring..." : "Restore Applicant"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchiveApplicants;