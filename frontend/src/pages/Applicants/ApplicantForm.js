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

  // ✅ Fetch applicants using React Query
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

  // 🔍 Filter results with useMemo for performance
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

  const EmptyState = () => (
    <div className="bg-white rounded-2xl shadow-xl shadow-blue-100 border border-blue-100 overflow-hidden">
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="mb-6 p-6 bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl">
          <FileText className="w-20 h-20 text-blue-300" />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-blue-900">No applicants found</h3>
        <p className="text-blue-600 mb-8 max-w-md">
          {searchTerm
            ? "Try adjusting your search criteria to find what you're looking for"
            : "Get started by adding your first applicant to the system"}
        </p>
        <button
          onClick={() => navigate("/new-applicant")}
          className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-400/30 hover:shadow-xl hover:shadow-blue-400/40 flex items-center gap-2 hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          Add Applicant
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/30 to-blue-50 p-4 sm:p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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

            <button
              onClick={() => navigate("/new-applicant")}
              className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-400/30 hover:shadow-xl hover:shadow-blue-400/40 flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              New Applicant
            </button>
          </div>
        </div>

        {/* Search + Stats */}
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-100 border border-blue-100 mb-6 overflow-hidden">
          <div className="p-6 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search by name, barangay, city, or assistance type..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-700 placeholder-gray-400"
              />
            </div>

            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100/50 px-6 py-3.5 rounded-xl border-2 border-blue-200/50">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {isLoading ? "..." : applicants.length}
                </div>
                <div className="text-xs font-medium text-blue-700">Total Applicants</div>
              </div>
            </div>
          </div>
        </div>

        {/* Table or Loading/Empty */}
        {isLoading ? (
          <div className="flex justify-center py-24 text-blue-700 font-semibold">
            Loading...
          </div>
        ) : isError || !filteredApplicants.length ? (
          <EmptyState />
        ) : (
          <div className="bg-white rounded-2xl shadow-xl shadow-blue-100 border border-blue-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-semibold uppercase tracking-wider">
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
                <tbody className="divide-y divide-blue-50">
                  {filteredApplicants.map((a, i) => (
                    <tr
                      key={a.id || i}
                      className="hover:bg-blue-50/50 transition-all duration-150 group cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          {filteredApplicants.length - i}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-900 whitespace-nowrap">
                        {a.background_info?.first_name} {a.background_info?.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        {a.background_info?.barangay}
                      </td>{" "}
                      <td className="px-6 py-4 text-sm text-blue-700 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        {a.background_info?.barangay_details?.city_name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm">
                          <FileText className="w-3 h-3" />
                          {a.type_of_assistance}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-700 flex items-center gap-2">
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
  );
};

export default ApplicantForm;
