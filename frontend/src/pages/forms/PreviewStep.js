// File: frontend/src/forms/PreviewStep.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitApplicant } from "../../services/api";

const PreviewStep = ({ formData, prevStep }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });
  const [cancelModal, setCancelModal] = useState({ show: false });
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await submitApplicant(formData);
      setSubmitSuccess(true);
      navigate("/print", { state: { applicant: data } });
      setTimeout(() => {
        alert("Applicant registered successfully!");
      }, 500);
    } catch (error) {
      console.error("Submission Error:", error);
      let errorMessage = error;
      if (error.response) {
        errorMessage +=
          error.response.data.error || error.response.data.detail || " Please try again.";
      } else if (error.request) {
        errorMessage += "No response from server. Please check your connection.";
      } else {
        errorMessage += error.message || " Please try again.";
      }
      setErrorModal({ show: true, message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setCancelModal({ show: true });
  };

  const confirmCancel = () => {
    setCancelModal({ show: false });
    prevStep();
  };

  const getFullName = () => {
    let name = formData.first_name;
    if (formData.middle_initial) name += ` ${formData.middle_initial}.`;
    name += ` ${formData.last_name}`;
    if (formData.suffix) name += ` ${formData.suffix}`;
    return name;
  };

  const getFullAddress = () => {
    return `${formData.street_address}, ${formData.barangay_name}, ${formData.city_municipality}, ${formData.province}`;
  };

  return (
    <div className="card bg-quickaid-surface rounded-xl shadow-md p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-quickaid-text-primary mb-1">
          Review Applicant Details
        </h2>
        <p className="text-sm text-quickaid-text-secondary">
          Please verify all information before submitting
        </p>
      </div>

      <div className="space-y-8">
        {/* Personal Information */}
        <section>
          <h3 className="text-xl font-semibold text-quickaid-text-primary mb-4">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold text-gray-700">Full Name</div>
              <div className="text-quickaid-text-primary">{getFullName()}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Birthday</div>
              <div className="text-quickaid-text-primary">{formData.birthday}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Sex</div>
              <div className="text-quickaid-text-primary">{formData.sex}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Civil Status</div>
              <div className="text-quickaid-text-primary">{formData.civil_status}</div>
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Contact Information */}
        <section>
          <h3 className="text-xl font-semibold text-quickaid-text-primary mb-4">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold text-gray-700">Contact Number</div>
              <div className="text-quickaid-text-primary">{formData.contact_number}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Address</div>
              <div className="text-quickaid-text-primary">{getFullAddress()}</div>
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Financial Information */}
        <section>
          <h3 className="text-xl font-semibold text-quickaid-text-primary mb-4">
            Financial Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold text-gray-700">Occupation</div>
              <div className="text-quickaid-text-primary">{formData.occupation}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Monthly Income</div>
              <div className="text-quickaid-text-primary">₱{formData.monthly_income}</div>
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Application Details */}
        <section>
          <h3 className="text-xl font-semibold text-quickaid-text-primary mb-4">
            Application Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="font-semibold text-gray-700">Valid ID Presented</div>
              <div className="text-quickaid-text-primary">{formData.valid_id_presented}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Applicant Type</div>
              <div className="text-quickaid-text-primary">{formData.applicant_type}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Assistance Type</div>
              <div className="text-quickaid-text-primary">{formData.type_of_assistance}</div>
            </div>
          </div>
        </section>

        {formData.applicant_type === "Representative" && (
          <>
            <hr className="border-gray-200" />
            <section>
              <h3 className="text-xl font-semibold text-quickaid-text-primary mb-4">
                Representative Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-gray-700">Representative Name</div>
                  <div className="text-quickaid-text-primary">
                    {formData.rep_first_name}{" "}
                    {formData.rep_middle_initial && `${formData.rep_middle_initial}.`}{" "}
                    {formData.rep_last_name} {formData.rep_suffix}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Representative Address</div>
                  <div className="text-quickaid-text-primary">{formData.rep_address}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Representative Birthday</div>
                  <div className="text-quickaid-text-primary">{formData.rep_birthday}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Representative Sex</div>
                  <div className="text-quickaid-text-primary">{formData.rep_gender}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">
                    Representative Civil Status
                  </div>
                  <div className="text-quickaid-text-primary">{formData.rep_civil_status}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Representative Occupation</div>
                  <div className="text-quickaid-text-primary">{formData.rep_occupation}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">
                    Representative Monthly Income
                  </div>
                  <div className="text-quickaid-text-primary">
                    ₱{formData.rep_monthly_income}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Relationship to Applicant</div>
                  <div className="text-quickaid-text-primary">{formData.rep_relationship}</div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handleBack}
          className="btn btn-outline bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2"
          disabled={isSubmitting}
        >
          <span aria-hidden="true" className="mr-2">
            ←
          </span>{" "}
          Back
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className={`bg-quickaid-accent hover:bg-teal-600 text-white rounded-lg px-4 py-2 inline-flex items-center ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Submitting..."
            : submitSuccess
            ? "Submitted ✓"
            : "Submit Application"}
        </button>
      </div>

      {/* Error Modal */}
      {errorModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="modal-box bg-quickaid-surface rounded-xl shadow-lg p-6 max-w-md">
            <h3 className="text-xl font-semibold text-quickaid-text-primary mb-4">Error</h3>
            <p className="text-quickaid-text-secondary mb-6">{errorModal.message}</p>
            <div className="flex justify-end">
              <button
                className="btn bg-quickaid-accent hover:bg-teal-600 text-white rounded-lg px-4 py-2"
                onClick={() => setErrorModal({ show: false, message: "" })}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="modal-box bg-quickaid-surface rounded-xl shadow-lg p-6 max-w-md">
            <h3 className="text-xl font-semibold text-quickaid-text-primary mb-4">
              Confirm Cancellation
            </h3>
            <p className="text-quickaid-text-secondary mb-6">
              Are you sure you want to go back? Any unsaved changes will be lost.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="btn bg-quickaid-accent hover:bg-teal-600 text-white rounded-lg px-4 py-2"
                onClick={confirmCancel}
              >
                Yes, Go Back
              </button>
              <button
                className="btn btn-outline rounded-lg px-4 py-2"
                onClick={() => setCancelModal({ show: false })}
              >
                No, Stay Here
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewStep;
