import React, { useState } from "react";

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
    <div className="grid gap-4">
      <div>
        <label>Province:</label>
        <select
          defaultValue="Quezon"
          onChange={e => onSelect("province", e.target.value)}
          required
          disabled
        >
          <option value="Quezon">Quezon</option>
        </select>
      </div>
      <div>
        <label>City / Municipality:</label>
        <select value={selectedCity} onChange={handleCityChange} required>
          <option value="">Select City or Municipality</option>
          {cities.map(city => (
            <option key={city.code} value={city.code}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Barangay:</label>
        <select onChange={e => onSelect("barangay", e.target.value)} required>
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
