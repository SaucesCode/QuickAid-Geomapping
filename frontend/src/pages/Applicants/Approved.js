import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api";
import {
  Upload,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  BarChart3,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  Filter,
  X,
  Calendar,
} from "lucide-react";
import { formatDate } from "../../utils/FormatDate";
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

// --- API Helpers ---
const fetchBatches = async () => {
  const res = await api.get("/approved/batches/?limit=50");
  return res.data.results;
};

const uploadApprovedFile = async file => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/approved/upload/", formData);
  return res.data;
};

// --- Child Component: BatchRow ---
const BatchRow = ({ batch, toggleBatch, isExpanded }) => {
  const [filters, setFilters] = useState({
    city: "",
    barangay: "",
    type: "",
    start: "",
    end: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ["approvals", batch.id, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.city) params.append("city", filters.city);
      if (filters.barangay) params.append("barangay", filters.barangay);
      if (filters.type) params.append("type", filters.type);
      if (filters.start && filters.end) {
        params.append("start_date", filters.start);
        params.append("end_date", filters.end);
      }
      const res = await api.get(`/approved/batch/${batch.id}/approvals/?${params.toString()}`);
      return res.data.results || [];
    },
    enabled: isExpanded,
    staleTime: 1000 * 60 * 5,
  });

  const hasActiveFilters =
    filters.city || filters.barangay || filters.type || (filters.start && filters.end);

  const clearFilters = () =>
    setFilters({ city: "", barangay: "", type: "", start: "", end: "" });

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all">
      {/* Header */}
      <button
        onClick={() => toggleBatch(batch.id)}
        className="w-full flex justify-between items-center text-left"
      >
        <div className="flex-1 space-y-3 p-4">
          {/* File info */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <H2 className="text-gray-800 group-hover:text-indigo-600">{batch.file_name}</H2>
          </div>

          <BodyText className="flex items-center gap-2 text-sm text-gray-600 ml-11">
            <Calendar className="w-4 h-4 text-gray-400" />
            Uploaded by{" "}
            <span className="font-semibold text-blue-700">{batch.uploaded_by}</span> on{" "}
            {new Date(batch.uploaded_at).toLocaleString()}
          </BodyText>

          {/* Stats */}
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
          </div>
        </div>

        <div className="p-4">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-indigo-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-indigo-600" />
          )}
        </div>
      </button>

      {/* Expanded Table */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                Filter Approvals
              </h4>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {showFilters ? "Hide" : "Show"} Filters
                {showFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {showFilters && (
              <div className="space-y-3">
                <ApplicantsFilter filters={filters} onFilterChange={setFilters} />
                {hasActiveFilters && (
                  <OutlineButton
                    onClick={clearFilters}
                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" /> Clear All Filters
                  </OutlineButton>
                )}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <LoadingState message="Loading approvals..." />
            ) : approvals.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-12 text-gray-500">
                <AlertCircle className="w-12 h-12 mb-3 text-gray-400" />
                <BodyText>No approvals found. Try adjusting your filters.</BodyText>
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0">
                  <tr>
                    {[
                      "Last Name",
                      "First Name",
                      "Barangay",
                      "Municipal",
                      "Assistance",
                      "Amount",
                      "Approved At",
                    ].map((header, i) => (
                      <th
                        key={i}
                        className="px-5 py-3 text-left font-semibold border-r border-blue-500/30"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {approvals.map((app, index) => (
                    <tr
                      key={app.id}
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-5 py-3 font-medium">{app.last_name}</td>
                      <td className="px-5 py-3 font-medium">{app.first_name}</td>
                      <td className="px-5 py-3">{app.barangay}</td>
                      <td className="px-5 py-3">{app.municipal}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm">
                          <FileText className="w-3 h-3" />
                          {app.type_of_assistance}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-green-700">₱{app.amount}</td>
                      <td className="px-5 py-3">{formatDate(app.approved_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

// --- Main Component ---
const Approved = () => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

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
      setFile(null);
      toast.custom(
        t => (
          <CustomToast
            t={t}
            type="upload"
            customMessage={`Processed ${data.total_processed || 0} records, ${
              data.total_approved || 0
            } approved.`}
          />
        ),
        { duration: 4000 }
      );
    },
    onError: error => {
      toast.error(error?.message || "Upload failed. Please try again.");
    },
  });

  const toggleBatch = batchId => {
    queryClient.setQueryData(["approved-batches"], old =>
      old ? old.map(b => (b.id === batchId ? { ...b, expanded: !b.expanded } : b)) : []
    );
  };

  // --- Render ---
  return (
    <PageContainer>
      <PageHeader
        icon={CheckCircle}
        title="Approved Applicants"
        subtitle="Upload and manage approved applicant batches"
      />

      {/* Upload Section */}
      <Card>
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
          <Upload className="w-6 h-6 text-indigo-600" />
          <H2>Upload Approved List</H2>
        </div>

        {/* Drag & Drop */}
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
            if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
          }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full">
              <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
            </div>
            <BodyText>
              Drag and drop your file here, or click to browse. Supports CSV and Excel files.
            </BodyText>
            <input
              type="file"
              onChange={e => setFile(e.target.files[0])}
              className="hidden"
              id="file-upload"
              accept=".csv,.xlsx,.xls"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer px-6 py-2 border-2 border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all"
            >
              Choose File
            </label>
          </div>
        </div>

        {/* Selected File */}
        {file && (
          <div className="mt-4 flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <button onClick={() => setFile(null)} className="p-2 hover:bg-red-100 rounded-lg">
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}

        {/* Upload Button */}
        <div className="mt-4 flex justify-end">
          <GradientButton
            onClick={() => uploadMutation.mutate(file)}
            disabled={!file || uploadMutation.isPending}
            loading={uploadMutation.isPending}
          >
            <Upload className="w-5 h-5" /> Upload File
          </GradientButton>
        </div>

        {/* Upload Result */}
        {uploadMutation.data && (
          <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <H2 className="text-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Upload Successful!
            </H2>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <BodyText>Approved: {uploadMutation.data.total_approved ?? 0}</BodyText>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <BodyText>Processed: {uploadMutation.data.total_processed ?? 0}</BodyText>
              </div>
            </div>
          </Card>
        )}

        {uploadMutation.isError && (
          <Card className="mt-6 bg-red-50 border-red-200 text-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <strong>Upload Failed</strong>
                <p className="text-sm mt-1">
                  {uploadMutation.error?.message ||
                    "An error occurred while uploading the file."}
                </p>
              </div>
            </div>
          </Card>
        )}
      </Card>

      {/* Batches Section */}
      <Card>
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
          <FileText className="w-6 h-6 text-indigo-600" />
          <H2>Approval Batches History</H2>
        </div>

        {isLoading ? (
          <LoadingState message="Loading approval batches..." />
        ) : isError ? (
          <Card className="bg-red-50 border-red-300 text-center text-red-700 py-8">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            Failed to load batches. Please try again later.
          </Card>
        ) : batches.length === 0 ? (
          <Card className="text-center text-gray-600 py-10">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-400" />
            No approval batches yet.
          </Card>
        ) : (
          <div className="space-y-4">
            {batches.map(batch => (
              <BatchRow
                key={batch.id}
                batch={batch}
                toggleBatch={toggleBatch}
                isExpanded={batch.expanded}
              />
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default Approved;
