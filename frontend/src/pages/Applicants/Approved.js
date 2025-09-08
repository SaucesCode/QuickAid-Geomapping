// File: frontend/src/pages/Approved.js
import React, { useState, useEffect } from "react";
import { api } from "../../services/api";

const Approved = () => {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [batches, setBatches] = useState([]);

  // Load batches on mount
  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await api.get("/approved/batches/");
      setBatches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApprovals = async batchId => {
    try {
      const res = await api.get(`/approved/batch/${batchId}/approvals/`);
      setBatches(prev =>
        prev.map(b => (b.id === batchId ? { ...b, approvals: res.data, expanded: true } : b))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to load approvals.");
    }
  };

  const toggleBatch = batchId => {
    setBatches(prev =>
      prev.map(b => (b.id === batchId ? { ...b, expanded: !b.expanded } : b))
    );
    const batch = batches.find(b => b.id === batchId);
    if (batch && !batch.approvals) {
      fetchApprovals(batchId);
    }
  };

  const handleFileChange = e => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/approved/upload/", formData);
      setUploadResult(res.data);
      fetchBatches(); // refresh list
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900">Approved Applicants</h1>

      {/* Upload Section */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">
          Upload Approved List
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full sm:w-auto text-gray-700 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Select file to upload"
          />
          <button
            onClick={handleUpload}
            disabled={!file}
            className={`inline-flex items-center justify-center px-6 py-2 rounded-md text-white font-semibold transition-colors ${
              file
                ? "bg-teal-600 hover:bg-teal-700 focus:ring-4 focus:ring-teal-300"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Upload
          </button>
        </div>

        {uploadResult && (
          <div className="mt-6 bg-teal-50 border border-teal-200 rounded-md p-4 text-teal-900">
            <h3 className="font-semibold mb-2">Upload Results:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>✅ Approved: {uploadResult.approved?.length ?? 0}</li>
              <li>⚠️ Already Approved: {uploadResult.already_approved?.length ?? 0}</li>
              <li>❌ Not Found: {uploadResult.not_found?.length ?? 0}</li>
              <li>📊 Total Processed: {uploadResult.total_processed ?? 0}</li>
            </ul>
          </div>
        )}
      </section>

      {/* Batches Section */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 border-b border-gray-200 pb-2">
          Approval Batches
        </h2>

        {batches.length === 0 && (
          <p className="text-center text-gray-500 py-10">No approval batches found.</p>
        )}

        <div className="space-y-6">
          {batches.map(batch => (
            <div key={batch.id} className="border border-gray-200 rounded-lg shadow-sm">
              <button
                onClick={() => toggleBatch(batch.id)}
                className="w-full flex justify-between items-center p-4 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-t-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                aria-expanded={batch.expanded ? "true" : "false"}
                aria-controls={`batch-${batch.id}-content`}
              >
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    File: {batch.file_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Uploaded by <span className="font-medium">{batch.uploaded_by}</span> on{" "}
                    {new Date(batch.uploaded_at).toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    📊 Processed: {batch.total_processed} | ✅ Approved: {batch.total_approved}{" "}
                    | ⚠️ Already Approved: {batch.total_already_approved} | ❌ Not Found:{" "}
                    {batch.total_not_found}
                  </p>
                </div>
                <span className="text-teal-600 font-semibold select-none">
                  {batch.expanded ? "▲ Hide" : "▼ View"}
                </span>
              </button>

              {batch.expanded && batch.approvals && (
                <div
                  id={`batch-${batch.id}-content`}
                  className="overflow-x-auto max-h-96 border-t border-gray-200"
                >
                  <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-2 border-b border-gray-300">Name</th>
                        <th className="px-4 py-2 border-b border-gray-300">Barangay</th>
                        <th className="px-4 py-2 border-b border-gray-300">Municipal</th>
                        <th className="px-4 py-2 border-b border-gray-300">Assistance</th>
                        <th className="px-4 py-2 border-b border-gray-300">Amount</th>
                        <th className="px-4 py-2 border-b border-gray-300">Approved By</th>
                        <th className="px-4 py-2 border-b border-gray-300">Approved At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batch.approvals.map(app => (
                        <tr key={app.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-b border-gray-200">
                            {app.first_name} {app.last_name}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200">
                            {app.barangay}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200">
                            {app.municipal}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200">
                            {app.type_of_assistance}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200">{app.amount}</td>
                          <td className="px-4 py-2 border-b border-gray-200">
                            {app.approved_by}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200">
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
      </section>
    </div>
  );
};

export default Approved;
