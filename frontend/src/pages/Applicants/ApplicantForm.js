import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Users,
  MapPin,
  Building2,
  Calendar,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";

// Helper function to fetch applicants (React Query query function)
const fetchApplicants = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Access token not found.");
  }
  // Added a delay to simulate network latency, making the loading state visible
  await new Promise(resolve => setTimeout(resolve, 800)); 
  
  const response = await api.get(`/applicants/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(response.data.results) ? response.data.results : [];
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

// --- Skeleton Component for Table Row ---
const TableSkeleton = ({ count = 5 }) => (
  <tbody className="divide-y divide-blue-50 animate-pulse">
    {Array.from({ count }).map((_, index) => (
      <tr key={index} className="hover:bg-blue-50/50 transition-all duration-150">
        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-6 mx-auto"></div></td>
        <td className="px-6 py-4"><div className="h-6 bg-blue-100 rounded w-48"></div></td>
        <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded w-32"></div></td>
        <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded w-28"></div></td>
        <td className="px-6 py-4"><div className="h-6 bg-blue-100 rounded w-20"></div></td>
        <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded w-36"></div></td>
      </tr>
    ))}
  </tbody>
);
// ---------------------------------------------


const ApplicantForm = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: applicants = [], isLoading, isError, error } = useQuery(
    "applicantsList", // Unique key for caching
    fetchApplicants,
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      onError: (err) => {
        console.error("React Query Error fetching applicants:", err);
      },
    }
  );

  useEffect(() => {
    document.title = "QuickAid | Applicant Form";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  // Filtering is done on the data returned by useQuery
  const filteredApplicants = applicants.filter(
    (applicant) =>
      `${applicant.background_info?.first_name || ""} ${
        applicant.background_info?.last_name || ""
      }`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      applicant.background_info?.barangay
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      applicant.background_info?.barangay_details?.city_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      applicant.type_of_assistance
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      formatDate(applicant.created_at)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // *** THE MAIN COMPONENT REMAINS UNCHANGED, allowing the title section to load ***
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/30 to-blue-50 p-4 sm:p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section (Always Visible) */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl">
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-blue-900 tracking-tight">
                  New Applicants
                </h1>
              </div>
              <p className="text-blue-500 ml-14 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Input and view assistance applicants
              </p>
            </div>

            {/* Navigation Button */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/new-applicant");
              }}
              className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-400/30 hover:shadow-xl hover:shadow-blue-400/40 flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              New Applicant
            </a>
          </div>
        </div>

        {/* Stats and Search Card (Always Visible) */}
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-100 border border-blue-100 mb-6 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6">
              {/* Search Bar */}
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name, barangay, city, or assistance type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Stats Badge */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100/50 px-6 py-3.5 rounded-xl border-2 border-blue-200/50">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {/* Display actual count or a placeholder during loading */}
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-blue-400" /> : applicants.length}
                  </div>
                  <div className="text-xs font-medium text-blue-700">
                    Total Applicants
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Dynamic Content Area (Loading/Error/Table) --- */}
        {isError ? (
          <div className="bg-red-50 rounded-2xl shadow-xl border border-red-200 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-red-900">
                Failed to Load Applicants
              </h3>
              <p className="text-red-700 max-w-lg">
                An error occurred while fetching data: **{(error).message}**. Please check your network connection or try logging in again.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl shadow-blue-100 border border-blue-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100">
                <thead>
                  {/* Table Header (Always Visible) */}
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider"><div className="flex items-center gap-2"><Users className="w-4 h-4" />Full Name</div></th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider"><div className="flex items-center gap-2"><MapPin className="w-4 h-4" />Barangay</div></th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider"><div className="flex items-center gap-2"><Building2 className="w-4 h-4" />City</div></th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider"><div className="flex items-center gap-2"><FileText className="w-4 h-4" />Assistance Type</div></th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider"><div className="flex items-center gap-2"><Calendar className="w-4 h-4" />Date Filled</div></th>
                  </tr>
                </thead>
                
                {isLoading ? (
                  // Show Skeleton while loading
                  <TableSkeleton count={10} />
                ) : filteredApplicants.length > 0 ? (
                  // Show Filtered Data
                  <tbody className="divide-y divide-blue-50">
                    {filteredApplicants.map((applicant, index) => (
                      <tr
                        key={applicant.id || index}
                        className="hover:bg-blue-50/50 transition-all duration-150 group cursor-pointer"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                            {filteredApplicants.length - index}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-blue-900 whitespace-nowrap">
                          {applicant.background_info?.first_name}{" "}
                          {applicant.background_info?.last_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-blue-700">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            {applicant.background_info?.barangay}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-blue-700">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-400" />
                            {applicant.background_info?.barangay_details?.city_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
                            <FileText className="w-3 h-3" />
                            {applicant.type_of_assistance}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-blue-700">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            {formatDate(applicant.created_at)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  // Show Empty State (no results or no applicants yet)
                  <tbody>
                    <tr>
                      <td colSpan="6" className="p-0">
                        <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-gray-50 rounded-b-2xl">
                          <div className="mb-6 p-6 bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl">
                            <FileText className="w-20 h-20 text-blue-300" />
                          </div>
                          <h3 className="text-2xl font-bold mb-3 text-blue-900">
                            No applicants found
                          </h3>
                          <p className="text-blue-600 mb-8 max-w-md">
                            {searchTerm
                              ? "Try adjusting your search criteria to find what you're looking for"
                              : "Get started by adding your first applicant to the system"}
                          </p>

                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              navigate("/new-applicant");
                            }}
                            className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-400/30 hover:shadow-xl hover:shadow-blue-400/40 flex items-center gap-2 hover:scale-105 active:scale-95"
                          >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                            Add Applicant
                          </a>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantForm;