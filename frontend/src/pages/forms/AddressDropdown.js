// File: frontend/src/forms/AddressDropdown.js
import React, { useState, useEffect } from "react";

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
  const [selectedCityCode, setSelectedCityCode] = useState("");
  const [barangays, setBarangays] = useState([]);
  const [selectedBrgyCode, setSelectedBrgyCode] = useState("");
  // Added new state for loading indicator
  const [isLoadingBrgys, setIsLoadingBrgys] = useState(false);

  useEffect(() => {
    if (!initialValues.city_municipality) return;

    // prevent re-trigger if already set
    if (selectedCityCode) return;

    const city = CITY_OPTIONS.find(c => c.name === initialValues.city_municipality);
    if (city) {
      setSelectedCityCode(city.code);
      onSelect("city_municipalityCode", city.code);
      onSelect("city_municipality", city.name);
    }
  }, [initialValues.city_municipality]);

  useEffect(() => {
    if (selectedCityCode) {
      fetchBarangays(selectedCityCode);
    }
  }, [selectedCityCode]);

  const fetchBarangays = async cityCode => {
    setIsLoadingBrgys(true); // START LOADING
    try {
      const res = await fetch(`${PSGC_BASE}/cities-municipalities/${cityCode}/barangays/`);
      if (!res.ok) throw new Error("Failed barangay request");
      const data = await res.json();
      const formatted = data.map(b => ({
        code: b.code,
        name: b.name.replace(/ \(Pob\.\)/i, "").trim(),
      }));
      setBarangays(formatted);

      if (initialValues.barangay) {
        const matchingBarangay = formatted.find(b => b.code === initialValues.barangay);
        if (matchingBarangay) {
          setSelectedBrgyCode(matchingBarangay.code);
          onSelect("barangay", matchingBarangay.code);
          onSelect("barangay_name", matchingBarangay.name);
        }
      }
    } catch (err) {
      console.error("Error fetching barangays:", err);
      setBarangays([]);
    } finally {
      setIsLoadingBrgys(false); // STOP LOADING
    }
  };

  const handleCityChange = e => {
    const code = e.target.value;
    setSelectedCityCode(code);

    const cityObj = CITY_OPTIONS.find(c => c.code === code) || {};

    onSelect("city_municipalityCode", code);
    onSelect("city_municipality", cityObj.name || "");

    setSelectedBrgyCode("");
    onSelect("barangay", "");
    onSelect("barangay_name", "");
  };

  const handleBarangayChange = e => {
    const code = e.target.value;
    setSelectedBrgyCode(code);

    const brgyObj = barangays.find(b => b.code === code) || {};

    onSelect("barangay", code);
    onSelect("barangay_name", brgyObj.name || "");
  };

  return (
    <div className="address-dropdown-container">
      {/* Province, City/Municipality, and Barangay: 3 Columns on md screen and up */}
      {/* Changed the outer structure to a grid for 3 columns instead of two separate sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Province */}
        <div className="form-group mb-4 md:mb-0">
          <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
            Province <span className="text-error">*</span>
          </label>
          <select
            id="province"
            // Changed input-lg to input-md for smaller box and font
            className="select select-bordered w-full rounded-lg cursor-not-allowed input input-md bg-white text-gray-700"
            value="Quezon"
            disabled
          >
            <option value="Quezon">Quezon</option>
          </select>
        </div>

        {/* City / Municipality */}
        <div className="form-group mb-4 md:mb-0">
          <label
            htmlFor="city_municipality"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            City / Municipality <span className="text-error">*</span>
          </label>
          <select
            id="city_municipality"
            // Changed input-lg to input-md for smaller box and font
            className="select select-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent input input-md bg-white text-gray-700"
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
        <div className="form-group mb-4">
          <label htmlFor="barangay" className="block text-sm font-medium text-gray-700 mb-1">
            Barangay <span className="text-error">*</span>
          </label>
          <select
            id="barangay"
            // Changed input-lg to input-md for smaller box and font
            className="select select-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent input input-md bg-white text-gray-700"
            value={selectedBrgyCode}
            onChange={handleBarangayChange}
            // Disable if no city is selected OR if barangays are loading
            disabled={!selectedCityCode || isLoadingBrgys}
            required
          >
            {/* Conditional option text */}
            <option value="">
              {isLoadingBrgys
                ? "Loading Barangays..."
                : !selectedCityCode
                  ? "Select City first"
                  : "Select Barangay"
              }
            </option>
            {barangays.map(b => (
              <option key={b.code} value={b.code}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AddressDropdown;