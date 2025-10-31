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
import { BarChart3 } from "lucide-react";
import { api } from "../../services/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Monochromatic Blue Theme Colors with Specific Overrides
const CHART_COLORS = {
  // Monochromatic Blue Shades for demographic charts (Gender, Status)
  GENDER_COLORS: ["#3b82f6", "#2563eb", "#1d4ed8"], // Blue shades
  STATUS_COLORS: [
    "#93c5fd",
    "#60a5fa",
    "#3b82f6",
    "#2563eb",
    "#1d4ed8",
    "#1e3a8a",
  ], // Lighter to Darker Blues
  
  // Custom Assistance Colors as requested for consistency across the application
  ASSISTANCE_COLORS_MAP: {
    Medical: "#2563eb", // Primary Blue
    Educational: "#10b981", // Specific Green
    Burial: "#facc15", // Specific Light Yellow
  },
  
  // Primary color for single-data charts
  PRIMARY_BLUE: "#3b82f6",
  SECONDARY_BLUE: "#2563eb",
  DARK_BLUE: "#1d4ed8",
  GRID_STROKE: "#e0f2fe", // Light blue grid
  AXIS_STROKE: "#374151", // Dark gray for legibility
};

const Analytics = () => {
  // State Management (NO CHANGES)
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("descriptive");

  // Analytics Data States (NO CHANGES)
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

  const formatDate = (date) => date?.toISOString().split("T")[0] ?? null; // NO CHANGES

  useEffect(() => {
    document.title = "Quickaid | Analytics";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);

  // Data Fetching Logic (NO CHANGES)
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

  // Memoized data for charts (NO CHANGES)
  const genderPieData = useMemo(
    () =>
      genderData.map((item) => ({
        name: item.background_info__sex || "Unknown",
        value: item.count,
      })),
    [genderData]
  );

  const civilStatusPieData = useMemo(
    () =>
      civilStatusData.map((item) => ({
        name: item.background_info__civil_status || "Unknown",
        value: item.count,
      })),
    [civilStatusData]
  );

  const ageGroupBarData = useMemo(
    () => ageGroupData.map((item) => ({ name: item.age_group, count: item.count })),
    [ageGroupData]
  );

  // === REDESIGNED JSX BELOW ===
  return (
    <div className="bg-blue-50 min-h-screen p-4 sm:p-6 font-sans text-gray-900">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-800 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Comprehensive insights and data visualization.
        </p>
      </header>

      {/* Tab Navigation - Blue Monochromatic Style */}
      <div className="flex bg-white p-1 rounded-xl shadow-lg border border-blue-100 mb-6 w-full max-w-4xl mx-auto">
        <a
          onClick={() => setActiveTab("descriptive")}
          className={`flex-1 h-12 text-sm sm:text-base font-semibold text-center cursor-pointer transition-all duration-200 rounded-lg ${
            activeTab === "descriptive"
              ? "bg-blue-600 text-white shadow-md"
              : "text-blue-700 hover:bg-blue-50"
          }`}
        >
          <span className="flex items-center justify-center h-full">
            Descriptive
          </span>
        </a>
        <a
          onClick={() => setActiveTab("diagnostic")}
          className={`flex-1 h-12 text-sm sm:text-base font-semibold text-center cursor-pointer transition-all duration-200 rounded-lg ${
            activeTab === "diagnostic"
              ? "bg-blue-600 text-white shadow-md"
              : "text-blue-700 hover:bg-blue-50"
          }`}
        >
          <span className="flex items-center justify-center h-full">
            Diagnostic
          </span>
        </a>
        <a
          onClick={() => setActiveTab("predictive")}
          className={`flex-1 h-12 text-sm sm:text-base font-semibold text-center cursor-pointer transition-all duration-200 rounded-lg ${
            activeTab === "predictive"
              ? "bg-blue-600 text-white shadow-md"
              : "text-blue-700 hover:bg-blue-50"
          }`}
        >
          <span className="flex items-center justify-center h-full">
            Predictive
          </span>
        </a>
        <a
          onClick={() => setActiveTab("prescriptive")}
          className={`flex-1 h-12 text-sm sm:text-base font-semibold text-center cursor-pointer transition-all duration-200 rounded-lg ${
            activeTab === "prescriptive"
              ? "bg-blue-600 text-white shadow-md"
              : "text-blue-700 hover:bg-blue-50"
          }`}
        >
          <span className="flex items-center justify-center h-full">
            Prescriptive
          </span>
        </a>
      </div>

      {/* Filter Bar - Blue Monochromatic Style */}
      <div className="bg-white p-4 rounded-xl shadow-lg mb-6 flex flex-wrap gap-4 items-center border border-blue-100">
        <div className="text-sm font-medium text-gray-700">Filter by:</div>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          placeholderText="Start Date"
          dateFormat="yyyy-MM-dd"
          className="input input-bordered w-full sm:w-auto h-10 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150"
          isClearable
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          placeholderText="End Date"
          dateFormat="yyyy-MM-dd"
          className="input input-bordered w-full sm:w-auto h-10 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150"
          minDate={startDate}
          isClearable
        />
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="select select-bordered w-full sm:w-auto h-10 min-h-0 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition duration-150"
        >
          <option value="">All Types</option>
          <option value="Medical">Medical</option>
          <option value="Burial">Burial</option>
          <option value="Educational">Educational</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-white p-6 shadow-xl rounded-2xl text-center border border-blue-100">
          <span className="loading loading-spinner text-blue-600 w-8 h-8"></span>
          <div className="mt-2 text-gray-500 font-medium">
            Loading analytics data...
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Descriptive Analytics Tab */}
          {activeTab === "descriptive" && (
            <div className="space-y-6">
              {/* Summary Metrics - Blue Monochromatic Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stat Card 1 */}
                <div className="card bg-white p-6 shadow-xl rounded-2xl border-l-4 border-blue-600 transition hover:shadow-2xl">
                  <div className="text-sm font-medium text-gray-500">
                    Total Applicants
                  </div>
                  <div className="text-3xl font-bold text-blue-800 mt-2">
                    {summaryMetrics.totalApplicants}
                  </div>
                </div>
                {/* Stat Card 2 */}
                <div className="card bg-white p-6 shadow-xl rounded-2xl border-l-4 border-blue-600 transition hover:shadow-2xl">
                  <div className="text-sm font-medium text-gray-500">
                    Avg. Form Completion Time
                  </div>
                  <div className="text-3xl font-bold text-blue-800 mt-2">
                    {summaryMetrics.averageProcessingTime}{" "}
                    <span className="text-base font-normal text-gray-600">
                      mins
                    </span>
                  </div>
                </div>
                {/* Stat Card 3 */}
                <div className="card bg-white p-6 shadow-xl rounded-2xl border-l-4 border-blue-600 transition hover:shadow-2xl">
                  <div className="text-sm font-medium text-gray-500">
                    Most Common Type
                  </div>
                  <div className="text-3xl font-bold text-blue-800 mt-2">
                    {summaryMetrics.mostCommonType}
                  </div>
                </div>
                {/* Stat Card 4 */}
                <div className="card bg-white p-6 shadow-xl rounded-2xl border-l-4 border-blue-600 transition hover:shadow-2xl">
                  <div className="text-sm font-medium text-gray-500">
                    Highest Barangay
                  </div>
                  <div className="text-3xl font-bold text-blue-800 mt-2">
                    {summaryMetrics.highestBarangay}
                  </div>
                </div>
              </div>

              {/* Chart Row - Blue Monochromatic Style */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Applicants by Gender */}
                <div className="card bg-white p-6 shadow-xl rounded-2xl border border-blue-100">
                  <h2 className="text-lg font-semibold text-blue-800 mb-4 border-b pb-2">
                    Applicants by Gender
                  </h2>
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
                              fill={
                                CHART_COLORS.GENDER_COLORS[
                                  index % CHART_COLORS.GENDER_COLORS.length
                                ]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No gender data available
                    </div>
                  )}
                </div>

                {/* Applicants by Civil Status */}
                <div className="card bg-white p-6 shadow-xl rounded-2xl border border-blue-100">
                  <h2 className="text-lg font-semibold text-blue-800 mb-4 border-b pb-2">
                    Applicants by Civil Status
                  </h2>
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
                              fill={
                                CHART_COLORS.STATUS_COLORS[
                                  index % CHART_COLORS.STATUS_COLORS.length
                                ]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No civil status data available
                    </div>
                  )}
                </div>

                {/* Applicants by Age Group */}
                <div className="card bg-white p-6 shadow-xl rounded-2xl border border-blue-100">
                  <h2 className="text-lg font-semibold text-blue-800 mb-4 border-b pb-2">
                    Applicants by Age Group
                  </h2>
                  {ageGroupBarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={ageGroupBarData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={CHART_COLORS.GRID_STROKE}
                        />
                        <XAxis dataKey="name" stroke={CHART_COLORS.AXIS_STROKE} />
                        <YAxis
                          allowDecimals={false}
                          stroke={CHART_COLORS.AXIS_STROKE}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: "8px", border: "none" }}
                        />
                        <Legend />
                        <Bar
                          dataKey="count"
                          fill={CHART_COLORS.PRIMARY_BLUE}
                          name="Applicants"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No age group data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Diagnostic Analytics Tab */}
          {activeTab === "diagnostic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Application Trends */}
                <div className="card bg-white p-6 shadow-xl rounded-2xl border border-blue-100">
                  <h2 className="text-lg font-semibold text-blue-800 mb-4 border-b pb-2">
                    Monthly Application Trends
                  </h2>
                  {monthlyTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyTrends}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={CHART_COLORS.GRID_STROKE}
                        />
                        <XAxis dataKey="month" stroke={CHART_COLORS.AXIS_STROKE} />
                        <YAxis stroke={CHART_COLORS.AXIS_STROKE} />
                        <Tooltip
                          contentStyle={{ borderRadius: "8px", border: "none" }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke={CHART_COLORS.SECONDARY_BLUE} // Monochromatic Blue Stroke
                          fill={CHART_COLORS.SECONDARY_BLUE} // Monochromatic Blue Fill
                          fillOpacity={0.2}
                          name="Applications"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No monthly trend data available
                    </div>
                  )}
                </div>

                {/* Form Completion Time by Type */}
                <div className="card bg-white p-6 shadow-xl rounded-2xl border border-blue-100">
                  <h2 className="text-lg font-semibold text-blue-800 mb-4 border-b pb-2">
                    Form Completion Time by Type
                  </h2>
                  {processingTime.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={processingTime}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={CHART_COLORS.GRID_STROKE}
                        />
                        <XAxis dataKey="type" stroke={CHART_COLORS.AXIS_STROKE} />
                        <YAxis stroke={CHART_COLORS.AXIS_STROKE} />
                        <Tooltip
                          contentStyle={{ borderRadius: "8px", border: "none" }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="minutes"
                          stroke={CHART_COLORS.DARK_BLUE} // Monochromatic Darker Blue Stroke
                          strokeWidth={2}
                          dot={{ fill: CHART_COLORS.DARK_BLUE, r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Completion Time (mins)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No processing time data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Predictive Analytics Tab */}
          {activeTab === "predictive" && (
            <div className="card bg-white p-6 shadow-xl rounded-2xl border border-blue-100">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">
                Predictive Analytics
              </h2>
              <p className="text-gray-600">
                This tab could display visualizations and data related to future
                trends, such as forecasted application volume or predicted needs
                for specific assistance types. Currently, no predictive data is
                available.
              </p>
            </div>
          )}

          {/* Prescriptive Analytics Tab */}
          {activeTab === "prescriptive" && (
            <div className="card bg-white p-6 shadow-xl rounded-2xl border border-blue-100">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">
                Prescriptive Analytics
              </h2>
              <p className="text-gray-600">
                This tab could provide recommendations based on the analytics
                data, such as suggesting resource allocation or identifying
                high-risk areas for outreach. Currently, no prescriptive data is
                available.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;