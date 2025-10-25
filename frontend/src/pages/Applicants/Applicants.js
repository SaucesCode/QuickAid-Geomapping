import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/FormatDate";
import ApplicantsHeader from "./components/ApplicantsHeader";
import ApplicantTable from "./components/ApplicantTable";
import Pagination from "../../components/Pagination";
import PreviewModal from "./components/PreviewModal";
import EditModal from "./components/EditModal";
import ArchiveModal from "./components/ArchiveModal";
import toast, { Toaster } from "react-hot-toast";
import CustomToast from "../../components/CustomToast";

const Applicants = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [editView, setEditView] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);
  const [previewView, setPreviewView] = useState(false);
  const [previewApplicant, setPreviewApplicant] = useState(null);
  const [archiveModal, setArchiveModal] = useState({ show: false, applicantId: null });

  useEffect(() => {
    document.title = "QuickAid | Applicants";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  const fetchApplicants = async () => {
    const res = await api.get("/applicants/");
    return res.data.results || [];
  };

  const {
    data: applicants = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["applicants"],
    queryFn: fetchApplicants,
    staleTime: 1000 * 60 * 5,
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setEditingApplicant(prev => {
      const updated = { ...prev };
      if (name.startsWith("background_info.")) {
        updated.background_info = {
          ...updated.background_info,
          [name.replace("background_info.", "")]: value,
        };
      } else if (name === "rep_relationship") {
        updated.representative = { ...updated.representative, relationship: value };
      } else if (["type_of_assistance", "amount", "purpose"].includes(name)) {
        updated.assistance_info = { ...updated.assistance_info, [name]: value };
      }
      return updated;
    });
  };

  const handleSave = async e => {
    e.preventDefault();
    if (!editingApplicant?.id) return;

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
      toast.success("Applicant updated successfully");
      refetch();
      setEditView(false);
    } catch (err) {
      console.error("Error saving applicant:", err);
      toast.error("Failed to update applicant");
    }
  };

  const handleArchive = async () => {
    if (!archiveModal.applicantId) return;
    try {
      await api.delete(`/applicants/${archiveModal.applicantId}/`);
      toast.custom(t => <CustomToast t={t} type="archive" />);
      refetch();
      setArchiveModal({ show: false, applicantId: null });
    } catch (err) {
      console.error("Archive failed:", err);
      toast.error("Failed to archive applicant");
    }
  };

  const handleSort = key => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === "ascending" ? "descending" : "ascending",
    }));
  };

  const filteredApplicants = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return applicants.filter(a => {
      const info = a.background_info || {};
      return (
        (info.first_name || "").toLowerCase().includes(term) ||
        (info.last_name || "").toLowerCase().includes(term) ||
        (info.barangay || "").toLowerCase().includes(term) ||
        (a.type_of_assistance || "").toLowerCase().includes(term) ||
        (formatDate(a.date_filled) || "").toLowerCase().includes(term)
      );
    });
  }, [applicants, searchTerm]);

  const sortedApplicants = useMemo(() => {
    if (!sortConfig.key) return filteredApplicants;
    return [...filteredApplicants].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [filteredApplicants, sortConfig]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedApplicants.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="relative z-10 p-4 sm:p-6 md:p-10">
        <div className="mb-8 md:mb-10">
          <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-100 p-6 sm:p-8 mb-6">
            <ApplicantsHeader />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-10 text-center">
              <p className="text-blue-600 font-semibold">Loading applicants...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="text-center text-red-500">Failed to load applicants.</div>
        ) : filteredApplicants.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-10 text-center">
            <h3 className="text-xl font-bold text-blue-700 mb-2">No Applicants Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Try adjusting your search filters."
                : "Start adding your first applicant."}
            </p>
            <button
              onClick={() => navigate("/new-applicant")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add Applicant
            </button>
          </div>
        ) : (
          <>
            <ApplicantTable
              currentItems={currentItems}
              sortConfig={sortConfig}
              handleSort={handleSort}
              openPreviewView={applicant => {
                setPreviewApplicant(applicant);
                setPreviewView(true);
              }}
              openEditView={applicant => {
                setEditingApplicant(applicant);
                setEditView(true);
              }}
              openArchiveModal={id => setArchiveModal({ show: true, applicantId: id })}
              goPrintPage={navigate}
              formatDate={formatDate}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              handleItemsPerPageChange={e => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              totalItems={sortedApplicants.length}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
            />
          </>
        )}

        {previewView && previewApplicant && (
          <PreviewModal
            previewApplicant={previewApplicant}
            closePreviewView={() => setPreviewView(false)}
            formatDate={formatDate}
          />
        )}
        {archiveModal.show && (
          <ArchiveModal
            archiveModal={archiveModal}
            closeArchiveModal={() => setArchiveModal({ show: false, applicantId: null })}
            handleArchive={handleArchive}
          />
        )}
        {editView && editingApplicant && (
          <EditModal
            editingApplicant={editingApplicant}
            closeEditView={() => setEditView(false)}
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
