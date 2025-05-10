import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PrintPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const applicant = state?.applicant;

  React.useEffect(() => {
    if (!applicant) {
      navigate("/dashboard");
    }
  }, [applicant, navigate]);

  if (!applicant) return null;

  return (
    <div className="print-container p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Submitted Applicant Information</h1>

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

export default PrintPage;
