import React, { useEffect, useState, useMemo } from "react"; // Removed useCallback as it's not strictly needed here with useEffect dependency management
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api } from "../../services/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import "./Analytics.css";

// Colors for Pie Charts
const GENDER_COLORS = ["#0088FE", "#FF8042", "#FFBB28"]; // Blue, Orange, Yellow
const STATUS_COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#0088FE", "#FF1919"]; // Teal, Yellow, Orange, Purple, Blue, Red

const Analytics = () => {
  // Existing State
  const [typeTrends, setTypeTrends] = useState([]);
  const [barangayTypeBreakdown, setBarangayTypeBreakdown] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true);

  // --- New State for Demographics ---
  const [genderData, setGenderData] = useState([]);
  const [civilStatusData, setCivilStatusData] = useState([]);
  const [ageGroupData, setAgeGroupData] = useState([]);
  // --- End New State ---

  const formatDate = date => date?.toISOString().split("T")[0] ?? null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const params = {}; // Params for date/type filtered endpoints
      if (startDate && endDate) {
        params.start = formatDate(startDate);
        params.end = formatDate(endDate);
      }
      if (selectedType) {
        params.type = selectedType;
      }

      try {
        // Fetch existing and new data points
        const [
          typeTrendRes,
          brgyTypeRes,
          genderRes, // New
          civilStatusRes, // New
          ageGroupRes, // New
        ] = await Promise.all([
          api.get("/analytics/assistance-type-trend/", { params }),
          api.get("/analytics/barangay-by-type/", { params }), // Ensure this endpoint exists & works
          api.get("/analytics/by-gender/"), // New endpoint call
          api.get("/analytics/by-civil-status/"), // New endpoint call
          api.get("/analytics/by-age-group/"), // New endpoint call
        ]);

        setTypeTrends(typeTrendRes.data || []);
        setBarangayTypeBreakdown(brgyTypeRes.data || []);
        // --- Set New State ---
        setGenderData(genderRes.data || []);
        setCivilStatusData(civilStatusRes.data || []);
        setAgeGroupData(ageGroupRes.data || []);
        // --- End Set New State ---
      } catch (error) {
        console.error("Analytics fetch error:", error);
        // Clear state on error? Or show specific error messages?
        setTypeTrends([]);
        setBarangayTypeBreakdown([]);
        setGenderData([]);
        setCivilStatusData([]);
        setAgeGroupData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, selectedType]); // Dependencies for re-fetching filtered data

  // --- Memoized data for charts ---
  const genderPieData = useMemo(
    () => genderData.map(item => ({ name: item.gender || "Unknown", value: item.count })),
    [genderData]
  );

  const civilStatusPieData = useMemo(
    () =>
      civilStatusData.map(item => ({
        name: item.civil_status || "Unknown",
        value: item.count,
      })),
    [civilStatusData]
  );

  const ageGroupBarData = useMemo(
    () => ageGroupData.map(item => ({ name: item.age_group, count: item.count })),
    [ageGroupData]
  );
  // --- End Memoized data ---

  return (
    <div className="analytics-container">
      <h1>📈 In-Depth Analytics</h1>

      {/* --- Filter Bar --- */}
      <div className="filter-bar">
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          placeholderText="Start Date"
          dateFormat="yyyy-MM-dd"
          className="date-picker"
          isClearable
        />
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          placeholderText="End Date"
          dateFormat="yyyy-MM-dd"
          className="date-picker"
          minDate={startDate}
          isClearable
        />
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="type-filter"
        >
          <option value="">All Types</option>
          <option value="Medical">Medical</option>
          <option value="Burial">Burial</option>
          <option value="Educational">Educational</option>
        </select>
      </div>

      {loading ? (
        <p>Loading insights...</p>
      ) : (
        // --- Main Content Area ---
        <div className="analytics-content">
          {/* --- Demographics Row --- */}
          <div className="analytics-row">
            {/* Gender Chart */}
            <div className="chart-card">
              <h2>Applicants by Gender</h2>
              {genderPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {genderPieData.map((entry, index) => (
                        <Cell
                          key={`cell-gender-${index}`}
                          fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p>No gender data.</p>
              )}
            </div>

            {/* Civil Status Chart */}
            <div className="chart-card">
              <h2>Applicants by Civil Status</h2>
              {civilStatusPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={civilStatusPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {civilStatusPieData.map((entry, index) => (
                        <Cell
                          key={`cell-status-${index}`}
                          fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p>No civil status data.</p>
              )}
            </div>

            {/* Age Group Chart */}
            <div className="chart-card">
              <h2>Applicants by Age Group</h2>
              {ageGroupBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={ageGroupBarData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#fca311" name="Applicants" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>No age group data.</p>
              )}
            </div>
          </div>

          {/* --- Existing Charts Row --- */}
          <div className="analytics-row">
            {/* Assistance Type Trends */}
            <div className="chart-card">
              <h2>Assistance Type Trends Over Time</h2>
              {typeTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={typeTrends}>
                    {/* ... Line chart definition same as before ... */}
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3a0ca3"
                      name="Applicants"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p>No trend data for selected period/type.</p>
              )}
            </div>

            {/* Barangay Breakdown */}
            <div className="chart-card">
              <h2>Top Barangays by Assistance Type</h2>
              {barangayTypeBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={barangayTypeBreakdown.slice(0, 10)}
                    layout="vertical"
                    margin={{ left: 30 }}
                  >
                    {/* ... Bar chart definition same as before ... */}
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="barangay" type="category" width={90} interval={0} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#4cc9f0" name="Applicants" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>No barangay breakdown data for selected period/type.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
