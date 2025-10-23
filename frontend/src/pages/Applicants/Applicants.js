import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
    FileText,
    CheckCircle2,
    TrendingUp,
    Activity,
    GraduationCap,
    Stethoscope,
    Plus,
    Heart,
    Sparkles,
    Loader2,
} from "lucide-react";

// 1. Import React Query Hooks
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";

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
    { label: "Monthly Income", key: "monthly_income" },
    { label: "Valid ID", key: "valid_id_presented" },
    { label: "Assistance Type", key: "type_of_assistance" },
    { label: "Applicant Type", key: "applicant_type" },
    { label: "Date Filled", key: "date_filled" },
];

// Define a placeholder for the stats data structure
const initialStats = {
  total: { value: 0, loading: true, color: "blue", icon: Users, title: "Total Applicants" },
  medical: {
    value: 0,
    loading: true,
    color: "amber",
    icon: Stethoscope,
    title: "Medical Assistance",
  },
  educational: {
    value: 0,
    loading: true,
    color: "emerald",
    icon: GraduationCap,
    title: "Educational Assistance",
  },
  burial: {
    value: 0,
    loading: true,
    color: "violet",
    icon: Heart,
    title: "Burial Assistance",
  },
};

// --- API Fetchers for React Query ---

// Fetches the initial page and is used by useInfiniteQuery
const fetchApplicantsPage = async ({ pageParam = "/applicants/?limit=50" }) => {
    const res = await api.get(pageParam);
    return res.data;
};

// Fetches all applicants for stats calculation (mimics original concurrent logic)
const fetchAllApplicantsForStats = async () => {
    const res = await api.get("/applicants/?limit=1000"); // Fetch a large number to ensure all are counted
    return res.data.results || res.data || [];
};


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

  // New state for concurrent stats loading
  const [stats, setStats] = useState(initialStats);
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
      const res = await api.get(url);
      const data = res.data;

      if (data.results) {
        setApplicants(prev => [...prev, ...data.results]);
        setNextUrl(data.next);
      } else if (Array.isArray(data)) {
        setApplicants(prev => [...prev, ...data]);
        setNextUrl(null);
      }
    } catch (err) {
      console.error("Fetch applicants failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW CONCURRENT STATS FETCHING LOGIC ---

  const fetchStat = useCallback(async (key, apiPath, minDelay = 200, maxDelay = 1000) => {
    try {
      // 1. Simulate varying network delay
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      await new Promise(resolve => setTimeout(resolve, delay));

      // 2. Fetch data (Simulated call by fetching all and calculating locally)
      // In a real app, this would be a quick call to a dedicated count endpoint.
      const res = await api.get("/applicants/");
      const allApplicants = res.data.results || [];

      let count = 0;
      if (key === "total") {
        count = allApplicants.length;
      } else {
        const assistanceType = stats[key].title.split(" ")[0]; // Medical, Educational, Burial
        count = allApplicants.filter(a => a.type_of_assistance === assistanceType).length;
      }

      // 3. Update the state immediately after the promise resolves
      setStats(prev => ({
        ...prev,
        [key]: { ...prev[key], value: count, loading: false },
      }));

      return { key, count };
    } catch (err) {
      console.error(`Fetch for ${key} failed:`, err);
      setStats(prev => ({
        ...prev,
        [key]: { ...prev[key], loading: false, value: "Error" },
      }));
    }
  }, []);

  const fetchAllStatsConcurrently = useCallback(() => {
    // Reset all stats to loading
    setStats(initialStats);

    // Define all promises to run concurrently
    const totalPromise = fetchStat("total", "/applicants/count/total");
    const medicalPromise = fetchStat("medical", "/applicants/count/medical");
    const educationalPromise = fetchStat("educational", "/applicants/count/educational");
    const burialPromise = fetchStat("burial", "/applicants/count/burial");

    // Wait for all promises to settle, allowing the setStats inside fetchStat
    // to update the UI in the order they resolve (fastest first).
    Promise.allSettled([totalPromise, medicalPromise, educationalPromise, burialPromise]);
  }, [fetchStat]);

  // --- END NEW CONCURRENT STATS FETCHING LOGIC ---

  useEffect(() => {
    fetchApplicants(); // For the table data
    fetchAllStatsConcurrently(); // For the top stats cards
  }, [fetchAllStatsConcurrently]);

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
      // Remove the item locally:
      setApplicants(prev => prev.filter(a => a.id !== archiveModal.applicantId));
      closeArchiveModal();
    } catch (err) {
      console.error("Archive failed:", err);
      alert("Failed to archive applicant.");
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;

    setEditingApplicant(prev => {
      const updated = { ...prev };

      // Handle background info
      if (name.startsWith("rep_bg_")) {
        updated.representative = {
          ...updated.representative,
          background_info: {
            ...updated.representative?.background_info,
            [name.replace("rep_bg_", "")]: value,
          },
        };
      } else if (
        name.startsWith("background_info.") ||
        [
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
        ].includes(name)
      ) {
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
    }, []);


    // --- React Query Implementation for Applicants Table (Replacing fetchApplicants) ---
    // Use useInfiniteQuery to simulate the original component's append/pagination logic
    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingApplicants,
        // isError,
    } = useInfiniteQuery({
        queryKey: ["applicants"],
        queryFn: fetchApplicantsPage,
        initialPageParam: "/applicants/?limit=50",
        getNextPageParam: (lastPage) => lastPage.next || undefined,
        // Refetch interval is 0 for simplicity, use a higher value in production
    });

  const handleSave = async e => {
    e.preventDefault();
    if (!editingApplicant || !editingApplicant.id) return;

    // 5. Replace original concurrent stat fetching logic with a derived effect
    useEffect(() => {
        if (!isLoadingStats && allApplicantsForStats.length > 0) {
            const allApplicants = allApplicantsForStats;

            // This logic runs once the 'applicantsAll' query is successfully loaded
            const calculateAndSetStats = () => {
                const results = {
                    total: allApplicants.length,
                    medical: allApplicants.filter(a => 
                        a.type_of_assistance?.toLowerCase() === 'medical' ||
                        a.assistance_info?.type_of_assistance?.toLowerCase() === 'medical'
                    ).length,
                    educational: allApplicants.filter(a => 
                        a.type_of_assistance?.toLowerCase() === 'educational' ||
                        a.assistance_info?.type_of_assistance?.toLowerCase() === 'educational'
                    ).length,
                    burial: allApplicants.filter(a => 
                        a.type_of_assistance?.toLowerCase() === 'burial' ||
                        a.assistance_info?.type_of_assistance?.toLowerCase() === 'burial'
                    ).length,
                };

                // Update the stats state based on calculated values
                setStats(prev => ({
                    ...prev,
                    total: { ...prev.total, value: results.total, loading: false },
                    medical: { ...prev.medical, value: results.medical, loading: false },
                    educational: { ...prev.educational, value: results.educational, loading: false },
                    burial: { ...prev.burial, value: results.burial, loading: false },
                }));
            };

            // Mimic the immediate start/reset and subsequent update
            setStats(initialStats);
            calculateAndSetStats();
        } else if (!isLoadingStats && allApplicantsForStats.length === 0) {
             // Handle case where fetch is complete but no data
             setStats(prev => Object.fromEntries(
                 Object.entries(prev).map(([key, stat]) => [key, { ...stat, value: 0, loading: false }])
             ));
        }
    }, [isLoadingStats, allApplicantsForStats]);


    // --- Mutation Logic for Archive (Replacing handleArchive) ---
    const archiveApplicantMutation = useMutation({
        mutationFn: (applicantId) => api.delete(`/applicants/${applicantId}/`),
        onMutate: async (applicantId) => {
            await queryClient.cancelQueries({ queryKey: ["applicants"] });
            await queryClient.cancelQueries({ queryKey: ["applicantsAll"] });
            
            // Optimistic update for the infinite list
            const previousApplicantsData = queryClient.getQueryData(["applicants"]);
            queryClient.setQueryData(["applicants"], (old) => ({
                ...old,
                pages: old.pages.map(page => ({
                    ...page,
                    results: (page.results || page).filter(a => a.id !== applicantId),
                }))
            }));

            closeArchiveModal();
            return { previousApplicantsData };
        },
        onSuccess: () => {
            toast.custom(t => <CustomToast t={t} type="archive" />);
        },
        onError: (err, applicantId, context) => {
            queryClient.setQueryData(["applicants"], context.previousApplicantsData); // Rollback
            console.error("Archive failed:", err);
            alert("Failed to archive applicant.");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["applicants"] });
            queryClient.invalidateQueries({ queryKey: ["applicantsAll"] });
        },
    });

    const handleArchive = () => {
        if (!archiveModal.applicantId) return;
        archiveApplicantMutation.mutate(archiveModal.applicantId);
    };


    // --- Mutation Logic for Edit/Save (Replacing handleSave) ---
    const updateApplicantMutation = useMutation({
        mutationFn: async (editingApplicant) => {
            // Original coordinate update logic
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
            return updatedApplicant;
        },
        onSuccess: () => {
            // Re-fetch the table data and stats
            queryClient.invalidateQueries({ queryKey: ["applicants"] });
            queryClient.invalidateQueries({ queryKey: ["applicantsAll"] });
            closeEditView();
            toast.custom(t => <CustomToast t={t} type="success" message="Applicant successfully updated!" />);
        },
        onError: (err) => {
            console.error("Error saving applicant:", err);
            toast.custom(t => <CustomToast t={t} type="error" message="Failed to update applicant." />);
        }
    });

    const handleSave = e => {
        e.preventDefault();
        if (!editingApplicant || !editingApplicant.id) return;
        updateApplicantMutation.mutate(editingApplicant);
    };


    // --- Other Logic (Kept Unchanged) ---
    const openEditView = applicant => {
        setEditingApplicant({
            ...applicant,
            valid_id_presented: applicant.valid_id_presented || "",
            other_valid_id: applicant.other_valid_id || "",
        });
        setEditView(true);
    };

    // The Title/Name is rendered unconditionally
    return (
      <div className="relative">
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-1">
          {stat.title}
        </p>

        {stat.loading ? (
          // Renders the loading state (skeleton for value and progress bar)
          <div className="relative flex flex-col justify-between h-full">
            {/* Skeleton for the numeric value */}
            <div
              className={`text-4xl font-extrabold text-gray-300 animate-pulse h-10 w-1/3 rounded-md bg-gray-200`}
            ></div>
            {/* Skeleton for the progress bar */}
            <div className={`mt-4 h-1 w-full bg-${primaryColor}-100 rounded-full`}>
              <div className={`h-1 w-1/4 bg-gray-300 rounded-full animate-pulse`}></div>
            </div>
          </div>
        ) : (
          // Renders the loaded state (value and actual progress bar)
          <>
            <p
              className={`text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-${fromDark} to-${toDark}`}
            >
              {stat.value.toLocaleString()}
            </p>

            {/* Render progress bar only for assistance types */}
            {stat.title !== "Total Applicants" && (
              <div className={`mt-4 h-1 w-full bg-${primaryColor}-100 rounded-full`}>
                <div
                  className={`h-1 bg-gradient-to-r from-${from} to-${to} rounded-full`}
                  style={{
                    // Use stats.total.value for calculation if loaded, otherwise 0
                    width: `${
                      stats.total.value > 0 ? (stat.value / stats.total.value) * 100 : 0
                    }%`,
                  }}
                ></div>
              </div>
            )}
            {/* NOTE: Total Applicants card does not need a progress bar, so no else block is needed */}
          </>
        )}
      </div>
    );
  };

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

          {/* Stats Cards - Now uses the new state and helper component */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Applicants */}
            <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200 p-5 sm:p-6 overflow-hidden hover:-translate-y-0.5">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <StatCardContent stat={stats.total} />
            </div>

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

    const handleChange = (e) => {
        const { name, value } = e.target;

        setEditingApplicant((prev) => {
            const updated = { ...prev };

            // Handle background info
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

    // Helper component for the Stat Cards
    const StatCardContent = ({ stat }) => {
        const primaryColor = stat.color;
        const from = `${primaryColor}-500`;
        const to = `${primaryColor}-600`;
        const toDark = `${primaryColor}-800`;
        const fromDark = `${primaryColor}-700`;

        // The Title/Name is rendered unconditionally
        return (
            <div className="relative">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-1">
                    {stat.title}
                </p>

                {stat.loading || isLoadingStats ? (
                    // Renders the loading state (skeleton for value and progress bar)
                    <div className="relative flex flex-col justify-between h-full">
                        {/* Skeleton for the numeric value */}
                        <div className={`text-4xl font-extrabold text-gray-300 animate-pulse h-10 w-1/3 rounded-md bg-gray-200`}>
                        </div>
                        {/* Skeleton for the progress bar */}
                        <div className={`mt-4 h-1 w-full bg-${primaryColor}-100 rounded-full`}>
                            <div className={`h-1 w-1/4 bg-gray-300 rounded-full animate-pulse`} ></div>
                        </div>
                    </div>
                ) : (
                    // Renders the loaded state (value and actual progress bar)
                    <>
                        <p className={`text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-${fromDark} to-${toDark}`}>
                            {stat.value.toLocaleString()}
                        </p>

                        {/* Render progress bar only for assistance types */}
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
                        {/* NOTE: Total Applicants card does not need a progress bar, so no else block is needed */}
                    </>
                )}
            </div>
        );
    };


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

                    {/* Stats Cards - Uses the updated stats state (derived from useQuery) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {/* Total Applicants */}
                        <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200 p-5 sm:p-6 overflow-hidden hover:-translate-y-0.5">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                            <StatCardContent stat={stats.total} />
                        </div>

                        {/* Medical */}
                        <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-200 p-5 sm:p-6 overflow-hidden hover:-translate-y-0.5">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                            <StatCardContent stat={stats.medical} />
                        </div>

                        {/* Educational */}
                        <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-200 p-5 sm:p-6 overflow-hidden hover:-translate-y-0.5">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                            <StatCardContent stat={stats.educational} />
                        </div>

                        {/* Burial */}
                        <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-violet-200 p-5 sm:p-6 overflow-hidden hover:-translate-y-0.5">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                            <StatCardContent stat={stats.burial} />
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

                {/* Loading Spinner - Uses React Query's loading state */}
                {loading && applicants.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
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
                ) : applicants.length > 0 ? (
                    <>
                        {/* Applicant Table (Assumes ApplicantTable uses a modern design) */}
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

                        {/* Pagination (and Load More button if applicable) */}
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
                                {hasNextPage && (
                                    <div className="text-center mt-4">
                                        <button 
                                            onClick={handleScroll}
                                            disabled={isFetchingNextPage}
                                            className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isFetchingNextPage ? 'Loading More...' : 'Load More Applicants'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    /* Empty State */
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

                {/* Modals (Logic Unchanged) */}
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
