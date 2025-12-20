import React, { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api";
import {
  Search,
  Archive,
  RotateCcw,
  Eye,
  X,
  AlertCircle,
  Info,
  Users,
  MapPin,
  Building2,
  Calendar,
  FileText,
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
  BodyText,
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
  //  FETCH FROM BACKEND WITH PAGINATION
  // -----------------------------
  const { data, isLoading, isError } = useQuery({
    queryKey: ["archived-applicants", filters, debouncedSearch, currentPage, itemsPerPage],
    queryFn: async () => {
      const params = new URLSearchParams();

      // backend pagination:
      params.append("limit", itemsPerPage);
      params.append("offset", (currentPage - 1) * itemsPerPage);

      // filters
      if (filters.city) params.append("city", filters.city);
      if (filters.barangay) params.append("barangay", filters.barangay);
      if (filters.type) params.append("type", filters.type);
      if (filters.start && filters.end) {
        params.append("start_date", filters.start);
        params.append("end_date", filters.end);
      }

      // search
      if (debouncedSearch) params.append("search", debouncedSearch);

      const res = await api.get(`/list-archived-applicants/?${params.toString()}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const archivedApplicants = data?.results || [];
  const totalItems = data?.count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // -----------------------------
  //  RESTORE MUTATION
  // -----------------------------
  const restoreMutation = useMutation({
    mutationFn: async id => api.post(`/restore-applicant/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(["archived-applicants"]);
      setRestoreModal({ show: false, applicantId: null });

      toast.custom(t => <CustomToast t={t} type="restore" />, {
        duration: 4000,
      });
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

  useEffect(() => {
    document.title = "QuickAid | Archived Applicants";
  }, []);

  return (
    <PageContainer>
      <PageHeader
        icon={Archive}
        title="Archived Applicants"
        subtitle="View and restore archived records"
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

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <LoadingState message="Loading archived applicants..." />
        ) : isError ? (
          <div className="p-10 text-center text-red-600">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            Failed to load data.
          </div>
        ) : archivedApplicants.length === 0 ? (
          <div className="p-10 text-center text-blue-700 bg-blue-50">
            No archived applicants found.
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100 text-sm">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-3 py-4 text-center w-[50px]">No.</th>
                    <th className="px-6 py-4 text-left">Full Name</th>
                    <th className="px-6 py-4 text-left">Barangay</th>
                    <th className="px-6 py-4 text-left">City</th>
                    <th className="px-6 py-4 text-left">Assistance</th>
                    <th className="px-6 py-4 text-left">Date Filled</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-blue-100">
                  {archivedApplicants.map((a, index) => (
                    <tr key={a.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-3 py-4 text-center">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                      <td
                        className="px-6 py-4 font-bold cursor-pointer hover:text-indigo-600"
                        onClick={() => {
                          setPreviewApplicant(a);
                          setPreviewView(true);
                        }}
                      >
                        {`${a.background_info?.first_name || ""} ${
                          a.background_info?.last_name || ""
                        }`}
                      </td>
                      <td className="px-6 py-4 align-middle text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="truncate">
                            {a.background_info?.barangay || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="truncate">
                            {a.background_info?.barangay_details?.city_name || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <div className="flex items-center justify-center">
                          <span
                            className={`inline-flex px-2 py-1 rounded-xl text-xs font-semibold shadow-md whitespace-nowrap
            ${
              a.type_of_assistance?.toLowerCase() === "educational"
                ? "bg-green-100 text-green-800"
                : a.type_of_assistance?.toLowerCase() === "medical"
                ? "bg-blue-100 text-blue-800"
                : a.type_of_assistance?.toLowerCase() === "burial"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
                          >
                            {a.type_of_assistance}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="truncate">{formatDate(a.date_filled)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            onClick={() => {
                              setPreviewApplicant(a);
                              setPreviewView(true);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-300"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => setRestoreModal({ show: true, applicantId: a.id })}
                            disabled={restoreMutation.isPending}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors border border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <RotateCcw className="w-4 h-4" /> Restore
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="bg-indigo-600 px-6 py-4 rounded-t-xl text-white font-bold flex justify-between">
              Restore Applicant
              <button onClick={() => setRestoreModal({ show: false, applicantId: null })}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <Info className="w-5 h-5 text-blue-700" />
                <p className="text-sm text-blue-800">
                  This applicant will be moved back to the active list.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 py-2 border rounded-lg"
                  onClick={() => setRestoreModal({ show: false, applicantId: null })}
                >
                  Cancel
                </button>

                <button
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg"
                  onClick={handleRestore}
                >
                  Restore Applicant
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
