// File: frontend/src/pages/Approved.js
import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import {
  Upload,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  BarChart3,
  Users,
  Loader2,
  ListOrdered,
} from "lucide-react";

// --- Design Helper Components ---

// Placeholder for the table content when a batch is expanded
const ApprovalTableSkeleton = () => (
    <div className="p-4 sm:p-6">
        <div className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Loading Approvals...
        </div>
        <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
        </div>
    </div>
);

const Approved = () => {
  const [file, setFile] = useState(null);
  // We'll use a placeholder structure for uploadResult to show the design
  const [uploadResult, setUploadResult] = useState(null); // e.g., { approved: null, already_approved: null, not_found: null, total_processed: null }
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);

  // Load batches on mount (Logic kept but stylized for design)
  const [isUploading, setIsUploading] = useState(false);

  // Load batches when page mounts

  useEffect(() => {
    // Simulating loading state for design purpose
    setTimeout(() => {
        setLoadingBatches(false);
    }, 1500); // Simulate API call delay
    // fetchBatches(); // Actual call
  }, []);

  // 🔹 Fetch approval batches
  const fetchBatches = async () => {

    // Actual fetch logic...
    // const res = await api.get("/approved/batches/");
    // setBatches(res.data);
  };

  const fetchApprovals = async (batchId) => {
    // Actual fetch logic...
    // const res = await api.get(`/approved/batch/${batchId}/approvals/`);
    // setBatches((prev) =>
    //   prev.map((b) => (b.id === batchId ? { ...b, approvals: res.data, expanded: true } : b))
    // );
  };

  const toggleBatch = (batchId) => {
    // This is purely visual toggling for the design, actual implementation needs data
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, expanded: !b.expanded, loadingApprovals: true } : { ...b, expanded: false }))
    );

    // Simulate loading details
    // const batch = batches.find((b) => b.id === batchId);
    // if (batch && !batch.approvals) {
    //   fetchApprovals(batchId);
    // }

    try {
      const res = await api.get("/approved/batches/?limit=50");
      setBatches(res.data.results);
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    }
  };

  // 🔹 Fetch approvals under a batch
  const fetchApprovals = async batchId => {
    try {
      const res = await api.get(`/approved/batch/${batchId}/approvals/?limit=100`);
      setBatches(prev =>
        prev.map(b =>
          b.id === batchId ? { ...b, approvals: res.data.results, expanded: true } : b
        )
      );
    } catch (err) {
      console.error("Failed to load approvals:", err);
      alert("Failed to load approvals.");
    }
  };

  // 🔹 Expand/collapse a batch
  const toggleBatch = batchId => {
    setBatches(prev =>
      prev.map(b => (b.id === batchId ? { ...b, expanded: !b.expanded } : b))
    );

    const batch = batches.find(b => b.id === batchId);
    if (batch && !batch.approvals) {
      fetchApprovals(batchId);
    }
  };

  // 🔹 File upload handling
  const handleFileChange = e => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return;

    // Simulate upload and result display for design
    setUploadResult({
        approved: [], // Show the card, but with empty/zero data
        already_approved: [],
        not_found: [],
        total_processed: 0,
    });
    setFile(null); // Reset file input
    // Actual upload logic...
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/approved/upload/", formData);
      setUploadResult(res.data);
      setFile(null);
      fetchBatches(); // refresh batches
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 space-y-8 md:space-y-10">
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto flex items-center gap-4 pt-4 pb-2">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 tracking-tight">
            Approved Applicants
          </h1>
          <p className="text-blue-700 text-sm sm:text-lg">Upload lists and track historical approval batches.</p>
        </div>
      </div>

      {/* --- Upload Section --- */}
      <section className="max-w-7xl mx-auto bg-white border border-blue-200 rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-blue-100 pb-3">
          <Upload className="w-6 h-6 text-blue-700" />
          <h2 className="text-xl font-bold text-blue-900">Upload New Approved List (CSV)</h2>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-blue-700 cursor-pointer
                       file:mr-4 file:py-2.5 file:px-5
                       file:rounded-xl file:border-0
                       file:text-sm file:font-bold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100 transition-colors duration-200"
          />
          <button
            onClick={handleUpload}
            disabled={!file}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 transform w-full md:w-auto flex-shrink-0 ${
              file
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-300/50 hover:scale-[1.02]"
                : "bg-gray-300 cursor-not-allowed text-gray-600 shadow-none"
            }`}
          >
            <Upload className="w-5 h-5" />
            Upload List
            disabled={!file || isUploading}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
              file && !isUploading
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                : "bg-gray-300 cursor-not-allowed text-gray-600"
            }`}
          >
            <Upload className="w-5 h-5" />
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* Upload Results (Designed to show a placeholder for the results structure) */}
        {uploadResult && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5 text-blue-900 shadow-inner">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-blue-700" />
              Last Upload Summary
            </h3>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <li className="flex flex-col items-start p-3 rounded-lg bg-white shadow-sm border border-green-200">
                <span className="flex items-center gap-1 text-green-600 font-bold">
                    <CheckCircle className="w-4 h-4" /> Approved
                </span>
                <span className="text-2xl font-bold text-green-800 mt-1 w-full h-8 bg-gray-100 rounded animate-pulse"></span>
              </li>
              <li className="flex flex-col items-start p-3 rounded-lg bg-white shadow-sm border border-yellow-200">
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <AlertTriangle className="w-4 h-4" /> Already Approved
                </span>
                <span className="text-2xl font-bold text-amber-800 mt-1 w-full h-8 bg-gray-100 rounded animate-pulse"></span>
              </li>
              <li className="flex flex-col items-start p-3 rounded-lg bg-white shadow-sm border border-red-200">
                <span className="flex items-center gap-1 text-red-600 font-bold">
                    <XCircle className="w-4 h-4" /> Not Found
                </span>
                <span className="text-2xl font-bold text-red-800 mt-1 w-full h-8 bg-gray-100 rounded animate-pulse"></span>
              Upload Summary
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" /> Approved:{" "}
                {uploadResult.total_approved ?? 0}
              </li>
              <li className="flex flex-col items-start p-3 rounded-lg bg-white shadow-sm border border-blue-200">
                <span className="flex items-center gap-1 text-blue-700 font-bold">
                    <ListOrdered className="w-4 h-4" /> Total Processed
                </span>
                <span className="text-2xl font-bold text-blue-900 mt-1 w-full h-8 bg-gray-100 rounded animate-pulse"></span>
              </li>
            </ul>
          </div>
        )}
      </section>

      {/* --- Batches Section --- */}
      <section className="max-w-7xl mx-auto bg-white border border-blue-200 rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-blue-100 pb-3">
          <FileText className="w-6 h-6 text-blue-700" />
          <h2 className="text-xl font-bold text-blue-900">Approval Batches History</h2>
        </div>

        {/* Loading State Placeholder */}
        {loadingBatches && (
            <div className="text-center py-12 text-blue-700 font-bold">
                <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
                <p>Loading batch history...</p>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-blue-50 rounded-xl shadow-sm mt-4 animate-pulse"></div>
                ))}
            </div>
        )}

        {/* Empty State Placeholder (Visible when not loading and batches is empty) */}
        {!loadingBatches && batches.length === 0 && (
          <p className="text-center text-blue-700 py-10 italic font-medium">
            <AlertTriangle className="w-6 h-6 mx-auto mb-3 text-amber-500" />
            No approval batches found. Upload a file to see the history here.
          </p>
        )}

        {/* Batch Accordion Structure (Designed with placeholders) */}
        {!loadingBatches && batches.length > 0 && (
            <div className="space-y-4">
                {/* We map a placeholder array here to show the design structure */}
                {[...Array(2)].map((_, index) => {
                    // Simulate an 'expanded' state for design purposes
                    const isExpanded = index === 0; 
                    const isApprovalsLoaded = index === 0; 

                    return (
                        <div
                            key={index}
                            className="border border-blue-200 rounded-xl shadow-md bg-gradient-to-br from-white to-blue-50 transition-all hover:shadow-lg"
                        >
                            <button
                                onClick={() => toggleBatch(index)}
                                className="w-full flex justify-between items-center p-4 sm:p-5 focus:outline-none rounded-xl transition-all"
                                aria-expanded={isExpanded ? "true" : "false"}
                                aria-controls={`batch-${index}-content`}
                            >
                                <div className="text-left space-y-1">
                                    <h3 className="text-lg font-bold text-blue-900 truncate flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600"/> Batch ID: <span className="text-blue-700 font-bold">12025-0{index + 1}</span>
                                    </h3>
                                    <p className="text-sm text-blue-800">
                                        Uploaded by <span className="font-bold">Admin User</span> on{" "}
                                        <span className="font-bold">{new Date().toLocaleString()}</span>
                                    </p>
                                    {/* Placeholder for stats */}
                                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
                                        <div className="h-4 w-20 bg-blue-100 rounded-full animate-pulse"></div>
                                        <div className="h-4 w-24 bg-green-100 rounded-full animate-pulse"></div>
                                        <div className="h-4 w-28 bg-amber-100 rounded-full animate-pulse"></div>
                                    </div>
                                </div>

                                <span className="text-blue-700 font-bold select-none flex items-center p-2 rounded-full hover:bg-blue-100 transition-colors flex-shrink-0 ml-4">
                                    {isExpanded ? (
                                        <ChevronUp className="w-5 h-5" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5" />
                                    )}
                                </span>
                            </button>

                            {/* Expanded Content (Designed with a loading/skeleton state) */}
                            {isExpanded && (
                                <div
                                    id={`batch-${index}-content`}
                                    className="overflow-x-auto max-h-96 border-t border-blue-100 bg-white rounded-b-xl transition-all duration-300 ease-in-out"
                                >
                                    {isApprovalsLoaded ? (
                                        <table className="min-w-full text-sm text-left text-blue-900">
                                            <thead className="bg-blue-100 sticky top-0 z-10 shadow-sm">
                                                <tr>
                                                    <th className="px-4 py-3 font-bold text-blue-700 uppercase tracking-wider whitespace-nowrap">Name</th>
                                                    <th className="px-4 py-3 font-bold text-blue-700 uppercase tracking-wider whitespace-nowrap">Barangay</th>
                                                    <th className="px-4 py-3 font-bold text-blue-700 uppercase tracking-wider whitespace-nowrap">Assistance</th>
                                                    <th className="px-4 py-3 font-bold text-blue-700 uppercase tracking-wider whitespace-nowrap">Amount</th>
                                                    <th className="px-4 py-3 font-bold text-blue-700 uppercase tracking-wider whitespace-nowrap">Approved At</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Placeholder rows */}
                                                {[...Array(4)].map((_, row_i) => (
                                                    <tr key={row_i} className="hover:bg-blue-50 transition-all duration-150 animate-pulse">
                                                        <td className="px-4 py-3 border-b border-blue-100"><div className="h-4 bg-gray-100 rounded w-36"></div></td>
                                                        <td className="px-4 py-3 border-b border-blue-100"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                                        <td className="px-4 py-3 border-b border-blue-100"><div className="h-6 bg-blue-100 rounded-full w-24"></div></td>
                                                        <td className="px-4 py-3 border-b border-blue-100"><div className="h-4 bg-green-100 rounded w-16"></div></td>
                                                        <td className="px-4 py-3 border-b border-blue-100"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <ApprovalTableSkeleton />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        {batches.length === 0 ? (
          <p className="text-center text-blue-700 py-10 italic">No approval batches found.</p>
        ) : (
          <div className="space-y-6">
            {batches.map(batch => (
              <div
                key={batch.id}
                className="border border-blue-100 rounded-xl shadow-sm bg-gradient-to-br from-white to-blue-50 hover:shadow-md transition-all"
              >
                <button
                  onClick={() => toggleBatch(batch.id)}
                  className="w-full flex justify-between items-center p-4 focus:outline-none rounded-t-xl hover:bg-blue-50 transition-all"
                  aria-expanded={batch.expanded ? "true" : "false"}
                  aria-controls={`batch-${batch.id}-content`}
                >
                  <div className="text-left space-y-1">
                    <h3 className="text-lg font-semibold text-blue-900 truncate">
                      📄 File: {batch.file_name}
                    </h3>
                    <p className="text-sm text-blue-800">
                      Uploaded by <span className="font-medium">{batch.uploaded_by}</span> on{" "}
                      {new Date(batch.uploaded_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-blue-700 flex flex-wrap gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4 text-blue-600" /> Processed:{" "}
                        {batch.total_processed}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-600" /> Approved:{" "}
                        {batch.total_approved}
                      </span>
                    </p>
                  </div>

                  <span className="text-blue-700 font-semibold select-none flex items-center">
                    {batch.expanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </span>
                </button>

                {batch.expanded && batch.approvals && (
                  <div
                    id={`batch-${batch.id}-content`}
                    className="overflow-x-auto max-h-96 border-t border-blue-100 bg-white rounded-b-xl"
                  >
                    <table className="min-w-full text-sm text-left text-blue-900">
                      <thead className="bg-blue-100 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-2 border-b border-blue-200">Name</th>
                          <th className="px-4 py-2 border-b border-blue-200">Barangay</th>
                          <th className="px-4 py-2 border-b border-blue-200">Municipal</th>
                          <th className="px-4 py-2 border-b border-blue-200">Assistance</th>
                          <th className="px-4 py-2 border-b border-blue-200">Amount</th>
                          <th className="px-4 py-2 border-b border-blue-200">Approved By</th>
                          <th className="px-4 py-2 border-b border-blue-200">Approved At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batch.approvals.map(app => (
                          <tr
                            key={app.id}
                            className="hover:bg-blue-50 transition-all duration-150"
                          >
                            <td className="px-4 py-2 border-b border-blue-100">
                              {app.first_name} {app.last_name}
                            </td>
                            <td className="px-4 py-2 border-b border-blue-100">
                              {app.barangay}
                            </td>
                            <td className="px-4 py-2 border-b border-blue-100">
                              {app.municipal}
                            </td>
                            <td className="px-4 py-2 border-b border-blue-100">
                              {app.type_of_assistance}
                            </td>
                            <td className="px-4 py-2 border-b border-blue-100">
                              {app.amount}
                            </td>
                            <td className="px-4 py-2 border-b border-blue-100">
                              {app.approved_by}
                            </td>
                            <td className="px-4 py-2 border-b border-blue-100">
                              {new Date(app.approved_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Approved;