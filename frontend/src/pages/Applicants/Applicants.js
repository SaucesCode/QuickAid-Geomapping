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
import { Users } from "lucide-react";

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
  { label: "Occupation", key: "occupation" },
  { label: "Monthly Income", key: "monthly_income" },
  { label: "Valid ID", key: "valid_id_presented" },
  { label: "Assistance Type", key: "type_of_assistance" },
  { label: "Applicant Type", key: "applicant_type" },
  { label: "Date Filled", key: "date_filled" },
];

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editView, setEditView] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);
  const [previewView, setPreviewView] = useState(false);
  const [previewApplicant, setPreviewApplicant] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [archiveModal, setArchiveModal] = useState({ show: false, applicantId: null });
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    document.title = "Quickaid | Applicants";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);
  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await api.get("/applicants/");
      setApplicants(res.data);
    } catch (err) {
      console.error("Fetch applicants failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const openEditView = applicant => {
    console.log("Opening edit view for applicant:", applicant);
    console.log("Valid ID data:", {
      valid_id_presented: applicant.valid_id_presented,
      other_valid_id: applicant.other_valid_id,
    });

    const applicantCopy = {
      ...applicant,
      valid_id_presented: applicant.valid_id_presented || "",
      other_valid_id: applicant.other_valid_id || "",
    };

    console.log("Applicant copy for editing:", applicantCopy);
    setEditingApplicant(applicantCopy);
    setEditView(true);
  };

  const closeEditView = () => {
    setEditingApplicant(null);
    setEditView(false);
  };

  const goPrintPage = applicant => {
    navigate(`/print/${applicant.id}`);
  };

  const openPreviewView = applicant => {
    setPreviewApplicant({ ...applicant });
    setPreviewView(true);
  };

  const closePreviewView = () => {
    setPreviewApplicant(null);
    setPreviewView(false);
  };

  const openArchiveModal = applicant_id => {
    setArchiveModal({ show: true, applicantId: applicant_id });
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
    console.log("Handling change:", { name, value, currentState: editingApplicant });

    if (name === "valid_id_presented" || name === "other_valid_id") {
      setEditingApplicant(prev => {
        const newState = {
          ...prev,
          [name]: value,
        };
        console.log("New state after valid ID change:", newState);
        return newState;
      });
    } else if (
      [
        "first_name",
        "middle_initial",
        "last_name",
        "suffix",
        "sex",
        "civil_status",
        "street_address",
      ].includes(name)
    ) {
      setEditingApplicant(prev => ({
        ...prev,
        background_info: {
          ...prev.background_info,
          [name]: value,
        },
      }));
    } else if (name.startsWith("rep_")) {
      const repField = name.replace("rep_", "");
      setEditingApplicant(prev => ({
        ...prev,
        representative: {
          ...prev.representative,
          [repField]: value,
        },
      }));
    } else if (name.startsWith("rep_bg_")) {
      const repBgField = name.replace("rep_bg_", "");
      setEditingApplicant(prev => ({
        ...prev,
        representative: {
          ...prev.representative,
          background_info: {
            ...prev.representative?.background_info,
            [repBgField]: value,
          },
        },
      }));
    } else {
      setEditingApplicant(prev => ({
        ...prev,
        [name]: value,
      }));
    }
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

      const cleanApplicant = JSON.parse(JSON.stringify(updatedApplicant));
      await api.put(`/applicants/${editingApplicant.id}/`, cleanApplicant);
      fetchApplicants();
      closeEditView();
    } catch (err) {
      console.error("Error saving applicant:", err);
      if (err.response) {
        console.error("Error response:", err.response);
      }
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

      if (sortConfig.key.includes(".")) {
        const keys = sortConfig.key.split(".");
        aValue = keys.reduce((obj, key) => obj?.[key], a);
        bValue = keys.reduce((obj, key) => obj?.[key], b);
      }

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-center" reverseOrder={false} />
      <ApplicantsHeader />
      <ApplicantActions
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        applicants={applicants}
        csvHeaders={csvHeaders}
      />
      {loading ? (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="bg-white rounded-xl shadow-md p-10 text-center border border-gray-100">
      <div className="relative flex items-center justify-center mx-auto mb-4">
        {/* Spinner */}
        <div className="h-14 w-14 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"></div>
        {/* Icon inside spinner */}
        <Users className="absolute h-6 w-6 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">
        Loading Applicants
      </h3>
      <p className="text-gray-500 text-sm mt-1">
        Please wait while we fetch the latest applicant data...
      </p>
    </div>
  </div>
) : (

        <>
          <ApplicantTable
            currentItems={currentItems}
            sortConfig={sortConfig}
            handleSort={handleSort}
            openPreviewView={openPreviewView}
            openEditView={openEditView}
            openArchiveModal={openArchiveModal}
            goPrintPage={goPrintPage}
            formatDate={formatDate}
          />
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
      )}

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
  );
};

export default Applicants;
