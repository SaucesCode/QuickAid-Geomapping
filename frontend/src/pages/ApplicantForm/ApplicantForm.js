import React, { useState, useEffect } from "react";
import "./ApplicationForm.css";
import { NavLink } from "react-router-dom";
import { API_URL } from "../../services/api";

const ApplicantForm = () => {
  const [applicants, setApplicants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = "Quickaid | Applicant Form";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);

  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_URL}/applicants/`, {
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
    console.log("Fetched applicants:", applicants);
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
      minute: "numeric",
      hour: "numeric",
    });
  };

  return (
    <div className="applicant-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>New Applicant</h1>
          <p>Input and View assistance applicants</p>
        </div>
        <NavLink className="add-applicant-btn" to={"/new-applicant"}>
          + New Applicant
        </NavLink>
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
                    {applicant.background_info.first_name}{" "}
                    {applicant.background_info.last_name}
                  </td>
                  <td>{applicant.background_info.barangay}</td>
                  <td>{applicant.background_info.barangay_details.city_name}</td>
                  <td>
                    <span className="assistance-badge">{applicant.type_of_assistance}</span>
                  </td>
                  <td>{formatDate(new Date(applicant.created_at).toString().slice(0, 24))}</td>
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
    </div>
  );
};

export default ApplicantForm;
