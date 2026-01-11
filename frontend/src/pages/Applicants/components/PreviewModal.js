// frontend/src/pages/Applicants/components/PreviewModal.js

import {
  X,
  User,
  MapPin,
  FileText,
  DollarSign,
  History,
  CheckCircle2,
  Clock,
  Phone,
  Calendar,
  IdCard,
  Users,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import clsx from "clsx";
import { formatDate } from "../../../utils/FormatDate";

const PreviewModal = ({ previewApplicant, closePreviewView }) => {
  const {
    id,
    background_info = {},
    contact_number,
    type_of_assistance,
    applicant_type,
    date_filled,
    created_at,
    valid_id_presented,
    other_valid_id,
    representative,
    application_history,
    identity_status,
    identity_notes,
    staff,
    longitude,
    latitude,
  } = previewApplicant;

  const repInfo = representative || {};
  const repBackground = repInfo.background_info || {};

  const fullName = `${background_info.first_name || ""} ${
    background_info.middle_initial ? background_info.middle_initial + "." : ""
  } ${background_info.last_name || ""} ${background_info.suffix || ""}`.trim();

  const repFullName = `${repBackground.first_name || ""} ${
    repBackground.middle_initial ? repBackground.middle_initial + "." : ""
  } ${repBackground.last_name || ""} ${repBackground.suffix || ""}`.trim();

  const { isSidebarMinimized } = useOutletContext();

  const formatCurrency = amount => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount || 0);
  };

  const getIdentityStatusColor = status => {
    const colors = {
      NEW: "text-blue-700 bg-blue-50 border-blue-200",
      VERIFIED: "text-green-700 bg-green-50 border-green-200",
      SUSPICIOUS: "text-yellow-700 bg-yellow-50 border-yellow-200",
      REVIEWED: "text-purple-700 bg-purple-50 border-purple-200",
      BLOCKED: "text-red-700 bg-red-50 border-red-200",
    };
    return colors[status] || colors.NEW;
  };

  return (
    <div
      className={clsx(
        "fixed top-0 bottom-0 right-0 bg-black/40 flex items-center justify-center z-50 p-4 transition-all duration-300",
        {
          "left-[80px]": isSidebarMinimized,
          "left-[240px]": !isSidebarMinimized,
        }
      )}
      onClick={closePreviewView}
    >
      <div
        className={clsx(
          "bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-hidden flex flex-col border-2 border-gray-300",
          {
            "max-w-6xl": !isSidebarMinimized,
            "max-w-7xl": isSidebarMinimized,
          }
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#003a76] px-6 py-4 flex items-center justify-between border-b-2 border-[#002d5c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center border border-white/30">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{fullName}</h2>
              <p className="text-xs text-white/80">Application ID: #{id}</p>
            </div>
          </div>
          <button
            onClick={closePreviewView}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-white/20"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          {/* Alert for identity status */}
          {identity_status && identity_status !== "NEW" && (
            <div
              className={`border-2 rounded-lg p-4 ${getIdentityStatusColor(identity_status)}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-current mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Identity Status: {identity_status}</p>
                  {identity_notes && <p className="text-xs mt-1">{identity_notes}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal */}
            <div className="bg-white rounded-lg border-2 border-gray-300 p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-200">
                <User className="w-5 h-5 text-[#003a76]" />
                <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
              </div>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-blue-800">Full Name</dt>
                  <dd className="text-sm font-medium text-gray-900 mt-1">{fullName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800">Sex</dt>
                  <dd className="text-sm text-gray-900 mt-1">{background_info.sex}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800">Birthday</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {formatDate(background_info.birthday)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800">Civil Status</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {background_info.civil_status}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800">Occupation</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {background_info.occupation || "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800">Monthly Income</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {background_info.monthly_income
                      ? `₱${parseFloat(background_info.monthly_income).toLocaleString()}`
                      : "Not specified"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Contact & Location */}
            <div className="bg-white rounded-lg border-2 border-gray-300 p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-200">
                <MapPin className="w-5 h-5 text-[#003a76]" />
                <h3 className="text-sm font-semibold text-gray-900">Contact & Location</h3>
              </div>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-blue-800">Contact Number</dt>
                  <dd className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {contact_number}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800">Street Address</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {background_info.street_address}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800">Barangay</dt>
                  <dd className="text-sm text-gray-900 mt-1">{background_info.barangay}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800">City/Municipality</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {background_info.barangay_details?.city_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800">Province</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {background_info.barangay_details?.province_name}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Application */}
            <div className="bg-white rounded-lg border-2 border-gray-300 p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-200">
                <FileText className="w-5 h-5 text-[#003a76]" />
                <h3 className="text-sm font-semibold text-gray-900">Application Details</h3>
              </div>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-blue-800">Assistance Type</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-block px-2.5 py-1 rounded border-2 text-xs font-semibold ${
                        type_of_assistance?.toLowerCase() === "educational"
                          ? "bg-green-50 text-green-700 border-green-300"
                          : type_of_assistance?.toLowerCase() === "medical"
                          ? "bg-blue-50 text-blue-700 border-blue-300"
                          : "bg-yellow-50 text-yellow-700 border-yellow-300"
                      }`}
                    >
                      {type_of_assistance}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800">Applicant Type</dt>
                  <dd className="text-sm text-gray-900 mt-1">{applicant_type}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800">Date Submitted</dt>
                  <dd className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {formatDate(date_filled)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800">Valid ID</dt>
                  <dd className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                    <IdCard className="w-3.5 h-3.5 text-gray-400" />
                    {valid_id_presented}
                    {other_valid_id && (
                      <span className="text-blue-800">({other_valid_id})</span>
                    )}
                  </dd>
                </div>
                {staff && (
                  <div>
                    <dt className="text-xs font-medium text-blue-800">Processed By</dt>
                    <dd className="text-sm text-gray-900 mt-1">{staff}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Representative */}
          {representative && (
            <div className="bg-white rounded-lg border-2 border-gray-300 p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-200">
                <Users className="w-5 h-5 text-[#003a76]" />
                <h3 className="text-sm font-semibold text-gray-900">Representative Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <dt className="text-xs font-medium text-blue-800">Full Name</dt>
                  <dd className="text-sm font-medium text-gray-900 mt-1">{repFullName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800">Relationship</dt>
                  <dd className="text-sm text-gray-900 mt-1">{repInfo.relationship}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800">Contact Number</dt>
                  <dd className="text-sm text-gray-900 mt-1">{repInfo.contact_number}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800">Address</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {repBackground.street_address}
                  </dd>
                </div>
              </div>
            </div>
          )}

          {/* Financial Summary */}
          {previewApplicant.total_approved_amount > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 p-5">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-green-700" />
                <h3 className="text-sm font-semibold text-gray-900">Financial Summary</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/60 rounded-lg p-3 border border-green-200">
                  <p className="text-xs font-medium text-gray-600">Total Approved</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {formatCurrency(previewApplicant.total_approved_amount)}
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-green-200">
                  <p className="text-xs font-medium text-gray-600">Claimed</p>
                  <p className="text-lg font-semibold text-green-700 mt-1">
                    {formatCurrency(previewApplicant.total_claimed_amount)}
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-green-200">
                  <p className="text-xs font-medium text-gray-600">Unclaimed</p>
                  <p className="text-lg font-semibold text-orange-700 mt-1">
                    {formatCurrency(previewApplicant.total_unclaimed_amount)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* History & Approvals Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application History */}
            <div className="bg-white rounded-lg border-2 border-gray-300 p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-200">
                <History className="w-5 h-5 text-[#003a76]" />
                <h3 className="text-sm font-semibold text-gray-900">Application History</h3>
              </div>
              <div className="space-y-2">
                {application_history && application_history.length > 0 ? (
                  application_history.map((h, i) => (
                    <div
                      key={h.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-300">
                        <span className="text-xs font-semibold text-blue-700">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {h.type_of_assistance}
                        </p>
                        <p className="text-xs text-blue-800">{formatDate(h.date)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-blue-800 text-center py-4">
                    No history available
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border-2 border-gray-300 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b-2 border-gray-200">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Total Applications</span>
                  <span className="text-lg font-bold text-gray-900">
                    {application_history?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Approvals</span>
                  <span className="text-lg font-bold text-gray-900">
                    {previewApplicant.approval_count || 0}
                  </span>
                </div>
                {identity_status && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Identity Status</span>
                    <span
                      className={`text-sm font-semibold px-2 py-1 rounded border ${getIdentityStatusColor(
                        identity_status
                      )}`}
                    >
                      {identity_status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Approvals & Disbursements */}
          {previewApplicant.approvals && previewApplicant.approvals.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Approvals & Disbursements
              </h3>
              {previewApplicant.approvals.map((approval, i) => (
                <div
                  key={approval.id}
                  className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden"
                >
                  {/* Approval Header */}
                  <div className="bg-gray-50 px-5 py-3 border-b-2 border-gray-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Approval #{i + 1}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {approval.approved_by} • {formatDate(approval.approved_at)}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(approval.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Disbursement Status */}
                    {approval.disbursement_claim && (
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                        <span className="text-xs font-medium text-gray-600">
                          Disbursement Status
                        </span>
                        <div className="flex items-center gap-2">
                          {approval.disbursement_claim.status === "CLAIMED" ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-700">
                                Claimed on{" "}
                                {formatDate(approval.disbursement_claim.payout_date)}
                              </span>
                            </>
                          ) : approval.disbursement_claim.status === "UNCLAIMED" ? (
                            <>
                              <Clock className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-semibold text-orange-700">
                                Unclaimed
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-semibold text-gray-700">
                                Pending
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Audit Trail */}
                    {approval.audit_trail && approval.audit_trail.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-3">
                          Activity Log
                        </p>
                        <div className="space-y-2">
                          {approval.audit_trail.map((audit, idx) => (
                            <div key={idx} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className="w-2.5 h-2.5 bg-[#003a76] rounded-full border-2 border-[#003a76]" />
                                {idx < approval.audit_trail.length - 1 && (
                                  <div className="w-0.5 h-full bg-gray-300 my-1" />
                                )}
                              </div>
                              <div className="flex-1 pb-3">
                                <p className="text-sm font-semibold text-gray-900">
                                  {audit.action}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5">{audit.notes}</p>
                                <p className="text-xs text-blue-800 mt-1">
                                  {audit.performed_by && `${audit.performed_by} • `}
                                  {formatDate(audit.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t-2 border-gray-300 px-6 py-3 flex justify-end">
          <button
            onClick={closePreviewView}
            className="px-4 py-2 bg-[#003a76] hover:bg-[#002d5c] text-white text-sm font-semibold rounded-lg transition-colors border border-[#002d5c]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
