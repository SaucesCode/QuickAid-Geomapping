import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/FormatDate";
import ApplicantTable from "./components/ApplicantTable";
import Pagination from "../../components/Pagination";
import PreviewModal from "./components/PreviewModal";
import EditModal from "./components/EditModal";
import ArchiveModal from "./components/ArchiveModal";
import ApplicantsFilter from "./components/ApplicantFilter";
import toast from "react-hot-toast";
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

// Skeleton Row
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

  // UI STATE
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

  // Set Page Title
  useEffect(() => {
    document.title = "QuickAid | Applicants";
    return () => (document.title = "QuickAid | Home");
  }, []);

  // ------------------------------------------------------------
  // BACKEND PAGINATION FETCHER
  // ------------------------------------------------------------
  const fetchApplicants = async ({ queryKey }) => {
    const [_key, { filters, offset, limit, search }] = queryKey;

    const params = new URLSearchParams();

    // Filters
    if (filters.city) params.append("city", filters.city);
    if (filters.barangay) params.append("barangay", filters.barangay);
    if (filters.type) params.append("type", filters.type);
    if (filters.start && filters.end) {
      params.append("start_date", filters.start);
      params.append("end_date", filters.end);
    }

    // Search
    if (search) params.append("search", search);

    // Pagination
    params.append("limit", limit);
    params.append("offset", offset);

    const res = await api.get(`/applicants/?${params.toString()}`);

    return {
      results: res.data.results,
      count: res.data.count,
    };
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "applicants",
      {
        filters,
        search: searchTerm,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      },
    ],
    queryFn: fetchApplicants,
    keepPreviousData: true,
  });

  const applicants = data?.results || [];
  const totalItems = data?.count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // ------------------------------------------------------------
  // SORTING — Only sort the current page
  // ------------------------------------------------------------
  const sortedApplicants = useMemo(() => {
    if (!sortConfig.key) return applicants;

    return [...applicants].sort((a, b) => {
      const getValue = (obj, key) => {
        if (key === "full_name") {
          return `${obj.background_info?.last_name || ""} ${
            obj.background_info?.first_name || ""
          }`.toLowerCase();
        }
        return obj[key];
      };

      const aValue = getValue(a, sortConfig.key);
      const bValue = getValue(b, sortConfig.key);

      if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [applicants, sortConfig]);

  // Sorting handler
  const handleSort = key => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === "ascending" ? "descending" : "ascending",
    }));
  };

  // ------------------------------------------------------------
  // SAVE + EDIT
  // ------------------------------------------------------------
  const handleChange = e => {
    const { name, value } = e.target;

    setEditingApplicant(prev => {
      const updated = { ...prev };

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
      } else {
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

      const savePromise = api.put(`/applicants/${editingApplicant.id}/`, editingApplicant);

      await savePromise;

      toast.custom(t => <CustomToast t={t} type="editApplicant" />, { id: "saving" });
      setEditView(false);
      refetch();
    } catch (err) {
      toast.error("Failed to update applicant", { id: "saving" });
    }
  };

  // ------------------------------------------------------------
  // ARCHIVE
  // ------------------------------------------------------------
  const handleArchive = async () => {
    if (!archiveModal.applicantId) return;

    try {
      await api.delete(`/applicants/${archiveModal.applicantId}/`);
      toast.custom(t => <CustomToast t={t} type="archive" />);
      refetch();
      queryClient.invalidateQueries(["archived-applicants"]);
      setArchiveModal({ show: false, applicantId: null });
    } catch {
      toast.error("Failed to archive applicant");
    }
  };

  // ------------------------------------------------------------
  // TABLE HEADER
  // ------------------------------------------------------------
  const tableHeader = (
    <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold uppercase tracking-wider">
      <th className="px-3 py-4 text-center w-[50px]">No.</th>
      <th className="px-6 py-4 text-left">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Full Name
        </div>
      </th>
      <th className="px-6 py-4 text-left">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Barangay
        </div>
      </th>
      <th className="px-6 py-4 text-left">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          City
        </div>
      </th>
      <th className="px-6 py-4 text-left">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Assistance
        </div>
      </th>
      <th className="px-6 py-4 text-left">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Date Filled
        </div>
      </th>
      <th className="px-6 py-4 text-left">Actions</th>
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
            <Plus className="w-5 h-5" /> Add New Applicant
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // restart pagination
              }}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl"
            />
          </div>

          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="p-2 text-gray-500 hover:text-indigo-700 hover:bg-indigo-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </Card>

      {/* TABLE + PAGINATION */}
      {isLoading ? (
        <LoadingTable tableHeader={tableHeader} itemsPerPage={itemsPerPage} />
      ) : isError ? (
        <ErrorState />
      ) : applicants.length === 0 ? (
        <EmptyState />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <ApplicantTable
              currentItems={sortedApplicants}
              sortConfig={sortConfig}
              handleSort={handleSort}
              openPreviewView={app => {
                setPreviewApplicant(app);
                setPreviewView(true);
              }}
              openEditView={app => {
                setEditingApplicant(app);
                setEditView(true);
              }}
              openArchiveModal={id => setArchiveModal({ show: true, applicantId: id })}
              goPrintPage={navigate}
              formatDate={formatDate}
              tableHeader={tableHeader}
              indexOfFirstItem={(currentPage - 1) * itemsPerPage}
            />
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            handleItemsPerPageChange={e => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            totalItems={totalItems}
          />
        </Card>
      )}

      {/* Modals */}
      {previewView && (
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
      {editView && (
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

// ------------------------------------------------------------
// EXTRA COMPONENTS
// ------------------------------------------------------------
const LoadingTable = ({ tableHeader, itemsPerPage }) => (
  <Card className="p-0 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-blue-100 text-sm">
        <thead>{tableHeader}</thead>
        <tbody className="divide-y divide-blue-100">
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
    <LoadingState message="Fetching applicant list..." />
  </Card>
);

const ErrorState = () => (
  <Card className="bg-red-50 border-red-300 text-center">
    <div className="flex items-center justify-center gap-2">
      <AlertCircle className="w-6 h-6 text-red-600" />
      <BodyText className="text-red-700 font-semibold">
        <strong>Error:</strong> Failed to load applicants.
      </BodyText>
    </div>
  </Card>
);

const EmptyState = () => (
  <Card className="p-10 text-center space-y-4">
    <H2>No Applicants Found</H2>
    <BodyText>No matching records found. Try adjusting your filters.</BodyText>
  </Card>
);
