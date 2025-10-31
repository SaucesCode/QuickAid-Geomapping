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
  Loader2, // Added for consistent loading UI
} from "lucide-react";
import { formatDate } from "../../utils/FormatDate";
import ApplicantsFilter from "./components/ApplicantFilter";

// --- API Helpers (NO CHANGES) ---
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

// --- Child Component: BatchRow (REDESIGNED) ---
const BatchRow = ({ batch, toggleBatch }) => {
  const [filters, setFilters] = useState({
    city: "",
    barangay: "",
    type: "",
    start: "",
    end: "",
  });

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
    enabled: batch.expanded,
    staleTime: 1000 * 60 * 5,
  });

  return (
    // Card Style: Slight glass-morphism for nested element
    <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-md border border-blue-200 hover:shadow-lg transition-all duration-300">
      <button
        onClick={() => toggleBatch(batch.id)}
        className="w-full flex justify-between items-center p-5 focus:outline-none rounded-t-2xl hover:bg-blue-50/50 transition-all"
        aria-expanded={batch.expanded ? "true" : "false"}
        aria-controls={`batch-${batch.id}-content`}
      >
        <div className="text-left space-y-1">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            File: {batch.file_name}
          </h3>
          <p className="text-sm text-gray-500 ml-7">
            Uploaded by <span className="font-medium text-blue-700">{batch.uploaded_by}</span>{" "}
            on {new Date(batch.uploaded_at).toLocaleString()}
          </p>
          <p className="flex flex-wrap gap-4 mt-2 ml-7">
            <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <BarChart3 className="w-4 h-4 text-blue-600" /> Processed:{" "}
              <span className="font-bold text-blue-800">{batch.total_processed}</span>
            </span>
            <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600" /> Approved:{" "}
              <span className="font-bold text-green-800">{batch.total_approved}</span>
            </span>
          </p>
        </div>

        <span className="text-indigo-600 font-semibold select-none flex items-center p-2 rounded-full bg-blue-100/50">
          {batch.expanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </span>
      </button>

      {batch.expanded && (
        <div
          id={`batch-${batch.id}-content`}
          className="overflow-x-auto max-h-96 border-t border-blue-200 bg-white rounded-b-2xl"
        >
          <div className="p-4 border-b border-blue-100 bg-blue-50/50">
            <ApplicantsFilter filters={filters} onFilterChange={setFilters} />
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600 mr-2" />
              <p className="text-indigo-600 font-medium">Loading approvals...</p>
            </div>
          ) : (
            <table className="min-w-full text-sm text-left text-gray-800">
              {/* Table Header Style: Soft blue with text-blue-900 */}
              <thead className="bg-blue-100/80 sticky top-0 z-10 font-semibold text-blue-800 border-b border-blue-200">
                <tr>
                  <th className="px-5 py-3 border-r border-blue-100">Last Name</th>
                  <th className="px-5 py-3 border-r border-blue-100">First Name</th>
                  <th className="px-5 py-3 border-r border-blue-100">Barangay</th>
                  <th className="px-5 py-3 border-r border-blue-100">Municipal</th>
                  <th className="px-5 py-3 border-r border-blue-100">Assistance</th>
                  <th className="px-5 py-3 border-r border-blue-100">Amount</th>
                  <th className="px-5 py-3">Approved At</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map(app => (
                  <tr
                    key={app.id}
                    className="hover:bg-blue-50 transition-all duration-150 border-b border-blue-50 last:border-b-0"
                  >
                    <td className="px-5 py-3 text-gray-900 font-medium whitespace-nowrap">
                      {app.last_name}
                    </td>
                    <td className="px-5 py-3 text-gray-900 font-medium whitespace-nowrap">
                      {app.first_name}
                    </td>
                    <td className="px-5 py-3">{app.barangay}</td>
                    <td className="px-5 py-3">{app.municipal}</td>
                    <td className="px-5 py-3">
                      {/* CONSISTENT CHIP STYLE: Gradient background with rounded-xl and small icon */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">
                        <FileText className="w-3 h-3" />
                        {app.type_of_assistance}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-green-700">{app.amount}</td>
                    <td className="px-5 py-3">{formatDate(app.approved_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

// --- Main Component (REDESIGNED) ---
const Approved = () => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);

  // 🔹 Fetch all batches (NO CHANGES)
  const {
    data: batches = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["approved-batches"],
    queryFn: fetchBatches,
  });

  // 🔹 Upload mutation (NO CHANGES)
  const uploadMutation = useMutation({
    mutationFn: uploadApprovedFile,
    onSuccess: () => {
      queryClient.invalidateQueries(["approved-batches"]); // refresh batches
      setFile(null);
    },
  });

  // 🔹 Toggle expand/collapse (NO CHANGES)
  const toggleBatch = batchId => {
    queryClient.setQueryData(["approved-batches"], old =>
      old ? old.map(b => (b.id === batchId ? { ...b, expanded: !b.expanded } : b)) : []
    );
  };

  return (
    // Background: Matching the Applicants component
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background Blur Shapes (Copied for consistency) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 space-y-6">
        {/* Header Card (New Card Style) */}
        <div className="max-w-7xl mx-auto bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 leading-tight">
                    Approved Applicants
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">
                    Upload and manage approved applicant batches
                  </p>
                </div>
              </div>
        </div>

        {/* Upload Section (New Card Style) */}
        <section className="max-w-7xl mx-auto bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
          <div className="flex items-center gap-2 mb-4 border-b border-blue-100 pb-2">
            <Upload className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800">Upload Approved List</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <input
              type="file"
              onChange={e => setFile(e.target.files[0])}
              className="block w-full sm:w-auto text-gray-700 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 text-sm"
            />
            <button
              onClick={() => uploadMutation.mutate(file)}
              disabled={!file || uploadMutation.isPending}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md ${
                file && !uploadMutation.isPending
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-400/50 hover:shadow-lg"
                  : "bg-gray-300 cursor-not-allowed text-gray-600"
              }`}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" /> Upload
                </>
              )}
            </button>
          </div>

          {uploadMutation.data && (
            <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-indigo-900">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-indigo-700" />
                Upload Summary
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" /> Approved:{" "}
                  <span className="font-semibold">
                    {uploadMutation.data.total_approved ?? 0}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-700" /> Total Processed:{" "}
                  <span className="font-semibold">
                    {uploadMutation.data.total_processed ?? 0}
                  </span>
                </li>
              </ul>
            </div>
          )}
        </section>

        {/* Batches Section (New Card Style - NO CHANGES) */}
        <section className="max-w-7xl mx-auto bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
          <div className="flex items-center gap-2 mb-6 border-b border-blue-100 pb-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800">Approval Batches History</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mr-2" />
              <p className="text-indigo-600 font-medium">Loading approval batches...</p>
            </div>
          ) : isError ? (
            <p className="text-center text-red-600 py-10 font-medium">
              Failed to load batches. An error occurred while fetching data.
            </p>
          ) : batches.length === 0 ? (
            <p className="text-center text-gray-500 py-10 italic">
              No approval batches have been uploaded yet.
            </p>
          ) : (
            <div className="space-y-6">
              {batches.map(batch => (
                <BatchRow key={batch.id} batch={batch} toggleBatch={toggleBatch} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Approved;
