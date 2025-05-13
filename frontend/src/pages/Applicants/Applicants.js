// File: frontend/src/pages/Applicants.js
import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { CSVLink } from "react-csv";
import AddressDropdown from "../../forms/AddressDropdown";
import "./Applicants.css";

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
  { label: "Gender", key: "gender" },
  { label: "Civil Status", key: "civil_status" },
  { label: "Occupation", key: "occupation" },
  { label: "Monthly Income", key: "monthly_income" },
  { label: "Valid ID", key: "valid_id_presented" },
  { label: "Assistance Type", key: "type_of_assistance" },
  { label: "Applicant Type", key: "applicant_type" },
  { label: "Date Filled", key: "processed_at" },
];

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editView, setEditView] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);
  const [previewView, setPreviewView] = useState(false);
  const [previewApplicant, setPreviewApplicant] = useState(null);

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
    if (
      editingApplicant?.barangay &&
      editingApplicant?.city_municipality &&
      editingApplicant?.province
    ) {
      updateCoordinates();
    }
  }, [
    editingApplicant?.barangay,
    editingApplicant?.city_municipality,
    editingApplicant?.province,
  ]);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const openEditView = applicant => {
    setEditingApplicant({ ...applicant });
    setEditView(true);
    // Add a class to body to prevent scrolling
    document.body.classList.add("dialog-open");
  };

  const goPrintPage = applicant => {
    window.open(`/print/applicants/${applicant.id}`, "_blank");
  };

  const closeEditView = () => {
    setEditingApplicant(null);
    setEditView(false);
    document.body.classList.remove("dialog-open");
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

  const handleArchive = async applicant_id => {
    if (!window.confirm("Are you sure you want to delete this applicant?")) return;

    try {
      await api.delete(`/applicants/${applicant_id}/`);
      fetchApplicants();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete applicant.");
    }
  };

  const handleSave = async e => {
    e.preventDefault();
    if (!editingApplicant || !editingApplicant.id) return;

    try {
      // Before saving, update the coordinates first
      const { data } = await api.post("/update_coordinates/", {
        id: editingApplicant.id,
        barangay: editingApplicant.barangay,
        city_municipality: editingApplicant.city_municipality,
        province: editingApplicant.province,
      });

      // Update local editingApplicant with new coordinates
      const updatedApplicant = {
        ...editingApplicant,
        latitude: data.latitude,
        longitude: data.longitude,
      };

      // Save the updated applicant
      await api.put(`/applicants/${editingApplicant.id}/`, updatedApplicant);

      fetchApplicants(); // Refresh the table
      closeEditView();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save applicant.");
    }
  };

  const handleChange = async e => {
    const { name, value } = e.target;
    setEditingApplicant(prev => ({ ...prev, [name]: value }));

    // Trigger coordinate update if address fields change
    if (["barangay", "city_municipality", "province"].includes(name)) {
      await updateCoordinates(); // Call updateCoordinates directly
    }
  };

  const updateCoordinates = async () => {
    if (!editingApplicant) return;

    try {
      // Make a request to your Django backend to update coordinates
      const response = await api.post("/update_coordinates/", {
        barangay: editingApplicant.barangay,
        city_municipality: editingApplicant.city_municipality,
        province: editingApplicant.province,
        id: editingApplicant.id,
      });

      if (response.data.latitude && response.data.longitude) {
        setEditingApplicant(prev => ({
          ...prev,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
        }));
      } else {
        console.error("Failed to update coordinates");
        alert("Failed to update coordinates.");
      }
    } catch (error) {
      console.error("Error updating coordinates:", error);
      alert("Error updating coordinates.");
    }
  };

  const formatDate = dateStr => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString();
  };

  const filteredApplicants = applicants.filter(a => {
    const keyword = searchTerm.toLowerCase();
    return (
      (a.first_name || "").toLowerCase().includes(keyword) ||
      (a.last_name || "").toLowerCase().includes(keyword) ||
      (a.barangay || "").toLowerCase().includes(keyword) ||
      (a.type_of_assistance || "").toLowerCase().includes(keyword)
    );
  });

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
                  <td className="link-button" onClick={() => openPreviewView(applicant)}>
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
                    <button onClick={() => openEditView(applicant)}>Edit</button>
                    <button onClick={() => handleArchive(applicant.id)}>Archive</button>
                    <button onClick={() => goPrintPage(applicant)}>Print</button>
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

      {/* Preview Dialog */}
      {previewView && (
        <div className="dialog-backdrop">
          <div className="dialog preview-dialog">
            <div className="dialog-header">
              <h2>Applicant Preview</h2>
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
                          {previewApplicant.first_name} {previewApplicant.middle_initial}{" "}
                          {previewApplicant.last_name} {previewApplicant.suffix}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Gender</span>
                        <span className="detail-value">{previewApplicant.gender}</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-label">Birthday</span>
                        <span className="detail-value">{previewApplicant.birthday}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Civil Status</span>
                        <span className="detail-value">{previewApplicant.civil_status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-group">
                    <h3>Contact Information</h3>
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-label">Address</span>
                        <span className="detail-value">
                          {previewApplicant.purok}, {previewApplicant.barangay},{" "}
                          {previewApplicant.city_municipality}, {previewApplicant.province}
                        </span>
                      </div>
                    </div>
                    <div className="detail-row">
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
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="dialog-footer">
              <button className="btn dialog-btn" onClick={closePreviewView}>
                Close
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
                            value={editingApplicant.first_name || ""}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label htmlFor="middle_initial">Middle Initial</label>
                          <input
                            id="middle_initial"
                            name="middle_initial"
                            placeholder="Middle Initial"
                            value={editingApplicant.middle_initial || ""}
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
                            value={editingApplicant.last_name || ""}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label htmlFor="suffix">Suffix</label>
                          <select
                            id="suffix"
                            name="suffix"
                            value={editingApplicant.suffix || ""}
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
                          <label htmlFor="gender">Gender</label>
                          <input
                            id="gender"
                            name="gender"
                            placeholder="Gender"
                            value={editingApplicant.gender || ""}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-field">
                          <label htmlFor="civil_status">Civil Status</label>
                          <input
                            id="civil_status"
                            name="civil_status"
                            placeholder="Civil Status"
                            value={editingApplicant.civil_status || ""}
                            onChange={handleChange}
                          />
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
                          <label htmlFor="purok">Purok</label>
                          <input
                            id="purok"
                            type="text"
                            name="purok"
                            value={editingApplicant.purok || ""}
                            onChange={handleChange}
                            required
                            placeholder="Enter your purok"
                          />
                        </div>
                      </div>

                      <div className="form-field address-dropdown-container">
                        <AddressDropdown
                          onSelect={(field, value) => {
                            setEditingApplicant(prev => ({
                              ...prev,
                              [field]: value,
                            }));
                          }}
                          initialValues={{
                            province: editingApplicant.province,
                            city_municipality: editingApplicant.city_municipality,
                            city_municipalityCode: editingApplicant.city_municipalityCode,
                            barangay: editingApplicant.barangay,
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Assistance Information</h3>
                      <div className="form-row">
                        <div className="form-field">
                          <label htmlFor="type_of_assistance">Type of Assistance</label>
                          <input
                            id="type_of_assistance"
                            name="type_of_assistance"
                            placeholder="Type of Assistance"
                            value={editingApplicant.type_of_assistance || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
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
