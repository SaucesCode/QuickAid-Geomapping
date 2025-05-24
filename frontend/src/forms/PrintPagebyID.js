import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../services/api";

const PrintPagebyID = () => {
  const { id } = useParams();
  const [applicant, setApplicant] = useState(null);
  const navigate = useNavigate();
  console.log(id);

  const fetchApplicant = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log(token);
      const res = await fetch(`${API_URL}/applicants/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setApplicant(data);
      console.log("Fetched applicant data:", data);
    } catch (err) {
      console.error("Error loading applicant:", err);
      // navigate("/dashboard");
    }
  };
  useEffect(() => {
    fetchApplicant();
  });

  if (!applicant) return <p className="p-4">Loading applicant info...</p>;

  return (
    <div className="print-container p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Applicant Information</h1>

      <div className="space-y-2 mb-6">
        <p>
          <strong>Full Name:</strong> {applicant.first_name} {applicant.middle_initial}{" "}
          {applicant.last_name} {applicant.suffix}
        </p>
        <p>
          <strong>Birthday:</strong> {applicant.birthday}
        </p>
        <p>
          <strong>Gender:</strong> {applicant.gender}
        </p>
        <p>
          <strong>Address:</strong> {applicant.purok}, {applicant.barangay},{" "}
          {applicant.city_municipality}, {applicant.province}
        </p>
        <p>
          <strong>Type of Assistance:</strong> {applicant.type_of_assistance}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Print
        </button>
        <button
          onClick={() => navigate("/applicants")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Applicants
        </button>
      </div>
    </div>
  );
};

export default PrintPagebyID;
