import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/FormatDate";
import ApplicantsHeader from "./components/ApplicantsHeader";
import ApplicantTable from "./components/ApplicantTable";
import Pagination from "../../components/Pagination";
import PreviewModal from "./components/PreviewModal";
import EditModal from "./components/EditModal";
import ArchiveModal from "./components/ArchiveModal";
import ApplicantsFilter from "./components/ApplicantFilter";
import toast, { Toaster } from "react-hot-toast";
import CustomToast from "../../components/CustomToast";
import { Loader2, AlertCircle } from "lucide-react";

const Applicants = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    barangay: "",
    type: "",
    start: "",
    end: "",
  });

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [editView, setEditView] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);
  const [previewView, setPreviewView] = useState(false);
  const [previewApplicant, setPreviewApplicant] = useState(null);
  const [archiveModal, setArchiveModal] = useState({ show: false, applicantId: null });

  useEffect(() => {
    document.title = "QuickAid | Applicants";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  const fetchApplicants = async () => {
    const params = new URLSearchParams();

    if (filters.city) params.append("city", filters.city);
    if (filters.barangay) params.append("barangay", filters.barangay);
    if (filters.type) params.append("type", filters.type);
    if (filters.start && filters.end) {
      params.append("start_date", filters.start);
      params.append("end_date", filters.end);
    }

    const res = await api.get(`/applicants/?${params.toString()}`);
    return res.data.results || [];
  };

  const {
    data: applicants = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["applicants", filters],
    queryFn: fetchApplicants,
    staleTime: 1000 * 60 * 5,
  });

  // --- HANDLERS (NO CHANGES) ---
  const handleChange = e => {
    const { name, value } = e.target;

    setEditingApplicant(prev => {
      const updated = { ...prev };

      // For background_info fields
      if (
        [
          "first_name",
          "middle_initial",
          "last_name",
          "suffix",
          "sex",
          "civil_status",
          "street_address",
        ].includes(name)
      ) {
        updated.background_info = {
          ...prev.background_info,
          [name]: value,
        };
      }

      // For representative info
      else if (name.startsWith("rep_bg_")) {
        const field = name.replace("rep_bg_", "");
        updated.representative = {
          ...prev.representative,
          background_info: {
            ...prev.representative.background_info,
            [field]: value,
          },
        };
      }

      // For other top-level fields
      else {
        updated[name] = value;
      }

      return updated;
    });
  };

  const handleSave = async e => {
    e.preventDefault();
    if (!editingApplicant?.id) return;

    try {
      // ✅ Instant feedback for the user
      toast.loading("Saving changes...", { id: "saving" });

      const coordPromise = api.post("/update_coordinates/", {
        id: editingApplicant.id,
        background_info: {
          barangay: editingApplicant.background_info.barangay,
          barangay_details: {
            city_name: editingApplicant.background_info.barangay_details.city_name,
          },
        },
      });

      // Wait for coordinates first
      const { data } = await coordPromise;

      // Merge new coordinates into applicant
      const updatedApplicant = {
        ...editingApplicant,
        latitude: data.latitude,
        longitude: data.longitude,
      };
      const savePromise = api.put(`/applicants/${editingApplicant.id}/`, updatedApplicant);
      setEditView(false);
      await savePromise;

      toast.success("Applicant updated successfully", { id: "saving" });
      refetch(); // Refresh data after
    } catch (err) {
      console.error("Error saving applicant:", err);
      toast.error("Failed to update applicant", { id: "saving" });
    }
  };

  const handleArchive = async () => {
    if (!archiveModal.applicantId) return;
    try {
      await api.delete(`/applicants/${archiveModal.applicantId}/`);
      toast.custom(t => <CustomToast t={t} type="archive" />);
      refetch();
      setArchiveModal({ show: false, applicantId: null });
    } catch (err) {
      console.error("Archive failed:", err);
      toast.error("Failed to archive applicant");
    }
  };

  const handleSort = key => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === "ascending" ? "descending" : "ascending",
    }));
  };

  // --- MEMOIZED DATA (NO CHANGES) ---
  const filteredApplicants = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return applicants.filter(a => {
      const info = a.background_info || {};
      return (
        (info.first_name || "").toLowerCase().includes(term) ||
        (info.last_name || "").toLowerCase().includes(term) ||
        (info.barangay || "").toLowerCase().includes(term) ||
        (a.type_of_assistance || "").toLowerCase().includes(term) ||
        (formatDate(a.date_filled) || "").toLowerCase().includes(term)
      );
    });
  }, [applicants, searchTerm]);

  const sortedApplicants = useMemo(() => {
    if (!sortConfig.key) return filteredApplicants;
    return [...filteredApplicants].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [filteredApplicants, sortConfig]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedApplicants.length / itemsPerPage);

  // --- REDESIGNED JSX (MATCHING Geographic.js) ---
  return (
    // Background: Soft gradient and blurred elements (Photocopy)
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background Blur Shapes (Photocopy) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <Toaster position="top-center" reverseOrder={false} />
      <div className="relative z-10 p-4 sm:p-6 md:p-10 space-y-6">
        {/* Header/Search Card (Photocopy: Blured, Rounded-3xl, Shadow-xl, Border) */}
        <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl p-6 sm:p-8 border border-blue-200">
          <ApplicantsHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <ApplicantsFilter filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Conditional Content Area */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="bg-white rounded-3xl shadow-xl border border-blue-200 p-10 text-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">Fetching applicant list...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-300 rounded-3xl p-6 text-center shadow-md">
            <div className="flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
              <p className="text-red-700 font-semibold">
                <span className="font-bold">Error:</span> Failed to load applicants.
              </p>
            </div>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-blue-200 p-10 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Applicants Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? "Your search yielded no results. Try simplifying your query."
                : "The applicant database is empty. Click below to add the first one."}
            </p>
            <button
              onClick={() => navigate("/new-applicant")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition duration-300 shadow-lg"
            >
              Add New Applicant
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-4 sm:p-6 overflow-x-auto">
              <ApplicantTable
                currentItems={currentItems}
                sortConfig={sortConfig}
                handleSort={handleSort}
                openPreviewView={applicant => {
                  setPreviewApplicant(applicant);
                  setPreviewView(true);
                }}
                openEditView={applicant => {
                  setEditingApplicant(applicant);
                  setEditView(true);
                }}
                openArchiveModal={id => setArchiveModal({ show: true, applicantId: id })}
                goPrintPage={navigate}
                formatDate={formatDate}
              />
            </div>

            {/* Pagination Card (Photocopy: Blured, Rounded-3xl, Shadow-xl, Border) */}
            <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                handleItemsPerPageChange={e => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                totalItems={sortedApplicants.length}
                indexOfFirstItem={indexOfFirstItem}
                indexOfLastItem={indexOfLastItem}
              />
            </div>
          </div>
        )}

        {/* Modals (Logic Unchanged) */}
        {previewView && previewApplicant && (
          <PreviewModal
            previewApplicant={previewApplicant}
            closePreviewView={() => setPreviewView(false)}
            formatDate={formatDate}
          />
        )}
        {archiveModal.show && (
          <ArchiveModal
            archiveModal={archiveModal}
            closeArchiveModal={() => setArchiveModal({ show: false, applicantId: null })}
            handleArchive={handleArchive}
          />
        )}
        {editView && editingApplicant && (
          <EditModal
            editingApplicant={editingApplicant}
            closeEditView={() => setEditView(false)}
            handleChange={handleChange}
            handleSave={handleSave}
            setEditingApplicant={setEditingApplicant}
          />
        )}
      </div>
    </div>
  );
};

export default Applicants;
