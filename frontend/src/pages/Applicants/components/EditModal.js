import { X, User, MapPin, FileText, Users } from "lucide-react";
import AddressDropdown from "../../forms/AddressDropdown";
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
    // Modal Container
    <div
      className={clsx(
        "fixed top-0 bottom-0 right-0 bg-gray-900/70 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-12 transition-all duration-300",
        {
          "left-[80px]": isSidebarMinimized, // when minimized (Modal is WIDE)
          "left-[240px]": !isSidebarMinimized, // when expanded (Modal is NARROW)
        }
      )}
    >
      {/* Modal Wrapper */}
      <div 
        className={clsx(
          "bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col transform transition-all duration-300 max-h-full",
          {
            "max-w-7xl": isSidebarMinimized, // WIDE
            "max-w-4xl": !isSidebarMinimized, // NARROW
          }
        )}
      >
        
        {/* Header (Already Blue) */}
        <div className="sticky top-0 bg-blue-800 px-6 py-4 flex items-center justify-between shadow-xl z-10 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide truncate pr-4"> 
            Edit Applicant
          </h2>
          <button
            onClick={closeEditView}
            className="p-2 text-white hover:bg-blue-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/80 flex-shrink-0"
            aria-label="Close edit modal"
          >
            <X className="w-6 h-6" /> 
          </button>
        </div>
        
        {/* Scrollable Content Area (Light Blue Background) */}
        <div className="overflow-y-auto flex-grow bg-blue-50/50">
          <div className="p-6 md:p-8">
            <form id="edit-applicant-form" onSubmit={handleSave} noValidate>
              <div className="space-y-8">
                
                {/* Personal Information Section */}
                <section className="bg-white border border-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                  {/* Title (Dark Blue) */}
                  <div className="flex items-center gap-3 mb-5 sm:mb-6 border-b pb-3 mb-4 border-blue-300/70">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-900">
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
                        placeholder: "First Name"
                      },
                      {
                        label: "Middle Initial",
                        name: "middle_initial",
                        type: "text",
                        value: editingApplicant.background_info?.middle_initial || "",
                        placeholder: "Middle Name"
                      },
                      {
                        label: "Last Name",
                        name: "last_name",
                        type: "text",
                        value: editingApplicant.background_info?.last_name || "",
                        placeholder: "Last Name"
                      },
                    ].map(({ label, name, type, value, placeholder }) => (
                      <div key={name} className="space-y-1.5">
                        {/* Label: Dark Blue text */}
                        <label htmlFor={name} className="block text-sm font-semibold text-blue-800">
                          {label}
                        </label>
                        <input
                          id={name}
                          name={name}
                          type={type}
                          value={value}
                          onChange={handleChange}
                          placeholder={placeholder}
                          // Input: Blue focus ring and blue hover border
                          className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white text-gray-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
                        />
                      </div>
                    ))}

                    <div className="space-y-1.5">
                      {/* Label: Dark Blue text */}
                      <label htmlFor="suffix" className="block text-sm font-semibold text-blue-800">
                        Suffix
                      </label>
                      <select
                        id="suffix"
                        name="suffix"
                        value={editingApplicant.background_info?.suffix || ""}
                        onChange={handleChange}
                        // Select: Blue focus ring and blue hover border
                        className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
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
                      {/* Label: Dark Blue text */}
                      <label htmlFor="sex" className="block text-sm font-semibold text-blue-800">
                        Sex
                      </label>
                      <select
                        id="sex"
                        name="sex"
                        value={editingApplicant.background_info?.sex || ""}
                        onChange={handleChange}
                        // Select: Blue focus ring and blue hover border
                        className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
                      >
                        <option value=""disabled>Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      {/* Label: Dark Blue text */}
                      <label htmlFor="civil_status" className="block text-sm font-semibold text-blue-800">
                        Civil Status
                      </label>
                      <select
                        id="civil_status"
                        name="civil_status"
                        value={editingApplicant.background_info?.civil_status || ""}
                        onChange={handleChange}
                        // Select: Blue focus ring and blue hover border
                        className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
                      >
                        <option value=""disabled>Select Civil Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Contact and Address Information Section */}
                <section className="bg-white border border-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                  {/* Title (Dark Blue) */}
                  <div className="flex items-center gap-3 mb-5 sm:mb-6 border-b pb-3 mb-4 border-blue-300/70">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-900">
                      Contact Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-5 sm:mb-6">
                    <div className="space-y-1.5">
                      {/* Label: Dark Blue text */}
                      <label htmlFor="contact_number" className="block text-sm font-semibold text-blue-800">
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
                        // Input: Blue focus ring and blue hover border, light blue placeholder
                        className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white text-gray-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
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
                    {/* Label: Dark Blue text */}
                    <label htmlFor="street_address" className="block text-sm font-semibold text-blue-800">
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
                      // Input: Blue focus ring and blue hover border, light blue placeholder
                      className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white text-gray-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
                    />
                  </div>
                </section>

                {/* Assistance Information Section */}
                <section className="bg-white border border-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                  {/* Title (Dark Blue) */}
                  <div className="flex items-center gap-3 mb-5 sm:mb-6 border-b pb-3 mb-4 border-blue-300/70">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-900">
                      Assistance Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                    <div className="space-y-1.5">
                      {/* Label: Dark Blue text */}
                      <label htmlFor="type_of_assistance" className="block text-sm font-semibold text-blue-800">
                        Type of Assistance
                      </label>
                      <select
                        id="type_of_assistance"
                        name="type_of_assistance"
                        value={editingApplicant.type_of_assistance || ""}
                        onChange={handleChange}
                        // Select: Blue focus ring and blue hover border
                        className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
                      >
                        <option value=""disabled>Select Type of Assistance</option>
                        <option value="Medical">Medical</option>
                        <option value="Burial">Burial</option>
                        <option value="Educational">Educational</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      {/* Label: Dark Blue text */}
                      <label htmlFor="valid_id_presented" className="block text-sm font-semibold text-blue-800">
                        Valid ID Presented
                      </label>
                      <select
                        id="valid_id_presented"
                        name="valid_id_presented"
                        value={editingApplicant?.valid_id_presented || ""}
                        onChange={handleChange}
                        // Select: Blue focus ring and blue hover border
                        className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
                      >
                        <option value=""disabled>Select Valid ID</option>
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
                        {/* Label: Dark Blue text */}
                        <label htmlFor="other_valid_id" className="block text-sm font-semibold text-blue-800">
                          Specify Other ID
                        </label>
                        <input
                          id="other_valid_id"
                          name="other_valid_id"
                          type="text"
                          value={editingApplicant?.other_valid_id || ""}
                          onChange={handleChange}
                          placeholder="Specify other valid ID"
                          // Input: Blue focus ring and blue hover border, light blue placeholder
                          className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white text-gray-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* Representative Information Section */}
                {editingApplicant.representative && (
                  <section className="bg-white border border-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                    {/* Title (Dark Blue) */}
                    <div className="flex items-center gap-3 mb-5 sm:mb-6 border-b pb-3 mb-4 border-blue-300/70">
                      <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-blue-900">
                        Representative Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                      <div className="space-y-1.5">
                        {/* Label: Dark Blue text */}
                        <label htmlFor="rep_relationship" className="block text-sm font-semibold text-blue-800">
                          Relationship to Applicant
                        </label>
                        <input
                          id="rep_relationship"
                          name="rep_relationship"
                          type="text"
                          value={editingApplicant.representative.relationship || ""}
                          onChange={handleChange}
                          placeholder="Enter relationship"
                          // Input: Blue focus ring and blue hover border
                          className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white text-gray-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
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
                          {/* Label: Dark Blue text */}
                          <label htmlFor={name} className="block text-sm font-semibold text-blue-800">
                            {label}
                          </label>
                          <input
                            id={name}
                            name={name}
                            type="text"
                            value={value}
                            onChange={handleChange}
                            // Input: Blue focus ring and blue hover border
                            className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
                          />
                        </div>
                      ))}
                      <div className="space-y-1.5">
                        {/* Label: Dark Blue text */}
                        <label htmlFor="rep_bg_suffix" className="block text-sm font-semibold text-blue-800">
                          Suffix (Rep.)
                        </label>
                        <select
                          id="rep_bg_suffix"
                          name="rep_bg_suffix"
                          value={editingApplicant.representative.background_info?.suffix || ""}
                          onChange={handleChange}
                          // Select: Blue focus ring and blue hover border
                          className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
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
                        {/* Label: Dark Blue text */}
                        <label htmlFor="rep_bg_sex" className="block text-sm font-semibold text-blue-800">
                          Sex (Rep.)
                        </label>
                        <select
                          id="rep_bg_sex"
                          name="rep_bg_sex"
                          value={editingApplicant.representative.background_info?.sex || ""}
                          onChange={handleChange}
                          // Select: Blue focus ring and blue hover border
                          className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
                        >
                          <option value=""disabled>Select Sex</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        {/* Label: Dark Blue text */}
                        <label htmlFor="rep_bg_civil_status" className="block text-sm font-semibold text-blue-800">
                          Civil Status (Rep.)
                        </label>
                        <select
                          id="rep_bg_civil_status"
                          name="rep_bg_civil_status"
                          value={
                            editingApplicant.representative.background_info?.civil_status || ""
                          }
                          onChange={handleChange}
                          // Select: Blue focus ring and blue hover border
                          className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
                        >
                          <option value=""disabled>Select Civil Status</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Widowed">Widowed</option>
                          <option value="Separated">Separated</option>
                          <option value="Divorced">Divorced</option>
                        </select>
                      </div>
                      <div className="lg:col-span-4 md:col-span-2 space-y-1.5">
                        {/* Label: Dark Blue text */}
                        <label htmlFor="rep_bg_street_address" className="block text-sm font-semibold text-blue-800">
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
                          // Input: Blue focus ring and blue hover border
                          className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white text-gray-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
                        />
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </form>
          </div>
        </div>
        
        {/* Footer (Monochromatic Blue Buttons) */}
        <div className="sticky bottom-0 bg-white border-t border-blue-200 px-6 py-4 flex justify-end shadow-inner z-10 flex-shrink-0">
          <button
            type="button"
            onClick={closeEditView}
            // Cancel Button: White background, Blue text/border, Light blue hover/focus
            className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-blue-50 text-blue-700 font-semibold rounded-lg border-2 border-blue-300 hover:border-blue-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 shadow-sm mr-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-applicant-form"
            // Save Button: Dark Blue background
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg transition-colors shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300/50"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;