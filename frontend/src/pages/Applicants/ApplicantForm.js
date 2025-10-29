import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Users,
  MapPin,
  Building2,
  Calendar,
  FileText,
  Sparkles,
  UserPlus,
  Loader2, // Added Loader2 for consistent loading UI
} from "lucide-react";
import { api } from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/FormatDate";
import toast from "react-hot-toast";

const ApplicantForm = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "QuickAid | Applicant Form";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  // ✅ Fetch applicants using React Query (NO CHANGES)
  const {
    data: applicants = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["applicants"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const res = await api.get("/applicants/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return Array.isArray(res.data.results) ? res.data.results : [];
    },
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    retry: 1,
    onError: () =>
      toast.error("Failed to load applicants", {
        style: { background: "#1e293b", color: "#f1f5f9" },
      }),
  });

  // 🔍 Filter results with useMemo for performance (NO CHANGES)
  const filteredApplicants = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return applicants;
    return applicants.filter(a => {
      const info = a.background_info || {};
      const fullName = `${info.first_name ?? ""} ${info.last_name ?? ""}`.toLowerCase();
      const barangay = info.barangay?.toLowerCase() || "";
      const city = info.barangay_details?.city_name?.toLowerCase() || "";
      const assistance = a.type_of_assistance?.toLowerCase() || "";
      const date = formatDate(a.created_at)?.toLowerCase() || "";
      return (
        fullName.includes(term) ||
        barangay.includes(term) ||
        city.includes(term) ||
        assistance.includes(term) ||
        date.includes(term)
      );
    });
  }, [applicants, searchTerm]);

  // Updated EmptyState component with consistent design (UPDATED)
  const EmptyState = () => (
    <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 overflow-hidden p-6">
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        {/* Updated icon container style to match DemographicsEconomics header */}
        <div className="mb-6 w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-gray-800">
          {isError ? "Error Loading Data" : "No Applicants Found"}
        </h3>
        <p className="text-gray-500 mb-8 max-w-md">
          {isError
            ? "There was an issue fetching the data. Please check your connection or try again later."
            : searchTerm
            ? "Your search criteria yielded no results. Try adjusting your search."
            : "Get started by adding your first applicant to the system."}
        </p>
        <button
          onClick={() => navigate("/new-applicant")}
          className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-400/30 hover:shadow-xl hover:shadow-blue-400/40 flex items-center gap-2 hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          Add New Applicant
        </button>
      </div>
    </div>
  );

  return (
    // Background: Matched main container style from DemographicsEconomics
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 relative overflow-hidden">
      {/* Background Blur Shapes (Kept for consistency) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Card (UPDATED to match DemographicsEconomics header) */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-start gap-4">
                {/* Icon style matched to DemographicsEconomics header */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 leading-tight">
                    Applicant Registry
                  </h1>
                  <p className="text-gray-600 text-lg mt-1 flex items-center gap-2">
                    Input and manage assistance applicants
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/new-applicant")}
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-400/30 hover:shadow-xl hover:shadow-blue-400/40 flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                New Applicant
              </button>
            </div>
          </div>

          {/* Search + Stats Card (UPDATED to match general card style) */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 overflow-hidden">
            <div className="p-6 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name, barangay, city, or assistance type..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Stat Card style matched to DemographicsEconomics StatCard look */}
              <div className="group bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-lg p-3 lg:p-4 border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full lg:w-auto flex-shrink-0" style={{ borderLeftColor: "#3B82F6" }}>
                  <div className="flex items-center gap-4 justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Total Applicants</p>
                      {isLoading ? (
                        <div className="mt-1 space-y-2">
                          <div className="h-8 w-20 bg-gray-300 rounded animate-pulse"></div>
                          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r" style={{backgroundImage: `linear-gradient(to right, #3B82F6, #6366f1)`}}>
                            {applicants.length.toLocaleString()}
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">Total in registry</p>
                        </>
                      )}
                    </div>
                    {/* Icon style matched */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                        style={{ backgroundColor: "#3B82F6", background: `linear-gradient(to bottom right, #3B82F690, #3B82F6)` }}>
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Table or Loading/Empty */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24 bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
              <span className="text-blue-700 font-semibold">Loading Applicant Data...</span>
            </div>
          ) : isError || !filteredApplicants.length ? (
            <EmptyState />
          ) : (
            <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-100">
                  <thead>
                    {/* Table Header: Using gradient background for visual weight (kept) */}
                    <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4 text-left">#</th>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Full Name
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Barangay
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          City
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Assistance Type
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date Filled
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {filteredApplicants.map((a, i) => (
                      <tr
                        key={a.id || i}
                        className="hover:bg-blue-50/50 transition-all duration-150 group cursor-pointer"
                        // Optional: Navigate to detail page on click
                        onClick={() => navigate(`/applicants/${a.id}`)}
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                            {filteredApplicants.length - i}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800 whitespace-nowrap">
                          {a.background_info?.first_name} {a.background_info?.last_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-400" />
                          {a.background_info?.barangay}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-400" />
                          {a.background_info?.barangay_details?.city_name}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {/* Assistance Type Chip: Using gradient background (kept) */}
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">
                            <FileText className="w-3 h-3" />
                            {a.type_of_assistance}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          {formatDate(a.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantForm;