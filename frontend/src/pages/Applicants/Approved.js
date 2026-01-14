// frontend/src/pages/Applicants/Approved.js

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api";
import {
  Upload,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  BarChart3,
  Filter,
  X,
  Calendar,
  Package,
  RefreshCw,
} from "lucide-react";
import ApprovedFilter from "./components/ApprovedFilter";
import Pagination from "../../components/Pagination";
import {
  PageContainer,
  PageHeader,
  Card,
  GradientButton,
  LoadingState,
  H2,
  BodyText,
} from "../../components/DesignSystem";
import toast from "react-hot-toast";
import CustomToast from "../../components/CustomToast";
import { formatDate } from "../../utils/FormatDate";

const fetchBatches = async () => {
  const res = await api.get("/approved/batches/?limit=50");
  return res.data.results;
};

const uploadApprovedFile = async ({ file, batchId }) => {
  const formData = new FormData();
  formData.append("file", file);
  if (batchId) {
    formData.append("batch_id", batchId);
  }
  const res = await api.post("/approved/upload/", formData);
  return res.data;
};

const BatchRow = ({ batch, toggleBatch, isExpanded, onContinueBatch, activeBatchId }) => {
  const [filters, setFilters] = useState({
    city: "",
    barangay: "",
    type: "",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: approvalsData = [], isLoading } = useQuery({
    queryKey: ["approvals", batch.id, filters, currentPage, itemsPerPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("limit", itemsPerPage);
      if (filters.search) params.append("search", filters.search);
      if (filters.city) params.append("city", filters.city);
      if (filters.barangay) params.append("barangay", filters.barangay);
      if (filters.type) params.append("type", filters.type);
      const res = await api.get(`/approved/batch/${batch.id}/approvals/?${params.toString()}`);
      return res.data;
    },
    enabled: isExpanded,
    staleTime: 1000 * 60 * 5,
  });

  const approvals = approvalsData?.results || [];
  const totalItems = approvalsData?.count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = page => setCurrentPage(page);
  const handleItemsPerPageChange = e => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <Card className="overflow-hidden border-2 border-gray-300 hover:border-blue-400 transition-all">
      <button
        onClick={() => toggleBatch(batch.id)}
        className="w-full flex justify-between items-center text-left p-4"
      >
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#003a76] rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
                  BATCH #{batch.id}
                </span>
                <H2 className="text-gray-800">{batch.file_name}</H2>
              </div>
            </div>
          </div>

          <BodyText className="flex items-center gap-2 text-sm text-gray-600 ml-11">
            <Calendar className="w-4 h-4 text-gray-400" />
            Uploaded by{" "}
            <span className="font-semibold text-blue-700">{batch.uploaded_by}</span>
            {" • "}
            <span className="text-gray-500">{formatDate(batch.uploaded_at)}</span>
          </BodyText>

          <div className="flex flex-wrap gap-3 ml-11">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">
                Processed: <strong>{batch.total_processed}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">
                Approved: <strong>{batch.total_approved}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={e => {
                  e.stopPropagation();
                  onContinueBatch(batch.id);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                Add to This Batch
              </button>
              {activeBatchId === batch.id && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded animate-pulse">
                  ACTIVE
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="p-4">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-blue-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-blue-600" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t-2 border-gray-200">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#003a76]" />
                <h4 className="text-sm font-semibold text-gray-900">Filter Approvals</h4>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-xs text-[#003a76] hover:text-[#002d5c] font-medium flex items-center gap-1"
              >
                {showFilters ? "Hide" : "Show"}
                {showFilters ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>
            {showFilters && <ApprovedFilter filters={filters} onFilterChange={setFilters} />}
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8">
                <LoadingState message="Loading approvals..." />
              </div>
            ) : approvals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No approvals found</p>
              </div>
            ) : (
              <>
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#003a76] text-white sticky top-0 z-10">
                      <tr>
                        {[
                          "Last Name",
                          "First Name",
                          "Barangay",
                          "City",
                          "Assistance",
                          "Amount",
                        ].map((header, i) => (
                          <th
                            key={i}
                            className="px-4 py-3 text-left text-xs font-semibold border-r border-white/10 last:border-r-0"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {approvals.map((app, idx) => (
                        <tr
                          key={app.id}
                          className={`hover:bg-blue-50 transition-colors ${
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {app.last_name}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {app.first_name}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{app.barangay}</td>
                          <td className="px-4 py-3 text-gray-700">{app.municipal}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${
                                app.type_of_assistance?.toLowerCase() === "medical"
                                  ? "bg-blue-100 text-blue-700"
                                  : app.type_of_assistance?.toLowerCase() === "educational"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {app.type_of_assistance}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-green-700">
                            ₱{app.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  handleItemsPerPageChange={handleItemsPerPageChange}
                  totalItems={totalItems}
                />
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

const Approved = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [unmatchedRows, setUnmatchedRows] = useState([]);
  const [showUnmatchedModal, setShowUnmatchedModal] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState(null);

  useEffect(() => {
    document.title = "QuickAid | Approved Applicants";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  const resetFileInput = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const {
    data: batches = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["approved-batches"],
    queryFn: fetchBatches,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadApprovedFile,
    onSuccess: data => {
      queryClient.invalidateQueries(["approved-batches"]);
      resetFileInput();

      if (data.approval_batch_id) {
        setActiveBatchId(data.approval_batch_id);
      }

      if (data.unmatched_rows?.length > 0) {
        setUnmatchedRows(data.unmatched_rows);
        setShowUnmatchedModal(true);
      }

      toast.custom(
        t => (
          <CustomToast
            t={t}
            type="upload"
            customMessage={`Processed ${data.total_processed} records, ${
              data.total_newly_approved
            } approved${
              data.unmatched_rows?.length ? `, ${data.unmatched_rows.length} unmatched` : ""
            }`}
          />
        ),
        { duration: 4000 }
      );
    },
    onError: error => {
      toast.custom(
        t => (
          <CustomToast
            t={t}
            type="uploadError"
            customMessage={error.response?.data?.error || "Upload failed. Please try again."}
          />
        ),
        { duration: 4000 }
      );
    },
  });

  const toggleBatch = batchId => {
    queryClient.setQueryData(["approved-batches"], old =>
      old ? old.map(b => (b.id === batchId ? { ...b, expanded: !b.expanded } : b)) : []
    );
  };

  const handleContinueBatch = batchId => {
    setActiveBatchId(batchId);
    toast.custom(
      t => (
        <CustomToast
          t={t}
          type="success"
          customMessage={`Continuing Batch #${batchId}. Upload a file to add more approvals.`}
        />
      ),
      { duration: 3000 }
    );
  };

  return (
    <PageContainer>
      <PageHeader
        icon={CheckCircle}
        title="Approved Applicants"
        subtitle="Upload and manage approved applicant batches"
      />

      <Card>
        <div className="flex items-center gap-2 mb-5 pb-4 border-b-2 border-gray-200">
          <Upload className="w-6 h-6 text-[#003a76]" />
          <H2>Upload Approved List</H2>
        </div>

        <div
          onDragEnter={e => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={e => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            setDragActive(false);
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) {
              const validTypes = [".csv", ".xlsx", ".xls"];
              const fileExt = "." + droppedFile.name.split(".").pop().toLowerCase();
              if (validTypes.includes(fileExt)) setFile(droppedFile);
              else toast.error("Invalid file type.");
            }
          }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-blue-50 rounded-full">
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
            </div>
            <BodyText className="text-gray-600">
              Drag and drop your file here, or click to browse
            </BodyText>
            <p className="text-xs text-gray-500">Supports CSV and Excel (.csv, .xlsx, .xls)</p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={e => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  const validTypes = [".csv", ".xlsx", ".xls"];
                  const fileExt = "." + selectedFile.name.split(".").pop().toLowerCase();
                  if (validTypes.includes(fileExt)) setFile(selectedFile);
                  else {
                    toast.error("Invalid file type.");
                    resetFileInput();
                  }
                }
              }}
              className="hidden"
              id="file-upload"
              accept=".csv,.xlsx,.xls"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer px-5 py-2 border-2 border-gray-300 rounded-lg hover:border-blue-400 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all"
            >
              Choose File
            </label>
          </div>
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <button
              onClick={resetFileInput}
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-4">
          {activeBatchId ? (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-green-50 border-2 border-green-300 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <Package className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    Active Batch #{activeBatchId}
                  </p>
                  <p className="text-xs text-green-700">Upload to add more records</p>
                </div>
              </div>
              <button
                onClick={() => setActiveBatchId(null)}
                className="ml-2 text-xs text-green-700 hover:text-green-800 font-medium flex items-center gap-1 px-2 py-1 hover:bg-green-100 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          ) : (
            <div />
          )}

          <GradientButton
            onClick={() => uploadMutation.mutate({ file, batchId: activeBatchId })}
            disabled={!file || uploadMutation.isPending}
            loading={uploadMutation.isPending}
          >
            <Upload className="w-5 h-5" />
            {uploadMutation.isPending ? "Uploading..." : "Upload File"}
          </GradientButton>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-gray-200">
          <FileText className="w-6 h-6 text-[#003a76]" />
          <H2>Approval Batches History</H2>
        </div>

        {isLoading ? (
          <LoadingState message="Loading approval batches..." />
        ) : isError ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-sm text-red-600">Failed to load batches.</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No approval batches yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {batches.map(batch => (
              <BatchRow
                key={batch.id}
                batch={batch}
                toggleBatch={toggleBatch}
                isExpanded={batch.expanded}
                onContinueBatch={handleContinueBatch}
                activeBatchId={activeBatchId}
              />
            ))}
          </div>
        )}
      </Card>

      {showUnmatchedModal && (
        <UnmatchedRowsModal
          rows={unmatchedRows}
          onClose={() => {
            setShowUnmatchedModal(false);
            setUnmatchedRows([]);
          }}
        />
      )}
    </PageContainer>
  );
};

const UnmatchedRowsModal = ({ rows, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border-2 border-gray-300">
        <div className="flex items-center justify-between px-6 py-4 bg-red-50 border-b-2 border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">
              Unmatched Records ({rows.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-red-600" />
          </button>
        </div>
        <div className="overflow-auto max-h-[calc(90vh-140px)]">
          <table className="min-w-full text-sm">
            <thead className="bg-red-600 text-white sticky top-0">
              <tr>
                {[
                  "Row",
                  "First Name",
                  "Last Name",
                  "Barangay",
                  "City",
                  "Assistance",
                  "Reason",
                ].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-red-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900">{r.row}</td>
                  <td className="px-4 py-3 text-gray-700">{r.first_name}</td>
                  <td className="px-4 py-3 text-gray-700">{r.last_name}</td>
                  <td className="px-4 py-3 text-gray-700">{r.barangay}</td>
                  <td className="px-4 py-3 text-gray-700">{r.municipal}</td>
                  <td className="px-4 py-3 text-gray-700">{r.assistance_type}</td>
                  <td className="px-4 py-3 text-red-700 font-medium">{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end px-6 py-4 bg-gray-50 border-t-2 border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Approved;
