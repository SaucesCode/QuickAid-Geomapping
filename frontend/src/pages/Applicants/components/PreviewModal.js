import React from "react";
import { X } from "lucide-react";

const PreviewModal = ({ previewApplicant, closePreviewView, formatPreviewDate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">Applicant Details</h2>
          <button
            onClick={closePreviewView}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-xl font-medium text-gray-800 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </span>
                <span className="text-gray-900">
                  {previewApplicant.background_info?.first_name || ""}{" "}
                  {previewApplicant.background_info?.middle_initial || ""}{" "}
                  {previewApplicant.background_info?.last_name || ""}{" "}
                  {previewApplicant.background_info?.suffix || ""}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">Sex</span>
                <span className="text-gray-900">
                  {previewApplicant.background_info?.sex || ""}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Birthday
                </span>
                <span className="text-gray-900">
                  {formatPreviewDate(previewApplicant.background_info?.birthday)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Civil Status
                </span>
                <span className="text-gray-900">
                  {previewApplicant.background_info?.civil_status}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Occupation
                </span>
                <span className="text-gray-900">
                  {previewApplicant.background_info?.occupation || "Not specified"}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Income
                </span>
                <span className="text-gray-900">
                  {previewApplicant.background_info?.monthly_income
                    ? `₱${parseFloat(
                        previewApplicant.background_info.monthly_income
                      ).toLocaleString()}`
                    : "Not specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-medium text-gray-800 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </span>
                <span className="text-gray-900">
                  {previewApplicant.background_info?.street_address}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Barangay
                </span>
                <span className="text-gray-900">
                  {previewApplicant.background_info?.barangay}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  City/Municipality
                </span>
                <span className="text-gray-900">
                  {previewApplicant.background_info?.barangay_details?.city_name}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Province
                </span>
                <span className="text-gray-900">
                  {previewApplicant.background_info?.barangay_details?.province_name}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </span>
                <span className="text-gray-900">{previewApplicant.contact_number}</span>
              </div>
            </div>
          </div>

          {/* Assistance Details */}
          <div>
            <h3 className="text-xl font-medium text-gray-800 mb-4">Assistance Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Assistance Type
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {previewApplicant.type_of_assistance}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Applicant Type
                </span>
                <span className="text-gray-900">{previewApplicant.applicant_type}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Date Filled
                </span>
                <span className="text-gray-900">
                  {formatPreviewDate(previewApplicant.date_filled)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Valid ID Presented
                </span>
                <span className="text-gray-900">
                  {previewApplicant.valid_id_presented}
                  {previewApplicant.other_valid_id &&
                    ` (${previewApplicant.other_valid_id})`}
                </span>
              </div>
            </div>
          </div>

          {/* Representative Information */}
          {previewApplicant.representative && (
            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-4">
                Representative Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </span>
                  <span className="text-gray-900">
                    {previewApplicant.representative.background_info?.suffix || ""}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </span>
                  <span className="text-gray-900">
                    {previewApplicant.representative.relationship}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </span>
                  <span className="text-gray-900">
                    {previewApplicant.representative.background_info?.street_address},{" "}
                    {previewApplicant.representative.background_info?.barangay},{" "}
                    {
                      previewApplicant.representative.background_info?.barangay_details
                        ?.city_name
                    }
                    ,{" "}
                    {
                      previewApplicant.representative.background_info?.barangay_details
                        ?.province_name
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={closePreviewView}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
