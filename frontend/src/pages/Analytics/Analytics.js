import React, { useEffect, useState, useMemo } from "react";
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
  AreaChart,
  Area,
} from "recharts";
import { api } from "../../services/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Analytics.css";

// Colors for Charts
const GENDER_COLORS = ["#0088FE", "#FF8042", "#FFBB28"];
const STATUS_COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#0088FE", "#FF1919"];
const ASSISTANCE_COLORS = ["#4361ee", "#3a0ca3", "#4cc9f0", "#f72585", "#7209b7"];

const Analytics = () => {
  // State Management
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true);

  // Analytics Data States
  const [genderData, setGenderData] = useState([]);
  const [civilStatusData, setCivilStatusData] = useState([]);
  const [ageGroupData, setAgeGroupData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [incomeDistribution, setIncomeDistribution] = useState([]);
  const [processingTime, setProcessingTime] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalApplicants: 0,
    averageProcessingTime: 0,
    mostCommonType: "",
    highestBarangay: "",
  });

  const formatDate = date => date?.toISOString().split("T")[0] ?? null;

  useEffect(() => {
    document.title = "Quickaid | Analytics";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const params = {};
      if (startDate && endDate) {
        params.start = formatDate(startDate);
        params.end = formatDate(endDate);
      }
      if (selectedType) {
        params.type = selectedType;
      }

      try {
        const [
          genderRes,
          civilStatusRes,
          ageGroupRes,
          monthlyTrendRes,
          incomeDistRes,
          processingTimeRes,
          summaryRes,
        ] = await Promise.all([
          api.get("/analytics/by-gender/"),
          api.get("/analytics/by-civil-status/"),
          api.get("/analytics/by-age-group/"),
          api.get("/analytics/monthly-trends/"),
          api.get("/analytics/income-distribution/"),
          api.get("/analytics/processing-time/"),
          api.get("/analytics/summary-metrics/"),
        ]);

        setGenderData(genderRes.data || []);
        setCivilStatusData(civilStatusRes.data || []);
        setAgeGroupData(ageGroupRes.data || []);
        setMonthlyTrends(monthlyTrendRes.data || []);
        setIncomeDistribution(incomeDistRes.data || []);
        setProcessingTime(processingTimeRes.data || []);
        setSummaryMetrics(summaryRes.data || {});
      } catch (error) {
        console.error("Analytics fetch error:", error);
        // Clear all states on error
        setGenderData([]);
        setCivilStatusData([]);
        setAgeGroupData([]);
        setMonthlyTrends([]);
        setIncomeDistribution([]);
        setProcessingTime([]);
        setSummaryMetrics({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, selectedType]);

  // Memoized data for charts
  const genderPieData = useMemo(
    () =>
      genderData.map(item => ({
        name: item.background_info__sex || "Unknown",
        value: item.count,
      })),
    [genderData]
  );

  const civilStatusPieData = useMemo(
    () =>
      civilStatusData.map(item => ({
        name: item.background_info__civil_status || "Unknown",
        value: item.count,
      })),
    [civilStatusData]
  );

  const ageGroupBarData = useMemo(
    () => ageGroupData.map(item => ({ name: item.age_group, count: item.count })),
    [ageGroupData]
  );

  return (
    <div className="analytics-container">
      <h1>📈 Analytics Dashboard</h1>

      {/* Filter Bar */}
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
        <div className="analytics-loading">Loading analytics data...</div>
      ) : (
        <div className="analytics-content">
          {/* Summary Metrics */}
          <div className="summary-metrics">
            <div className="metric-card">
              <div className="metric-label">Total Applicants</div>
              <div className="metric-value">{summaryMetrics.totalApplicants}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Avg. Form Completion Time</div>
              <div className="metric-value">{summaryMetrics.averageProcessingTime} mins</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Most Common Type</div>
              <div className="metric-value">{summaryMetrics.mostCommonType}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Highest Barangay</div>
              <div className="metric-value">{summaryMetrics.highestBarangay}</div>
            </div>
          </div>

          {/* Demographics Row */}
          <div className="analytics-row">
            {/* Gender Chart */}
            <div className="chart-card">
              <h2>Applicants by Sex</h2>
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
                <div className="no-data">No gender data available</div>
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
                <div className="no-data">No civil status data available</div>
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
                <div className="no-data">No age group data available</div>
              )}
            </div>
          </div>

          {/* Trends Row */}
          <div className="analytics-row">
            {/* Monthly Trends */}
            <div className="chart-card">
              <h2>Monthly Application Trends</h2>
              {monthlyTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#4361ee"
                      fill="#4361ee"
                      fillOpacity={0.2}
                      name="Applications"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No monthly trend data available</div>
              )}
            </div>

            {/* Processing Time */}
            <div className="chart-card">
              <h2>Form Completion Time by Type</h2>
              {processingTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={processingTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="minutes"
                      stroke="#f72585"
                      name="Completion Time (mins)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No processing time data available</div>
              )}
            </div>
          </div>

          {/* Income Distribution */}
          <div className="analytics-row">
            <div className="chart-card">
              <h2>Income Distribution</h2>
              {incomeDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={incomeDistribution}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#7209b7" name="Applicants" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No income distribution data available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
