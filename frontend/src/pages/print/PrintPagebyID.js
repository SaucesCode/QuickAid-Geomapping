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

  // --- Start of Blue Monochromatic Styles for Modern & Professional Look (A4 Print Optimized) ---

  const styles = `
    /* Blue Monochromatic Palette */
    :root {
      --color-primary: #004d99; /* Deep/Navy Blue - for main headers, primary buttons */
      --color-secondary: #337ab7; /* Medium Blue - for subheadings */
      --color-tertiary: #cce0ff; /* Light Blue - for accents/backgrounds */
      --color-text: #333333; /* Dark Gray for readability */
      --color-light-text: #666666; /* Lighter Gray for labels */
      --color-white: #ffffff;
      --color-border: #dddddd; /* Light gray border */
    }

    /* Overall Container for A4 Sizing in Print */
    .print-container {
      padding: 20px;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: var(--color-text);
      /* Default for screen */
      max-width: 900px; 
      margin: 0 auto;
    }

    /* A4 Print Optimization */
    @media print {
      body {
        margin: 0;
        padding: 0;
        /* Set A4 size for the print output */
        width: 210mm; /* A4 width */
        height: 297mm; /* A4 height */
      }
      .print-container {
        padding: 20mm; /* A professional border/margin */
        width: 100%;
        margin: 0;
        box-shadow: none;
      }
      .print-actions {
        display: none; /* Hide buttons when printing */
      }
      /* Ensure only black ink is used for text in print for maximum professionalism/readability */
      .print-content, .print-content * {
        color: #000000 !important; 
        background: none !important;
      }
      h1, h2 {
        color: var(--color-primary) !important; /* Keep primary color for titles if printer supports it */
      }
      .detail-group {
        border: 1px solid var(--color-border);
      }
    }

    /* Header Styling */
    .print-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid var(--color-primary);
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    .print-header h1 {
      color: var(--color-primary);
      font-size: 28px;
      font-weight: 600;
      margin: 0;
    }
    .print-actions button {
      margin-left: 10px;
    }

    /* Button Styling (Modern & Monochromatic) */
    .btn {
      padding: 10px 15px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.3s;
    }
    .primary-btn {
      background-color: var(--color-primary);
      color: var(--color-white);
    }
    .primary-btn:hover {
      background-color: #003366; /* Darker Blue */
    }
    .secondary-btn {
      background-color: var(--color-white);
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
    }
    .secondary-btn:hover {
      background-color: var(--color-tertiary);
      color: var(--color-primary);
    }

    /* Details Section Styling */
    .detail-group {
      margin-bottom: 25px;
      padding: 15px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
    }
    .detail-group h2 {
      color: var(--color-secondary);
      font-size: 20px;
      font-weight: 500;
      margin-top: 0;
      margin-bottom: 15px;
      border-bottom: 1px solid var(--color-tertiary);
      padding-bottom: 5px;
    }
    .detail-row {
      display: flex;
      flex-wrap: wrap;
      gap: 20px; /* Space between detail items */
    }
    .detail-item {
      flex: 1 1 200px; /* Allows for 2-4 items per row, wraps on smaller screens/print */
      min-width: 200px;
      margin-bottom: 10px;
    }
    .detail-label {
      display: block;
      font-size: 12px;
      color: var(--color-light-text);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .detail-value {
      display: block;
      font-size: 16px;
      font-weight: 400;
      line-height: 1.4;
      color: var(--color-text);
      word-break: break-word;
    }
    
    /* State Styling (Loading/Error) */
    .loading-state, .error-state {
      text-align: center;
      padding: 50px;
      border: 1px solid var(--color-tertiary);
      border-radius: 5px;
    }
    .loading-spinner {
      /* Minimalist spinner design */
      border: 4px solid var(--color-tertiary);
      border-top: 4px solid var(--color-primary);
      border-radius: 50%;
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
      margin: 0 auto 10px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  
  // --- End of Blue Monochromatic Styles ---

  // Renders the style block dynamically
  const StyleBlock = () => <style>{styles}</style>;


  if (loading) {
    return (
      <div className="print-container">
        <StyleBlock />
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
        <StyleBlock />
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
        <StyleBlock />
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
      <StyleBlock /> {/* Apply styles here */}
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
          {/* Personal Information */}
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

          {/* Contact Information */}
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

          {/* Assistance Details */}
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

          {/* Representative Information (Conditional) */}
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