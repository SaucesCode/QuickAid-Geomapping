import React, { useState } from "react";
import "./MultiStepForm.css";

const AddressDropdown = ({ onSelect }) => {
  const [selectedCity, setSelectedCity] = useState("");
  const [barangays, setBarangays] = useState([]);

  const cities = [
    { name: "Lucena City", code: "045624000" },
    { name: "Sariaya, Quezon", code: "045645000" },
    { name: "Candelaria, Quezon", code: "045608000" },
    { name: "Tiaong, Quezon", code: "045648000" },
    { name: "San Antonio, Quezon", code: "045641000" },
    { name: "Dolores, Quezon", code: "045615000" },
  ];

  const handleCityChange = async e => {
    const code = e.target.value;
    const city = cities.find(city => city.code === code);
    setSelectedCity(code);
    onSelect("city_municipality", city.name);

    try {
      const response = await fetch(
        `https://psgc.gitlab.io/api/cities-municipalities/${code}/barangays/`
      );
      const data = await response.json();
      console.log("Fetched barangays:", data);

      const processedBarangays = data.map(brgy => ({
        ...brgy,
        name: brgy.name.replace(" (Pob.)", "").trim(),
      }));

      setBarangays(processedBarangays);
    } catch (error) {
      console.error("Error fetching barangays:", error);
    }
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
          onChange={e => onSelect("province", e.target.value)}
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
          onChange={e => onSelect("barangay", e.target.value)}
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
