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
} from "lucide-react";
import PreviewModal from "./components/PreviewModal";
import Pagination from "../../components/Pagination";

// --- API Helpers ---
const fetchArchivedApplicants = async () => {
  // small delay for UX (optional)
  await new Promise(resolve => setTimeout(resolve, 500));
  const res = await api.get("/list-archived-applicants/?limit=50");
  return res.data.results;
};

const restoreApplicant = async applicantId => {
  await api.post(`/restore-applicant/${applicantId}/`);
};

// --- Skeleton Loader ---
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

  // 🔹 Fetch archived applicants with React Query
  const {
    data: archivedApplicants = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["archived-applicants"],
    queryFn: fetchArchivedApplicants,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // 🔹 Mutation for restoring applicant
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

  // 🔹 Modal handlers
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

  // 🔹 Filter logic
  const filteredApplicants = archivedApplicants.filter(a => {
    const keyword = searchTerm.toLowerCase();
    return (
      (a.background_info?.first_name || "").toLowerCase().includes(keyword) ||
      (a.background_info?.last_name || "").toLowerCase().includes(keyword) ||
      (a.background_info?.barangay || "").toLowerCase().includes(keyword) ||
      (a.type_of_assistance || "").toLowerCase().includes(keyword)
    );
  });

  // 🔹 Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);

  const formatPreviewDate = dateStr => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAssistanceBadgeClass = type => {
    const lower = (type || "").toLowerCase();
    switch (lower) {
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

  useEffect(() => {
    document.title = "Quickaid | Archive Applicants";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-200"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-400"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
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

            <div className="flex items-center gap-3 mt-4 sm:mt-6">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 text-sm font-semibold">
                <History className="w-4 h-4 text-blue-600" />
                <span>{archivedApplicants.length} Archived Records</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search archived applicants..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 text-blue-800 placeholder-gray-400 text-sm outline-none"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="p-3 text-gray-500 hover:text-blue-700 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
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
                        className="px-6 py-4 text-blue-800 font-semibold cursor-pointer"
                        onClick={() => openPreviewView(applicant)}
                      >
                        {`${applicant.background_info?.first_name || ""} ${
                          applicant.background_info?.last_name || ""
                        }`}
                      </td>
                      <td className="px-6 py-4 text-blue-700">
                        {applicant.background_info?.barangay}
                      </td>
                      <td className="px-6 py-4 text-blue-700">
                        {applicant.background_info?.barangay_details?.city_name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getAssistanceBadgeClass(
                            applicant.type_of_assistance
                          )}`}
                        >
                          <FileText className="w-3 h-3" />
                          {applicant.type_of_assistance}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-blue-600 text-sm">
                        {formatPreviewDate(applicant.date_filled)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openPreviewView(applicant)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-white hover:bg-blue-100 rounded-lg transition-all border border-blue-300 shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => openRestoreModal(applicant.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md"
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

        {/* Preview Modal */}
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
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-md">
                  <RotateCcw className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-blue-900">Confirm Restore</h2>
              </div>

              <div className="p-5">
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                  <p className="text-blue-700 text-sm leading-relaxed">
                    Are you sure you want to restore this applicant?
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-5 border-t border-blue-100 bg-blue-50">
                <button
                  onClick={closeRestoreModal}
                  className="px-5 py-2 text-gray-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg border border-blue-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  disabled={restoreMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md font-medium disabled:opacity-50"
                >
                  {restoreMutation.isPending ? (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Restore Applicant
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
