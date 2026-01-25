import React, { useState, useMemo } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
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
import { useDebounce } from "../../hooks/useDebounce";
import {
  AlertCircle,
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
  const debouncedSearch = useDebounce(searchTerm, 500);
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

  usePageTitle("Applicants");

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
    console.log(res.data);

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
        search: debouncedSearch,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      },
    ],
    queryFn: fetchApplicants,
  });

  const applicants = data?.results || [];
  const totalItems = data?.count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  console.log(data);

  // ------------------------------------------------------------
  // SORTING — Only sort the current page
  // ------------------------------------------------------------
  const sortedApplicants = useMemo(() => {
    if (!sortConfig.key) return applicants;

    return [...applicants].sort((a, b) => {
      const aValue = (a[sortConfig.key] || "").toString().toLowerCase();
      const bValue = (b[sortConfig.key] || "").toString().toLowerCase();

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
  // SAVE + EDIT - FIXED VERSION
  // ------------------------------------------------------------
  const handleChange = e => {
    const { name, value } = e.target;

    console.log("handleChange:", name, value); // Debug log

    setEditingApplicant(prev => {
      if (!prev) return prev;

      // shallow clone
      const updated = { ...prev };

      // Representative fields use prefix rep_bg_ or rep_
      if (name.startsWith("rep_bg_") || name.startsWith("rep_")) {
        // ensure representative object exists
        updated.representative = updated.representative ? { ...updated.representative } : {};
        updated.representative.background_info = updated.representative.background_info
          ? { ...updated.representative.background_info }
          : {};

        const key = name.replace(/^rep_bg_/, "").replace(/^rep_/, "");
        // rep_contact_number or rep_relationship map directly to representative
        if (key === "relationship" || key === "contact_number") {
          updated.representative[key] = value;
        } else {
          updated.representative.background_info[key] = value;
        }

        return updated;
      }

      // background_info nested fields
      const bgFields = [
        "first_name",
        "middle_initial",
        "last_name",
        "suffix",
        "sex",
        "civil_status",
        "street_address",
        "birthday",
        "occupation",
        "monthly_income",
      ];
      if (bgFields.includes(name)) {
        updated.background_info = { ...updated.background_info, [name]: value };
        return updated;
      }

      // REMOVED: The barangay handling here - AddressDropdown handles it directly via setEditingApplicant
      // This was causing the issue - handleChange was overriding the AddressDropdown's updates

      // top-level applicant fields
      updated[name] = value;
      return updated;
    });
  };

  const handleSave = async e => {
    e.preventDefault();
    if (!editingApplicant?.id) return;

    try {
      toast.loading("Saving changes...", { id: "saving" });

      const a = editingApplicant;
      const bg = a.background_info || {};

      // SIMPLIFIED: Just send the PSGC code or ID as-is
      // The backend will handle the conversion
      const barangayValue =
        bg.barangay || bg.barangay_details?.psgc_code || bg.barangay_details?.id;

      if (!barangayValue) {
        toast.error("Barangay is required", { id: "saving" });
        return;
      }

      const applicantBg = {
        first_name: bg.first_name || "",
        middle_initial: bg.middle_initial || "",
        last_name: bg.last_name || "",
        suffix: bg.suffix || "",
        birthday: bg.birthday || "",
        street_address: bg.street_address || "",
        barangay: barangayValue, // Send PSGC code or ID - backend handles it
        sex: bg.sex || "",
        civil_status: bg.civil_status || "",
        occupation: bg.occupation || "",
        monthly_income: bg.monthly_income || 0,
      };

      // Representative (if present)
      let representativePayload = null;
      if (a.representative) {
        const rep = a.representative;
        const repBg = rep.background_info || {};
        const repContact = rep.contact_number || "";

        representativePayload = {
          relationship: rep.relationship || "",
          contact_number: repContact,
          background_info: {
            first_name: repBg.first_name || "",
            middle_initial: repBg.middle_initial || "",
            last_name: repBg.last_name || "",
            suffix: repBg.suffix || "",
            birthday: repBg.birthday || "",
            street_address: repBg.street_address || "",
            sex: repBg.sex || "",
            civil_status: repBg.civil_status || "",
            occupation: repBg.occupation || "",
            monthly_income: repBg.monthly_income || 0,
          },
        };
      }

      // Build final payload
      const payload = {
        background_info: applicantBg,
        representative: representativePayload,
        contact_number: a.contact_number || "",
        type_of_assistance: a.type_of_assistance || "",
        valid_id_presented: a.valid_id_presented || "",
        other_valid_id: a.other_valid_id || "",
        applicant_type: a.applicant_type || "Self",
      };

      // Make request
      await api.put(`/applicants/${a.id}/`, payload);
      // queryClient.invalidateQueries({ queryKey: ["applicants"] });
      toast.custom(t => <CustomToast t={t} type="editApplicant" />, { id: "saving" });
      setEditView(false);
    } catch (err) {
      console.error("Update failed", err);
      toast.error(err.response?.data?.error || "Failed to update applicant", { id: "saving" });
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
      queryClient.invalidateQueries({ queryKey: ["archived-applicants"] });
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      setArchiveModal({ show: false, applicantId: null });
    } catch {
      toast.error("Failed to archive applicant");
    }
  };

  // ------------------------------------------------------------
  // TABLE HEADER
  // ------------------------------------------------------------
  const tableHeader = (
    <tr className="bg-[#003a76] text-white text-xs font-semibold uppercase tracking-wider">
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
        <ApplicantsFilter
          filters={filters}
          onFilterChange={setFilters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
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
              openPreviewView={async app => {
                const res = await api.get(`/applicants/${app.id}/`);
                setPreviewApplicant(res.data);
                setPreviewView(true);
                console.log(res.data);
              }}
              openEditView={async app => {
                const res = await api.get(`/applicants/${app.id}/`);
                setEditingApplicant(res.data);
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
