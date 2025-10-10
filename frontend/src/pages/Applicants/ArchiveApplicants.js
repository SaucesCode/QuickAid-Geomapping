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
} from "lucide-react";
import PreviewModal from "./components/PreviewModal";
import Pagination from "../../components/Pagination";

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Archive className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Archived Applicants</h1>
        </div>
        <p className="text-gray-400">Manage and restore archived applicant records</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative w-14 h-14 mb-4">
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Archive className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-blue-600 font-medium">Loading archived...</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Barangay</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      City or Municipality
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Assistance</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Date Filled</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((applicant, id) => (
                      <tr key={id} className="hover:bg-gray-50 transition-colors">
                        <td
                          className="px-6 py-4 text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
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
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm
                              ${
                                applicant.type_of_assistance?.toLowerCase() === "medical"
                                  ? "bg-gradient-to-r from-blue-600 to-blue-700"
                                  : applicant.type_of_assistance?.toLowerCase() === "financial"
                                  ? "bg-gradient-to-r from-green-600 to-green-700"
                                  : applicant.type_of_assistance?.toLowerCase() === "burial"
                                  ? "bg-gradient-to-r from-pink-500 to-pink-600"
                                  : "bg-gradient-to-r from-blue-600 to-blue-700"
                              }`}
                          >
                            <FileText className="w-3 h-3" />
                            {applicant.type_of_assistance}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatPreviewDate(applicant.date_filled)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openPreviewView(applicant)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => openRestoreModal(applicant.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
                      <td colSpan="6" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <Archive className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg font-medium">
                            No archived applicants found
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

            {/* Pagination */}
            {filteredApplicants.length > 0 && (
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
          </>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center gap-3 p-6 border-b">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Confirm Restore</h2>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-gray-600">
                Are you sure you want to restore this applicant? This will move them back
                to the active applicants list.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={closeRestoreModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchiveApplicants;
