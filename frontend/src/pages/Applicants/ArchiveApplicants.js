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
      const res = await api.get("/list-archived-applicants/?limit=50");
      setArchivedApplicants(res.data.results);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Archive className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-800 to-blue-700">
                  Archived Applicants
                </h1>
                <p className="text-blue-600 text-lg mt-1">Manage and restore archived applicant records</p>
              </div>
            </div>
            
            {/* Stats Badge */}
            <div className="flex items-center gap-3 mt-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-xl border border-blue-200">
                <History className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">
                  {archivedApplicants.length} Archived Records
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-lg border border-blue-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -tranblue-y-1/2 w-5 h-5 text-blue-400" />
              <input
                type="text"
                placeholder="Search archived applicants by name, barangay, or assistance type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-blue-700 placeholder-blue-400"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="p-3 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-xl border border-blue-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative flex items-center justify-center mb-6">
                <div className="h-20 w-20 rounded-full border-[5px] border-blue-200 border-t-blue-600 animate-spin"></div>
                <div className="absolute flex items-center justify-center">
                  <Archive className="h-8 w-8 text-blue-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 mb-2">
                Loading archived records...
              </h3>
              <p className="text-blue-600">Please wait while we fetch the data</p>
              <div className="flex gap-2 mt-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-blue-50 border-b-2 border-blue-200">
                    <tr>
                      <th className="text-left px-6 py-4 font-bold text-blue-700 uppercase text-xs tracking-wider">
                        Name
                      </th>
                      <th className="text-left px-6 py-4 font-bold text-blue-700 uppercase text-xs tracking-wider">
                        Barangay
                      </th>
                      <th className="text-left px-6 py-4 font-bold text-blue-700 uppercase text-xs tracking-wider">
                        City or Municipality
                      </th>
                      <th className="text-left px-6 py-4 font-bold text-blue-700 uppercase text-xs tracking-wider">
                        Assistance
                      </th>
                      <th className="text-left px-6 py-4 font-bold text-blue-700 uppercase text-xs tracking-wider">
                        Date Filled
                      </th>
                      <th className="text-left px-6 py-4 font-bold text-blue-700 uppercase text-xs tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {currentItems.length > 0 ? (
                      currentItems.map((applicant, id) => (
                        <tr key={id} className="hover:bg-blue-50 transition-colors group">
                          <td
                            className="px-6 py-4 text-blue-700 hover:text-blue-900 cursor-pointer font-semibold group-hover:text-blue-600 transition-colors"
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
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-md
                                ${
                                  applicant.type_of_assistance?.toLowerCase() === "medical"
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700"
                                    : applicant.type_of_assistance?.toLowerCase() === "financial"
                                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700"
                                    : applicant.type_of_assistance?.toLowerCase() === "burial"
                                    ? "bg-gradient-to-r from-violet-500 to-violet-600"
                                    : "bg-gradient-to-r from-blue-600 to-blue-700"
                                }`}
                            >
                              <FileText className="w-3 h-3" />
                              {applicant.type_of_assistance}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-blue-600 font-medium">
                            {formatPreviewDate(applicant.date_filled)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openPreviewView(applicant)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all border border-blue-200 hover:border-blue-300"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              <button
                                onClick={() => openRestoreModal(applicant.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
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
                        <td colSpan="6" className="px-6 py-24 text-center">
                          <div className="flex flex-col items-center">
                            <div className="mb-6 p-8 bg-gradient-to-br from-blue-50 to-blue-50 rounded-3xl border-2 border-blue-200 shadow-lg">
                              <Archive className="w-20 h-20 text-blue-300 mx-auto" />
                            </div>
                            <h3 className="text-2xl font-bold text-blue-800 mb-2">
                              No archived applicants found
                            </h3>
                            <p className="text-blue-500 text-base mb-4">
                              {searchTerm
                                ? "Try adjusting your search terms"
                                : "There are no archived records at the moment"}
                            </p>
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-lg border border-blue-200">
                              <Sparkles className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-semibold text-blue-700">All clear!</span>
                            </div>
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
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border-2 border-blue-200 overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="flex items-center gap-4 p-6 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-blue-50">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <RotateCcw className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900">Confirm Restore</h2>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="flex items-start gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl mb-4">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-700 text-base leading-relaxed">
                    Are you sure you want to restore this applicant? This will move them back
                    to the active applicants list.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-blue-200 bg-blue-50">
                <button
                  onClick={closeRestoreModal}
                  className="px-6 py-2.5 text-blue-700 hover:text-blue-900 hover:bg-blue-200 rounded-xl transition-all font-semibold border border-blue-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold"
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