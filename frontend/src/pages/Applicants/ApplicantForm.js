import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Users,
  MapPin,
  Building2,
  Calendar,
  FileText,
  Sparkles,
} from "lucide-react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// Helper function for React Query to fetch data
const fetchApplicantsData = async () => {
  const token = localStorage.getItem("accessToken");
  const response = await api.get(`/applicants/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = response.data.results;
  return Array.isArray(data) ? data : [];
};

// ============= NEW SKELETON COMPONENT =============

const SkeletonRow = ({ index }) => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-200"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-4/5"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-3/5"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-2/5"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </td>
  </tr>
);

// ============= MAIN COMPONENT =============

const ApplicantForm = () => {
  const {
    data: applicantsData,
    isLoading,
    isError,
    // error, // Kept out to avoid changing logic but available if needed
  } = useQuery({
    queryKey: ["allApplicants"],
    queryFn: fetchApplicantsData,
    staleTime: 5 * 60 * 1000, 
  });

  const applicants = applicantsData || [];
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "QuickAid | Applicant Form";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  // Logic remains unchanged
  const filteredApplicants = applicants.filter(
    (applicant) =>
      `${applicant.background_info.first_name} ${applicant.background_info.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      applicant.background_info.barangay
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      applicant.background_info.barangay_details.city_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      applicant.type_of_assistance
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      formatDate(applicant.created_at).toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Define a set number of skeleton rows to show while loading
  const SKELETON_ROW_COUNT = 8; 

  // We handle error/loading display within the main return block now
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-red-100/30 to-red-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-2xl border border-red-200">
          <p className="text-xl font-bold text-red-700 mb-2">Error Loading Data</p>
          <p className="text-gray-600">Could not fetch applicant list. Please check the network connection and try refreshing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/30 to-blue-50 p-4 sm:p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Section (Unchanged) */}
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

        {/* Stats and Search Card */}
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

              {/* Stats Badge - shows 0 or actual count immediately based on isLoading state */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100/50 px-6 py-3.5 rounded-xl border-2 border-blue-200/50">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {isLoading ? (
                      <div className="h-6 w-10 bg-blue-200 rounded animate-pulse"></div>
                    ) : (
                      applicants.length
                    )}
                  </div>
                  <div className="text-xs font-medium text-blue-700">
                    Total Applicants
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table or Empty State */}
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-100 border border-blue-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" /> Full Name
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Barangay
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> City
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Assistance Type
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Date Filled
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Conditional rendering for loading, data, or empty state */}
              <tbody className="divide-y divide-blue-50">
                {isLoading ? (
                  // Show skeleton rows while loading
                  [...Array(SKELETON_ROW_COUNT)].map((_, index) => (
                    <SkeletonRow key={index} index={index} />
                  ))
                ) : filteredApplicants.length > 0 ? (
                  // Show actual data
                  filteredApplicants.map((applicant, index) => (
                    <tr
                      key={index}
                      className="hover:bg-blue-50/50 transition-all duration-150 group cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          {filteredApplicants.length - index}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-900 whitespace-nowrap">
                        {applicant.background_info.first_name}{" "}
                        {applicant.background_info.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-700">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-400" />
                          {applicant.background_info.barangay}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-700">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-400" />
                          {applicant.background_info.barangay_details.city_name}
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
                  ))
                ) : (
                  // Show empty state if filtering results in no matches
                  // Note: The original empty state was outside the table, so we handle search-no-results here.
                  <tr className="bg-white">
                    <td colSpan="6" className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-blue-300 mb-3" />
                        <h3 className="text-xl font-semibold text-blue-900 mb-1">
                          No {searchTerm ? "matching " : ""}applicants found
                        </h3>
                        <p className="max-w-md">
                          {searchTerm
                            ? "Try adjusting your search criteria."
                            : "No applicants have been added yet."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* This empty state is for when there are NO applicants AND NO search term */}
          {/* We simplify the rendering by checking `filteredApplicants.length` after loading */}
          {!isLoading && applicants.length === 0 && searchTerm === "" && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="mb-6 p-6 bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl">
                  <FileText className="w-20 h-20 text-blue-300" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-blue-900">Get started!</h3>
                <p className="text-blue-600 mb-8 max-w-md">
                    Add your first applicant to the system.
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
          )}

        </div>
      </div>
    </div>
  );
};

export default ApplicantForm;