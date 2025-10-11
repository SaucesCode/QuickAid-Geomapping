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
      <div className="form-group">
        <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
          Province <span className="text-error">*</span>
        </label>
        <select
          id="province"
          className="select select-bordered w-full rounded-lg bg-gray-100 cursor-not-allowed"
          value="Quezon"
          disabled
        >
          <option value="Quezon">Quezon</option>
        </select>
      </div>

      <div className="form-group">
        <label
          htmlFor="city_municipality"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          City / Municipality <span className="text-error">*</span>
        </label>
        <select
          id="city_municipality"
          className="select select-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent"
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

      <div className="form-group">
        <label htmlFor="barangay" className="block text-sm font-medium text-gray-700 mb-1">
          Barangay <span className="text-error">*</span>
        </label>
        <select
          id="barangay"
          className="select select-bordered w-full rounded-lg focus:ring-2 focus:ring-quickaid-accent"
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
