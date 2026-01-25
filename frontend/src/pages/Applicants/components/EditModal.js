import { X, User, MapPin, FileText, Users } from "lucide-react";
import AddressDropdown from "../../forms/AddressDropdown";
import { ASSISTANCE_TYPES } from "../../../utils/assistanceColors";
import clsx from "clsx";
import { useOutletContext } from "react-router-dom";

const EditModal = ({
  editingApplicant,
  closeEditView,
  handleChange,
  handleSave,
  setEditingApplicant,
}) => {
  const { isSidebarMinimized } = useOutletContext();

  return (
    // Modal Container - KEPT UNCHANGED
    <div
      className={clsx(
        "fixed top-0 bottom-0 right-0 bg-blue-950/70 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-12 transition-all duration-300",
        {
          "left-[80px]": isSidebarMinimized,
          "left-[240px]": !isSidebarMinimized,
        }
      )}
    >
      {/* Modal Wrapper */}
      <div
        className={clsx(
          "bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col transform transition-all duration-300 max-h-full",
          {
            "max-w-[90%]": isSidebarMinimized,
            "max-w-5xl": !isSidebarMinimized,
          }
        )}
      >
        {/* REDESIGNED: Header to match PreviewModal */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between shadow-lg z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide truncate pr-4">
            Edit Applicant
          </h2>
          <button
            onClick={closeEditView}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/80 flex-shrink-0"
            aria-label="Close edit modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* REDESIGNED: Scrollable Content Area */}
        <div className="overflow-y-auto flex-grow bg-blue-50/30">
          <div className="p-6 space-y-6">
            <form id="edit-applicant-form" onSubmit={handleSave} noValidate>
              {/* REDESIGNED: Single Column Stack - All sections stack vertically */}
              <div className="space-y-6">
                {/* REDESIGNED: Personal Information Section */}
                <section className="bg-white border border-blue-200 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5">
                  <div className="flex items-center gap-3 mb-5 border-b pb-3 border-blue-300/70">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-900">Personal Information</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        label: "First Name",
                        name: "first_name",
                        type: "text",
                        value: editingApplicant.background_info?.first_name || "",
                        placeholder: "First Name",
                      },
                      {
                        label: "Middle Initial",
                        name: "middle_initial",
                        type: "text",
                        value: editingApplicant.background_info?.middle_initial || "",
                        placeholder: "Middle Name",
                      },
                      {
                        label: "Last Name",
                        name: "last_name",
                        type: "text",
                        value: editingApplicant.background_info?.last_name || "",
                        placeholder: "Last Name",
                      },
                    ].map(({ label, name, type, value, placeholder }) => (
                      <div key={name} className="space-y-1.5">
                        <label
                          htmlFor={name}
                          className="block text-xs font-semibold text-blue-700 uppercase tracking-wide"
                        >
                          {label}
                        </label>
                        <input
                          id={name}
                          name={name}
                          type={type}
                          value={value}
                          onChange={handleChange}
                          placeholder={placeholder}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition-all hover:border-blue-400"
                        />
                      </div>
                    ))}

                    <div className="space-y-1.5">
                      <label
                        htmlFor="suffix"
                        className="block text-xs font-semibold text-blue-700 uppercase tracking-wide"
                      >
                        Suffix
                      </label>
                      <select
                        id="suffix"
                        name="suffix"
                        value={editingApplicant.background_info?.suffix || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition-all hover:border-blue-400"
                      >
                        <option value="">None</option>
                        <option value="Jr.">Jr.</option>
                        <option value="Sr.">Sr.</option>
                        <option value="I">I</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                        <option value="IV">IV</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="sex"
                        className="block text-xs font-semibold text-blue-700 uppercase tracking-wide"
                      >
                        Sex
                      </label>
                      <select
                        id="sex"
                        name="sex"
                        value={editingApplicant.background_info?.sex || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition-all hover:border-blue-400"
                      >
                        <option value="" disabled>
                          Select Sex
                        </option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="civil_status"
                        className="block text-xs font-semibold text-blue-700 uppercase tracking-wide"
                      >
                        Civil Status
                      </label>
                      <select
                        id="civil_status"
                        name="civil_status"
                        value={editingApplicant.background_info?.civil_status || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition-all hover:border-blue-400"
                      >
                        <option value="" disabled>
                          Select Civil Status
                        </option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* REDESIGNED: Contact and Address Information Section */}
                <section className="bg-white border border-blue-200 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5">
                  <div className="flex items-center gap-3 mb-5 border-b pb-3 border-blue-300/70">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-900">Contact Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact_number"
                        className="block text-xs font-semibold text-blue-700 uppercase tracking-wide"
                      >
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        id="contact_number"
                        name="contact_number"
                        value={editingApplicant.contact_number || ""}
                        onChange={handleChange}
                        required
                        placeholder="e.g. 09123456789"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition-all hover:border-blue-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <AddressDropdown
                        onSelect={(field, value) => {
                          console.log("AddressDropdown onSelect:", field, value); // Debug log

                          if (field === "city_municipality") {
                            setEditingApplicant(prev => ({
                              ...prev,
                              background_info: {
                                ...prev.background_info,
                                barangay_details: {
                                  ...prev.background_info.barangay_details,
                                  city_name: value,
                                },
                              },
                            }));
                          } else if (field === "barangay") {
                            // CRITICAL: Update the barangay field directly
                            setEditingApplicant(prev => ({
                              ...prev,
                              background_info: {
                                ...prev.background_info,
                                barangay: value, // This should be the PSGC code from dropdown
                              },
                            }));
                          }
                        }}
                        initialValues={{
                          barangay:
                            editingApplicant.background_info?.barangay_details?.psgc_code ||
                            editingApplicant.background_info?.barangay,
                          city_municipality:
                            editingApplicant.background_info?.barangay_details?.city_name,
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="street_address"
                      className="block text-xs font-semibold text-blue-700 uppercase tracking-wide"
                    >
                      Street Address (House No./Blk/Lot/Street Name)
                    </label>
                    <input
                      type="text"
                      id="street_address"
                      name="street_address"
                      value={editingApplicant.background_info?.street_address || ""}
                      onChange={handleChange}
                      required
                      placeholder="Enter your Street Address"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition-all hover:border-blue-400"
                    />
                  </div>
                </section>

                {/* REDESIGNED: Assistance Information Section */}
                <section className="bg-white border border-blue-200 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5">
                  <div className="flex items-center gap-3 mb-5 border-b pb-3 border-blue-300/70">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-900">Assistance Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="type_of_assistance"
                        className="block text-xs font-semibold text-blue-700 uppercase tracking-wide"
                      >
                        Type of Assistance
                      </label>
                      <select
                        id="type_of_assistance"
                        name="type_of_assistance"
                        value={editingApplicant.type_of_assistance || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition-all hover:border-blue-400"
                      >
                        <option value="" disabled>
                          Select Type of Assistance
                        </option>
                        {ASSISTANCE_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="valid_id_presented"
                        className="block text-xs font-semibold text-blue-700 uppercase tracking-wide"
                      >
                        Valid ID Presented
                      </label>
                      <select
                        id="valid_id_presented"
                        name="valid_id_presented"
                        value={editingApplicant?.valid_id_presented || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition-all hover:border-blue-400"
                      >
                        <option value="" disabled>
                          Select Valid ID
                        </option>
                        <option value="National ID">National ID</option>
                        <option value="Driver's License">Driver's License</option>
                        <option value="Voter's ID">Voter's ID</option>
                        <option value="Passport">Passport</option>
                        <option value="SSS ID">SSS ID</option>
                        <option value="GSIS ID">GSIS ID</option>
                        <option value="UMID">UMID</option>
                        <option value="PhilHealth ID">PhilHealth ID</option>
                        <option value="TIN ID">TIN ID</option>
                        <option value="Postal ID">Postal ID</option>
                        <option value="Senior Citizen ID">Senior Citizen ID</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    {editingApplicant?.valid_id_presented === "Others" && (
                      <div className="md:col-span-2 space-y-1.5">
                        <label
                          htmlFor="other_valid_id"
                          className="block text-xs font-semibold text-blue-700 uppercase tracking-wide"
                        >
                          Specify Other ID
                        </label>
                        <input
                          id="other_valid_id"
                          name="other_valid_id"
                          type="text"
                          value={editingApplicant?.other_valid_id || ""}
                          onChange={handleChange}
                          placeholder="Specify other valid ID"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition-all hover:border-blue-400"
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* REDESIGNED: Representative Information Section */}
                {editingApplicant.representative && (
                  <section className="bg-white border border-blue-200 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5">
                    <div className="flex items-center gap-3 mb-5 border-b pb-3 border-blue-300/70">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-blue-900">
                        Representative Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="rep_relationship"
                          className="block text-xs font-semibold text-blue-700 uppercase tracking-wide"
                        >
                          Relationship to Applicant
                        </label>
                        <input
                          id="rep_relationship"
                          name="rep_relationship"
                          type="text"
                          value={editingApplicant.representative.relationship || ""}
                          onChange={handleChange}
                          placeholder="Enter relationship"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition-all hover:border-blue-400"
                        />
                      </div>
                      {[
                        {
                          label: "First Name (Rep.)",
                          name: "rep_bg_first_name",
                          value:
                            editingApplicant.representative.background_info?.first_name || "",
                        },
                        {
                          label: "Middle Initial (Rep.)",
                          name: "rep_bg_middle_initial",
                          value:
                            editingApplicant.representative.background_info?.middle_initial ||
                            "",
                        },
                        {
                          label: "Last Name (Rep.)",
                          name: "rep_bg_last_name",
                          value:
                            editingApplicant.representative.background_info?.last_name || "",
                        },
                      ].map(({ label, name, value }) => (
                        <div key={name} className="space-y-1.5">
                          <label
                            htmlFor={name}
                            className="block text-xs font-semibold text-blue-700 uppercase tracking-wide"
                          >
                            {label}
                          </label>
                          <input
                            id={name}
                            name={name}
                            type="text"
                            value={value}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition-all hover:border-blue-400"
                          />
                        </div>
                      ))}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="rep_bg_suffix"
                          className="block text-xs font-semibold text-blue-700 uppercase tracking-wide"
                        >
                          Suffix (Rep.)
                        </label>
                        <select
                          id="rep_bg_suffix"
                          name="rep_bg_suffix"
                          value={editingApplicant.representative.background_info?.suffix || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition-all hover:border-blue-400"
                        >
                          <option value="">None</option>
                          <option value="Jr.">Jr.</option>
                          <option value="Sr.">Sr.</option>
                          <option value="I">I</option>
                          <option value="II">II</option>
                          <option value="III">III</option>
                          <option value="IV">IV</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="rep_bg_sex"
                          className="block text-xs font-semibold text-blue-700 uppercase tracking-wide"
                        >
                          Sex (Rep.)
                        </label>
                        <select
                          id="rep_bg_sex"
                          name="rep_bg_sex"
                          value={editingApplicant.representative.background_info?.sex || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition-all hover:border-blue-400"
                        >
                          <option value="" disabled>
                            Select Sex
                          </option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="rep_bg_civil_status"
                          className="block text-xs font-semibold text-blue-700 uppercase tracking-wide"
                        >
                          Civil Status (Rep.)
                        </label>
                        <select
                          id="rep_bg_civil_status"
                          name="rep_bg_civil_status"
                          value={
                            editingApplicant.representative.background_info?.civil_status || ""
                          }
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition-all hover:border-blue-400"
                        >
                          <option value="" disabled>
                            Select Civil Status
                          </option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Widowed">Widowed</option>
                          <option value="Separated">Separated</option>
                          <option value="Divorced">Divorced</option>
                        </select>
                      </div>
                      <div className="lg:col-span-4 md:col-span-2 space-y-1.5">
                        <label
                          htmlFor="rep_bg_street_address"
                          className="block text-xs font-semibold text-blue-700 uppercase tracking-wide"
                        >
                          Full Address (Rep.)
                        </label>
                        <input
                          id="rep_bg_street_address"
                          name="rep_bg_street_address"
                          type="text"
                          value={
                            editingApplicant.representative.background_info?.street_address ||
                            ""
                          }
                          onChange={handleChange}
                          placeholder="Enter Full Address"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-300 focus:border-blue-600 transition-all hover:border-blue-400"
                        />
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* REDESIGNED: Footer with Design System Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-blue-200 px-6 py-3 flex justify-end gap-3 shadow-lg z-10">
          <button
            type="button"
            onClick={closeEditView}
            className="px-6 py-2 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold transition-all text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-applicant-form"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
