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
} from "lucide-react";

const Approved = () => {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [batches, setBatches] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Load batches when page mounts
  useEffect(() => {
    fetchBatches();
  }, []);

  // 🔹 Fetch approval batches
  const fetchBatches = async () => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6 space-y-10">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <Users className="w-8 h-8 text-blue-700" />
        <h1 className="text-3xl font-bold text-blue-900 tracking-tight">
          Approved Applicants
        </h1>
      </div>

      {/* Upload Section */}
      <section className="max-w-7xl mx-auto bg-white border border-blue-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
        <div className="flex items-center gap-2 mb-4 border-b border-blue-100 pb-2">
          <Upload className="w-6 h-6 text-blue-700" />
          <h2 className="text-xl font-semibold text-blue-800">Upload Approved List</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full sm:w-auto text-gray-700 border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleUpload}
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

        {uploadResult && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-5 text-blue-900">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-700" />
              Upload Summary
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" /> Approved:{" "}
                {uploadResult.total_approved ?? 0}
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" /> Total Processed:{" "}
                {uploadResult.total_processed ?? 0}
              </li>
            </ul>
          </div>
        )}
      </section>

      {/* Batches Section */}
      <section className="max-w-7xl mx-auto bg-white border border-blue-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
        <div className="flex items-center gap-2 mb-6 border-b border-blue-100 pb-2">
          <FileText className="w-6 h-6 text-blue-700" />
          <h2 className="text-xl font-semibold text-blue-800">Approval Batches</h2>
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
