// import React, { useState } from "react";
// import { Filter, RotateCcw, MapPin, Building2, Tags, Search } from "lucide-react";
// import { useQuery } from "@tanstack/react-query";
// import { api } from "../../../services/api";

// const ApprovedFilter = ({ filters, onFilterChange }) => {
//   const [localFilters, setLocalFilters] = useState(filters);

//   // Fetch cities
//   const { data: cities = [], isFetching: isFetchingCities } = useQuery({
//     queryKey: ["citiesWithApplicants"],
//     queryFn: async () => {
//       const res = await api.get("/applicant-locations/filters/");
//       return res.data.cities || [];
//     },
//     staleTime: 1000 * 60 * 10,
//   });

//   // Fetch barangays for selected city
//   const { data: barangays = [], isFetching: isFetchingBarangays } = useQuery({
//     queryKey: ["barangaysByCity", localFilters.city],
//     queryFn: async () => {
//       if (!localFilters.city) return [];
//       const res = await api.get(`/applicant-locations/filters/?city=${localFilters.city}`);
//       return res.data.barangays || [];
//     },
//     enabled: !!localFilters.city,
//     staleTime: 1000 * 60 * 5,
//   });

//   const handleChange = (field, value) => {
//     setLocalFilters(prev => ({ ...prev, [field]: value }));
//     if (field === "city") {
//       setLocalFilters(prev => ({ ...prev, barangay: "" }));
//     }
//   };

//   const handleReset = () => {
//     const cleared = { city: "", barangay: "", type: "", search: "" };
//     setLocalFilters(cleared);
//     onFilterChange?.(cleared);
//   };

//   const handleApply = () => {
//     onFilterChange(localFilters);
//   };

//   return (
//     <div>
//       <div className="flex flex-wrap items-end gap-3">
//         {/* Search Bar */}
//         <div className="flex flex-col min-w-[200px] flex-1 max-w-[300px]">
//           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
//             <Search className="w-3 h-3" />
//             Search Name
//           </label>
//           <div className="relative">
//             <input
//               type="text"
//               value={localFilters.search || ""}
//               onChange={e => handleChange("search", e.target.value)}
//               placeholder="Search by name..."
//               className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-gray-700 hover:border-blue-400 placeholder:text-gray-400"
//             />
//             <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
//           </div>
//         </div>

//         {/* City */}
//         <FilterSelect
//           icon={MapPin}
//           label="City"
//           value={localFilters.city}
//           onChange={value => handleChange("city", value)}
//           disabled={isFetchingCities}
//         >
//           <option value="">{isFetchingCities ? "Loading..." : "All Cities"}</option>
//           {cities.map(city => (
//             <option key={city} value={city}>
//               {city}
//             </option>
//           ))}
//         </FilterSelect>

//         {/* Barangay */}
//         <FilterSelect
//           icon={Building2}
//           label="Barangay"
//           value={localFilters.barangay}
//           onChange={value => handleChange("barangay", value)}
//           disabled={!localFilters.city || isFetchingBarangays}
//         >
//           <option value="">
//             {localFilters.city
//               ? isFetchingBarangays
//                 ? "Loading..."
//                 : "All Barangays"
//               : "Select City First"}
//           </option>
//           {barangays.map(b => (
//             <option key={b} value={b}>
//               {b}
//             </option>
//           ))}
//         </FilterSelect>

//         {/* Assistance Type */}
//         <FilterSelect
//           icon={Tags}
//           label="Assistance Type"
//           value={localFilters.type}
//           onChange={value => handleChange("type", value)}
//         >
//           <option value="">All Types</option>
//           <option value="Medical">Medical</option>
//           <option value="Educational">Educational</option>
//           <option value="Burial">Burial</option>
//         </FilterSelect>

//         {/* Buttons */}
//         <div className="flex gap-2 ml-auto">
//           <button
//             onClick={handleReset}
//             className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-all hover:shadow-sm active:scale-[0.98] border border-gray-200"
//           >
//             <RotateCcw className="w-3.5 h-3.5" />
//             Reset
//           </button>
//           <button
//             onClick={handleApply}
//             className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white hover:bg-[#003a76] rounded-lg text-sm font-semibold transition-all hover:shadow-md active:scale-[0.98] shadow-sm"
//           >
//             <Filter className="w-3.5 h-3.5" />
//             Apply
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const FilterSelect = ({ icon: Icon, label, value, onChange, disabled, children }) => (
//   <div className="flex flex-col min-w-[140px]">
//     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
//       {Icon && <Icon className="w-3 h-3" />}
//       {label}
//     </label>
//     <div className="relative">
//       <select
//         value={value}
//         onChange={e => onChange(e.target.value)}
//         disabled={disabled}
//         className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-gray-700 hover:border-blue-400 appearance-none cursor-pointer pr-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
//       >
//         {children}
//       </select>
//       <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
//         <svg
//           className="w-4 h-4 text-gray-400"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M19 9l-7 7-7-7"
//           />
//         </svg>
//       </div>
//     </div>
//   </div>
// );

// export default ApprovedFilter;

import React, { useState } from "react";
import { Filter, RotateCcw, MapPin, Building2, Tags, Search, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/api";

const ApprovedFilter = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  // Fetch cities
  const { data: cities = [], isFetching: isFetchingCities } = useQuery({
    queryKey: ["citiesWithApplicants"],
    queryFn: async () => {
      const res = await api.get("/applicant-locations/filters/");
      return res.data.cities || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Fetch barangays for selected city
  const { data: barangays = [], isFetching: isFetchingBarangays } = useQuery({
    queryKey: ["barangaysByCity", localFilters.city],
    queryFn: async () => {
      if (!localFilters.city) return [];
      const res = await api.get(`/applicant-locations/filters/?city=${localFilters.city}`);
      return res.data.barangays || [];
    },
    enabled: !!localFilters.city,
    staleTime: 1000 * 60 * 5,
  });

  const handleChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
    if (field === "city") {
      setLocalFilters(prev => ({ ...prev, barangay: "" }));
    }
  };

  const handleReset = () => {
    const cleared = { city: "", barangay: "", type: "", search: "" };
    setLocalFilters(cleared);
    onFilterChange?.(cleared);
  };

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        {/* Search Bar */}
        <div className="flex flex-col min-w-[240px] flex-1">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-blue-600" />
            Search Applicant
          </label>
          <div className="relative group">
            <input
              type="text"
              value={localFilters.search || ""}
              onChange={e => handleChange("search", e.target.value)}
              placeholder="Enter name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-700 hover:border-gray-400 placeholder:text-gray-400"
            />
            <Search className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
          </div>
        </div>

        {/* City */}
        <FilterSelect
          icon={MapPin}
          label="City / Municipality"
          value={localFilters.city}
          onChange={value => handleChange("city", value)}
          disabled={isFetchingCities}
        >
          <option value="">{isFetchingCities ? "Loading cities..." : "All Cities"}</option>
          {cities.map(city => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </FilterSelect>

        {/* Barangay */}
        <FilterSelect
          icon={Building2}
          label="Barangay"
          value={localFilters.barangay}
          onChange={value => handleChange("barangay", value)}
          disabled={!localFilters.city || isFetchingBarangays}
        >
          <option value="">
            {localFilters.city
              ? isFetchingBarangays
                ? "Loading barangays..."
                : "All Barangays"
              : "Select City First"}
          </option>
          {barangays.map(b => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </FilterSelect>

        {/* Assistance Type */}
        <FilterSelect
          icon={Tags}
          label="Assistance Type"
          value={localFilters.type}
          onChange={value => handleChange("type", value)}
        >
          <option value="">All Types</option>
          <option value="Medical">Medical</option>
          <option value="Educational">Educational</option>
          <option value="Burial">Burial</option>
        </FilterSelect>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-all border border-gray-300 hover:border-red-200 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95 border border-transparent"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

const FilterSelect = ({ icon: Icon, label, value, onChange, disabled, children }) => (
  <div className="flex flex-col min-w-[180px] flex-1 lg:flex-none">
    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-blue-600" />}
      {label}
    </label>
    <div className="relative group">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-700 hover:border-gray-400 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  </div>
);

export default ApprovedFilter;