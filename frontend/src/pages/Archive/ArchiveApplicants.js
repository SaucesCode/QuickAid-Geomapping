import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./ArchiveApplicants.css";

const ArchiveApplicants = () => {
  const [archivedApplicants, setArchivedApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewView, setPreviewView] = useState(false);
  const [previewApplicant, setPreviewApplicant] = useState(null);
  const [restoreModal, setRestoreModal] = useState({ show: false, applicantId: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchArchivedApplicants = async () => {
    setLoading(true);
    try {
      const res = await api.get("/list-archived-applicants/");
      setArchivedApplicants(res.data);
    } catch (err) {
      console.error("Fetch applicants failed:", err);
    } finally {
      setLoading(false);
    }
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

  const openRestoreModal = applicant_id => {
    setRestoreModal({ show: true, applicantId: applicant_id });
    document.body.classList.add("dialog-open");
  };

  const closeRestoreModal = () => {
    setRestoreModal({ show: false, applicantId: null });
    document.body.classList.remove("dialog-open");
  };

  const handleRestore = async () => {
    if (!restoreModal.applicantId) return;

    try {
      await api.post(`/restore-applicant/${restoreModal.applicantId}/`);
      fetchArchivedApplicants();
      closeRestoreModal();
    } catch (err) {
      console.error("Restore applicant failed:", err);
    }
  };

  const filteredApplicants = archivedApplicants.filter(a => {
    const keyword = searchTerm.toLowerCase();
    return (
      (a.background_info?.first_name || "").toLowerCase().includes(keyword) ||
      (a.background_info?.last_name || "").toLowerCase().includes(keyword) ||
      (a.background_info?.barangay || "").toLowerCase().includes(keyword) ||
      (a.type_of_assistance || "").toLowerCase().includes(keyword)
    );
  });

  // Add pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);

  const handlePageChange = pageNumber => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = e => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
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

  useEffect(() => {
    fetchArchivedApplicants();
    document.title = "Quickaid | Archive Applicants";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);

  return (
    <div className="applicants-container">
      <h1>📋 Archived Applicants</h1>

      <div className="actions">
        <input
          type="text"
          placeholder="🔍 Search applicants..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
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
                  <th>Name</th>
                  <th>Barangay</th>
                  <th>City or Municipality</th>
                  <th>Assistance</th>
                  <th>Date Filled</th>
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
                        <button onClick={() => openRestoreModal(applicant.id)}>Restore</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      <div className="empty-state">
                        <p>No archived applicants found</p>
                        <small>Try adjusting your search</small>
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
                {Math.min(indexOfLastItem, filteredApplicants.length)} of{" "}
                {filteredApplicants.length} entries
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

      {/* Restore Confirmation Modal */}
      {restoreModal.show && (
        <div className="dialog-backdrop">
          <div className="dialog confirm-dialog">
            <div className="dialog-header">
              <h2>Confirm Restore</h2>
            </div>
            <div className="dialog-content">
              <p>
                Are you sure you want to restore this applicant? This will move them back to
                the active applicants list.
              </p>
            </div>
            <div className="dialog-footer">
              <button className="btn success-btn" onClick={handleRestore}>
                Restore
              </button>
              <button className="btn secondary-btn" onClick={closeRestoreModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchiveApplicants;
