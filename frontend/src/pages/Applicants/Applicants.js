import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/FormatDate";
import ApplicantsHeader from "./components/ApplicantsHeader";
import ApplicantActions from "./components/ApplicantActions";
import ApplicantTable from "./components/ApplicantTable";
import Pagination from "../../components/Pagination";
import PreviewModal from "./components/PreviewModal";
import EditModal from "./components/EditModal";
import ArchiveModal from "./components/ArchiveModal";
import toast, { Toaster } from "react-hot-toast";
import CustomToast from "../../components/CustomToast";
import { Users, FileText, CheckCircle2, TrendingUp, Activity, GraduationCap, Stethoscope, Plus } from "lucide-react";

const csvHeaders = [
  { label: "ID", key: "id" },
  { label: "First Name", key: "first_name" },
  { label: "Middle Initial", key: "middle_initial" },
  { label: "Last Name", key: "last_name" },
  { label: "Suffix", key: "suffix" },
  { label: "Contact Number", key: "contact_number" },
  { label: "Purok", key: "purok" },
  { label: "Barangay", key: "barangay" },
  { label: "City/Municipality", key: "city_municipality" },
  { label: "Province", key: "province" },
  { label: "Birthday", key: "birthday" },
  { label: "Sex", key: "gender" },
  { label: "Civil Status", key: "civil_status" },
  { label: "Occupation", key: "occupation" },
  { label: "Monthly Income", key: "monthly_income" },
  { label: "Valid ID", key: "valid_id_presented" },
  { label: "Assistance Type", key: "type_of_assistance" },
  { label: "Applicant Type", key: "applicant_type" },
  { label: "Date Filled", key: "date_filled" },
];

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editView, setEditView] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);
  const [previewView, setPreviewView] = useState(false);
  const [previewApplicant, setPreviewApplicant] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [archiveModal, setArchiveModal] = useState({ show: false, applicantId: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "QuickAid | Applicants";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await api.get("/applicants/");
      setApplicants(res.data);
    } catch (err) {
      console.error("Fetch applicants failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const openEditView = (applicant) => {
    setEditingApplicant({
      ...applicant,
      valid_id_presented: applicant.valid_id_presented || "",
      other_valid_id: applicant.other_valid_id || "",
    });
    setEditView(true);
  };

  const closeEditView = () => {
    setEditingApplicant(null);
    setEditView(false);
  };

  const openPreviewView = (applicant) => {
    setPreviewApplicant({ ...applicant });
    setPreviewView(true);
  };

  const closePreviewView = () => {
    setPreviewApplicant(null);
    setPreviewView(false);
  };

  const openArchiveModal = (id) => {
    setArchiveModal({ show: true, applicantId: id });
  };

  const closeArchiveModal = () => {
    setArchiveModal({ show: false, applicantId: null });
  };

  const handleArchive = async () => {
    if (!archiveModal.applicantId) return;
    try {
      await api.delete(`/applicants/${archiveModal.applicantId}/`);
      toast.custom((t) => <CustomToast t={t} type="archive" />);
      fetchApplicants();
      closeArchiveModal();
    } catch (err) {
      console.error("Archive failed:", err);
      alert("Failed to archive applicant.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingApplicant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingApplicant || !editingApplicant.id) return;

    try {
      const { data } = await api.post("/update_coordinates/", {
        id: editingApplicant.id,
        background_info: {
          barangay: editingApplicant.background_info.barangay,
          barangay_details: {
            city_name: editingApplicant.background_info.barangay_details.city_name,
          },
        },
      });

      const updatedApplicant = {
        ...editingApplicant,
        latitude: data.latitude,
        longitude: data.longitude,
      };

      await api.put(`/applicants/${editingApplicant.id}/`, updatedApplicant);
      fetchApplicants();
      closeEditView();
    } catch (err) {
      console.error("Error saving applicant:", err);
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  };

  const filteredApplicants = applicants.filter((a) => {
    const keyword = searchTerm.toLowerCase();
    return (
      (a.background_info?.first_name || "").toLowerCase().includes(keyword) ||
      (a.background_info?.last_name || "").toLowerCase().includes(keyword) ||
      (a.background_info?.barangay || "").toLowerCase().includes(keyword) ||
      (formatDate(a.date_filled) || "").toLowerCase().includes(keyword) ||
      (a.type_of_assistance || "").toLowerCase().includes(keyword)
    );
  });

  const sortedApplicants = getSortedData(filteredApplicants);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedApplicants.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Calculate statistics
  const medicalCount = applicants.filter(a => a.type_of_assistance === "Medical").length;
  const financialCount = applicants.filter(a => a.type_of_assistance === "Financial").length;
  const educationalCount = applicants.filter(a => a.type_of_assistance === "Educational").length;

  return (
    <div className="bg-gradient-to-b from-slate-50 to-slate-100 p-6 md:p-10">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Header Section */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-8">
          <div className=" rounded-2xl border border-slate-200 p-6 mb-6">
        <ApplicantsHeader />
      </div>
        </div>
        
      

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Applicants */}
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-2">
                  Total Applicants
                </p>
                <p className="text-4xl font-bold text-blue-600">{applicants.length}</p>
                <p className="text-slate-500 text-xs mt-3">All registered applicants</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Medical */}
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-2">
                  Medical Assistance
                </p>
                <p className="text-4xl font-bold text-amber-600">{medicalCount}</p>
                <p className="text-slate-500 text-xs mt-3">Active medical cases</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                <Stethoscope className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Financial */}
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-2">
                  Educational Assistance
                </p>
                <p className="text-4xl font-bold text-emerald-600">{financialCount}</p>
                <p className="text-slate-500 text-xs mt-3">Active educational cases</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                <GraduationCap className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Educational */}
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-2">
                  Burial Assistance
                </p>
                <p className="text-4xl font-bold text-violet-600">{educationalCount}</p>
                <p className="text-slate-500 text-xs mt-3">Active burial cases</p>
              </div>
              <div className="p-3 bg-violet-50 rounded-xl group-hover:bg-violet-100 transition-colors">
                <Plus className="w-6 h-6 text-violet-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
      

      {/* Search and Export */}
      <div className="mb-6">
        <ApplicantActions
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          applicants={applicants}
          csvHeaders={csvHeaders}
        />
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="relative flex items-center justify-center mx-auto mb-6">
              <div className="h-20 w-20 rounded-full border-[5px] border-slate-200 border-t-blue-600 animate-spin"></div>
              <Users className="absolute h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">
              Loading Applicants...
            </h3>
            <p className="text-slate-600 text-base">
              Please wait while we fetch the latest applicant data.
            </p>
          </div>
        </div>
      ) : applicants.length > 0 ? (
        <>
          <ApplicantTable
            currentItems={currentItems}
            sortConfig={sortConfig}
            handleSort={handleSort}
            openPreviewView={openPreviewView}
            openEditView={openEditView}
            openArchiveModal={openArchiveModal}
            goPrintPage={navigate}
            formatDate={formatDate}
          />

          {sortedApplicants.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              handleItemsPerPageChange={handleItemsPerPageChange}
              totalItems={sortedApplicants.length}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
            />
          )}
        </>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
            <div className="mb-8 p-8 bg-blue-50 rounded-3xl border border-blue-200">
              <Users className="w-24 h-24 text-blue-400 mx-auto" />
            </div>
            <h3 className="text-3xl font-bold mb-4 text-slate-900">
              No applicants found
            </h3>
            <p className="text-slate-600 mb-8 max-w-md text-lg">
              {searchTerm
                ? "Try adjusting your search criteria to find what you're looking for"
                : "Start adding applicants to get started with the management system"}
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      {previewView && previewApplicant && (
        <PreviewModal
          previewApplicant={previewApplicant}
          closePreviewView={closePreviewView}
          formatDate={formatDate}
        />
      )}

      {archiveModal.show && (
        <ArchiveModal
          archiveModal={archiveModal}
          closeArchiveModal={closeArchiveModal}
          handleArchive={handleArchive}
        />
      )}

      {editView && editingApplicant && (
        <EditModal
          editingApplicant={editingApplicant}
          closeEditView={closeEditView}
          handleChange={handleChange}
          handleSave={handleSave}
          setEditingApplicant={setEditingApplicant}
        />
      )}
    </div>
  );
};

export default Applicants;