import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const PrintPagebyID = () => {
  const { id } = useParams();
  const [applicant, setApplicant] = useState(null);
  const navigate = useNavigate();

  //   useEffect(() => {
  //     const fetchApplicant = async () => {
  //       try {
  //         const res = await fetch(`/applicants/${id}`);
  //         setApplicant(res.data);
  //       } catch (err) {
  //         console.error("Error loading applicant:", err);
  //         // navigate("/dashboard");
  //       }
  //     };

  //     fetchApplicant();
  //   }, [id, navigate]);
  const fetchApplicant = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://127.0.0.1:8000/api/applicants/${applicant.id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Fetching applicant ID:", id);

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setApplicant(data);
      console.log(res.data);
    } catch (err) {
      console.error("Error loading applicant:", err);
      // navigate("/dashboard");
    }
  };

  // const fetchApplicants = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await api.get("/applicants/");
  //     setApplicants(res.data);
  //   } catch (err) {
  //     console.error("Fetch applicants failed:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    fetchApplicant();
  }, [id, navigate]);

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
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => navigate("/new-applicant")}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Input Another Applicant
        </button>
      </div>
    </div>
  );
};

export default PrintPagebyID;
