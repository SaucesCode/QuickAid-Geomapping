import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Users, FileText, UserPlus } from "lucide-react";
import { api } from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/FormatDate";
import toast from "react-hot-toast";
import Pagination from "../../components/Pagination";
import {
  PageContainer,
  Card,
  PageHeader,
  GradientButton,
  LoadingState,
  H2,
  BodyText,
  Caption,
} from "../../components/DesignSystem";

const ApplicantForm = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    document.title = "QuickAid | Applicant Registry";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  // Fetch applicants
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
    staleTime: 1000 * 60 * 5,
    retry: 1,
    onError: () =>
      toast.error("Failed to load applicants", {
        style: { background: "#1e293b", color: "#f1f5f9" },
      }),
  });

  // Filter
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

  // Pagination logic
  const totalItems = filteredApplicants.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApplicants = useMemo(
    () => filteredApplicants.slice(indexOfFirstItem, indexOfLastItem),
    [filteredApplicants, indexOfFirstItem, indexOfLastItem]
  );

  const handlePageChange = pageNumber => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = e => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, applicants]);

  // Empty State
  const EmptyState = () => (
    <Card className="p-8 text-center space-y-6">
      <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
        <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
      </div>
      <H2>{isError ? "Error Loading Data" : "No Applicants Found"}</H2>
      <BodyText className="max-w-md mx-auto">
        {isError
          ? "There was an issue fetching the data. Please check your connection or try again later."
          : searchTerm
          ? "Your search criteria yielded no results. Try adjusting your search."
          : "Get started by adding your first applicant to the system."}
      </BodyText>
      <GradientButton onClick={() => navigate("/new-applicant")} className="mx-auto">
        <Plus className="w-5 h-5" />
        Add New Applicant
      </GradientButton>
    </Card>
  );

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        icon={UserPlus}
        title="Applicant Registry"
        subtitle="Manage, view, and add new applicants"
        action={
          <GradientButton onClick={() => navigate("/new-applicant")}>
            <Plus className="w-5 h-5" />
            New Applicant
          </GradientButton>
        }
      />

      {/* Search & Stats */}
      <Card className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 sm:gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, barangay, city, or assistance type..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 focus:bg-white text-gray-700 placeholder-gray-400 text-sm sm:text-base"
          />
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-inner flex items-center justify-between w-full lg:w-auto">
          <div>
            <Caption className="font-semibold text-gray-600">Total Applicants</Caption>
            {isLoading ? (
              <div className="h-6 sm:h-8 w-16 sm:w-20 bg-gray-200 rounded animate-pulse mt-1"></div>
            ) : (
              <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
                {applicants.length.toLocaleString()}
              </h2>
            )}
          </div>
          <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
      </Card>

      {/* Data Display */}
      {isLoading ? (
        <Card>
          <LoadingState message="Loading Applicant Data..." />
        </Card>
      ) : isError || !filteredApplicants.length ? (
        <EmptyState />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100 text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white uppercase text-xs font-semibold tracking-wider">
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">No.</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">Full Name</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">Barangay</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">City</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">Assistance Type</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">Date Filled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50 text-gray-800">
                {currentApplicants.map((a, i) => (
                  <tr
                    key={a.id || i}
                    onClick={() => navigate(`/applicants/${a.id}`)}
                    className="hover:bg-blue-50 cursor-pointer transition-all duration-150"
                  >
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-600">
                      {totalItems - (indexOfFirstItem + i)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900">
                      {a.background_info?.first_name} {a.background_info?.last_name}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700">
                      {a.background_info?.barangay}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700">
                      {a.background_info?.barangay_details?.city_name || "N/A"}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span
                        className={`inline-flex px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-semibold ${
                          a.type_of_assistance?.toLowerCase() === "educational"
                            ? "bg-green-100 text-green-800"
                            : a.type_of_assistance?.toLowerCase() === "medical"
                            ? "bg-blue-100 text-blue-800"
                            : a.type_of_assistance?.toLowerCase() === "burial"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {a.type_of_assistance || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700">
                      {formatDate(a.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            handleItemsPerPageChange={handleItemsPerPageChange}
            totalItems={totalItems}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
          />
        </Card>
      )}
    </PageContainer>
  );
};

export default ApplicantForm;
