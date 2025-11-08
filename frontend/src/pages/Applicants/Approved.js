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

// --- Child Component: BatchRow (ENHANCED) ---
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

  const clearFilters = () => {
    setFilters({ city: "", barangay: "", type: "", start: "", end: "" });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Batch Header */}
      <button
        onClick={() => toggleBatch(batch.id)}
        className="w-full flex justify-between items-center p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all group"
        aria-expanded={isExpanded ? "true" : "false"}
      >
        <div className="text-left space-y-3 flex-1">
          {/* File Name */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
              {batch.file_name}
            </h3>
          </div>

          {/* Upload Info */}
          <div className="flex items-center gap-2 text-sm text-gray-600 ml-11">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              Uploaded by{" "}
              <span className="font-semibold text-blue-700">{batch.uploaded_by}</span> on{" "}
              {new Date(batch.uploaded_at).toLocaleString()}
            </span>
          </div>

          {/* Statistics */}
          <div className="flex flex-wrap gap-4 ml-11">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">
                Processed:{" "}
                <span className="font-bold text-blue-800">{batch.total_processed}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">
                Approved:{" "}
                <span className="font-bold text-green-800">{batch.total_approved}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Expand/Collapse Icon */}
        <div className="ml-4 p-3 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-indigo-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-indigo-600" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Filter Section */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                Filter Approvals
              </h4>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
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
                  <button
                    onClick={clearFilters}
                    className="w-full text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg py-2 flex items-center justify-center gap-2 transition-colors"
                  >
                    <X className="w-4 h-4" /> Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                <p className="text-indigo-600 font-medium">Loading approvals...</p>
              </div>
            ) : approvals.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-12 text-gray-500">
                <AlertCircle className="w-12 h-12 mb-3 text-gray-400" />
                <p className="font-medium">No approvals found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold border-r border-blue-500/30">
                      Last Name
                    </th>
                    <th className="px-5 py-3 text-left font-semibold border-r border-blue-500/30">
                      First Name
                    </th>
                    <th className="px-5 py-3 text-left font-semibold border-r border-blue-500/30">
                      Barangay
                    </th>
                    <th className="px-5 py-3 text-left font-semibold border-r border-blue-500/30">
                      Municipal
                    </th>
                    <th className="px-5 py-3 text-left font-semibold border-r border-blue-500/30">
                      Assistance
                    </th>
                    <th className="px-5 py-3 text-left font-semibold border-r border-blue-500/30">
                      Amount
                    </th>
                    <th className="px-5 py-3 text-left font-semibold">Approved At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {approvals.map((app, index) => (
                    <tr
                      key={app.id}
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-5 py-3 text-gray-900 font-medium whitespace-nowrap">
                        {app.last_name}
                      </td>
                      <td className="px-5 py-3 text-gray-900 font-medium whitespace-nowrap">
                        {app.first_name}
                      </td>
                      <td className="px-5 py-3 text-gray-700">{app.barangay}</td>
                      <td className="px-5 py-3 text-gray-700">{app.municipal}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm">
                          <FileText className="w-3 h-3" />
                          {app.type_of_assistance}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-green-700">₱{app.amount}</td>
                      <td className="px-5 py-3 text-gray-700">
                        {formatDate(app.approved_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Results Count */}
          {!isLoading && approvals.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-800">{approvals.length}</span>{" "}
              approval
              {approvals.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Main Component ---
const Approved = () => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Fetch batches
  const {
    data: batches = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["approved-batches"],
    queryFn: fetchBatches,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: uploadApprovedFile,
    onSuccess: () => {
      queryClient.invalidateQueries(["approved-batches"]);
      setFile(null);
    },
  });

  // Toggle batch expansion
  const toggleBatch = batchId => {
    queryClient.setQueryData(["approved-batches"], old =>
      old ? old.map(b => (b.id === batchId ? { ...b, expanded: !b.expanded } : b)) : []
    );
  };

  // Drag and drop handlers
  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Approved Applicants</h1>
              <p className="text-gray-600 mt-1">
                Upload and manage approved applicant batches
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
            <Upload className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800">Upload Approved List</h2>
          </div>

          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
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
              <div>
                <p className="text-gray-700 font-medium mb-1">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-sm text-gray-500">Supports CSV and Excel files</p>
              </div>
              <input
                type="file"
                onChange={e => setFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
                accept=".csv,.xlsx,.xls"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer px-6 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:border-indigo-400 hover:bg-gray-50 transition-all"
              >
                Choose File
              </label>
            </div>
          </div>

          {/* Selected File Display */}
          {file && (
            <div className="mt-4 flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-red-600" />
              </button>
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => uploadMutation.mutate(file)}
              disabled={!file || uploadMutation.isPending}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${
                file && !uploadMutation.isPending
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-xl"
                  : "bg-gray-300 cursor-not-allowed text-gray-600"
              }`}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload File
                </>
              )}
            </button>
          </div>

          {/* Upload Summary */}
          {uploadMutation.data && (
            <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-green-900">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Upload Successful!
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Approved</p>
                    <p className="text-lg font-bold text-green-800">
                      {uploadMutation.data.total_approved ?? 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Processed</p>
                    <p className="text-lg font-bold text-blue-800">
                      {uploadMutation.data.total_processed ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Error */}
          {uploadMutation.isError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Upload Failed</p>
                <p className="text-sm text-red-700 mt-1">
                  {uploadMutation.error?.message ||
                    "An error occurred while uploading the file."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Batches Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
            <FileText className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800">Approval Batches History</h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
              <p className="text-indigo-600 font-medium text-lg">
                Loading approval batches...
              </p>
            </div>
          ) : isError ? (
            <div className="flex flex-col justify-center items-center py-16 text-red-600">
              <AlertCircle className="w-12 h-12 mb-4" />
              <p className="font-medium text-lg">Failed to load batches</p>
              <p className="text-sm text-gray-600 mt-2">
                An error occurred while fetching data
              </p>
            </div>
          ) : batches.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 text-gray-500">
              <FileText className="w-16 h-16 mb-4 text-gray-400" />
              <p className="font-medium text-lg">No approval batches yet</p>
              <p className="text-sm mt-2">Upload your first batch to get started</p>
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default Approved;
