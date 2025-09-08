import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api";

const PrintPagebyID = () => {
  const { id } = useParams();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const formatDate = dateStr => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-PH", options);
  };

  const fetchApplicant = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/applicants/${id}/`);
      setApplicant(data);
    } catch (err) {
      console.error("Error loading applicant:", err);
      setError("Failed to load applicant information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicant();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="print-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading applicant information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="print-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => navigate("/applicants")} className="btn secondary-btn">
            Back to Applicants
          </button>
        </div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="print-container">
        <div className="error-state">
          <p>Applicant not found</p>
          <button onClick={() => navigate("/applicants")} className="btn secondary-btn">
            Back to Applicants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="print-container">
      <div className="print-content">
        <div className="print-header">
          <h1>Applicant Information</h1>
          <div className="print-actions">
            <button onClick={handlePrint} className="btn primary-btn">
              Print
            </button>
            <button onClick={() => navigate("/applicants")} className="btn secondary-btn">
              Back to Applicants
            </button>
          </div>
        </div>

        <div className="print-details">
          <div className="detail-group">
            <h2>Personal Information</h2>
            <div className="detail-row">
              <div className="detail-item">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">
                  {applicant.background_info.first_name}{" "}
                  {applicant.background_info.middle_initial}{" "}
                  {applicant.background_info.last_name} {applicant.background_info.suffix}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Birthday</span>
                <span className="detail-value">
                  {formatDate(applicant.background_info.birthday)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Gender</span>
                <span className="detail-value">{applicant.background_info.sex}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Civil Status</span>
                <span className="detail-value">{applicant.background_info.civil_status}</span>
              </div>
            </div>
          </div>

          <div className="detail-group">
            <h2>Contact Information</h2>
            <div className="detail-row">
              <div className="detail-item">
                <span className="detail-label">Street Address</span>
                <span className="detail-value">
                  {applicant.background_info?.street_address || "Not specified"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Barangay</span>
                <span className="detail-value">
                  {applicant.background_info?.barangay || "Not specified"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">City/Municipality</span>
                <span className="detail-value">
                  {applicant.background_info?.barangay_details?.city_name || "Not specified"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Province</span>
                <span className="detail-value">
                  {applicant.background_info?.barangay_details?.province_name ||
                    "Not specified"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Contact Number</span>
                <span className="detail-value">
                  {applicant.contact_number || "Not specified"}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-group">
            <h2>Assistance Details</h2>
            <div className="detail-row">
              <div className="detail-item">
                <span className="detail-label">Type of Assistance</span>
                <span className="detail-value">{applicant.type_of_assistance}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Applicant Type</span>
                <span className="detail-value">{applicant.applicant_type}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date Filled</span>
                <span className="detail-value">{formatDate(applicant.date_filled)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Valid ID Presented</span>
                <span className="detail-value">
                  {applicant.valid_id_presented}
                  {applicant.other_valid_id && ` (${applicant.other_valid_id})`}
                </span>
              </div>
            </div>
          </div>

          {applicant.representative && (
            <div className="detail-group">
              <h2>Representative Information</h2>
              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value">
                    {applicant.representative.background_info?.first_name || ""}{" "}
                    {applicant.representative.background_info?.middle_initial || ""}{" "}
                    {applicant.representative.background_info?.last_name || ""}{" "}
                    {applicant.representative.background_info?.suffix || ""}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Relationship</span>
                  <span className="detail-value">
                    {applicant.representative.relationship || "Not specified"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">
                    {[
                      applicant.representative.background_info?.street_address,
                      applicant.representative.background_info?.barangay,
                      applicant.representative.background_info?.barangay_details?.city_name,
                      applicant.representative.background_info?.barangay_details
                        ?.province_name,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Not specified"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintPagebyID;
