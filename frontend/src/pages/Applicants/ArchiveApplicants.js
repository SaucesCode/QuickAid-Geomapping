import React, { useState } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api";
import {
  Archive,
  RotateCcw,
  Eye,
  X,
  AlertCircle,
  Info,
  MapPin,
  Building2,
  Calendar,
  FileText,
  Users,
} from "lucide-react";
import PreviewModal from "./components/PreviewModal";
import Pagination from "../../components/Pagination";
import ApplicantsFilter from "./components/ApplicantFilter";

import {
  PageContainer,
  PageHeader,
  Card,
  LoadingState,
  H2,
} from "../../components/DesignSystem";

import toast from "react-hot-toast";
import CustomToast from "../../components/CustomToast";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate } from "../../utils/FormatDate";

const ArchiveApplicants = () => {
  const queryClient = useQueryClient();

  // Filters + UI state
  const [filters, setFilters] = useState({
    city: "",
    barangay: "",
    type: "",
    start: "",
    end: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [previewView, setPreviewView] = useState(false);
  const [previewApplicant, setPreviewApplicant] = useState(null);
  const [restoreModal, setRestoreModal] = useState({ show: false, applicantId: null });

  // Server pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // -----------------------------
  // IDENTITY BADGE COMPONENT
  // -----------------------------
  const IdentityBadge = ({ status }) => {
    if (!status) return null;
    const styles = {
      NEW: "bg-blue-50 text-blue-600 border-blue-200",
      REVIEWED: "bg-emerald-50 text-emerald-600 border-emerald-200",
      SUSPICIOUS: "bg-amber-50 text-amber-600 border-amber-200",
      BLOCKED: "bg-rose-50 text-rose-600 border-rose-200",
    };

    return (
      <span
        className={`flex-shrink-0 px-1.5 py-0.5 text-[7px] font-bold rounded border uppercase tracking-wide opacity-90 ${
          styles[status] || styles.NEW
        }`}
      >
        {status}
      </span>
    );
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["archived-applicants", filters, debouncedSearch, currentPage, itemsPerPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", itemsPerPage);
      params.append("offset", (currentPage - 1) * itemsPerPage);

      if (filters.city) params.append("city", filters.city);
      if (filters.barangay) params.append("barangay", filters.barangay);
      if (filters.type) params.append("type", filters.type);
      if (filters.start && filters.end) {
        params.append("start_date", filters.start);
        params.append("end_date", filters.end);
      }
      if (debouncedSearch) params.append("search", debouncedSearch);

      const res = await api.get(`/list-archived-applicants/?${params.toString()}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const archivedApplicants = data?.results || [];
  const totalItems = data?.count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const restoreMutation = useMutation({
    mutationFn: async id => api.post(`/restore-applicant/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(["archived-applicants"]);
      setRestoreModal({ show: false, applicantId: null });
      toast.custom(t => <CustomToast t={t} type="restore" />, { duration: 4000 });
    },
    onError: () => {
      toast.error("Failed to restore applicant.");
    },
  });

  const handleRestore = () => {
    if (restoreModal.applicantId) {
      restoreMutation.mutate(restoreModal.applicantId);
    }
  };

  usePageTitle("Archived Applicants");

  return (
    <PageContainer>
      <PageHeader
        icon={Archive}
        title="Archived Applicants"
        subtitle="View and restore archived records"
      />

      <Card>
        <ApplicantsFilter
          filters={filters}
          onFilterChange={setFilters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </Card>

      <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm rounded-2xl">
        {isLoading ? (
          <LoadingState message="Loading archived applicants..." />
        ) : isError ? (
          <div className="p-10 text-center text-red-600">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            Failed to load data.
          </div>
        ) : archivedApplicants.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <Users className="w-12 h-12 opacity-20 mx-auto mb-2" />
            <p className="font-medium">No archived applicants found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-[#003a76] text-white text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-4 text-center w-[70px]">NO.</th>
                    <th className="px-4 py-4 text-left w-[280px]">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Full Name
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left w-[160px]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Barangay
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left w-[130px]">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        City
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left w-[140px]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Assistance
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left w-[130px]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date Filled
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {archivedApplicants.map((a, index) => (
                    <tr
                      key={a.id}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-blue-50 transition-colors`}
                    >
                      <td className="px-4 py-4 text-center text-gray-600 font-semibold">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                      <td
                        className="px-4 py-4 cursor-pointer relative"
                        onClick={() => {
                          setPreviewApplicant(a);
                          setPreviewView(true);
                        }}
                      >
                        <div className="pr-16">
                          <span className="font-semibold text-gray-900 hover:text-indigo-600 truncate block transition-colors">
                            {`${a.background_info?.first_name || ""} ${
                              a.background_info?.last_name || ""
                            }`}
                          </span>
                        </div>
                        {/* Status Badge Positioned Top Right within the Name Cell */}
                        <div className="absolute top-3 right-2">
                          <IdentityBadge status={a.identity_status} />
                        </div>
                      </td>

                      <td className="px-4 py-4 text-gray-700 truncate max-w-[160px]">
                        {a.background_info?.barangay || "—"}
                      </td>

                      <td className="px-4 py-4 text-gray-700 truncate max-w-[130px]">
                        {a.background_info?.barangay_details?.city_name || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs rounded-lg font-semibold border ${
                            a.type_of_assistance?.toLowerCase() === "educational"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : a.type_of_assistance?.toLowerCase() === "medical"
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : a.type_of_assistance?.toLowerCase() === "burial"
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {a.type_of_assistance}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                        {formatDate(a.date_filled)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setPreviewApplicant(a);
                              setPreviewView(true);
                            }}
                            className="px-2 py-1.5 text-xs border rounded-lg text-indigo-600 border-indigo-300 hover:bg-indigo-50 transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                          <button
                            onClick={() => setRestoreModal({ show: true, applicantId: a.id })}
                            disabled={restoreMutation.isPending}
                            className="px-2 py-1.5 text-xs border rounded-lg text-green-600 border-green-300 hover:bg-green-50 transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Restore
                          </button>
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
              totalItems={totalItems}
            />
          </>
        )}
      </Card>

      {/* PREVIEW MODAL */}
      {previewView && (
        <PreviewModal
          previewApplicant={previewApplicant}
          closePreviewView={() => setPreviewView(false)}
          formatDate={formatDate}
        />
      )}

      {/* RESTORE MODAL */}
      {restoreModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#003a76] px-6 py-4 text-white font-bold flex justify-between items-center">
              <span>Restore Applicant</span>
              <button onClick={() => setRestoreModal({ show: false, applicantId: null })}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <Info className="w-5 h-5 text-blue-700 mt-0.5" />
                <p className="text-sm text-blue-800 leading-relaxed">
                  This applicant will be moved back to the active list and will be visible in
                  the main applicant table.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setRestoreModal({ show: false, applicantId: null })}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-2.5 bg-[#003a76] text-white rounded-lg font-medium hover:bg-[#002d5c] transition-colors"
                  onClick={handleRestore}
                >
                  Confirm Restore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ArchiveApplicants;
