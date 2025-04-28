// File: frontend/src/forms/AddressDropdown.js
import React, { useState, useEffect } from "react";
import "./MultiStepForm.css";

const AddressDropdown = ({ onSelect, initialValues }) => {
  const [selectedCity, setSelectedCity] = useState(initialValues?.city_municipalityCode || "");
  const [barangays, setBarangays] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState(initialValues?.barangay || "");

  const cities = [
    { name: "Lucena City", code: "045624000" },
    { name: "Sariaya, Quezon", code: "045645000" },
    { name: "Candelaria, Quezon", code: "045608000" },
    { name: "Tiaong, Quezon", code: "045648000" },
    { name: "San Antonio, Quezon", code: "045641000" },
    { name: "Dolores, Quezon", code: "045615000" },
  ];

  useEffect(() => {
    if (initialValues?.city_municipalityCode) {
      fetchBarangays(initialValues.city_municipalityCode);
    }
  }, [initialValues?.city_municipalityCode]);

  const fetchBarangays = async code => {
    try {
      const response = await fetch(
        `https://psgc.gitlab.io/api/cities-municipalities/${code}/barangays/`
      );
      const data = await response.json();
      const processedBarangays = data.map(brgy => ({
        ...brgy,
        name: brgy.name.replace(" (Pob.)", "").trim(),
      }));
      setBarangays(processedBarangays);
    } catch (error) {
      console.error("Error fetching barangays:", error);
    }
  };

  const handleCityChange = async e => {
    const code = e.target.value;
    setSelectedCity(code);
    const city = cities.find(city => city.code === code);
    // Use a single function to handle the onSelect calls
    handleAddressChange("city_municipality", city?.name || "");
    handleAddressChange("city_municipalityCode", code); // Store the code

    await fetchBarangays(code);
  };

  const handleBarangayChange = e => {
    const barangayName = e.target.value;
    setSelectedBarangay(barangayName);
    // Use a single function to handle the onSelect calls
    handleAddressChange("barangay", barangayName);
  };

  // Generic handler for address changes
  const handleAddressChange = (name, value) => {
    onSelect({ target: { name: name, value: value } });
  };

  return (
    <div className="address-dropdown-container">
      <div className="form-group">
        <label htmlFor="province">
          Province <span className="required">*</span>
        </label>
        <select
          id="province"
          className="form-control"
          defaultValue="Quezon"
          onChange={e => handleAddressChange("province", e.target.value)} // Use handleAddressChange
          required
          disabled
        >
          <option value="Quezon">Quezon</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="city_municipality">
          City / Municipality <span className="required">*</span>
        </label>
        <select
          id="city_municipality"
          className="form-control"
          value={selectedCity}
          onChange={handleCityChange}
          required
        >
          <option value="">Select City or Municipality</option>
          {cities.map(city => (
            <option key={city.code} value={city.code}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="barangay">
          Barangay <span className="required">*</span>
        </label>
        <select
          id="barangay"
          className="form-control"
          value={selectedBarangay}
          onChange={handleBarangayChange}
          required
        >
          <option value="">Select Barangay</option>
          {barangays.map(brgy => (
            <option key={brgy.code} value={brgy.name}>
              {brgy.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AddressDropdown;
