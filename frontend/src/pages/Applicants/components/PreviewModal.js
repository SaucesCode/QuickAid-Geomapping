import { X } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import clsx from "clsx";

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

  const { isSidebarMinimized } = useOutletContext();

  // REDESIGNED: DataRow component - Now fully stacked (label on top, value below)
  const DataRow = ({ label, value }) => {
    return (
      <div className="py-3 border-b border-blue-100 last:border-b-0">
        <div className="font-semibold text-blue-700 text-xs uppercase tracking-wide mb-1.5">
          {label}
        </div>
        <div className="text-gray-800 text-sm break-words">
          {value || <span className="text-gray-400 italic">N/A</span>}
        </div>
      </div>
    );
  };

  const SectionCard = ({ title, children, className }) => (
    <div
      className={clsx(
        "bg-white border border-blue-200 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5",
        className
      )}
    >
      <h3 className="text-lg font-bold text-blue-900 border-b pb-2.5 mb-3 border-blue-300/70">
        {title}
      </h3>
      <div className="space-y-0">{children}</div>
    </div>
  );

  return (
    <div
      className={clsx(
        "fixed top-0 bottom-0 right-0 bg-blue-950/70 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-12 transition-all duration-300",
        {
          "left-[80px]": isSidebarMinimized,
          "left-[240px]": !isSidebarMinimized,
        }
      )}
    >
      <div
        className={clsx(
          "bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col transform transition-all duration-300 max-h-full",
          {
            "max-w-[90%]": isSidebarMinimized,
            "max-w-5xl": !isSidebarMinimized,
          }
        )}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between shadow-lg z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide truncate pr-4">
            Applicant Preview
          </h2>
          <button
            onClick={closePreviewView}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/80 flex-shrink-0"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto bg-blue-50/30">
          {/* REDESIGNED: 2-Column Grid for section cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Personal Info */}
            <SectionCard title="Personal Information">
              <DataRow label="Full Name" value={fullName} />
              <DataRow label="Sex" value={background_info.sex} />
              <DataRow label="Birthday" value={formatDate(background_info.birthday)} />
              <DataRow label="Civil Status" value={background_info.civil_status} />
              <DataRow label="Occupation" value={background_info.occupation} />
              <DataRow
                label="Monthly Income"
                value={
                  background_info.monthly_income
                    ? `₱${parseFloat(background_info.monthly_income).toLocaleString()}`
                    : "Not specified"
                }
              />
            </SectionCard>

            {/* Contact Info */}
            <SectionCard title="Contact Information">
              <DataRow label="Street Address" value={background_info.street_address} />
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
            </SectionCard>

            {/* Assistance Info */}
            <SectionCard title="Assistance Details">
              <DataRow
                label="Assistance Type"
                value={
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold shadow-sm
                      ${
                        type_of_assistance?.toLowerCase() === "educational"
                          ? "bg-green-100 text-green-800"
                          : type_of_assistance?.toLowerCase() === "medical"
                          ? "bg-blue-100 text-blue-800"
                          : type_of_assistance?.toLowerCase() === "burial"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                  >
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
            </SectionCard>

            {/* Representative Info */}
            {representative && (
              <SectionCard title="Representative Information">
                <DataRow label="Full Name" value={repFullName} />
                <DataRow label="Relationship" value={repInfo.relationship} />
                <DataRow label="Address" value={repFullAddress} />
              </SectionCard>
            )}
          </div>

          {/* Application History */}
          <section>
            <h3 className="text-xl font-bold text-blue-900 mb-3">Application History</h3>
            <div className="overflow-x-auto rounded-xl shadow-md border border-blue-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-center w-16 font-semibold">#</th>
                    <th className="px-4 py-3 text-left font-semibold">Type of Assistance</th>
                    <th className="px-4 py-3 text-left font-semibold">Date Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {application_history && application_history.length > 0 ? (
                    application_history.map((h, index) => (
                      <tr key={h.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-3 text-blue-800 text-center font-medium">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-blue-800">{h.type_of_assistance}</td>
                        <td className="px-4 py-3 text-blue-800">{formatDate(h.date)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-4 py-6 text-center text-blue-400 italic bg-blue-50/30"
                      >
                        No history available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Approvals */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-blue-900">Approvals</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-bold">
                Total: {previewApplicant.approval_count || 0}
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl shadow-md border border-blue-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-center w-16 font-semibold">#</th>
                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                      Approved At
                    </th>
                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                      Approved By
                    </th>
                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                      Batch File
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {previewApplicant.approvals && previewApplicant.approvals.length > 0 ? (
                    previewApplicant.approvals.map((a, index) => (
                      <tr key={a.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-3 text-blue-800 text-center font-medium">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-blue-800 whitespace-nowrap">
                          {formatDate(a.approved_at)}
                        </td>
                        <td className="px-4 py-3 text-blue-800">{a.approved_by || "N/A"}</td>
                        <td className="px-4 py-3 text-blue-800">{a.batch_file || "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-6 text-center text-blue-400 italic bg-blue-50/30"
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
        <div className="sticky bottom-0 bg-white border-t border-blue-200 px-6 py-3 flex justify-end shadow-lg z-10">
          <button
            onClick={closePreviewView}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
