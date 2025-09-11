import React, { useState } from "react";
import { api } from "../../services/api";

const ExportApplicants = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assistanceType, setAssistanceType] = useState("");

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);

      if (endDate) {
        // Add +1 day so backend includes the entire endDate
        const adjustedEnd = new Date(endDate);
        adjustedEnd.setDate(adjustedEnd.getDate() + 1);
        params.append("end_date", adjustedEnd.toISOString().split("T")[0]);
      }

      if (assistanceType) params.append("assistance_type", assistanceType);

      const response = await api.get(`/export-applicants/?${params.toString()}`, {
        responseType: "blob",
      });

      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "applicants.csv");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Export Applicants</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Assistance Type</label>
          <select
            value={assistanceType}
            onChange={e => setAssistanceType(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">All</option>
            <option value="Medical">Medical</option>
            <option value="Burial">Burial</option>
            <option value="Educational">Educational</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleExport}
        className="mt-6 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
      >
        Export CSV
      </button>
    </div>
  );
};

export default ExportApplicants;
