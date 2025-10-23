import { X } from "lucide-react";

const PreviewModal = ({ previewApplicant, closePreviewView, formatDate }) => {
  const {
    background_info = {},
    contact_number,
    type_of_assistance,
    applicant_type,
    date_filled,
    valid_id_presented,
    other_valid_id,
    representative,
    application_history,
  } = previewApplicant;

  const repInfo = representative || {};
  const repBackground = repInfo.background_info || {};

  const fullName = `${background_info.first_name || ""} ${
    background_info.middle_initial ? background_info.middle_initial + "." : ""
  } ${background_info.last_name || ""} ${background_info.suffix || ""}`.trim();

  const repFullName = `${repBackground.first_name || ""} ${
    repBackground.middle_initial ? repBackground.middle_initial + "." : ""
  } ${repBackground.last_name || ""} ${repBackground.suffix || ""}`.trim();

  const repFullAddress = `${repBackground.street_address || ""}, ${
    repBackground.barangay || ""
  }, ${repBackground.barangay_details?.city_name || ""}, ${
    repBackground.barangay_details?.province_name || ""
  }`;

  // Custom component for a data row to reduce repetition and ensure consistent styling
  const DataRow = ({ label, value }) => (
    // Stack label and value on mobile, switch to side-by-side on small screens and up
    <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-blue-50/50 last:border-b-0">
      <div className="font-semibold text-blue-700 w-full sm:w-1/3 min-w-[120px] pr-2 mb-1 sm:mb-0 text-left">
        {label}
      </div>
      <div className="text-gray-800 w-full sm:w-2/3 break-words text-left">
        {value || "N/A"}
      </div>
    </div>
  );

  // Custom component for a data section/card
  const SectionCard = ({ title, children }) => (
    <div className="bg-white border border-blue-100 rounded-xl shadow-lg p-5 sm:p-6 transition-shadow hover:shadow-xl">
      <h3 className="text-xl font-extrabold text-blue-800 border-b pb-3 mb-4 border-blue-200">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );

  return (
    // Centered fixed modal background
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden flex flex-col transition-transform duration-300 transform scale-100">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-blue-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-lg z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white truncate pr-4">
            Applicant Details
          </h2>
          <button
            onClick={closePreviewView}
            className="p-2 text-white hover:bg-blue-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close preview"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body (Scrollable Content) */}
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 overflow-y-auto">
          {/* Main Information: Responsive Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Personal Information */}
            <SectionCard title="Personal Information">
              <DataRow label="Full Name" value={fullName} />
              <DataRow label="Sex" value={background_info.sex} />
              <DataRow
                label="Birthday"
                value={formatDate(background_info.birthday)}
              />
              <DataRow
                label="Civil Status"
                value={background_info.civil_status}
              />
              <DataRow label="Occupation" value={background_info.occupation} />
              <DataRow
                label="Monthly Income"
                value={
                  background_info.monthly_income
                    ? `₱${parseFloat(
                        background_info.monthly_income
                      ).toLocaleString()}`
                    : "Not specified"
                }
              />
            </SectionCard>

            {/* Contact Information */}
            <SectionCard title="Contact Information">
              <DataRow
                label="Street Address"
                value={background_info.street_address}
              />
              <DataRow label="Barangay" value={background_info.barangay} />
              <DataRow
                label="City/Municipality"
                value={background_info.barangay_details?.city_name}
              />
              <DataRow
                label="Province"
                value={background_info.barangay_details?.province_name}
              />
              <DataRow label="Contact Number" value={contact_number} />
              {/* Padding removed/simplified as DataRow handles space better now */}
              <div className="h-0 py-3 hidden xl:block"></div> 
            </SectionCard>

            {/* Assistance Details */}
            <SectionCard title="Assistance Details">
              <DataRow
                label="Assistance Type"
                value={
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 font-medium rounded-full text-sm">
                    {type_of_assistance || "N/A"}
                  </span>
                }
              />
              <DataRow label="Applicant Type" value={applicant_type} />
              <DataRow label="Date Filled" value={formatDate(date_filled)} />
              <DataRow
                label="Valid ID Presented"
                value={`${valid_id_presented || "N/A"} ${
                  other_valid_id ? ` (${other_valid_id})` : ""
                }`}
              />
              {/* Padding removed/simplified as DataRow handles space better now */}
              <div className="h-0 py-3 hidden xl:block"></div>
              <div className="h-0 py-3 hidden xl:block"></div>
            </SectionCard>
          </div>

          {/* Representative Information */}
          {representative && (
            <SectionCard title="Representative Information">
              {/* Switched to a flex wrap for small screens, then a grid for medium/large */}
              <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-8">
                <DataRow label="Full Name" value={repFullName} />
                <DataRow label="Relationship" value={repInfo.relationship} />
                <DataRow label="Address" value={repFullAddress} />
              </div>
            </SectionCard>
          )}

          {/* Application History Table */}
          <section>
            <h3 className="text-2xl font-bold text-blue-800 mb-4">
              Application History
            </h3>
            <div className="overflow-x-auto rounded-lg shadow-md border border-blue-200">
              <table className="min-w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-3 py-3 text-left w-12 text-blue-700 font-bold">
                      #
                    </th>
                    <th className="px-3 py-3 text-left text-blue-700 font-bold whitespace-nowrap">
                      Type of Assistance
                    </th>
                    <th className="px-3 py-3 text-left text-blue-700 font-bold whitespace-nowrap">
                      Date Applied
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {application_history && application_history.length > 0 ? (
                    application_history.map((h, index) => (
                      <tr
                        key={h.id}
                        className={
                          index % 2 === 0
                            ? "bg-white border-b border-gray-100"
                            : "bg-blue-50 border-b border-gray-100"
                        }
                      >
                        <td className="px-3 py-3 text-gray-700">{index + 1}</td>
                        <td className="px-3 py-3 text-gray-700">
                          {h.type_of_assistance}
                        </td>
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                          {formatDate(h.date)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-4 py-4 text-center text-gray-500 italic bg-white"
                      >
                        No history available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Approvals Section */}
          <section>
            <h3 className="text-2xl font-bold text-blue-800 mb-4">Approvals</h3>
            <p className="mb-4 text-base sm:text-lg">
              <span className="font-bold text-blue-700">Times Approved:</span>{" "}
              <span className="text-gray-800">
                {previewApplicant.approval_count || 0}
              </span>
            </p>

            <div className="overflow-x-auto rounded-lg shadow-md border border-blue-200">
              <table className="min-w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-3 py-3 text-left w-12 text-blue-700 font-bold">
                      #
                    </th>
                    <th className="px-3 py-3 text-left text-blue-700 font-bold whitespace-nowrap">
                      Approved At
                    </th>
                    <th className="px-3 py-3 text-left text-blue-700 font-bold whitespace-nowrap">
                      Approved By
                    </th>
                    <th className="px-3 py-3 text-left text-blue-700 font-bold whitespace-nowrap">
                      Batch File
                    </th>
                    <th className="px-3 py-3 text-left text-blue-700 font-bold">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {previewApplicant.approvals &&
                  previewApplicant.approvals.length > 0 ? (
                    previewApplicant.approvals.map((a, index) => (
                      <tr
                        key={a.id}
                        className={
                          index % 2 === 0
                            ? "bg-white border-b border-gray-100"
                            : "bg-blue-50 border-b border-gray-100"
                        }
                      >
                        <td className="px-3 py-3 text-gray-700">{index + 1}</td>
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                          {formatDate(a.approved_at)}
                        </td>
                        <td className="px-3 py-3 text-gray-700">
                          {a.approved_by || "N/A"}
                        </td>
                        <td className="px-3 py-3 text-gray-700">
                          {a.batch_file || "N/A"}
                        </td>
                        <td className="px-3 py-3 text-gray-700">
                          {a.notes || "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-4 text-center text-gray-500 italic bg-white"
                      >
                        No approvals found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-end shadow-inner z-10">
          <button
            onClick={closePreviewView}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;