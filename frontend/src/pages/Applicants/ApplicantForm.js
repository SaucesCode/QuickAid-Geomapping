import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { api } from "../../services/api";

const ApplicantForm = () => {
  const [applicants, setApplicants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = "QuickAid | Applicant Form";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await api.get(`/applicants/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.data;
      setApplicants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      setApplicants([]);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const filteredApplicants = applicants.filter(
    applicant =>
      `${applicant.background_info.first_name} ${applicant.background_info.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      applicant.background_info.barangay.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.background_info.barangay_details.city_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      applicant.type_of_assistance.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDate(applicant.created_at).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-12 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">New Applicants</h1>
          <p className="text-gray-400">Input and view assistance applicants</p>
        </div>
        <NavLink
          to="/new-applicant"
          className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2 rounded-lg font-medium transition-colors"
        >
          + New Applicant
        </NavLink>
      </div>

      {/* Tools */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="🔍 Search applicants..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full lg:w-1/3 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
        />
        <div className="text-gray-800 font-medium">
          <span className="text-teal-500 font-bold">{applicants.length}</span> Total Applicants
        </div>
      </div>

      {/* Table or Empty State */}
      {filteredApplicants.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-teal-500 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Full Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Barangay</th>
                <th className="px-4 py-3 text-left text-sm font-medium">City</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Assistance Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date Filled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApplicants.map((applicant, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {filteredApplicants.length - index}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {applicant.background_info.first_name}{" "}
                    {applicant.background_info.last_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {applicant.background_info.barangay}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {applicant.background_info.barangay_details.city_name}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs text-white bg-teal-500">
                      {applicant.type_of_assistance}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(applicant.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-16 text-center text-gray-400 bg-white rounded-xl shadow-md py-16">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">No applicants found</h3>
          <p className="text-sm">Add new applicants or adjust your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default ApplicantForm;
