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
  Sparkles,
  History,
  Loader2,
  Users, // ADDED for table row
  MapPin, // ADDED for table row
  Building2, // ADDED for table row
  Calendar, // ADDED for table row
} from "lucide-react";
import PreviewModal from "./components/PreviewModal";
import Pagination from "../../components/Pagination";

// --- API Helpers (NO CHANGES) ---
const fetchArchivedApplicants = async () => {
  // small delay for UX (optional)
  await new Promise(resolve => setTimeout(resolve, 500));
  const res = await api.get("/list-archived-applicants/?limit=50");
  return res.data.results;
};

const restoreApplicant = async applicantId => {
  await api.post(`/restore-applicant/${applicantId}/`);
};

// --- Skeleton Loader (NO CHANGES) ---
const SkeletonRow = () => (
  <tr className="border-b border-gray-100 animate-pulse">
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
  const [searchTerm, setSearchTerm] = useState("");
  const [previewView, setPreviewView] = useState(false);
  const [previewApplicant, setPreviewApplicant] = useState(null);
  const [restoreModal, setRestoreModal] = useState({ show: false, applicantId: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 🔹 Fetch archived applicants with React Query (NO CHANGES)
  const {
    data: archivedApplicants = [],
    isLoading,
    isError,
    refetch, // Keeping refetch even though unused, to preserve original logic/structure
  } = useQuery({
    queryKey: ["archived-applicants"],
    queryFn: fetchArchivedApplicants,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

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
            <div className="flex items-center gap-4">
              {/* CONSISTENT ICON CONTAINER: w-16 h-16, gradient, rounded-2xl, shadow-lg */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Archive className="w-8 h-8 text-white" />
              </div>
              <div>
                {/* CONSISTENT HEADLINE FONT */}
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 leading-tight">
                  Archived Applicants
                </h1>
                {/* CONSISTENT SUBTITLE STYLE */}
                <p className="text-gray-600 text-lg mt-1">
                  Manage and restore past applicant records
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

        {/* Search Bar (Consistent Card Style - NO CHANGES) */}
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

        {/* Table (Consistent Card Style) */}
        <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Name",
                    "Barangay",
                    "City/Municipality",
                    "Assistance",
                    "Date Filled",
                    "Actions",
                  ].map((header, i) => (
                    <th
                      key={i}
                      className="text-left px-6 py-3 font-semibold text-blue-700 uppercase text-xs tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: itemsPerPage }).map((_, index) => (
                    <SkeletonRow key={index} />
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-red-500">
                      Failed to load archived applicants.
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map(applicant => (
                    <tr
                      key={applicant.id}
                      className="hover:bg-blue-50 transition-colors group"
                    >
                      <td
                        // MODIFIED for consistency: added flex and icon
                        className="px-6 py-4 text-gray-800 font-semibold cursor-pointer hover:text-indigo-600 transition-colors flex items-center gap-2"
                        onClick={() => openPreviewView(applicant)}
                      >
                        <Users className="w-4 h-4 text-blue-400" />
                        {`${applicant.background_info?.first_name || ""} ${
                          applicant.background_info?.last_name || ""
                        }`}
                      </td>
                      <td
                        // MODIFIED for consistency: added flex, icon, and text size/color
                        className="px-6 py-4 text-sm text-gray-700 flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4 text-blue-400" />
                        {applicant.background_info?.barangay}
                      </td>
                      <td
                        // MODIFIED for consistency: added flex, icon, and text size/color
                        className="px-6 py-4 text-sm text-gray-700 flex items-center gap-2"
                      >
                        <Building2 className="w-4 h-4 text-blue-400" />
                        {applicant.background_info?.barangay_details?.city_name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          // CONSISTENT GRADIENT CHIP STYLE
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md"
                        >
                          <FileText className="w-3 h-3" />
                          {applicant.type_of_assistance}
                        </span>
                      </td>
                      <td
                        // MODIFIED for consistency: added flex, icon, and text size/color
                        className="px-6 py-4 text-sm text-gray-700 flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4 text-blue-400" />
                        {formatPreviewDate(applicant.date_filled)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openPreviewView(applicant)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 rounded-xl transition-all border border-indigo-300 shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => openRestoreModal(applicant.id)}
                            disabled={restoreMutation.isPending}
                            // Consistent Primary Gradient Button Style
                            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-xl transition-all duration-300 shadow-md transform 
                                ${
                              restoreMutation.isPending
                                ? "bg-gray-400 cursor-not-allowed shadow-none"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-400/50 hover:shadow-lg hover:scale-[1.02]"
                            }`}
                          >
                            <RotateCcw className="w-4 h-4" />
                            Restore
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-24 text-center bg-gray-50">
                      <div className="flex flex-col items-center">
                        <Archive className="w-16 h-16 text-blue-400 mb-4" />
                        <h3 className="text-2xl font-bold text-blue-800 mb-2">
                          No archived applicants found
                        </h3>
                        <p className="text-blue-600 text-base mb-4 max-w-md">
                          {searchTerm
                            ? "Try adjusting your search terms or check active applicants."
                            : "There are no archived records yet."}
                        </p>
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full border border-blue-200 text-sm font-semibold text-blue-700">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span>A fresh start!</span>
                        </div>
                      </div>
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
                    Are you sure you want to restore this applicant? This will move the record back to the active applicants list.
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