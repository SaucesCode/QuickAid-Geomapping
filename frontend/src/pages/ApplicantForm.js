import React, { useState, useEffect } from "react";
import MultiStepForm from "../forms/MultiStepForm";
import "./ApplicationForm.css";

const ApplicantForm = () => {
  const [applicants, setApplicants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://127.0.0.1:8000/api/applicants/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setApplicants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      setApplicants([]);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const filteredApplicants = applicants.filter(
    applicant =>
      `${applicant.first_name} ${applicant.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      applicant.barangay.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.city_municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.type_of_assistance.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="applicant-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>New Applicant</h1>
          <p>Input and View assistance applicants</p>
        </div>
        <button className="add-applicant-btn" onClick={() => setShowForm(true)}>
          + New Applicant
        </button>
      </div>

      <div className="dashboard-tools">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="applicant-count">
          <span className="count">{applicants.length}</span> Total Applicants
        </div>
      </div>

      {filteredApplicants.length > 0 ? (
        <div className="applicant-table-container">
          <table className="applicant-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Barangay</th>
                <th>City</th>
                <th>Assistance Type</th>
                <th>Date Filled</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((applicant, index) => (
                <tr key={index}>
                  <td>{filteredApplicants.length - index}</td>
                  <td className="applicant-name">
                    {applicant.first_name} {applicant.last_name}
                  </td>
                  <td>{applicant.barangay}</td>
                  <td>{applicant.city_municipality}</td>
                  <td>
                    <span className="assistance-badge">{applicant.type_of_assistance}</span>
                  </td>
                  <td>{Date(applicant.date_filled).toString().slice(0, 24)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No applicants found</h3>
          <p>Add new applicants or adjust your search criteria</p>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-header">
            <h2>New Applicant Registration</h2>
            <button
              className="close-modal-btn"
              onClick={() => {
                setShowForm(false);
              }}
            >
              ×
            </button>
          </div>
          <MultiStepForm
            closeModal={() => {
              setShowForm(false);
              fetchApplicants();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ApplicantForm;
