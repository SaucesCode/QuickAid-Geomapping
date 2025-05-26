import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PrintPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const applicant = state?.applicant;

  useEffect(() => {
    console.log("Applicants", applicant.background_info.barangay_details.city_name);
    document.title = "Quickaid | Print Applicant";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);

  useEffect(() => {
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
          <strong>Full Name:</strong> {applicant.background_info.first_name}{" "}
          {applicant.background_info.middle_initial} {applicant.background_info.last_name}{" "}
          {applicant.background_info.suffix}
        </p>
        <p>
          <strong>Birthday:</strong> {applicant.background_info.birthday}
        </p>
        <p>
          <strong>Sex:</strong> {applicant.background_info.sex}
        </p>
        <p>
          <strong>Address:</strong> {applicant.background_info.street_address},{" "}
          {applicant.background_info.barangay},{" "}
          {applicant.background_info.barangay_details.city_name},{" "}
          {applicant.background_info.barangay_details.province_name}
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
