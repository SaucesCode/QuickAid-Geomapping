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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">Applicant Details</h2>
          <button
            onClick={closePreviewView}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Personal Information Table */}
          <section>
            <h3 className="text-xl font-medium text-gray-800 mb-4">Personal Information</h3>
            <table className="min-w-full border border-gray-200 rounded-lg text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left bg-gray-50 w-1/3">Full Name</th>
                  <td className="px-4 py-2">{fullName || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left bg-gray-50">Sex</th>
                  <td className="px-4 py-2">{background_info.sex || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left bg-gray-50">Birthday</th>
                  <td className="px-4 py-2">
                    {formatDate(background_info.birthday) || "N/A"}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left bg-gray-50">Civil Status</th>
                  <td className="px-4 py-2">{background_info.civil_status || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left bg-gray-50">Occupation</th>
                  <td className="px-4 py-2">
                    {background_info.occupation || "Not specified"}
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-2 text-left bg-gray-50">Monthly Income</th>
                  <td className="px-4 py-2">
                    {background_info.monthly_income
                      ? `₱${parseFloat(background_info.monthly_income).toLocaleString()}`
                      : "Not specified"}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Contact Information Table */}
          <section>
            <h3 className="text-xl font-medium text-gray-800 mb-4">Contact Information</h3>
            <table className="min-w-full border border-gray-200 rounded-lg text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left bg-gray-50 w-1/3">Street Address</th>
                  <td className="px-4 py-2">{background_info.street_address || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left bg-gray-50">Barangay</th>
                  <td className="px-4 py-2">{background_info.barangay || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left bg-gray-50">City/Municipality</th>
                  <td className="px-4 py-2">
                    {background_info.barangay_details?.city_name || "N/A"}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left bg-gray-50">Province</th>
                  <td className="px-4 py-2">
                    {background_info.barangay_details?.province_name || "N/A"}
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-2 text-left bg-gray-50">Contact Number</th>
                  <td className="px-4 py-2">{contact_number || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Assistance Details Table */}
          <section>
            <h3 className="text-xl font-medium text-gray-800 mb-4">Assistance Details</h3>
            <table className="min-w-full border border-gray-200 rounded-lg text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left bg-gray-50 w-1/3">Assistance Type</th>
                  <td className="px-4 py-2">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {type_of_assistance || "N/A"}
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left bg-gray-50">Applicant Type</th>
                  <td className="px-4 py-2">{applicant_type || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left bg-gray-50">Date Filled</th>
                  <td className="px-4 py-2">{formatDate(date_filled) || "N/A"}</td>
                </tr>
                <tr>
                  <th className="px-4 py-2 text-left bg-gray-50">Valid ID Presented</th>
                  <td className="px-4 py-2">
                    {valid_id_presented}
                    {other_valid_id && ` (${other_valid_id})`}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Representative Information Table */}
          {representative && (
            <section>
              <h3 className="text-xl font-medium text-gray-800 mb-4">
                Representative Information
              </h3>
              <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left bg-gray-50 w-1/3">Full Name</th>
                    <td className="px-4 py-2">{repFullName || "N/A"}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left bg-gray-50">Relationship</th>
                    <td className="px-4 py-2">{repInfo.relationship || "N/A"}</td>
                  </tr>
                  <tr>
                    <th className="px-4 py-2 text-left bg-gray-50">Address</th>
                    <td className="px-4 py-2">{repFullAddress || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

          {/* Application History Table */}
          <section>
            <h3 className="text-xl font-medium text-gray-800 mb-4">Application History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left w-12">#</th>
                    <th className="px-4 py-2 text-left">Type of Assistance</th>
                    <th className="px-4 py-2 text-left">Date Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {application_history && application_history.length > 0 ? (
                    application_history.map((h, index) => (
                      <tr key={h.id} className="border-t border-gray-200">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{h.type_of_assistance}</td>
                        <td className="px-4 py-2">{formatDate(h.date)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-4 text-center text-gray-500 italic">
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
            <h3 className="text-xl font-medium text-gray-800 mb-4">Approvals</h3>
            <p className="mb-2">
              <span className="font-semibold">Times Approved:</span>{" "}
              {previewApplicant.approval_count || 0}
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left w-12">#</th>
                    <th className="px-4 py-2 text-left">Approved At</th>
                    <th className="px-4 py-2 text-left">Approved By</th>
                    <th className="px-4 py-2 text-left">Batch File</th>
                    <th className="px-4 py-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {previewApplicant.approvals && previewApplicant.approvals.length > 0 ? (
                    previewApplicant.approvals.map((a, index) => (
                      <tr key={a.id} className="border-t border-gray-200">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{formatDate(a.approved_at)}</td>
                        <td className="px-4 py-2">{a.approved_by || "N/A"}</td>
                        <td className="px-4 py-2">{a.batch_file || "N/A"}</td>
                        <td className="px-4 py-2">{a.notes || "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-4 text-center text-gray-500 italic">
                        No approvals found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
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
