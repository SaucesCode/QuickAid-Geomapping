import { X, User, MapPin, FileText, Users } from "lucide-react";
import AddressDropdown from "../../forms/AddressDropdown";
import clsx from "clsx";
import { useOutletContext } from "react-router-dom";

const EditModal = ({
  editingApplicant={editingApplicant},
  closeEditView,
  handleChange={handleChange},
  handleSave,
  setEditingApplicant,
}) => {
  const { isSidebarMinimized } = useOutletContext();
  return (
    // FIX 1: Overlap Fix (left-0 on mobile, left-[80px] on small screens and up to account for sidebar)
    // FIX 2: Added inset-y-0 to make sure it covers top/bottom properly
    <div
      className={clsx(
        "fixed inset-y-0 right-0 bg-gradient-to-br from-blue-900/40 via-slate-900/60 to-blue-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 md:p-6 animate-in fade-in duration-200 transition-all",
        {
          "left-[80px]": isSidebarMinimized, // when minimized
          "left-[240px]": !isSidebarMinimized, // when expanded
        }
      )}
    >
      {/* FIX 3: Changed max-w-7xl to max-w-5xl for a smaller box */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[96vh] flex flex-col transform transition-all">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex items-center justify-between shadow-lg rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Edit Applicant</h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">Update applicant information</p>
            </div>
          </div>
          <button
            onClick={closeEditView}
            className="group p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 hover:rotate-90 transform"
            aria-label="Close edit modal"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-grow">
          <div className="p-4 sm:p-6 lg:p-8">
            <form id="edit-applicant-form" onSubmit={handleSave} noValidate>
              <div className="space-y-6 sm:space-y-8">
                
                {/* Personal Information */}
                <section className="group bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-100 rounded-xl p-5 sm:p-6 lg:p-7 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5 sm:mb-6">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Personal Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                    {[
                      {
                        label: "First Name",
                        name: "first_name",
                        type: "text",
                        value: editingApplicant.background_info?.first_name || "",
                        placeholder: "Juan"
                      },
                      {
                        label: "Middle Initial",
                        name: "middle_initial",
                        type: "text",
                        value: editingApplicant.background_info?.middle_initial || "",
                        placeholder: "D"
                      },
                      {
                        label: "Last Name",
                        name: "last_name",
                        type: "text",
                        value: editingApplicant.background_info?.last_name || "",
                        placeholder: "Dela Cruz"
                      },
                    ].map(({ label, name, type, value, placeholder }) => (
                      <div key={name} className="space-y-1.5">
                        <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
                          {label}
                        </label>
                        <input
                          id={name}
                          name={name}
                          type={type}
                          value={value}
                          onChange={handleChange}
                          placeholder={placeholder}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
                        />
                      </div>
                    ))}

                    <div className="space-y-1.5">
                      <label htmlFor="suffix" className="block text-sm font-semibold text-gray-700">
                        Suffix
                      </label>
                      <select
                        id="suffix"
                        name="suffix"
                        value={editingApplicant.background_info?.suffix || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
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
                      <label htmlFor="sex" className="block text-sm font-semibold text-gray-700">
                        Sex
                      </label>
                      <select
                        id="sex"
                        name="sex"
                        value={editingApplicant.background_info?.sex || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
                      >
                        <option value="">Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="civil_status" className="block text-sm font-semibold text-gray-700">
                        Civil Status
                      </label>
                      <select
                        id="civil_status"
                        name="civil_status"
                        value={editingApplicant.background_info?.civil_status || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
                      >
                        <option value="">Select Civil Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Contact and Address Information */}
                <section className="group bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-100 rounded-xl p-5 sm:p-6 lg:p-7 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5 sm:mb-6">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Contact Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-5 sm:mb-6">
                    <div className="space-y-1.5">
                      <label htmlFor="contact_number" className="block text-sm font-semibold text-gray-700">
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <AddressDropdown
                        onSelect={(field, value) => {
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
                            setEditingApplicant(prev => ({
                              ...prev,
                              background_info: {
                                ...prev.background_info,
                                barangay: value,
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
                    <label htmlFor="street_address" className="block text-sm font-semibold text-gray-700">
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
                    />
                  </div>
                </section>

                {/* Assistance Information */}
                <section className="group bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-100 rounded-xl p-5 sm:p-6 lg:p-7 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5 sm:mb-6">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Assistance Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                    <div className="space-y-1.5">
                      <label htmlFor="type_of_assistance" className="block text-sm font-semibold text-gray-700">
                        Type of Assistance
                      </label>
                      <select
                        id="type_of_assistance"
                        name="type_of_assistance"
                        value={editingApplicant.type_of_assistance || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
                      >
                        <option value="">Select Type of Assistance</option>
                        <option value="Medical">Medical</option>
                        <option value="Burial">Burial</option>
                        <option value="Educational">Educational</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="valid_id_presented" className="block text-sm font-semibold text-gray-700">
                        Valid ID Presented
                      </label>
                      <select
                        id="valid_id_presented"
                        name="valid_id_presented"
                        value={editingApplicant?.valid_id_presented || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
                      >
                        <option value="">Select Valid ID</option>
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
                        <label htmlFor="other_valid_id" className="block text-sm font-semibold text-gray-700">
                          Specify Other ID
                        </label>
                        <input
                          id="other_valid_id"
                          name="other_valid_id"
                          type="text"
                          value={editingApplicant?.other_valid_id || ""}
                          onChange={handleChange}
                          placeholder="Specify other valid ID"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* Representative Information */}
                {editingApplicant.representative && (
                  <section className="group bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-100 rounded-xl p-5 sm:p-6 lg:p-7 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-5 sm:mb-6">
                      <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        Representative Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                      <div className="space-y-1.5">
                        <label htmlFor="rep_relationship" className="block text-sm font-semibold text-gray-700">
                          Relationship to Applicant
                        </label>
                        <input
                          id="rep_relationship"
                          name="rep_relationship"
                          type="text"
                          value={editingApplicant.representative.relationship || ""}
                          onChange={handleChange}
                          placeholder="Enter relationship"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
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
                          <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
                            {label}
                          </label>
                          <input
                            id={name}
                            name={name}
                            type="text"
                            value={value}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
                          />
                        </div>
                      ))}
                      <div className="space-y-1.5">
                        <label htmlFor="rep_bg_suffix" className="block text-sm font-semibold text-gray-700">
                          Suffix (Rep.)
                        </label>
                        <select
                          id="rep_bg_suffix"
                          name="rep_bg_suffix"
                          value={editingApplicant.representative.background_info?.suffix || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
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
                        <label htmlFor="rep_bg_sex" className="block text-sm font-semibold text-gray-700">
                          Sex (Rep.)
                        </label>
                        <select
                          id="rep_bg_sex"
                          name="rep_bg_sex"
                          value={editingApplicant.representative.background_info?.sex || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
                        >
                          <option value="">Select Sex</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="rep_bg_civil_status" className="block text-sm font-semibold text-gray-700">
                          Civil Status (Rep.)
                        </label>
                        <select
                          id="rep_bg_civil_status"
                          name="rep_bg_civil_status"
                          value={
                            editingApplicant.representative.background_info?.civil_status || ""
                          }
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
                        >
                          <option value="">Select Civil Status</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Widowed">Widowed</option>
                          <option value="Separated">Separated</option>
                          <option value="Divorced">Divorced</option>
                        </select>
                      </div>
                      <div className="lg:col-span-4 md:col-span-2 space-y-1.5">
                        <label htmlFor="rep_bg_street_address" className="block text-sm font-semibold text-gray-700">
                          Full Address (Rep.)
                        </label>
                        <input
                          id="rep_bg_street_address"
                          name="rep_bg_street_address"
                          type="text"
                          value={
                            editingApplicant.representative.background_info?.street_address || ""
                          }
                          onChange={handleChange}
                          placeholder="Enter Full Address"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400"
                        />
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </form>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end bg-gradient-to-r from-gray-50 to-blue-50/20 rounded-b-2xl flex-shrink-0">
          <button
            type="button"
            onClick={closeEditView}
            className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-applicant-form"
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:scale-105"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;