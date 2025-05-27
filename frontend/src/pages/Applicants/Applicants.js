// File: frontend/src/pages/Applicants.js
import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { CSVLink } from "react-csv";
import AddressDropdown from "../../forms/AddressDropdown";
import "./Applicants.css";
import { useNavigate } from "react-router-dom";

// Add this constant after your imports in Applicants.js

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
    console.log(applicants);
  }, []);

  const openEditView = applicant => {
    setEditingApplicant({ ...applicant });
    setEditView(true);
    document.body.classList.add("dialog-open");
  };

  const closeEditView = () => {
    setEditingApplicant(null);
    setEditView(false);
    document.body.classList.remove("dialog-open");
  };

  const goPrintPage = applicant => {
    navigate(`/print/${applicant.id}`);
  };

  const openPreviewView = applicant => {
    setPreviewApplicant({ ...applicant });
    setPreviewView(true);
    document.body.classList.add("dialog-open");
  };

  const closePreviewView = () => {
    setPreviewApplicant(null);
    setPreviewView(false);
    document.body.classList.remove("dialog-open");
  };

  const openArchiveModal = applicant_id => {
    setArchiveModal({ show: true, applicantId: applicant_id });
    document.body.classList.add("dialog-open");
  };

  const closeArchiveModal = () => {
    setArchiveModal({ show: false, applicantId: null });
    document.body.classList.remove("dialog-open");
  };

  const handleArchive = async () => {
    if (!archiveModal.applicantId) return;

    try {
      await api.delete(`/applicants/${archiveModal.applicantId}/`);
      fetchApplicants();
      closeArchiveModal();
    } catch (err) {
      console.error("Archive failed:", err);
      alert("Failed to archive applicant.");
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;

    if (
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
      setEditingApplicant(prev => ({ ...prev, [name]: value }));
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

  const formatPreviewDate = dateStr => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-PH", options);
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

      // Handle nested objects
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
      (formatPreviewDate(a.date_filled) || "").toLowerCase().includes(keyword) ||
      (a.type_of_assistance || "").toLowerCase().includes(keyword)
    );
  });

  const sortedApplicants = getSortedData(filteredApplicants);

  // Add pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedApplicants.length / itemsPerPage);

  const handlePageChange = pageNumber => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = e => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="applicants-container">
      <h1>📋 Applicants</h1>

      <div className="actions">
        <input
          type="text"
          placeholder="🔍 Search applicants..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <CSVLink
          data={applicants}
          headers={csvHeaders}
          filename="applicants.csv"
          className="btn"
        >
          Export CSV
        </CSVLink>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading applicants...</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="applicants-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("background_info.first_name")}>
                    Name{" "}
                    {sortConfig.key === "background_info.first_name" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("background_info.barangay")}>
                    Barangay{" "}
                    {sortConfig.key === "background_info.barangay" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("background_info.barangay_details.city_name")}>
                    City/Municipality{" "}
                    {sortConfig.key === "background_info.barangay_details.city_name" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("type_of_assistance")}>
                    Assistance{" "}
                    {sortConfig.key === "type_of_assistance" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("date_filled")}>
                    Date Filled{" "}
                    {sortConfig.key === "date_filled" &&
                      (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((applicant, id) => (
                    <tr key={id}>
                      <td className="link-button" onClick={() => openPreviewView(applicant)}>
                        {`${applicant.background_info?.first_name || ""} ${
                          applicant.background_info?.last_name || ""
                        }`}
                      </td>
                      <td>{applicant.background_info?.barangay}</td>
                      <td>{applicant.background_info?.barangay_details?.city_name}</td>
                      <td>{applicant.type_of_assistance}</td>
                      <td>{formatPreviewDate(applicant.date_filled)}</td>
                      <td>
                        <button onClick={() => openEditView(applicant)}>Edit</button>
                        <button onClick={() => openArchiveModal(applicant.id)}>Archive</button>
                        <button onClick={() => goPrintPage(applicant)}>Print</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      <div className="empty-state">
                        <p>No applicants found</p>
                        <small>Try adjusting your search or filters</small>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="pagination-controls">
            <div className="pagination-info">
              <span>
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, sortedApplicants.length)} of{" "}
                {sortedApplicants.length} entries
              </span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="items-per-page"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current page
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((page, index, array) => {
                  // Add ellipsis if there are gaps
                  if (index > 0 && page - array[index - 1] > 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <span className="pagination-ellipsis">...</span>
                        <button
                          className={`pagination-btn ${currentPage === page ? "active" : ""}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  }
                  return (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? "active" : ""}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                })}
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Preview Dialog */}
      {previewView && (
        <div className="dialog-backdrop">
          <div className="dialog preview-dialog">
            <div className="dialog-header">
              <h2>Applicant Details</h2>
            </div>
            <div className="dialog-content">
              {previewApplicant && (
                <div className="applicant-details">
                  <div className="detail-group">
                    <h3>Personal Information</h3>
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-label">Full Name</span>
                        <span className="detail-value">
                          {previewApplicant.background_info?.first_name || ""}{" "}
                          {previewApplicant.background_info?.middle_initial || ""}{" "}
                          {previewApplicant.background_info?.last_name || ""}{" "}
                          {previewApplicant.background_info?.suffix || ""}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Sex</span>
                        <span className="detail-value">
                          {previewApplicant.background_info?.sex || ""}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Birthday</span>
                        <span className="detail-value">
                          {formatPreviewDate(previewApplicant.background_info?.birthday)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Civil Status</span>
                        <span className="detail-value">
                          {previewApplicant.background_info?.civil_status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Occupation</span>
                        <span className="detail-value">
                          {previewApplicant.background_info?.occupation || "Not specified"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Monthly Income</span>
                        <span className="detail-value">
                          {previewApplicant.background_info?.monthly_income
                            ? `₱${parseFloat(
                                previewApplicant.background_info.monthly_income
                              ).toLocaleString()}`
                            : "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-group">
                    <h3>Contact Information</h3>
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-label">Street Address</span>
                        <span className="detail-value">
                          {previewApplicant.background_info?.street_address}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Barangay</span>
                        <span className="detail-value">
                          {previewApplicant.background_info?.barangay}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">City/Municipality</span>
                        <span className="detail-value">
                          {previewApplicant.background_info?.barangay_details?.city_name}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Province</span>
                        <span className="detail-value">
                          {previewApplicant.background_info?.barangay_details?.province_name}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Contact Number</span>
                        <span className="detail-value">{previewApplicant.contact_number}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-group">
                    <h3>Assistance Details</h3>
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-label">Assistance Type</span>
                        <span className="detail-value">
                          {previewApplicant.type_of_assistance}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Applicant Type</span>
                        <span className="detail-value">{previewApplicant.applicant_type}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Date Filled</span>
                        <span className="detail-value">
                          {formatPreviewDate(previewApplicant.date_filled)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Valid ID Presented</span>
                        <span className="detail-value">
                          {previewApplicant.valid_id_presented}
                          {previewApplicant.other_valid_id &&
                            ` (${previewApplicant.other_valid_id})`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {previewApplicant.representative && (
                    <div className="detail-group">
                      <h3>Representative Information</h3>
                      <div className="detail-row">
                        <div className="detail-item">
                          <span className="detail-label">Full Name</span>
                          <span className="detail-value">
                            {previewApplicant.representative.background_info?.first_name || ""}{" "}
                            {previewApplicant.representative.background_info?.middle_initial ||
                              ""}{" "}
                            {previewApplicant.representative.background_info?.last_name || ""}{" "}
                            {previewApplicant.representative.background_info?.suffix || ""}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Relationship</span>
                          <span className="detail-value">
                            {previewApplicant.representative.relationship}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Address</span>
                          <span className="detail-value">
                            {previewApplicant.representative.background_info?.street_address},{" "}
                            {previewApplicant.representative.background_info?.barangay},{" "}
                            {
                              previewApplicant.representative.background_info?.barangay_details
                                ?.city_name
                            }
                            ,{" "}
                            {
                              previewApplicant.representative.background_info?.barangay_details
                                ?.province_name
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="dialog-footer">
              <button className="btn secondary-btn" onClick={closePreviewView}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {archiveModal.show && (
        <div className="dialog-backdrop">
          <div className="dialog confirm-dialog">
            <div className="dialog-header">
              <h2>Confirm Archive</h2>
            </div>
            <div className="dialog-content">
              <p>
                Are you sure you want to archive this applicant? This action cannot be undone.
              </p>
            </div>
            <div className="dialog-footer">
              <button className="btn error-btn" onClick={handleArchive}>
                Archive
              </button>
              <button className="btn secondary-btn" onClick={closeArchiveModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editView && (
        <div className="dialog-backdrop">
          <div className="dialog edit-dialog">
            {editingApplicant && (
              <>
                <div className="dialog-header">
                  <h2>Edit Applicant</h2>
                  <button className="close-btn" onClick={closeEditView}>
                    ×
                  </button>
                </div>
                <div className="dialog-content">
                  <form id="edit-applicant-form" onSubmit={handleSave}>
                    <div className="form-section">
                      <h3>Personal Information</h3>
                      <div className="form-row">
                        <div className="form-field">
                          <label htmlFor="first_name">First Name</label>
                          <input
                            id="first_name"
                            name="first_name"
                            placeholder="First Name"
                            value={editingApplicant.background_info?.first_name || ""}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label htmlFor="middle_initial">Middle Initial</label>
                          <input
                            id="middle_initial"
                            name="middle_initial"
                            placeholder="Middle Initial"
                            value={editingApplicant.background_info?.middle_initial || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-field">
                          <label htmlFor="last_name">Last Name</label>
                          <input
                            id="last_name"
                            name="last_name"
                            placeholder="Last Name"
                            value={editingApplicant.background_info?.last_name || ""}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label htmlFor="suffix">Suffix</label>
                          <select
                            id="suffix"
                            name="suffix"
                            value={editingApplicant.background_info?.suffix || ""}
                            onChange={handleChange}
                          >
                            <option value="">None</option>
                            <option value="Jr.">Jr.</option>
                            <option value="Sr.">Sr.</option>
                            <option value="I">I</option>
                            <option value="II">II</option>
                            <option value="III">III</option>
                            <option value="IV">IV</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-field">
                          <label htmlFor="sex">Sex</label>
                          <select
                            id="sex"
                            name="sex"
                            value={editingApplicant.background_info?.sex || ""}
                            onChange={handleChange}
                          >
                            <option value="">Select Sex</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                        <div className="form-field">
                          <label htmlFor="civil_status">Civil Status</label>
                          <select
                            id="civil_status"
                            name="civil_status"
                            value={editingApplicant.background_info?.civil_status || ""}
                            onChange={handleChange}
                          >
                            <option value="">Select Civil Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Widowed">Widowed</option>
                            <option value="Separated">Separated</option>
                            <option value="Divorced">Divorced</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="form-section">
                      <h3>Contact Information</h3>
                      <div className="form-row">
                        <div className="form-field">
                          <label htmlFor="contact_number">Contact Number</label>
                          <input
                            id="contact_number"
                            type="tel"
                            name="contact_number"
                            value={editingApplicant.contact_number || ""}
                            onChange={handleChange}
                            required
                            placeholder="e.g. 09123456789"
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-field">
                          <label htmlFor="street_address">Street Address</label>
                          <input
                            id="street_address"
                            type="text"
                            name="street_address"
                            value={editingApplicant.background_info?.street_address || ""}
                            onChange={handleChange}
                            required
                            placeholder="Enter your Street Address"
                          />
                        </div>
                      </div>

                      <div className="form-field address-dropdown-container">
                        <AddressDropdown
                          onSelect={(field, value) => {
                            if (field === "city_municipality") {
                              setEditingApplicant(prev => ({
                                ...prev,
                                background_info: {
                                  ...prev.background_info,
                                  barangay_details: {
                                    ...prev.background_info.barangay_details,
                                    city_name: value,
                                  },
                                },
                              }));
                            } else if (field === "barangay") {
                              setEditingApplicant(prev => ({
                                ...prev,
                                background_info: {
                                  ...prev.background_info,
                                  barangay: value,
                                },
                              }));
                            }
                          }}
                          initialValues={{
                            barangay:
                              editingApplicant.background_info?.barangay_details?.psgc_code ||
                              editingApplicant.background_info?.barangay,
                            city_municipality:
                              editingApplicant.background_info?.barangay_details?.city_name,
                          }}
                        />
                      </div>
                    </div>
                    <div className="form-section">
                      <h3>Assistance Information</h3>
                      <div className="form-row">
                        <div className="form-field">
                          <label htmlFor="type_of_assistance">Type of Assistance</label>
                          <select
                            id="type_of_assistance"
                            name="type_of_assistance"
                            value={editingApplicant.type_of_assistance || ""}
                            onChange={handleChange}
                          >
                            <option value="">Select Type of Assistance</option>
                            <option value="Medical">Medical</option>
                            <option value="Burial">Burial</option>
                            <option value="Educational">Educational</option>
                          </select>
                        </div>
                        <div className="form-field">
                          <label htmlFor="valid_id_presented">Valid ID Presented</label>
                          <select
                            id="valid_id_presented"
                            name="valid_id_presented"
                            value={editingApplicant.valid_id_presented || ""}
                            onChange={handleChange}
                          >
                            <option value="">Select Valid ID</option>
                            <option value="Passport">Passport</option>
                            <option value="Driver's License">Driver's License</option>
                            <option value="SSS ID">SSS ID</option>
                            <option value="GSIS ID">GSIS ID</option>
                            <option value="UMID">UMID</option>
                            <option value="PhilHealth ID">PhilHealth ID</option>
                            <option value="TIN ID">TIN ID</option>
                            <option value="Postal ID">Postal ID</option>
                            <option value="Voter's ID">Voter's ID</option>
                            <option value="Senior Citizen ID">Senior Citizen ID</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      {editingApplicant.valid_id_presented === "Other" && (
                        <div className="form-row">
                          <div className="form-field">
                            <label htmlFor="other_valid_id">Specify Other ID</label>
                            <input
                              id="other_valid_id"
                              name="other_valid_id"
                              value={editingApplicant.other_valid_id || ""}
                              onChange={handleChange}
                              placeholder="Specify other valid ID"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Representative Information Section */}
                    {editingApplicant.representative && (
                      <div className="form-section">
                        <h3>Representative Information</h3>
                        <div className="form-row">
                          <div className="form-field">
                            <label htmlFor="rep_relationship">Relationship to Applicant</label>
                            <input
                              id="rep_relationship"
                              name="rep_relationship"
                              type="text"
                              value={editingApplicant.representative.relationship || ""}
                              onChange={handleChange}
                              placeholder="Enter relationship to applicant"
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-field">
                            <label htmlFor="rep_first_name">First Name</label>
                            <input
                              id="rep_first_name"
                              name="rep_bg_first_name"
                              placeholder="First Name"
                              value={
                                editingApplicant.representative.background_info?.first_name ||
                                ""
                              }
                              onChange={handleChange}
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor="rep_middle_initial">Middle Initial</label>
                            <input
                              id="rep_middle_initial"
                              name="rep_bg_middle_initial"
                              placeholder="Middle Initial"
                              value={
                                editingApplicant.representative.background_info
                                  ?.middle_initial || ""
                              }
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-field">
                            <label htmlFor="rep_last_name">Last Name</label>
                            <input
                              id="rep_last_name"
                              name="rep_bg_last_name"
                              placeholder="Last Name"
                              value={
                                editingApplicant.representative.background_info?.last_name ||
                                ""
                              }
                              onChange={handleChange}
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor="rep_suffix">Suffix</label>
                            <select
                              id="rep_suffix"
                              name="rep_bg_suffix"
                              value={
                                editingApplicant.representative.background_info?.suffix || ""
                              }
                              onChange={handleChange}
                            >
                              <option value="">None</option>
                              <option value="Jr.">Jr.</option>
                              <option value="Sr.">Sr.</option>
                              <option value="I">I</option>
                              <option value="II">II</option>
                              <option value="III">III</option>
                              <option value="IV">IV</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-field">
                            <label htmlFor="rep_sex">Sex</label>
                            <select
                              id="rep_sex"
                              name="rep_bg_sex"
                              value={
                                editingApplicant.representative.background_info?.sex || ""
                              }
                              onChange={handleChange}
                            >
                              <option value="">Select Sex</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                          <div className="form-field">
                            <label htmlFor="rep_civil_status">Civil Status</label>
                            <select
                              id="rep_civil_status"
                              name="rep_bg_civil_status"
                              value={
                                editingApplicant.representative.background_info
                                  ?.civil_status || ""
                              }
                              onChange={handleChange}
                            >
                              <option value="">Select Civil Status</option>
                              <option value="Single">Single</option>
                              <option value="Married">Married</option>
                              <option value="Widowed">Widowed</option>
                              <option value="Separated">Separated</option>
                              <option value="Divorced">Divorced</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-field">
                            <label htmlFor="rep_address">Full Address</label>
                            <input
                              id="rep_address"
                              name="rep_bg_street_address"
                              type="text"
                              value={
                                editingApplicant.representative.background_info
                                  ?.street_address || ""
                              }
                              onChange={handleChange}
                              placeholder="Enter Full Address"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
                <div className="dialog-footer">
                  <button type="submit" form="edit-applicant-form" className="btn primary-btn">
                    Save Changes
                  </button>
                  <button type="button" className="btn secondary-btn" onClick={closeEditView}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Applicants;
