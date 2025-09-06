import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import {
  Search,
  Archive,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Check,
  AlertCircle,
} from "lucide-react";

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

  const openPreviewView = applicant => {
    setPreviewApplicant({ ...applicant });
    setPreviewView(true);
    document.body.classList.add("dialog-open");
  };

  const closePreviewView = () => {
    setPreviewApplicant(null);
    setPreviewView(false);
    document.body.classList.remove("dialog-open");
  };

  const openRestoreModal = applicant_id => {
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

  const filteredApplicants = archivedApplicants.filter(a => {
    const keyword = searchTerm.toLowerCase();
    return (
      (a.background_info?.first_name || "").toLowerCase().includes(keyword) ||
      (a.background_info?.last_name || "").toLowerCase().includes(keyword) ||
      (a.background_info?.barangay || "").toLowerCase().includes(keyword) ||
      (a.type_of_assistance || "").toLowerCase().includes(keyword)
    );
  });

  // Add pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);

  const handlePageChange = pageNumber => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = e => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const formatPreviewDate = dateStr => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
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
          <Archive className="w-8 h-8 text-teal-500" />
          <h1 className="text-3xl font-bold text-gray-800">Archived Applicants</h1>
        </div>
        <p className="text-gray-400">Manage and restore archived applicant records</p>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading applicants...</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Barangay
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      City or Municipality
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Assistance
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Date Filled
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((applicant, id) => (
                      <tr key={id} className="hover:bg-gray-50 transition-colors">
                        <td
                          className="px-6 py-4 text-teal-600 hover:text-teal-700 cursor-pointer font-medium"
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
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => openRestoreModal(applicant.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
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
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, filteredApplicants.length)} of{" "}
                    {filteredApplicants.length} entries
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, index, array) => {
                      if (index > 0 && page - array[index - 1] > 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <span className="px-2 text-gray-400">...</span>
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                currentPage === page
                                  ? "bg-teal-500 text-white"
                                  : "border border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            currentPage === page
                              ? "bg-teal-500 text-white"
                              : "border border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-800">Applicant Details</h2>
              <button
                onClick={closePreviewView}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {previewApplicant && (
                <div className="space-y-8">
                  {/* Personal Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-medium text-gray-800 mb-4">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">
                          Full Name
                        </span>
                        <span className="text-gray-800">
                          {previewApplicant.background_info?.first_name || ""}{" "}
                          {previewApplicant.background_info?.middle_initial || ""}{" "}
                          {previewApplicant.background_info?.last_name || ""}{" "}
                          {previewApplicant.background_info?.suffix || ""}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">
                          Sex
                        </span>
                        <span className="text-gray-800">
                          {previewApplicant.background_info?.sex || ""}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">
                          Birthday
                        </span>
                        <span className="text-gray-800">
                          {formatPreviewDate(previewApplicant.background_info?.birthday)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">
                          Civil Status
                        </span>
                        <span className="text-gray-800">
                          {previewApplicant.background_info?.civil_status}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">
                          Occupation
                        </span>
                        <span className="text-gray-800">
                          {previewApplicant.background_info?.occupation || "Not specified"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">
                          Monthly Income
                        </span>
                        <span className="text-gray-800">
                          {previewApplicant.background_info?.monthly_income
                            ? `₱${parseFloat(
                                previewApplicant.background_info.monthly_income
                              ).toLocaleString()}`
                            : "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-medium text-gray-800 mb-4">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">
                          Street Address
                        </span>
                        <span className="text-gray-800">
                          {previewApplicant.background_info?.street_address}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">
                          Barangay
                        </span>
                        <span className="text-gray-800">
                          {previewApplicant.background_info?.barangay}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">
                          City/Municipality
                        </span>
                        <span className="text-gray-800">
                          {previewApplicant.background_info?.barangay_details?.city_name}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">
                          Province
                        </span>
                        <span className="text-gray-800">
                          {previewApplicant.background_info?.barangay_details?.province_name}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">
                          Contact Number
                        </span>
                        <span className="text-gray-800">
                          {previewApplicant.contact_number}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Assistance Details */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-medium text-gray-800 mb-4">
                      Assistance Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">
                          Assistance Type
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                          {previewApplicant.type_of_assistance}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">
                          Applicant Type
                        </span>
                        <span className="text-gray-800">
                          {previewApplicant.applicant_type}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">
                          Date Filled
                        </span>
                        <span className="text-gray-800">
                          {formatPreviewDate(previewApplicant.date_filled)}
                        </span>
                      </div>
                      <div className="md:col-span-2 lg:col-span-3">
                        <span className="block text-sm font-medium text-gray-500 mb-1">
                          Valid ID Presented
                        </span>
                        <span className="text-gray-800">
                          {previewApplicant.valid_id_presented}
                          {previewApplicant.other_valid_id &&
                            ` (${previewApplicant.other_valid_id})`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Representative Information */}
                  {previewApplicant.representative && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-medium text-gray-800 mb-4">
                        Representative Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <span className="block text-sm font-medium text-gray-500 mb-1">
                            Full Name
                          </span>
                          <span className="text-gray-800">
                            {previewApplicant.representative.background_info?.first_name || ""}{" "}
                            {previewApplicant.representative.background_info?.middle_initial ||
                              ""}{" "}
                            {previewApplicant.representative.background_info?.last_name || ""}{" "}
                            {previewApplicant.representative.background_info?.suffix || ""}
                          </span>
                        </div>
                        <div>
                          <span className="block text-sm font-medium text-gray-500 mb-1">
                            Relationship
                          </span>
                          <span className="text-gray-800">
                            {previewApplicant.representative.relationship}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="block text-sm font-medium text-gray-500 mb-1">
                            Address
                          </span>
                          <span className="text-gray-800">
                            {previewApplicant.representative.background_info?.street_address},{" "}
                            {previewApplicant.representative.background_info?.barangay},{" "}
                            {
                              previewApplicant.representative.background_info?.barangay_details
                                ?.city_name
                            }
                            ,{" "}
                            {
                              previewApplicant.representative.background_info?.barangay_details
                                ?.province_name
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={closePreviewView}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {restoreModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center gap-3 p-6 border-b">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Confirm Restore</h2>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-gray-600">
                Are you sure you want to restore this applicant? This will move them back to
                the active applicants list.
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
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
