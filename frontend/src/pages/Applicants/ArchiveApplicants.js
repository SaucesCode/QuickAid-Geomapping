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
  Loader2, // Added for better loading state visibility
} from "lucide-react";
import PreviewModal from "./components/PreviewModal";
import Pagination from "../../components/Pagination";

// --- Constants ---
const ARCHIVE_QUERY_KEY = "archivedApplicants";

// --- Query Function ---
// Fetches the archived applicants list
const fetchArchivedApplicants = async () => {
  // Simulating the delay for the skeleton to be noticeable (optional, remove in production)
  // await new Promise(resolve => setTimeout(resolve, 800));

  const res = await api.get("/list-archived-applicants/?limit=50"); // Fetch limit increased to 50 for filtering/pagination
  return res.data.results || [];
};

// --- Mutation Function (Restore) ---
// Restores a single applicant
const restoreApplicant = async (applicantId) => {
  const res = await api.post(`/restore-applicant/${applicantId}/`);
  return res.data;
};

// --- Helper Functions (unchanged, but moved outside the component) ---
const formatPreviewDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-PH", options);
};

const getAssistanceBadgeClass = (type) => {
  const lowerType = (type || "").toLowerCase();
  switch (lowerType) {
    case "educational":
      return "bg-blue-100 text-blue-700";
    case "medical":
      return "bg-green-100 text-green-700";
    case "burial":
      return "bg-amber-100 text-amber-700";
    case "financial":
      return "bg-indigo-100 text-indigo-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

// --- Skeleton Component for Table Row ---
const SkeletonRow = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40 sm:w-56"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24 sm:w-32"></div></td>
    <td className="px-6 py-4 hidden sm:table-cell"><div className="h-4 bg-gray-100 rounded w-28"></div></td>
    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-lg w-20"></div></td>
    <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
    <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="h-9 w-16 bg-gray-200 rounded-lg"></div><div className="h-9 w-24 bg-blue-300 rounded-lg"></div></div></td>
  </tr>
);
// ---------------------------------------------


const ArchiveApplicants = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [previewView, setPreviewView] = useState(false);
  const [previewApplicant, setPreviewApplicant] = useState(null);
  const [restoreModal, setRestoreModal] = useState({ show: false, applicantId: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 2. useQuery for fetching data
  const {
    data: archivedApplicants = [],
    isLoading,
    isError,
    error,
  } = useQuery(ARCHIVE_QUERY_KEY, fetchArchivedApplicants, {
    // Keep data in cache for a while even if the component unmounts
    staleTime: 5 * 60 * 1000, 
  });

  // 3. useMutation for restoring an applicant
  const restoreMutation = useMutation(restoreApplicant, {
    onSuccess: () => {
      // Invalidate the query to force a refetch of the archived list
      // and update the UI automatically.
      queryClient.invalidateQueries(ARCHIVE_QUERY_KEY);
      
      // OPTIONAL: Also invalidate the main active applicants list 
      // so the restored item shows up there immediately.
      queryClient.invalidateQueries("applicantsList");
      
      closeRestoreModal();
    },
    onError: (err) => {
      console.error("Restore failed:", err);
      // You could add a toast notification here
      closeRestoreModal(); 
    },
  });

  // Effect for setting document title (UI side effect)
  useEffect(() => {
    document.title = "Quickaid | Archive Applicants";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);

  // Modal handlers (unchanged)
  const openPreviewView = (applicant) => {
    setPreviewApplicant({ ...applicant });
    setPreviewView(true);
    document.body.classList.add("dialog-open");
  };

  const closePreviewView = () => {
    setPreviewApplicant(null);
    setPreviewView(false);
    document.body.classList.remove("dialog-open");
  };

  const openRestoreModal = (applicant_id) => {
    setRestoreModal({ show: true, applicantId: applicant_id });
    document.body.classList.add("dialog-open");
  };

  const closeRestoreModal = () => {
    setRestoreModal({ show: false, applicantId: null });
    document.body.classList.remove("dialog-open");
  };

  // 4. Update handleRestore to use the mutation hook
  const handleRestore = () => {
    if (!restoreModal.applicantId) return;

    // Call the mutate function, passing the ID of the applicant to restore
    restoreMutation.mutate(restoreModal.applicantId);
  };
  
  const isRestoring = restoreMutation.isLoading;

  // Filtering Logic (on the data returned by useQuery)
  const filteredApplicants = archivedApplicants.filter(a => {
    const keyword = searchTerm.toLowerCase();
    return (
      (a.background_info?.first_name || "").toLowerCase().includes(keyword) ||
      (a.background_info?.last_name || "").toLowerCase().includes(keyword) ||
      (a.background_info?.barangay || "").toLowerCase().includes(keyword) ||
      (a.type_of_assistance || "").toLowerCase().includes(keyword)
    );
  });

  // Pagination logic (unchanged)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);

  const handlePageChange = pageNumber => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = e => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  
  // Conditionally render error state
  if (isError) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
            <AlertCircle className="w-6 h-6 text-red-700 mr-2" />
            <p className="text-xl text-red-700 font-semibold">
                Error loading archived applicants: {error?.message || "Unknown error"}
            </p>
        </div>
    );
  }

  // Use isLoading for both initial loading and refetching logic
  const showSkeleton = isLoading && !isRestoring;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background */}
      {/* ... (omitted for brevity) ... */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-200"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-400"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Archive className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 leading-tight">
                  Archived Applicants
                </h1>
                <p className="text-blue-700 text-sm sm:text-lg mt-1 font-medium">
                  Manage and restore past applicant records
                </p>
              </div>
            </div>

            {/* Stats Badge */}
            <div className="flex items-center gap-3 mt-4 sm:mt-6">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-200 text-sm font-semibold">
                <History className="w-4 h-4 text-blue-600" />
                <span>{archivedApplicants.length} Archived Records</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search archived applicants by name, barangay, or assistance type..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-blue-800 placeholder-gray-400 text-sm sm:text-base outline-none"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="p-2 sm:p-3 text-gray-500 hover:text-blue-700 hover:bg-blue-100 rounded-xl transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content: Table/Skeleton */}
        <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-blue-700 uppercase text-xs tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-blue-700 uppercase text-xs tracking-wider">
                    Barangay
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-blue-700 uppercase text-xs tracking-wider hidden sm:table-cell">
                    City/Municipality
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-blue-700 uppercase text-xs tracking-wider">
                    Assistance
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-blue-700 uppercase text-xs tracking-wider hidden md:table-cell">
                    Date Filled
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-blue-700 uppercase text-xs tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {showSkeleton ? (
                  // Display Skeleton Rows when loading
                  Array.from({ length: itemsPerPage }).map((_, index) => (
                    <SkeletonRow key={index} />
                  ))
                ) : currentItems.length > 0 ? (
                  // Display Data when not loading and items exist
                  currentItems.map((applicant, id) => (
                    <tr key={id} className="hover:bg-blue-50 transition-colors group">
                      <td
                        className="px-6 py-4 text-blue-800 font-semibold group-hover:text-blue-900 cursor-pointer transition-colors whitespace-nowrap"
                        onClick={() => openPreviewView(applicant)}
                      >
                        {`${applicant.background_info?.first_name || ""} ${
                          applicant.background_info?.last_name || ""
                        }`}
                      </td>
                      <td className="px-6 py-4 text-blue-700 whitespace-nowrap">
                        {applicant.background_info?.barangay}
                      </td>
                      <td className="px-6 py-4 text-blue-700 whitespace-nowrap hidden sm:table-cell">
                        {applicant.background_info?.barangay_details?.city_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getAssistanceBadgeClass(
                            applicant.type_of_assistance
                          )}`}
                        >
                          <FileText className="w-3 h-3" />
                          {applicant.type_of_assistance}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-blue-600 whitespace-nowrap hidden md:table-cell text-sm">
                        {formatPreviewDate(applicant.date_filled)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openPreviewView(applicant)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-white hover:bg-blue-100 rounded-lg transition-all border border-blue-300 shadow-sm"
                            disabled={isRestoring}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">View</span>
                          </button>
                          <button
                            onClick={() => openRestoreModal(applicant.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={isRestoring}
                          >
                            {isRestoring ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">
                                {isRestoring ? "Restoring..." : "Restore"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // No Applicants Found State
                  <tr>
                    <td colSpan="6" className="px-6 py-24 text-center bg-gray-50">
                      <div className="flex flex-col items-center">
                        <div className="mb-6 p-8 bg-blue-50 rounded-full border-2 border-blue-200 shadow-sm">
                          <Archive className="w-16 h-16 text-blue-400 mx-auto" />
                        </div>
                        <h3 className="text-2xl font-bold text-blue-800 mb-2">
                          No archived applicants found
                        </h3>
                        <p className="text-blue-600 text-base mb-4 max-w-md">
                          {searchTerm
                            ? "Try adjusting your search terms or check active applicants."
                            : "There are no archived records at the moment. When applicants are archived, they will appear here."}
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

          {/* Pagination */}
          {!showSkeleton && filteredApplicants.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              handleItemsPerPageChange={handleItemsPerPageChange}
              totalItems={filteredApplicants.length}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
            />
          )}
        </div>

        {/* Preview Modal */}
        {previewView && (
          <PreviewModal
            previewApplicant={previewApplicant}
            closePreviewView={closePreviewView}
            formatDate={formatPreviewDate}
          />
        )}

        {/* Restore Confirmation Modal */}
        {restoreModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-blue-200 overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="flex items-center gap-4 p-5 border-b border-blue-100 bg-blue-50">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-md">
                  <RotateCcw className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-blue-900">Confirm Restore</h2>
              </div>

              {/* Modal Content */}
              <div className="p-5">
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-700 text-sm leading-relaxed">
                    Are you sure you want to restore this applicant? This will move them back
                    to the active applicants list.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-5 border-t border-blue-100 bg-blue-50">
                <button
                  onClick={closeRestoreModal}
                  className="px-5 py-2 text-gray-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all font-medium border border-blue-300"
                  disabled={isRestoring}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                  disabled={isRestoring}
                >
                    {isRestoring ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Check className="w-4 h-4" />
                    )}
                  {isRestoring ? "Restoring..." : "Restore Applicant"}
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