import React, { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  History,
  Loader2,
  Users,
  MapPin,
  Building2,
  Calendar,
} from "lucide-react";
import PreviewModal from "./components/PreviewModal";
import Pagination from "../../components/Pagination";
import ApplicantsFilter from "./components/ApplicantFilter";
import {
  PageContainer,
  PageHeader,
  Card,
  GradientButton,
  OutlineButton,
  LoadingState,
  H2,
  BodyText,
} from "../../components/DesignSystem";
import toast, { Toaster } from "react-hot-toast";
import CustomToast from "../../components/CustomToast";

// --- Skeleton Loader ---
const SkeletonRow = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    {Array(7)
      .fill(0)
      .map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </td>
      ))}
  </tr>
);

const ArchiveApplicants = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    city: "",
    barangay: "",
    type: "",
    start: "",
    end: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [previewView, setPreviewView] = useState(false);
  const [previewApplicant, setPreviewApplicant] = useState(null);
  const [restoreModal, setRestoreModal] = useState({ show: false, applicantId: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- Fetch archived applicants ---
  const {
    data: archivedApplicants = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["archived-applicants", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.city) params.append("city", filters.city);
      if (filters.barangay) params.append("barangay", filters.barangay);
      if (filters.type) params.append("type", filters.type);
      if (filters.start && filters.end) {
        params.append("start_date", filters.start);
        params.append("end_date", filters.end);
      }
      const res = await api.get(`/list-archived-applicants/?${params.toString()}`);
      return res.data.results || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // --- Restore Mutation ---
  const restoreMutation = useMutation({
    mutationFn: async id => api.post(`/restore-applicant/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(["archived-applicants"]);
      setRestoreModal({ show: false, applicantId: null });

      // ✅ Custom restore toast
      toast.custom(t => <CustomToast t={t} type="restore" />, {
        duration: 4000,
      });
    },
    onError: () => {
      toast.error("Failed to restore applicant. Please try again.", {
        duration: 5000,
        position: "top-right",
      });
    },
  });

  const handleRestore = () => {
    if (restoreModal.applicantId) restoreMutation.mutate(restoreModal.applicantId);
  };

  // --- Computed filtered applicants ---
  const filteredApplicants = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return archivedApplicants.filter(a => {
      const info = a.background_info || {};
      return (
        (info.first_name || "").toLowerCase().includes(term) ||
        (info.last_name || "").toLowerCase().includes(term) ||
        (info.barangay || "").toLowerCase().includes(term) ||
        (info.city || "").toLowerCase().includes(term) ||
        (a.type_of_assistance || "").toLowerCase().includes(term)
      );
    });
  }, [archivedApplicants, searchTerm]);

  // --- Pagination ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);

  const formatDateReadable = dateStr => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    document.title = "QuickAid | Archived Applicants";
  }, []);

  return (
    <PageContainer>
      <Toaster position="top-center" reverseOrder={false} />
      {/* Header */}
      <PageHeader
        icon={Archive}
        title="Archived Applicants"
        subtitle="Manage and restore archived applicant records"
      />

      {/* Filter Section */}
      <Card>
        <ApplicantsFilter filters={filters} onFilterChange={setFilters} />
      </Card>

      {/* Search Section */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search archived applicants..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-800 bg-gray-50 placeholder-gray-400 text-sm outline-none shadow-sm"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="p-3 rounded-xl text-gray-500 hover:text-indigo-700 hover:bg-indigo-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </Card>

      {/* Table Section */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <LoadingState message="Loading archived applicants..." />
        ) : isError ? (
          <div className="p-8 text-center text-red-600">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            Failed to load archived applicants.
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="p-10 text-center text-blue-700 bg-blue-50">
            No archived applicants found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100 text-sm align-middle">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold uppercase tracking-wider">
                  <tr>
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
                        City/Municipality
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
                </thead>
                <tbody className="divide-y divide-blue-100 text-gray-800">
                  {currentItems.map((a, index) => (
                    <tr key={a.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-3 py-4 text-center text-gray-500">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td
                        onClick={() => {
                          setPreviewApplicant(a);
                          setPreviewView(true);
                        }}
                        className="px-6 py-4 font-semibold text-gray-900 cursor-pointer hover:text-indigo-600"
                      >
                        {`${a.background_info?.first_name || ""} ${
                          a.background_info?.last_name || ""
                        }`}
                      </td>
                      <td className="px-6 py-4">{a.background_info?.barangay || "—"}</td>
                      <td className="px-6 py-4">
                        {a.background_info?.barangay_details?.city_name || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm">
                          {a.type_of_assistance}
                        </span>
                      </td>
                      <td className="px-6 py-4">{formatDateReadable(a.date_filled)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <OutlineButton
                            onClick={() => {
                              setPreviewApplicant(a);
                              setPreviewView(true);
                            }}
                            className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                          >
                            <Eye className="w-4 h-4" /> View
                          </OutlineButton>
                          <GradientButton
                            onClick={() => setRestoreModal({ show: true, applicantId: a.id })}
                            loading={restoreMutation.isPending}
                            disabled={restoreMutation.isPending}
                          >
                            <RotateCcw className="w-4 h-4" /> Restore
                          </GradientButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              totalItems={filteredApplicants.length}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
            />
          </>
        )}
      </Card>

      {/* Modals */}
      {previewView && (
        <PreviewModal
          previewApplicant={previewApplicant}
          closePreviewView={() => setPreviewView(false)}
          formatDate={formatDateReadable}
        />
      )}

      {restoreModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-0 overflow-hidden">
            <div className="flex items-center gap-4 p-5 border-b border-blue-100 bg-blue-50">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-white" />
              </div>
              <H2>Confirm Restore</H2>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                <BodyText>
                  Are you sure you want to restore this applicant? This will move the record
                  back to the active applicants list.
                </BodyText>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-blue-100 bg-gray-50">
              <OutlineButton
                onClick={() => setRestoreModal({ show: false, applicantId: null })}
              >
                Cancel
              </OutlineButton>
              <GradientButton
                onClick={handleRestore}
                loading={restoreMutation.isPending}
                disabled={restoreMutation.isPending}
              >
                <Check className="w-4 h-4" /> Restore Applicant
              </GradientButton>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
};

export default ArchiveApplicants;
