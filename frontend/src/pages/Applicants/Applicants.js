import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/FormatDate";
import ApplicantsHeader from "./components/ApplicantsHeader";
import ApplicantActions from "./components/ApplicantActions";
import ApplicantTable from "./components/ApplicantTable"; 
import Pagination from "../../components/Pagination";
import PreviewModal from "./components/PreviewModal";
import EditModal from "./components/EditModal";
import ArchiveModal from "./components/ArchiveModal";
import toast, { Toaster } from "react-hot-toast";
import CustomToast from "../../components/CustomToast";
import { Users, GraduationCap, Stethoscope, Heart, Sparkles, Clock, MapPin, TrendingUp } from "lucide-react";

// --- Skeleton Components for Loading State ---

const SkeletonCard = () => (
    // Reduced padding and font sizes for a smaller card footprint
    <div className="group relative bg-white bg-opacity-80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-4 animate-pulse overflow-hidden">
        <div className="relative flex items-start justify-between">
            <div className="flex-1 pr-3">
                {/* Title Skeleton */}
                <div className="h-3 w-4/5 bg-gray-200 rounded mb-2"></div>
                {/* Count Skeleton - Slightly larger to represent data */}
                <div className="h-7 w-1/3 bg-gray-300 rounded mb-1"></div>
                {/* Description Skeleton */}
                <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
            </div>
            {/* Icon Skeleton - Matches the new smaller size */}
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gray-300 rounded-xl flex-shrink-0"></div>
        </div>
        {/* Bottom Bar Skeleton */}
        <div className="mt-3 h-1 w-1/4 bg-gray-200 rounded-full"></div>
    </div>
);

const SkeletonRow = () => (
    <tr className="border-b border-gray-100 animate-pulse">
        {/* ID */}
        <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-500">
            <div className="h-4 bg-gray-200 rounded w-12"></div>
        </td>
        {/* Name */}
        <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
        </td>
        {/* Barangay */}
        <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
        </td>
        {/* Assistance Type */}
        <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
        </td>
        {/* Date Filled */}
        <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm">
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </td>
        {/* Actions */}
        <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm font-medium">
            <div className="flex space-x-2 justify-end">
                <div className="h-6 w-6 bg-gray-200 rounded-md"></div>
                <div className="h-6 w-6 bg-gray-200 rounded-md"></div>
                <div className="h-6 w-6 bg-gray-200 rounded-md"></div>
            </div>
        </td>
    </tr>
);

// --- Main Component ---
import {
  Users,
  FileText,
  CheckCircle2,
  TrendingUp,
  Activity,
  GraduationCap,
  Stethoscope,
  Plus,
  Heart,
  Sparkles,
} from "lucide-react";

const csvHeaders = [
  { label: "ID", key: "id" },
  { label: "First Name", key: "first_name" },
  { label: "Middle Initial", key: "middle_initial" },
  { label: "Last Name", key: "last_name" },
  { label: "Suffix", key: "suffix" },
  { label: "Contact Number", key: "contact_number" },
  { label: "Purok", key: "purok" },
  { label: "Barangay", key: "barangay" },
  { label: "City/Municipality", key: "city_municipality" },
  { label: "Province", key: "province" },
  { label: "Birthday", key: "birthday" },
  { label: "Sex", key: "gender" },
  { label: "Civil Status", key: "civil_status" },
  { label: "Occupation", "key": "occupation" },
  { label: "Monthly Income", "key": "monthly_income" },
  { label: "Valid ID", key: "valid_id_presented" },
  { label: "Assistance Type", key: "type_of_assistance" },
  { label: "Applicant Type", key: "applicant_type" },
  { label: "Date Filled", key: "date_filled" },
];

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editView, setEditView] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);
  const [previewView, setPreviewView] = useState(false);
  const [previewApplicant, setPreviewApplicant] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [archiveModal, setArchiveModal] = useState({ show: false, applicantId: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "QuickAid | Applicants";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  const fetchApplicants = async (url = "/applicants/?limit=50") => {
    setLoading(true);
    try {
      // Simulate network delay for skeleton visibility
      await new Promise(resolve => setTimeout(resolve, 800)); 
      const res = await api.get("/applicants/");
      setApplicants(res.data);
      const res = await api.get(url);
      const data = res.data;

      // DRF paginated response (has results array)
      if (data.results) {
        setApplicants(prev => [...prev, ...data.results]);
        setNextUrl(data.next);
      }
      // Non-paginated fallback (in case pagination is off)
      else if (Array.isArray(data)) {
        setApplicants(prev => [...prev, ...data]);
        setNextUrl(null);
      }
    } catch (err) {
      console.error("Fetch applicants failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleScroll = () => {
    if (nextUrl && !loading) {
      fetchApplicants(nextUrl);
    }
  };

  const openEditView = applicant => {
    setEditingApplicant({
      ...applicant,
      valid_id_presented: applicant.valid_id_presented || "",
      other_valid_id: applicant.other_valid_id || "",
    });
    setEditView(true);
  };

  const closeEditView = () => {
    setEditingApplicant(null);
    setEditView(false);
  };

  const openPreviewView = applicant => {
    setPreviewApplicant({ ...applicant });
    setPreviewView(true);
  };

  const closePreviewView = () => {
    setPreviewApplicant(null);
    setPreviewView(false);
  };

  const openArchiveModal = id => {
    setArchiveModal({ show: true, applicantId: id });
  };

  const closeArchiveModal = () => {
    setArchiveModal({ show: false, applicantId: null });
  };

  const handleArchive = async () => {
    if (!archiveModal.applicantId) return;
    try {
      await api.delete(`/applicants/${archiveModal.applicantId}/`);
      toast.custom(t => <CustomToast t={t} type="archive" />);
      fetchApplicants();
      closeArchiveModal();
    } catch (err) {
      console.error("Archive failed:", err);
      alert("Failed to archive applicant.");
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setEditingApplicant(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async e => {
    e.preventDefault();
    if (!editingApplicant || !editingApplicant.id) return;

    try {
      const { data } = await api.post("/update_coordinates/", {
        id: editingApplicant.id,
        background_info: {
          barangay: editingApplicant.background_info.barangay,
          barangay_details: {
            city_name: editingApplicant.background_info.barangay_details.city_name,
          },
        },
      });

      const updatedApplicant = {
        ...editingApplicant,
        latitude: data.latitude,
        longitude: data.longitude,
      };

      await api.put(`/applicants/${editingApplicant.id}/`, updatedApplicant);
      fetchApplicants();
      closeEditView();
    } catch (err) {
      console.error("Error saving applicant:", err);
    }
  };

  const handleSort = key => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = data => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  };

  const filteredApplicants = applicants.filter(a => {
    const keyword = searchTerm.toLowerCase();
    return (
      (a.background_info?.first_name || "").toLowerCase().includes(keyword) ||
      (a.background_info?.last_name || "").toLowerCase().includes(keyword) ||
      (a.background_info?.barangay || "").toLowerCase().includes(keyword) ||
      (formatDate(a.date_filled) || "").toLowerCase().includes(keyword) ||
      (a.type_of_assistance || "").toLowerCase().includes(keyword)
    );
  });

  const sortedApplicants = getSortedData(filteredApplicants);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedApplicants.length / itemsPerPage);

  const handlePageChange = pageNumber => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = e => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Calculate statistics
  const medicalCount = applicants.filter(a => a.type_of_assistance === "Medical").length;
  const educationalCount = applicants.filter(a => a.type_of_assistance === "Educational").length;
  const burialCount = applicants.filter(a => a.type_of_assistance === "Burial").length;

  /**
   * Color coding logic matching user requests and table visuals.
   */
  const getTypeStyles = (type) => {
    switch (type) {
      case "Educational":
        // Blue
        return "bg-blue-100 text-blue-700";
      case "Medical":
        // Light Mint/Teal Green
        return "bg-teal-100 text-teal-700";
      case "Burial":
        // Light Yellow/Amber
        return "bg-yellow-100 text-yellow-700";
      case "Livelihood":
        // Purple
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  const burialCount = applicants.filter(a => a.type_of_assistance === "Burial").length;
  const educationalCount = applicants.filter(
    a => a.type_of_assistance === "Educational"
  ).length;

  return (
    // Outermost Container: overflow-x-hidden is crucial for removing horizontal scrollbar
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* Main Content Container: Centered, max width, and only horizontal padding to prevent width overflow */}
      <div className="relative z-10 max-w-7xl mx-auto py-4 sm:py-6 md:py-8 lg:py-10 px-4 sm:px-6">
        <Toaster position="top-center" reverseOrder={false} />

        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-blue-200 p-4 sm:p-6 md:p-8 mb-6 md:mb-8">
            <ApplicantsHeader />
          </div>

          {/* Stats Cards: Responsive Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {loading ? (
                // --- Skeleton Cards when loading ---
                <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </>
            ) : (
                <>
                    {/* Total Applicants - Small Box */}
                    <div className="group relative bg-white bg-opacity-80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-200 p-4 sm:p-5 overflow-hidden hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                        <div className="relative flex items-start justify-between">
                            <div className="flex-1 pr-3">
                                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">
                                    Total Applicants
                                </p>
                                <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 mb-0.5">
                                    {applicants.length}
                                </p>
                                <p className="text-gray-500 text-xs font-medium">All registered applicants</p>
                            </div>
                            {/* Responsive Icon Container */}
                            <div className="w-10 h-10 sm:w-12 sm:h-12 p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-xl shadow-lg group-hover:scale-110 transition-transform flex items-center justify-center flex-shrink-0">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-3 h-1 w-12 sm:w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                    </div>

                    {/* Medical Assistance (Green) - Small Box */}
                    <div className="group relative bg-white bg-opacity-80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-teal-200 p-4 sm:p-5 overflow-hidden hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                        <div className="relative flex items-start justify-between">
                            <div className="flex-1 pr-3">
                                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">
                                    Medical Assistance
                                </p>
                                <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-700 mb-0.5">
                                    {medicalCount}
                                </p>
                                <p className="text-gray-500 text-xs font-medium">Active medical cases</p>
                            </div>
                            {/* Responsive Icon Container */}
                            <div className="w-10 h-10 sm:w-12 sm:h-12 p-2 sm:p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl sm:rounded-xl shadow-lg group-hover:scale-110 transition-transform flex items-center justify-center flex-shrink-0">
                                <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-3 h-1 w-12 sm:w-16 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full"></div>
                    </div>

                    {/* Educational Assistance (Blue) - Small Box */}
                    <div className="group relative bg-white bg-opacity-80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-200 p-4 sm:p-5 overflow-hidden hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                        <div className="relative flex items-start justify-between">
                            <div className="flex-1 pr-3">
                                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">
                                    Educational Assistance
                                </p>
                                <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 mb-0.5">
                                    {educationalCount}
                                </p>
                                <p className="text-gray-500 text-xs font-medium">Active educational cases</p>
                            </div>
                            {/* Responsive Icon Container */}
                            <div className="w-10 h-10 sm:w-12 sm:h-12 p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-xl shadow-lg group-hover:scale-110 transition-transform flex items-center justify-center flex-shrink-0">
                                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-3 h-1 w-12 sm:w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                    </div>

                    {/* Burial Assistance (Yellow/Orange) - Small Box */}
                    <div className="group relative bg-white bg-opacity-80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-yellow-200 p-4 sm:p-5 overflow-hidden hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                        <div className="relative flex items-start justify-between">
                            <div className="flex-1 pr-3">
                                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">
                                    Burial Assistance
                                </p>
                                <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-700 mb-0.5">
                                    {burialCount}
                                </p>
                                <p className="text-gray-500 text-xs font-medium">Active burial cases</p>
                            </div>
                            {/* Responsive Icon Container */}
                            <div className="w-10 h-10 sm:w-12 sm:h-12 p-2 sm:p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl sm:rounded-xl shadow-lg group-hover:scale-110 transition-transform flex items-center justify-center flex-shrink-0">
                                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-3 h-1 w-12 sm:w-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full"></div>
                    </div>
                </>
            )}
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Applicants */}
            <div className="group relative bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-200 p-6 overflow-hidden hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-gray-600 text-sm font-bold uppercase tracking-wide">
                      Total Applicants
                    </p>
                  </div>
                  <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 mb-2">
                    {applicants.length}
                  </p>
                  <p className="text-gray-500 text-sm font-medium">
                    All registered applicants
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="mt-4 h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>

            {/* Medical */}
            <div className="group relative bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-amber-200 p-6 overflow-hidden hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <p className="text-gray-600 text-sm font-bold uppercase tracking-wide">
                      Medical Assistance
                    </p>
                  </div>
                  <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-700 mb-2">
                    {medicalCount}
                  </p>
                  <p className="text-gray-500 text-sm font-medium">Active medical cases</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="mt-4 h-1 w-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"></div>
            </div>

            {/* Educational */}
            <div className="group relative bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-emerald-200 p-6 overflow-hidden hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p className="text-gray-600 text-sm font-bold uppercase tracking-wide">
                      Educational Assistance
                    </p>
                  </div>
                  <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-700 mb-2">
                    {educationalCount}
                  </p>
                  <p className="text-gray-500 text-sm font-medium">Active educational cases</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="mt-4 h-1 w-20 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"></div>
            </div>

            {/* Burial */}
            <div className="group relative bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-violet-200 p-6 overflow-hidden hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                    <p className="text-gray-600 text-sm font-bold uppercase tracking-wide">
                      Burial Assistance
                    </p>
                  </div>
                  <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-700 mb-2">
                    {burialCount}
                  </p>
                  <p className="text-gray-500 text-sm font-medium">Active burial cases</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Heart className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="mt-4 h-1 w-20 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Search and Export */}
        <div className="mb-6">
          <ApplicantActions
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            applicants={applicants}
            csvHeaders={csvHeaders}
          />
        </div>

        {/* Main Content Area: Table */}
        <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-blue-200 overflow-hidden">

          {/* Loading Skeleton for Table */}
          {loading ? (
            <div className="divide-y divide-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant Name</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Barangay</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assistance Type</th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Filled</th>
                            <th className="relative px-4 sm:px-6 py-3 text-right"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {/* Render 10 Skeleton Rows */}
                        {Array.from({ length: 10 }).map((_, index) => (
                            <SkeletonRow key={index} />
                        ))}
                    </tbody>
                </table>
            </div>
          ) : applicants.length > 0 ? (
            <>
              {/* Table Wrapper: Ensures horizontal scrolling is contained to the table when necessary */}
              <div className="overflow-x-auto">
                <ApplicantTable
                  currentItems={currentItems}
                  sortConfig={sortConfig}
                  handleSort={handleSort}
                  openPreviewView={openPreviewView}
                  openEditView={openEditView}
                  openArchiveModal={openArchiveModal}
                  goPrintPage={navigate}
                  formatDate={formatDate}
                  getTypeStyles={getTypeStyles} 
                />
              </div>

              {/* Pagination */}
              {sortedApplicants.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  handleItemsPerPageChange={handleItemsPerPageChange}
                  totalItems={sortedApplicants.length}
                  indexOfFirstItem={indexOfFirstItem}
                  indexOfLastItem={indexOfLastItem}
                />
              )}
            </>
          ) : (
            /* No Applicants Found State: Responsive padding and text */
            <div className="flex flex-col items-center justify-center py-20 sm:py-24 md:py-32 px-4 sm:px-6 text-center">
              <div className="mb-6 sm:mb-8 p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl border-2 border-blue-200 shadow-lg">
                <Users className="w-16 h-16 sm:w-20 sm:h-20 text-blue-400 mx-auto" />
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                No applicants found
              </h3>
              <p className="text-gray-600 mb-6 sm:mb-8 max-w-md text-base sm:text-lg leading-relaxed">
                {searchTerm
                  ? "Try adjusting your search criteria to find what you're looking for"
                  : "Start adding applicants to get started with the management system"}
              </p>
              <div className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-100 rounded-xl border border-blue-200">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Ready to begin</span>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {previewView && previewApplicant && (
          <PreviewModal
            previewApplicant={previewApplicant}
            closePreviewView={closePreviewView}
            formatDate={formatDate}
          />
        )}

        {archiveModal.show && (
          <ArchiveModal
            archiveModal={archiveModal}
            closeArchiveModal={closeArchiveModal}
            handleArchive={handleArchive}
          />
        )}

        {editView && editingApplicant && (
          <EditModal
            editingApplicant={editingApplicant}
            closeEditView={closeEditView}
            handleChange={handleChange}
            handleSave={handleSave}
            setEditingApplicant={setEditingApplicant}
          />
        )}
      </div>
    </div>
  );
};

export default Applicants;
