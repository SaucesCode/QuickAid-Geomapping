// File: frontend/src/pages/Applicants.js
import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { CSVLink } from "react-csv";
import Modal from "react-modal";
import AddressDropdown from "../../forms/AddressDropdown";
import "./Applicants.css";

Modal.setAppElement("#root");

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);

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

  const openEditModal = applicant => {
    setEditingApplicant({ ...applicant });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setEditingApplicant(null);
    setModalIsOpen(false);
  };

  const handleDelete = async applicant_id => {
    if (!window.confirm("Are you sure you want to delete this applicant?")) return;

    try {
      await api.delete(`/applicants/${applicant_id}/`);
      fetchApplicants();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete applicant.");
      console.log("Applicant deleted:", applicant_id);
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
      closeModal();
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
          placeholder="Search applicants..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <CSVLink data={applicants} filename="applicants.csv" className="btn">
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
              <th>Assistance</th>
              <th>Date Filled</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplicants.length > 0 ? (
              filteredApplicants.map((applicant, id) => (
                <tr key={id}>
                  <td>{`${applicant.first_name || ""} ${applicant.last_name || ""}`}</td>
                  <td>{applicant.barangay}</td>
                  <td>{applicant.type_of_assistance}</td>
                  <td>
                    {formatDate(
                      new Date(+applicant.date_filled).toLocaleString().slice(0, 24)
                    )}
                  </td>
                  <td>
                    <button onClick={() => openEditModal(applicant)}>Edit</button>
                    <button
                      onClick={() => {
                        handleDelete(applicant.id);
                      }}
                    >
                      Delete
                    </button>
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

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Applicant"
        className="modal"
        overlayClassName="overlay"
      >
        {editingApplicant && (
          <form onSubmit={handleSave}>
            <h2>Edit Applicant</h2>

            <input
              name="first_name"
              placeholder="First Name"
              value={editingApplicant.first_name || ""}
              onChange={handleChange}
            />
            <input
              name="middle_initial"
              placeholder="Middle Initial"
              value={editingApplicant.middle_initial || ""}
              onChange={handleChange}
            />
            <input
              name="last_name"
              placeholder="Last Name"
              value={editingApplicant.last_name || ""}
              onChange={handleChange}
            />
            <select
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
            <input
              type="tel"
              name="contact_number"
              value={editingApplicant.contact_number || ""}
              onChange={handleChange}
              required
              placeholder="e.g. 09123456789"
            />
            <input
              type="text"
              name="purok"
              value={editingApplicant.purok || ""}
              onChange={handleChange}
              required
              placeholder="Enter your purok"
            />
            <div className="form-group address-group full-width">
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
            <input
              name="type_of_assistance"
              placeholder="Type of Assistance"
              value={editingApplicant.type_of_assistance || ""}
              onChange={handleChange}
            />
            <input
              name="gender"
              placeholder="Gender"
              value={editingApplicant.gender || ""}
              onChange={handleChange}
            />
            <input
              name="civil_status"
              placeholder="Civil Status"
              value={editingApplicant.civil_status || ""}
              onChange={handleChange}
            />
            <input
              name="contact_number"
              placeholder="Contact Number"
              value={editingApplicant.contact_number || ""}
              onChange={handleChange}
            />

            <div className="modal-actions">
              <button type="submit">Save</button>
              <button type="button" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Applicants;
