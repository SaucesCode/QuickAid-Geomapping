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
  AlertCircle,
  Search,
  X,
  Users,
  MapPin,
  Building2,
  FileText,
  Calendar,
  UserPlus,
  Plus,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Card,
  GradientButton,
  LoadingState,
  H2,
  BodyText,
} from "../../components/DesignSystem";
import { useQueryClient } from "@tanstack/react-query";

// --- Skeleton Row ---
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
  const queryClient = useQueryClient();
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

  // --- HANDLERS ---
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

      const { data } = await coordPromise;

      const updatedApplicant = {
        ...editingApplicant,
        latitude: data.latitude,
        longitude: data.longitude,
      };
      const savePromise = api.put(`/applicants/${editingApplicant.id}/`, updatedApplicant);
      setEditView(false);
      await savePromise;

      toast.success("Applicant updated successfully", { id: "saving" });
      refetch();
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
      queryClient.invalidateQueries(["archived-applicants"]);
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

  // --- MEMOIZED DATA ---
  const filteredApplicants = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return applicants.filter(a => {
      const info = a.background_info || {};
      return (
        (info.first_name || "").toLowerCase().includes(term) ||
        (info.last_name || "").toLowerCase().includes(term) ||
        (info.barangay || "").toLowerCase().includes(term) ||
        (info.barangay_details?.city_name || "").toLowerCase().includes(term) ||
        (a.type_of_assistance || "").toLowerCase().includes(term) ||
        (formatDate(a.date_filled) || "").toLowerCase().includes(term)
      );
    });
  }, [applicants, searchTerm]);

  const sortedApplicants = useMemo(() => {
    if (!sortConfig.key) return filteredApplicants;
    return [...filteredApplicants].sort((a, b) => {
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

  // Table header structure
  const tableHeader = (
    <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold uppercase tracking-wider">
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

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        icon={UserPlus}
        title="Applicants Registry"
        subtitle="Manage, view, and archive assistance applicants"
        action={
          <GradientButton onClick={() => navigate("/new-applicant")}>
            <Plus className="w-5 h-5" />
            Add New Applicant
          </GradientButton>
        }
      />

      {/* Filters */}
      <Card>
        <ApplicantsFilter filters={filters} onFilterChange={setFilters} />
      </Card>

      {/* Search Bar */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applicants by name, barangay, or assistance type..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 placeholder-gray-400 text-sm outline-none shadow-sm bg-gray-50 transition-all duration-200"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="p-2 sm:p-3 text-gray-500 hover:text-indigo-700 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </Card>

      {/* Data Display */}
      {isLoading ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100 table-fixed text-sm align-middle">
              <thead>{tableHeader}</thead>
              <tbody className="divide-y divide-blue-100 text-gray-800">
                {Array.from({ length: itemsPerPage }).map((_, index) => (
                  <SkeletonRow key={index} />
                ))}
              </tbody>
            </table>
          </div>
          <LoadingState message="Fetching applicant list..." />
        </Card>
      ) : isError ? (
        <Card className="bg-red-50 border-red-300 text-center">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <BodyText className="text-red-700 font-semibold">
              <span className="font-bold">Error:</span> Failed to load applicants.
            </BodyText>
          </div>
        </Card>
      ) : filteredApplicants.length === 0 ? (
        <Card className="p-8 sm:p-10 text-center space-y-4 sm:space-y-6">
          <H2>No Applicants Found</H2>
          <BodyText>
            {searchTerm
              ? "Your search yielded no results. Try simplifying your query or checking your filters."
              : "The applicant database is empty."}
          </BodyText>
          <GradientButton onClick={() => navigate("/new-applicant")} className="mx-auto">
            <Plus className="w-5 h-5" />
            Add New Applicant
          </GradientButton>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
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
        </Card>
      )}

      {/* Modals */}
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
    </PageContainer>
  );
};

export default Applicants;
