import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useQuery, useQueries, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
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
import {
  Users,
  Stethoscope,
  GraduationCap,
  Heart,
} from "lucide-react";

// --- React Query Configuration & Keys ---

const applicantKeys = {
  all: ["applicants"],
  lists: () => [...applicantKeys.all, "list"],
  list: (params) => [...applicantKeys.lists(), params],
  details: () => [...applicantKeys.all, "detail"],
  detail: (id) => [...applicantKeys.details(), id],
  stats: () => [...applicantKeys.all, "stats"],
  stat: (key) => [...applicantKeys.stats(), key],
};

const STAT_ENDPOINTS = {
  total: { path: "count/total", color: "blue", icon: Users, title: "Total Applicants" },
  medical: { path: "count/medical", color: "amber", icon: Stethoscope, title: "Medical Assistance" },
  educational: { path: "count/educational", color: "emerald", icon: GraduationCap, title: "Educational Assistance" },
  burial: { path: "count/burial", color: "violet", icon: Heart, title: "Burial Assistance" },
};

// --- Data Transformation and Utility Functions ---

// Keep your existing csvHeaders
const csvHeaders = [
  { label: "ID", key: "id" },
  { label: "First Name", key: "first_name" },
  // ... (rest of your headers)
];

const Applicants = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- Local UI State (Not managed by React Query) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [editView, setEditView] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);
  const [previewView, setPreviewView] = useState(false);
  const [previewApplicant, setPreviewApplicant] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [archiveModal, setArchiveModal] = useState({ show: false, applicantId: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    document.title = "QuickAid | Applicants";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  // --- 1. React Query: Applicants Table Data (useInfiniteQuery for loading more) ---

  const {
    data: applicantsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isTableLoading,
    isError: isTableError,
  } = useInfiniteQuery({
    queryKey: applicantKeys.list({ limit: 50 }),
    queryFn: async ({ pageParam = "/applicants/?limit=50" }) => {
      // Use the full URL provided by `next` as `pageParam`
      const res = await api.get(pageParam);
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.next || undefined,
    initialPageParam: "/applicants/?limit=50",
    staleTime: 1000 * 60, // 1 minute
  });

  // Flatten the paged data into a single array for filtering/sorting
  const allApplicants = useMemo(
    () => applicantsData?.pages.flatMap(page => page.results || []) || [],
    [applicantsData]
  );
  
  // NOTE: The `handleScroll` logic is now handled by `fetchNextPage`

  // --- 2. React Query: Stats Cards (useQueries for concurrent fetching) ---

  const statQueries = useQueries({
    queries: Object.entries(STAT_ENDPOINTS).map(([key, config]) => ({
      queryKey: applicantKeys.stat(key),
      queryFn: async () => {
        // Simulating the local calculation by fetching all, but ideally
        // you would call a dedicated, fast endpoint for each: `/applicants/${config.path}`
        const res = await api.get("/applicants/");
        const allApplicantsForStat = res.data.results || [];
        
        let count = 0;
        if (key === 'total') {
            count = allApplicantsForStat.length;
        } else {
            const assistanceType = config.title.split(' ')[0]; // Medical, Educational, Burial
            count = allApplicantsForStat.filter(a => a.type_of_assistance === assistanceType).length;
        }
        return count;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      // This allows the stats to load as soon as they are ready (concurrently)
    })),
  });

  const stats = useMemo(() => {
    return Object.keys(STAT_ENDPOINTS).reduce((acc, key, index) => {
      const query = statQueries[index];
      const config = STAT_ENDPOINTS[key];
      acc[key] = {
        ...config,
        value: query.data ?? 0,
        loading: query.isLoading,
        isError: query.isError,
      };
      return acc;
    }, {});
  }, [statQueries]);

  // --- 3. React Query: Mutations (CUD operations) ---

  const archiveMutation = useMutation({
    mutationFn: (id) => api.delete(`/applicants/${id}/`),
    onSuccess: () => {
      toast.custom(t => <CustomToast t={t} type="archive" />);
      closeArchiveModal();
      // Invalidate the table list query to refresh the data in the background
      queryClient.invalidateQueries({ queryKey: applicantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicantKeys.stats() });
    },
    onError: (err) => {
      console.error("Archive failed:", err);
      alert("Failed to archive applicant.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updatedApplicant }) => {
      // 1. First, update coordinates (as per original logic)
      const { data: coordData } = await api.post("/update_coordinates/", {
        id,
        background_info: {
          barangay: updatedApplicant.background_info.barangay,
          barangay_details: {
            city_name: updatedApplicant.background_info.barangay_details.city_name,
          },
        },
      });

      // 2. Then, perform the main PUT request
      const finalUpdate = {
        ...updatedApplicant,
        latitude: coordData.latitude,
        longitude: coordData.longitude,
      };
      await api.put(`/applicants/${id}/`, finalUpdate);
    },
    onSuccess: () => {
      closeEditView();
      toast.custom(t => <CustomToast t={t} type="success" title="Applicant Updated" />);
      // Invalidate the table list query to refresh the data in the background
      queryClient.invalidateQueries({ queryKey: applicantKeys.lists() });
    },
    onError: (err) => {
      console.error("Error saving applicant:", err);
      toast.custom(t => <CustomToast t={t} type="error" title="Update Failed" />);
    },
  });


  // --- Event Handlers (Mostly simplified) ---

  const handleArchive = () => {
    if (archiveModal.applicantId) {
      archiveMutation.mutate(archiveModal.applicantId);
    }
  };

  const handleSave = async e => {
    e.preventDefault();
    if (!editingApplicant || !editingApplicant.id) return;
    updateMutation.mutate({ id: editingApplicant.id, updatedApplicant: editingApplicant });
  };
  
  // Modals
  const openEditView = useCallback(applicant => {
    setEditingApplicant({
      ...applicant,
      valid_id_presented: applicant.valid_id_presented || "",
      other_valid_id: applicant.other_valid_id || "",
    });
    setEditView(true);
  }, []);

  const closeEditView = useCallback(() => {
    setEditingApplicant(null);
    setEditView(false);
  }, []);

  const openPreviewView = useCallback(applicant => {
    setPreviewApplicant({ ...applicant });
    setPreviewView(true);
  }, []);

  const closePreviewView = useCallback(() => {
    setPreviewApplicant(null);
    setPreviewView(false);
  }, []);

  const openArchiveModal = useCallback(id => {
    setArchiveModal({ show: true, applicantId: id });
  }, []);

  const closeArchiveModal = useCallback(() => {
    setArchiveModal({ show: false, applicantId: null });
  }, []);

  // Edit form change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Your existing handleChange logic here, ensures state updates for the modal
    setEditingApplicant((prev) => {
      const updated = { ...prev };
      // ... (your existing complex state update logic)
      if (name.startsWith("rep_bg_")) {
          updated.representative = {
            ...updated.representative,
            background_info: {
              ...updated.representative?.background_info,
              [name.replace("rep_bg_", "")]: value,
            },
          };
      } else if (name.startsWith("background_info.") || [
          "first_name",
          "middle_initial",
          "last_name",
          "suffix",
          "birth_date",
          "birth_place",
          "age",
          "sex",
          "civil_status",
          "street_address",
          "barangay",
          "municipality",
          "province",
        ].includes(name)) {
          updated.background_info = {
            ...updated.background_info,
            [name.replace("background_info.", "")]: value,
          };
      }
      // Representative relationship
      else if (name === "rep_relationship") {
          updated.representative = {
            ...updated.representative,
            relationship: value,
          };
      }
      // Assistance info
      else if (["type_of_assistance", "amount", "purpose"].includes(name)) {
          updated.assistance_info = {
            ...updated.assistance_info,
            [name]: value,
          };
      }
      return updated;
    });
  };

  // --- Filtering, Sorting, and Pagination Logic (Unchanged, operating on allApplicants) ---

  const handleSort = key => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = useCallback(data => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [sortConfig]);

  const filteredApplicants = useMemo(() => {
    return allApplicants.filter(a => {
      const keyword = searchTerm.toLowerCase();
      // Search logic (using background_info fields)
      return (
        (a.background_info?.first_name || "").toLowerCase().includes(keyword) ||
        (a.background_info?.last_name || "").toLowerCase().includes(keyword) ||
        (a.background_info?.barangay || "").toLowerCase().includes(keyword) ||
        (formatDate(a.date_filled) || "").toLowerCase().includes(keyword) ||
        (a.type_of_assistance || "").toLowerCase().includes(keyword)
      );
    });
  }, [allApplicants, searchTerm]);

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
  
  // Combined Loading Check
  const isAnyStatLoading = statQueries.some(q => q.isLoading);
  const isInitialLoading = isTableLoading || isAnyStatLoading;


  // --- Helper component for the Stat Cards (Adapted for React Query data) ---
  const StatCardContent = ({ stat }) => {
    const primaryColor = stat.color;
    const from = `${primaryColor}-500`;
    const to = `${primaryColor}-600`;
    const toDark = `${primaryColor}-800`;
    const fromDark = `${primaryColor}-700`;

    return (
      <div className="relative">
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-1">
          {stat.title}
        </p>
        
        {stat.loading ? (
          <div className="relative flex flex-col justify-between h-full">
            <div className={`text-4xl font-extrabold text-gray-300 animate-pulse h-10 w-1/3 rounded-md bg-gray-200`}>
            </div>
            <div className={`mt-4 h-1 w-full bg-${primaryColor}-100 rounded-full`}>
                <div className={`h-1 w-1/4 bg-gray-300 rounded-full animate-pulse`} ></div>
            </div>
          </div>
        ) : (
          <>
            <p className={`text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-${fromDark} to-${toDark}`}>
              {stat.value.toLocaleString()}
            </p>
            
            {stat.title !== "Total Applicants" && (
                <div className={`mt-4 h-1 w-full bg-${primaryColor}-100 rounded-full`}>
                    <div
                      className={`h-1 bg-gradient-to-r from-${from} to-${to} rounded-full`}
                      style={{ 
                        // Use stats.total.value for calculation if loaded, otherwise 0
                        width: `${stats.total.value > 0 ? (stat.value / stats.total.value) * 100 : 0}%` 
                      }}
                    ></div>
                </div>
            )}
          </>
        )}
      </div>
    );
  };
  // --- END StatCardContent ---


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background (Subtle Modern Touch) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-200"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-400"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10">
        <Toaster position="top-center" reverseOrder={false} />

        {/* Header Section (Modernized) */}
        <div className="mb-8 md:mb-10">
          <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-100 p-6 sm:p-8 mb-6">
            <ApplicantsHeader />
          </div>

          {/* Stats Cards - Now using React Query's `stats` object */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Object.keys(stats).map((key) => {
              const stat = stats[key];
              const borderColor = `${stat.color}-200`;
              const fromColor = `${stat.color}-500`;
              const toColor = `${
                stat.color === 'blue' ? 'indigo' :
                stat.color === 'amber' ? 'orange' :
                stat.color === 'emerald' ? 'green' :
                'purple'
              }-600`;
              
              return (
                <div 
                  key={key} 
                  className={`group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-${borderColor} p-5 sm:p-6 overflow-hidden hover:-translate-y-0.5`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-${fromColor} to-${toColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  <StatCardContent stat={stat} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Search and Export */}
        <div className="mb-6">
          <ApplicantActions
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            applicants={allApplicants} // Use the fully fetched data for export
            csvHeaders={csvHeaders}
          />
        </div>

        {/* Main Content: Loading or Table/Empty State */}
        {isInitialLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            {/* ... (Your existing loading spinner) ... */}
            <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl border border-blue-200 p-12 sm:p-16 text-center w-full max-w-lg">
              <div className="relative flex items-center justify-center mx-auto mb-6">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-[6px] border-blue-200 border-t-blue-600 animate-spin"></div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 mb-2">
                Loading Applicants...
              </h3>
              <p className="text-gray-500 text-sm sm:text-base max-w-sm mx-auto">
                Please wait while we fetch the latest applicant data.
              </p>
              <div className="flex gap-2 justify-center mt-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          </div>
        ) : allApplicants.length > 0 ? (
          <>
            {/* Applicant Table */}
            <ApplicantTable
              currentItems={currentItems}
              sortConfig={sortConfig}
              handleSort={handleSort}
              openPreviewView={openPreviewView}
              openEditView={openEditView}
              openArchiveModal={openArchiveModal}
              goPrintPage={navigate}
              formatDate={formatDate}
            />

            {/* Pagination & Load More */}
            {sortedApplicants.length > 0 && (
              <div className="mt-6">
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
                
                {/* Infinite Scroll/Load More Button */}
                {hasNextPage && (
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="mt-4 w-full flex justify-center items-center py-2 px-4 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isFetchingNextPage ? (
                      <span className="flex items-center">
                        Loading more...
                        <svg className="animate-spin ml-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    ) : (
                      "Load More Applicants"
                    )}
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          /* Empty State (Your existing empty state remains) */
          <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-20 sm:py-32 px-4 sm:px-6 text-center">
              <div className="mb-6 p-6 sm:p-10 bg-blue-50 rounded-full border-2 border-blue-200 shadow-inner">
                <span className="text-5xl sm:text-6xl text-blue-500 font-extrabold">0</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800">
                No Applicants Yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-md text-sm sm:text-base leading-relaxed">
                {searchTerm
                  ? "Your search returned no results. Try adjusting the keywords or filters."
                  : "Start adding your first applicant to begin managing your records."}
              </p>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors cursor-pointer">
                <span className="text-sm font-semibold text-white">Add New Applicant</span>
              </div>
            </div>
          </div>
        )}

        {/* Modals (Unchanged) */}
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
            isArchiving={archiveMutation.isPending} // Pass mutation state to modal
          />
        )}

        {editView && editingApplicant && (
          <EditModal
            editingApplicant={editingApplicant}
            closeEditView={closeEditView}
            handleChange={handleChange}
            handleSave={handleSave}
            setEditingApplicant={setEditingApplicant}
            isSaving={updateMutation.isPending} // Pass mutation state to modal
          />
        )}
      </div>
    </div>
  );
};

export default Applicants;