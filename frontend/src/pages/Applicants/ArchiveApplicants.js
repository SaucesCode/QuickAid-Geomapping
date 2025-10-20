import React, { useEffect, useState } from "react";
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

// --- Skeleton Component for Table Row ---
const SkeletonRow = () => (
    <tr className="border-b border-gray-100 animate-pulse">
        {/* Name */}
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-40 sm:w-56"></div>
        </td>
        {/* Barangay */}
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-100 rounded w-24 sm:w-32"></div>
        </td>
        {/* City or Municipality */}
        <td className="px-6 py-4 hidden sm:table-cell">
            <div className="h-4 bg-gray-100 rounded w-28"></div>
        </td>
        {/* Assistance Type */}
        <td className="px-6 py-4">
            <div className="h-6 bg-gray-200 rounded-lg w-20"></div>
        </td>
        {/* Date Filled */}
        <td className="px-6 py-4 hidden md:table-cell">
            <div className="h-4 bg-gray-100 rounded w-24"></div>
        </td>
        {/* Actions */}
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
                {/* View Button Skeleton */}
                <div className="h-9 w-16 bg-gray-200 rounded-lg"></div>
                {/* Restore Button Skeleton */}
                <div className="h-9 w-24 bg-blue-300 rounded-lg"></div>
            </div>
        </td>
    </tr>
);
// ---------------------------------------------

const ArchiveApplicants = () => {
  const [archivedApplicants, setArchivedApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewView, setPreviewView] = useState(false);
  const [previewApplicant, setPreviewApplicant] = useState(null);
  const [restoreModal, setRestoreModal] = useState({ show: false, applicantId: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchArchivedApplicants = async () => {
    setLoading(true);
    try {
      // Add a small delay for the skeleton effect to be noticeable
      await new Promise(resolve => setTimeout(resolve, 800)); 
      const res = await api.get("/list-archived-applicants/");
      setArchivedApplicants(res.data);
    } catch (err) {
      console.error("Fetch applicants failed:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleRestore = async () => {
    if (!restoreModal.applicantId) return;

    try {
      await api.post(`/restore-applicant/${restoreModal.applicantId}/`);
      fetchArchivedApplicants();
      closeRestoreModal();
    } catch (err) {
      console.error("Restore applicant failed:", err);
    }
  };

  const filteredApplicants = archivedApplicants.filter((a) => {
    const keyword = searchTerm.toLowerCase();
    return (
      (a.background_info?.first_name || "").toLowerCase().includes(keyword) ||
      (a.background_info?.last_name || "").toLowerCase().includes(keyword) ||
      (a.background_info?.barangay || "").toLowerCase().includes(keyword) ||
      (a.type_of_assistance || "").toLowerCase().includes(keyword)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const formatPreviewDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-PH", options);
  };

  useEffect(() => {
    fetchArchivedApplicants();
    document.title = "Quickaid | Archive Applicants";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);

  // Function to determine badge style based on assistance type
  const getAssistanceBadgeClass = (type) => {
    const lowerType = (type || "").toLowerCase();
    switch (lowerType) {
      case "educational":
        return "bg-blue-100 text-blue-700"; // Blue
      case "medical":
        return "bg-green-100 text-green-700"; // Green
      case "burial":
        return "bg-amber-100 text-amber-700"; // Light Yellow/Amber
      case "financial":
        return "bg-indigo-100 text-indigo-700"; // Financial (default/other primary)
      default:
        return "bg-gray-100 text-gray-700";
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background - Adjusted for a softer, more modern feel */}
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
                <p className="text-blue-700 text-sm sm:text-lg mt-1 font-medium">Manage and restore past applicant records</p>
              </div>
            </div>
            
            {/* Stats Badge */}
            <div className="flex items-center gap-3 mt-4 sm:mt-6">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-200 text-sm font-semibold">
                <History className="w-4 h-4 text-blue-600" />
                <span>
                  {archivedApplicants.length} Archived Records
                </span>
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
            
          {/* Table Wrapper: Enables horizontal scroll for table on small screens */}
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
                {loading ? (
                    // --- Display Skeleton Rows when loading is true ---
                    Array.from({ length: itemsPerPage }).map((_, index) => (
                        <SkeletonRow key={index} />
                    ))
                ) : currentItems.length > 0 ? (
                    // --- Display Data when not loading and items exist ---
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
                              // Applying the new dynamic color class here
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getAssistanceBadgeClass(applicant.type_of_assistance)}`}
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
                              >
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline">View</span>
                              </button>
                              <button
                                onClick={() => openRestoreModal(applicant.id)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md"
                              >
                                <RotateCcw className="w-4 h-4" />
                                <span className="hidden sm:inline">Restore</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))
                ) : (
                    // --- No Applicants Found State ---
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
          {!loading && filteredApplicants.length > 0 && (
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
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md font-medium"
                >
                  <Check className="w-4 h-4" />
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