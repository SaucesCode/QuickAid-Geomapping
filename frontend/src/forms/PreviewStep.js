import React, { useState } from "react";
import "./PreviewStep.css";
import { useNavigate } from "react-router-dom";
import { submitApplicant } from "../services/api";

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
      let errorMessage = "Error submitting applicant. ";
      if (error.response) {
        errorMessage +=
          error.response.data.error || error.response.data.detail || "Please try again.";
      } else if (error.request) {
        errorMessage += "No response from server. Please check your connection.";
      } else {
        errorMessage += error.message || "Please try again.";
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
    <div className="preview-step">
      <div className="preview-header">
        <h2>Review Applicant Details</h2>
        <p>Please verify all information before submitting</p>
      </div>

      <div className="preview-content">
        <div className="section-title">Personal Information</div>
        <div className="preview-section">
          <div className="info-group">
            <div className="info-label">Full Name</div>
            <div className="info-value">{getFullName()}</div>
          </div>
          <div className="info-group">
            <div className="info-label">Birthday</div>
            <div className="info-value">{formData.birthday}</div>
          </div>
          <div className="info-group">
            <div className="info-label">Sex</div>
            <div className="info-value">{formData.sex}</div>
          </div>
          <div className="info-group">
            <div className="info-label">Civil Status</div>
            <div className="info-value">{formData.civil_status}</div>
          </div>
        </div>

        <div className="section-divider"></div>

        <div className="section-title">Contact Information</div>
        <div className="preview-section">
          <div className="info-group">
            <div className="info-label">Contact Number</div>
            <div className="info-value">{formData.contact_number}</div>
          </div>
          <div className="info-group">
            <div className="info-label">Address</div>
            <div className="info-value">{getFullAddress()}</div>
          </div>
        </div>

        <div className="section-divider"></div>

        <div className="section-title">Financial Information</div>
        <div className="preview-section">
          <div className="info-group">
            <div className="info-label">Occupation</div>
            <div className="info-value">{formData.occupation}</div>
          </div>
          <div className="info-group">
            <div className="info-label">Monthly Income</div>
            <div className="info-value">₱{formData.monthly_income}</div>
          </div>
        </div>

        <div className="section-divider"></div>

        <div className="section-title">Application Details</div>
        <div className="preview-section">
          <div className="info-group">
            <div className="info-label">Valid ID Presented</div>
            <div className="info-value">{formData.valid_id_presented}</div>
          </div>
          <div className="info-group">
            <div className="info-label">Applicant Type</div>
            <div className="info-value">{formData.applicant_type}</div>
          </div>
          <div className="info-group">
            <div className="info-label">Assistance Type</div>
            <div className="info-value">{formData.type_of_assistance}</div>
          </div>
        </div>

        {formData.applicant_type === "Representative" && (
          <>
            <div className="section-divider"></div>
            <div className="section-title">Representative Information</div>
            <div className="preview-section">
              <div className="info-group">
                <div className="info-label">Representative Name</div>
                <div className="info-value">
                  {formData.rep_first_name}{" "}
                  {formData.rep_middle_initial && `${formData.rep_middle_initial}.`}{" "}
                  {formData.rep_last_name} {formData.rep_suffix}
                </div>
              </div>
              <div className="info-group">
                <div className="info-label">Representative Address</div>
                <div className="info-value">{formData.rep_address}</div>
              </div>
              <div className="info-group">
                <div className="info-label">Representative Birthday</div>
                <div className="info-value">{formData.rep_birthday}</div>
              </div>
              <div className="info-group">
                <div className="info-label">Representative Sex</div>
                <div className="info-value">{formData.rep_sex}</div>
              </div>
              <div className="info-group">
                <div className="info-label">Representative Civil Status</div>
                <div className="info-value">{formData.rep_civil_status}</div>
              </div>
              <div className="info-group">
                <div className="info-label">Representative Occupation</div>
                <div className="info-value">{formData.rep_occupation}</div>
              </div>
              <div className="info-group">
                <div className="info-label">Representative Monthly Income</div>
                <div className="info-value">₱{formData.rep_monthly_income}</div>
              </div>
              <div className="info-group">
                <div className="info-label">Relationship to Applicant</div>
                <div className="info-value">{formData.rep_relationship}</div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="preview-actions">
        <button
          type="button"
          onClick={handleBack}
          className="btn back-btn"
          disabled={isSubmitting}
        >
          <span className="btn-icon">←</span> Back
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className={`btn submit-btn ${isSubmitting ? "submitting" : ""} ${
            submitSuccess ? "success" : ""
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
        <div className="modal-overlay">
          <div className="modal-content error-modal">
            <h3>Error</h3>
            <p>{errorModal.message}</p>
            <div className="modal-actions">
              <button
                className="btn primary-btn"
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
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <h3>Confirm Cancellation</h3>
            <p>Are you sure you want to go back? Any unsaved changes will be lost.</p>
            <div className="modal-actions">
              <button className="btn primary-btn" onClick={confirmCancel}>
                Yes, Go Back
              </button>
              <button
                className="btn secondary-btn"
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
