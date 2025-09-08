import { X } from "lucide-react";
import AddressDropdown from "../../forms/AddressDropdown";

const EditModal = ({
  editingApplicant,
  closeEditView,
  handleChange,
  handleSave,
  setEditingApplicant,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">Edit Applicant</h2>
          <button
            onClick={closeEditView}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close edit modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <form id="edit-applicant-form" onSubmit={handleSave} noValidate>
            <div className="space-y-6">
              {/* Personal Information */}
              <section>
                <h3 className="text-xl font-medium text-gray-800 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      label: "First Name",
                      name: "first_name",
                      type: "text",
                      value: editingApplicant.background_info?.first_name || "",
                    },
                    {
                      label: "Middle Initial",
                      name: "middle_initial",
                      type: "text",
                      value: editingApplicant.background_info?.middle_initial || "",
                    },
                    {
                      label: "Last Name",
                      name: "last_name",
                      type: "text",
                      value: editingApplicant.background_info?.last_name || "",
                    },
                  ].map(({ label, name, type, value }) => (
                    <div key={name}>
                      <label
                        htmlFor={name}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        {label}
                      </label>
                      <input
                        id={name}
                        name={name}
                        type={type}
                        value={value}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  ))}

                  {/* Suffix */}
                  <div>
                    <label
                      htmlFor="suffix"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Suffix
                    </label>
                    <select
                      id="suffix"
                      name="suffix"
                      value={editingApplicant.background_info?.suffix || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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

                  {/* Sex */}
                  <div>
                    <label
                      htmlFor="sex"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Sex
                    </label>
                    <select
                      id="sex"
                      name="sex"
                      value={editingApplicant.background_info?.sex || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Select Sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  {/* Civil Status */}
                  <div>
                    <label
                      htmlFor="civil_status"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Civil Status
                    </label>
                    <select
                      id="civil_status"
                      name="civil_status"
                      value={editingApplicant.background_info?.civil_status || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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

              {/* Contact Information */}
              <section>
                <h3 className="text-xl font-medium text-gray-800 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label
                      htmlFor="contact_number"
                      className="block text-sm font-medium text-gray-700 mb-1"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                <div>
                  <label
                    htmlFor="street_address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="street_address"
                    name="street_address"
                    value={editingApplicant.background_info?.street_address || ""}
                    onChange={handleChange}
                    required
                    placeholder="Enter your Street Address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </section>

              {/* Assistance Information */}
              <section>
                <h3 className="text-xl font-medium text-gray-800 mb-4">
                  Assistance Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="type_of_assistance"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Type of Assistance
                    </label>
                    <select
                      id="type_of_assistance"
                      name="type_of_assistance"
                      value={editingApplicant.type_of_assistance || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Select Type of Assistance</option>
                      <option value="Medical">Medical</option>
                      <option value="Burial">Burial</option>
                      <option value="Educational">Educational</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="valid_id_presented"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Valid ID Presented
                    </label>
                    <select
                      id="valid_id_presented"
                      name="valid_id_presented"
                      value={editingApplicant?.valid_id_presented || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                    <div>
                      <label
                        htmlFor="other_valid_id"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Specify Other ID
                      </label>
                      <input
                        id="other_valid_id"
                        name="other_valid_id"
                        value={editingApplicant?.other_valid_id || ""}
                        onChange={handleChange}
                        placeholder="Specify other valid ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Representative Information */}
              {editingApplicant.representative && (
                <section>
                  <h3 className="text-xl font-medium text-gray-800 mb-4">
                    Representative Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label
                        htmlFor="rep_relationship"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Relationship to Applicant
                      </label>
                      <input
                        id="rep_relationship"
                        name="rep_relationship"
                        type="text"
                        value={editingApplicant.representative.relationship || ""}
                        onChange={handleChange}
                        placeholder="Enter relationship to applicant"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    {[
                      {
                        label: "First Name",
                        name: "rep_bg_first_name",
                        value:
                          editingApplicant.representative.background_info?.first_name || "",
                      },
                      {
                        label: "Middle Initial",
                        name: "rep_bg_middle_initial",
                        value:
                          editingApplicant.representative.background_info?.middle_initial ||
                          "",
                      },
                      {
                        label: "Last Name",
                        name: "rep_bg_last_name",
                        value:
                          editingApplicant.representative.background_info?.last_name || "",
                      },
                    ].map(({ label, name, value }) => (
                      <div key={name}>
                        <label
                          htmlFor={name}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {label}
                        </label>
                        <input
                          id={name}
                          name={name}
                          type="text"
                          value={value}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                    <div>
                      <label
                        htmlFor="rep_bg_suffix"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Suffix
                      </label>
                      <select
                        id="rep_bg_suffix"
                        name="rep_bg_suffix"
                        value={editingApplicant.representative.background_info?.suffix || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                    <div>
                      <label
                        htmlFor="rep_bg_sex"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Sex
                      </label>
                      <select
                        id="rep_bg_sex"
                        name="rep_bg_sex"
                        value={editingApplicant.representative.background_info?.sex || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="rep_bg_civil_status"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Civil Status
                      </label>
                      <select
                        id="rep_bg_civil_status"
                        name="rep_bg_civil_status"
                        value={
                          editingApplicant.representative.background_info?.civil_status || ""
                        }
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">Select Civil Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label
                        htmlFor="rep_bg_street_address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Address
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </section>
              )}
            </div>
          </form>
        </div>
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            type="submit"
            form="edit-applicant-form"
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={closeEditView}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
