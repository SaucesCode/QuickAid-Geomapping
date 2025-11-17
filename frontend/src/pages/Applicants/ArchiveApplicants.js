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
    queryKey: ["archived-applicants", filters, searchTerm, currentPage, itemsPerPage],
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
      if (searchTerm) params.append("search", searchTerm);

      const res = await api.get(`/list-archived-applicants/?${params.toString()}`);
      return res.data;
    },
    keepPreviousData: true,
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

  // -----------------------------
  //  UI HELPERS
  // -----------------------------
  const formatDateReadable = dateStr => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-PH", {
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
      <PageHeader
        icon={Archive}
        title="Archived Applicants"
        subtitle="View and restore archived records"
      />

      {/* Filters */}
      <Card>
        <ApplicantsFilter
          filters={filters}
          onFilterChange={f => {
            setFilters(f);
            setCurrentPage(1); // reset page
          }}
        />
      </Card>

      {/* Search Bar */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search archived applicants..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl"
            />
          </div>

          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="p-3 text-gray-500 hover:bg-indigo-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
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

                      <td className="px-6 py-4">{a.background_info?.barangay || "—"}</td>

                      <td className="px-6 py-4">
                        {a.background_info?.barangay_details?.city_name || "—"}
                      </td>

                      <td className="px-6 py-4">{a.type_of_assistance}</td>

                      <td className="px-6 py-4">{formatDateReadable(a.date_filled)}</td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => setRestoreModal({ show: true, applicantId: a.id })}
                          className="px-3 py-1 rounded-lg bg-green-50 text-green-700 border border-green-300 hover:bg-green-100"
                        >
                          <RotateCcw className="w-4 h-4 inline mr-1" />
                          Restore
                        </button>
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
          formatDate={formatDateReadable}
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
