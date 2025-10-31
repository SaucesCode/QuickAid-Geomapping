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

  // This determines the modal's state (wide/narrow)
  const { isSidebarMinimized } = useOutletContext();

  // --- Start of FINAL FIX Logic ---
  const DataRow = ({ label, value }) => {
    const isLongLabel = label === "City/Municipality";

    // Standard width split (1/3 label, 2/3 value)
    let labelWidthClass = "sm:w-1/3 min-w-[120px]";
    let valueWidthClass = "sm:w-2/3";
    let labelWrapClass = "whitespace-nowrap";
    let valuePositionClass = ""; // Used to push value text away from the label
    
    // Use pr-4 for all labels to create consistent spacing.
    const labelPaddingClass = "pr-4"; 
    
    // --- Special handling for the long label: City/Municipality ---
    if (isLongLabel) {
      // Use wider split (2/5 label, 3/5 value) for long labels
      labelWidthClass = "sm:w-2/5 min-w-[120px]";
      valueWidthClass = "sm:w-3/5";

      // If sidebar is MINIMIZED (Modal is WIDE) -> Show FULL text
      if (isSidebarMinimized) {
        labelWrapClass = "whitespace-normal"; 
        // 🚀 FIX: Add definite left padding to the value in the WIDE state
        valuePositionClass = "sm:pl-2"; 
      }
      
      // If sidebar is EXPANDED (Modal is NARROW) -> TRUNCATE the label
      if (!isSidebarMinimized) {
        labelWrapClass = "truncate";
        // Add a small left padding to the value in the NARROW state for safety
        valuePositionClass = "sm:pl-1";
      }
    }

    return (
      <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-blue-100 last:border-b-0">
        <div
          className={clsx(
            "font-medium text-blue-800 w-full mb-1 sm:mb-0", 
            labelWidthClass,
            labelWrapClass,
            labelPaddingClass
          )}
        >
          {label}
        </div>
        <div
          className={clsx(
            "text-blue-800 w-full break-words text-left font-normal", // Changed text-gray-700 to text-blue-800
            valueWidthClass,
            valuePositionClass // Applied conditionally to create space
          )}
        >
          {value || <span className="text-blue-400 italic">N/A</span>} {/* Changed text-gray-500 to text-blue-400 */}
        </div>
      </div>
    );
  };
  // --- End of FINAL FIX Logic ---

  const SectionCard = ({ title, children }) => (
    <div className="bg-white border border-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
      <h3 className="text-xl font-bold text-blue-900 border-b pb-3 mb-4 border-blue-300/70">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );

  return (
    <div
      className={clsx(
        // Changed bg-gray-900/70 to bg-blue-950/70 for monochromatic backdrop
        "fixed top-0 bottom-0 right-0 bg-blue-950/70 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-12 transition-all duration-300",
        {
          "left-[80px]": isSidebarMinimized, // Modal is WIDE
          "left-[240px]": !isSidebarMinimized, // Modal is NARROW
        }
      )}
    >
      <div
        className={clsx(
          "bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col transform transition-all duration-300 max-h-full",
          {
            "max-w-7xl": isSidebarMinimized, 
            "max-w-4xl": !isSidebarMinimized, 
          }
        )}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-blue-800 px-6 py-4 flex items-center justify-between shadow-xl z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide truncate pr-4"> 
            Applicant Preview
          </h2>
          <button
            onClick={closePreviewView}
            className="p-2 text-white hover:bg-blue-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/80 flex-shrink-0"
            aria-label="Close preview"
          >
            <X className="w-6 h-6" /> 
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-8 overflow-y-auto bg-blue-50/50">
          {/* Grid Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              
              {/* This is the fixed line */}
              <DataRow
                label="City/Municipality" 
                value={background_info.barangay_details?.city_name}
              />
              
              <DataRow
                label="Province"
                value={background_info.barangay_details?.province_name}
              />
              <DataRow label="Contact Number" value={contact_number} />
              <div className="hidden lg:block"></div> 
            </SectionCard>

            {/* Assistance Info */}
            <SectionCard title="Assistance Details">
              <DataRow
  label="Assistance Type"
  value={
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold shadow-sm
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
              <div className="hidden lg:block"></div>
              <div className="hidden lg:block"></div>
            </SectionCard>
          </div>

          {/* Representative Info */}
          {representative && (
            <SectionCard title="Representative Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                <DataRow label="Full Name" value={repFullName} />
                <DataRow label="Relationship" value={repInfo.relationship} />
                <div className="lg:col-span-1 sm:col-span-2">
                  <DataRow label="Address" value={repFullAddress} />
                </div>
              </div>
            </SectionCard>
          )}

          {/* Application History */}
          <section>
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              Application History
            </h3>
            <div className="overflow-x-auto rounded-xl shadow-lg border border-blue-200">
              <table className="min-w-full text-sm">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left w-12 font-semibold rounded-tl-xl">#</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Type of Assistance
                    </th>
                    <th className="px-4 py-3 text-left font-semibold rounded-tr-xl">
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
                            ? "bg-white hover:bg-blue-50/70 transition-colors border-b border-gray-100"
                            : "bg-blue-50 hover:bg-blue-100/70 transition-colors border-b border-gray-100"
                        }
                      >
                        <td className="px-4 py-3 text-blue-800">{index + 1}</td> {/* Changed text-gray-700 to text-blue-800 */}
                        <td className="px-4 py-3 text-blue-800">{h.type_of_assistance}</td> {/* Changed text-gray-700 to text-blue-800 */}
                        <td className="px-4 py-3 text-blue-800">{formatDate(h.date)}</td> {/* Changed text-gray-700 to text-blue-800 */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-4 py-4 text-center text-blue-400 italic bg-white" // Changed text-gray-500 to text-blue-400
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
            <h3 className="text-2xl font-bold text-blue-900 mb-4">Approvals</h3>
            <p className="mb-4 text-lg">
              <span className="font-semibold text-blue-800">Times Approved:</span>{" "}
              <span className="text-blue-900 font-bold"> {/* Changed text-gray-800 to text-blue-900 */}
                {previewApplicant.approval_count || 0}
              </span>
            </p>
            <div className="overflow-x-auto rounded-xl shadow-lg border border-blue-200">
              <table className="min-w-full text-sm">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left w-12 font-semibold rounded-tl-xl">#</th>
                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                      Approved At
                    </th>
                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                      Approved By
                    </th>
                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                      Batch File
                    </th>
                    <th className="px-4 py-3 text-left font-semibold rounded-tr-xl">Notes</th>
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
                            ? "bg-white hover:bg-blue-50/70 transition-colors border-b border-gray-100"
                            : "bg-blue-50 hover:bg-blue-100/70 transition-colors border-b border-gray-100"
                        }
                      >
                        <td className="px-4 py-3 text-blue-800">{index + 1}</td> {/* Changed text-gray-700 to text-blue-800 */}
                        <td className="px-4 py-3 text-blue-800 whitespace-nowrap"> {/* Changed text-gray-700 to text-blue-800 */}
                          {formatDate(a.approved_at)}
                        </td>
                        <td className="px-4 py-3 text-blue-800">{a.approved_by || "N/A"}</td> {/* Changed text-gray-700 to text-blue-800 */}
                        <td className="px-4 py-3 text-blue-800">{a.batch_file || "N/A"}</td> {/* Changed text-gray-700 to text-blue-800 */}
                        <td className="px-4 py-3 text-blue-800">{a.notes || "—"}</td> {/* Changed text-gray-700 to text-blue-800 */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-4 text-center text-blue-400 italic bg-white" // Changed text-gray-500 to text-blue-400
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
        <div className="sticky bottom-0 bg-white border-t border-blue-200 px-6 py-4 flex justify-end shadow-inner z-10">
          <button
            onClick={closePreviewView}
            className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg transition-colors shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300/50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;