import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

const ArchiveApplicants = () => {
  const [achivedApplicants, setAchivedApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAchivedApplicants = async () => {
    setLoading(true);
    try {
      const res = await api.get("/list-archived-applicants/");
      setAchivedApplicants(res.data);
    } catch (err) {
      console.error("Fetch applicants failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async id => {
    if (!window.confirm("Are you sure you want to delete this applicant?")) return;
    try {
      await api.post(`/restore-applicant/${id}/`);
      fetchAchivedApplicants();
    } catch (err) {
      console.error("Restore applicant failed:", err);
    }
  };

  const filteredApplicants = achivedApplicants.filter(a => {
    const keyword = searchTerm.toLowerCase();
    return (
      (a.first_name || "").toLowerCase().includes(keyword) ||
      (a.last_name || "").toLowerCase().includes(keyword) ||
      (a.barangay || "").toLowerCase().includes(keyword) ||
      (a.type_of_assistance || "").toLowerCase().includes(keyword)
    );
  });

  const formatDate = dateStr => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString();
  };

  useEffect(() => {
    fetchAchivedApplicants();
    document.title = "Quickaid | Archive Applicants";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);
  return (
    <div>
      <div className="actions">
        <input
          type="text"
          placeholder="🔍 Search applicants..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      {loading ? (
        <p>Loading applicants...</p>
      ) : (
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
            {filteredApplicants.length > 0 ? (
              filteredApplicants.map((applicant, id) => (
                <tr key={id}>
                  <td className="link-button">
                    {`${applicant.first_name || ""} ${applicant.last_name || ""}`}
                  </td>

                  <td>{applicant.barangay}</td>
                  <td>{applicant.city_municipality}</td>
                  <td>{applicant.type_of_assistance}</td>
                  <td>
                    {formatDate(
                      new Date(applicant.processed_at).toLocaleString().slice(0, 24)
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleRestore(applicant.id)}>Restore</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No applicants found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ArchiveApplicants;
