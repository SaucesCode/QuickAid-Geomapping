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
import {
  Loader2,
  AlertCircle,
  Search, // ADDED for search bar
  X, // ADDED for clearing search
  Users,
  MapPin,
  Building2,
  FileText,
  Calendar,
} from "lucide-react";

// --- Skeleton Row (Copied from ArchiveApplicants.js for consistency) ---
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
      // For sorting the Name column
      if (sortConfig.key === "full_name") {
        const aName = `${a.background_info?.last_name || ""} ${
          a.background_info?.first_name || ""
        }`.toLowerCase();
        const bName = `${b.background_info?.last_name || ""} ${
          b.background_info?.first_name || ""
        }`.toLowerCase();
        if (aName < bName) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aName > bName) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      }

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

  // Define the consistent table header structure
  const tableHeader = (
    <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold uppercase tracking-wider">
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
  );

  // --- REDESIGNED JSX to match ArchiveApplicants.js ---
  return (
    // Consistent Dashboard Background
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background Blur Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <Toaster position="top-center" reverseOrder={false} />

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* 1. Header Card (Retains ApplicantsHeader component) */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-6 sm:p-8">
            <ApplicantsHeader totalApplicants={applicants.length} navigate={navigate} />
          </div>
        </div>

        {/* 2. Filter Card (Consistent Card Style) */}
        <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-4 sm:p-6">
          <ApplicantsFilter filters={filters} onFilterChange={setFilters} />
        </div>

        {/* 3. Search Bar Card (Dedicated Card) */}
        <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search applicants by name, barangay, or assistance type..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
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

        {/* 4. Conditional Content Area and Table/Pagination Card (Single Card Structure) */}
        {isLoading ? (
          <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100 table-fixed text-sm align-middle">
                <thead>{tableHeader}</thead>
                <tbody className="divide-y divide-blue-100 text-gray-800">
                  {Array.from({ length: itemsPerPage }).map((_, index) => (
                    <SkeletonRow key={index} />
                  ))}
                </tbody>
              </table>
              <div className="flex justify-center items-center p-10">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mr-3" />
                <p className="text-gray-600 font-semibold">Fetching applicant list...</p>
              </div>
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
          // Empty State
          <div className="bg-white rounded-3xl shadow-xl border border-blue-200 p-10 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Applicants Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? "Your search yielded no results. Try simplifying your query or checking your filters."
                : "The applicant database is empty."}
            </p>
            <button
              onClick={() => navigate("/new-applicant")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition duration-300 shadow-lg"
            >
              Add New Applicant
            </button>
          </div>
        ) : (
          // Single card containing both Table and Pagination (ArchiveApplicants.js style)
          // REMOVED the redundant 'space-y-6' wrapper
          <div className="bg-white bg-opacity-90 backdrop-blur-xl shadow-xl border border-blue-200 overflow-hidden rounded-t-3xl rounded-b-none">
            {/* Table */}
            <div className="overflow-x-auto">
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
                indexOfFirstItem={indexOfFirstItem}
                tableHeader={tableHeader}
              />
            </div>

            {/* Pagination */}
            {filteredApplicants.length > 0 && (
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
        )}
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
