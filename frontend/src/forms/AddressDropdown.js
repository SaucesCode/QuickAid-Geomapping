import React, { useState, useEffect } from "react";
import "./MultiStepForm.css";

// Hard‑coded list of six Quezon cities / municipalities your UI supports
const CITY_OPTIONS = [
  { name: "Lucena City", code: "045624000" },
  { name: "Sariaya", code: "045645000" },
  { name: "Candelaria", code: "045608000" },
  { name: "Tiaong", code: "045648000" },
  { name: "San Antonio", code: "045641000" },
  { name: "Dolores", code: "045615000" },
];

const PSGC_BASE = "https://psgc.gitlab.io/api";

const AddressDropdown = ({ onSelect, initialValues = {} }) => {
  /* ----------------------- State ----------------------- */
  const [selectedCityCode, setSelectedCityCode] = useState(
    initialValues.city_municipalityCode || ""
  );
  const [barangays, setBarangays] = useState([]); // array of {code,name}
  const [selectedBrgyCode, setSelectedBrgyCode] = useState(initialValues.barangay || "");
  //
  /* -------------------- Side effects ------------------- */
  // When component mounts OR initial values change (edit mode), fetch brgys.
  useEffect(() => {
    if (selectedCityCode) {
      fetchBarangays(selectedCityCode);
    }
  }, [selectedCityCode]);

  /* ------------------- Helper funcs -------------------- */
  const fetchBarangays = async cityCode => {
    try {
      const res = await fetch(`${PSGC_BASE}/cities-municipalities/${cityCode}/barangays/`);
      if (!res.ok) throw new Error("Failed brgy request");
      const data = await res.json();
      // Remove "(Pob.)" suffixes for cleaner display
      const formatted = data.map(b => ({
        code: b.code,
        name: b.name.replace(/ \(Pob\.\)/i, "").trim(),
      }));
      setBarangays(formatted);
    } catch (err) {
      console.error("Error fetching barangays:", err);
      setBarangays([]);
    }
  };

  /* ------------------- Event handlers ------------------ */
  const handleCityChange = e => {
    const code = e.target.value;
    setSelectedCityCode(code);

    // Get readable name from lookup
    const cityObj = CITY_OPTIONS.find(c => c.code === code) || {};

    // Notify parent of both code & name
    onSelect("city_municipalityCode", code);
    onSelect("city_municipality", cityObj.name || "");

    // Reset barangay selection whenever city changes
    setSelectedBrgyCode("");
    onSelect("barangay", "");
    onSelect("barangay_name", "");
  };

  const handleBarangayChange = e => {
    const code = e.target.value;
    setSelectedBrgyCode(code);

    // Find selected barangay readable name
    const brgyObj = barangays.find(b => b.code === code) || {};

    // Return both code and human name
    onSelect("barangay", code);
    onSelect("barangay_name", brgyObj.name || "");
  };

  /* ---------------------- Render ----------------------- */
  return (
    <div className="address-dropdown-container">
      {/* Province is fixed to Quezon */}
      <div className="form-group">
        <label htmlFor="province">
          Province <span className="required">*</span>
        </label>
        <select id="province" className="form-control" value="Quezon" disabled>
          <option value="Quezon">Quezon</option>
        </select>
      </div>

      {/* City / Municipality */}
      <div className="form-group">
        <label htmlFor="city_municipality">
          City / Municipality <span className="required">*</span>
        </label>
        <select
          id="city_municipality"
          className="form-control"
          value={selectedCityCode}
          onChange={handleCityChange}
          required
        >
          <option value="">Select City or Municipality</option>
          {CITY_OPTIONS.map(c => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Barangay */}
      <div className="form-group">
        <label htmlFor="barangay">
          Barangay <span className="required">*</span>
        </label>
        <select
          id="barangay"
          className="form-control"
          value={selectedBrgyCode}
          onChange={handleBarangayChange}
          disabled={!selectedCityCode}
          required
        >
          <option value="">Select Barangay</option>
          {barangays.map(b => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AddressDropdown;
