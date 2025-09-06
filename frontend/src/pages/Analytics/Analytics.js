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
  const [activeTab, setActiveTab] = useState("descriptive");

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
    <div className="bg-quickaid-bg min-h-screen p-6 font-sans text-quickaid-text-primary">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-quickaid-text-primary flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-quickaid-accent" />
          Analytics
        </h1>
        <p className="text-quickaid-text-secondary mt-2">Analytics and insights</p>
      </header>

      {/* Tab Navigation */}
      <div className="tabs tabs-boxed bg-quickaid-surface p-2 rounded-xl mb-6 shadow">
        <a
          onClick={() => setActiveTab("descriptive")}
          className={`tab flex-1 h-12 text-base font-semibold ${
            activeTab === "descriptive"
              ? "tab-active bg-quickaid-accent text-white"
              : "hover:bg-gray-100"
          }`}
        >
          Descriptive
        </a>
        <a
          onClick={() => setActiveTab("diagnostic")}
          className={`tab flex-1 h-12 text-base font-semibold ${
            activeTab === "diagnostic"
              ? "tab-active bg-quickaid-accent text-white"
              : "hover:bg-gray-100"
          }`}
        >
          Diagnostic
        </a>
        <a
          onClick={() => setActiveTab("predictive")}
          className={`tab flex-1 h-12 text-base font-semibold ${
            activeTab === "predictive"
              ? "tab-active bg-quickaid-accent text-white"
              : "hover:bg-gray-100"
          }`}
        >
          Predictive
        </a>
        <a
          onClick={() => setActiveTab("prescriptive")}
          className={`tab flex-1 h-12 text-base font-semibold ${
            activeTab === "prescriptive"
              ? "tab-active bg-quickaid-accent text-white"
              : "hover:bg-gray-100"
          }`}
        >
          Prescriptive
        </a>
      </div>

      {/* Filter Bar */}
      <div className="bg-quickaid-surface p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4 items-center">
        <div className="text-sm font-medium text-gray-700">Filter by:</div>
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          placeholderText="Start Date"
          dateFormat="yyyy-MM-dd"
          className="input input-bordered w-full md:w-auto -z-10 focus:ring-2 focus:ring-quickaid-accent"
          isClearable
        />
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          placeholderText="End Date"
          dateFormat="yyyy-MM-dd"
          className="input input-bordered w-full md:w-auto focus:ring-2 focus:ring-quickaid-accent"
          minDate={startDate}
          isClearable
        />
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="select select-bordered w-full md:w-auto focus:ring-2 focus:ring-quickaid-accent"
        >
          <option value="">All Types</option>
          <option value="Medical">Medical</option>
          <option value="Burial">Burial</option>
          <option value="Educational">Educational</option>
        </select>
      </div>

      {loading ? (
        <div className="card bg-quickaid-surface p-6 shadow-md rounded-xl text-center">
          <span className="loading loading-spinner text-quickaid-accent"></span>
          <div className="mt-2 text-gray-400">Loading analytics data...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Descriptive Analytics Tab */}
          {activeTab === "descriptive" && (
            <div className="space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card bg-quickaid-surface p-6 shadow-md rounded-xl">
                  <div className="text-sm font-semibold text-quickaid-text-secondary">
                    Total Applicants
                  </div>
                  <div className="text-3xl font-bold text-quickaid-text-primary mt-2">
                    {summaryMetrics.totalApplicants}
                  </div>
                </div>
                <div className="card bg-quickaid-surface p-6 shadow-md rounded-xl">
                  <div className="text-sm font-semibold text-quickaid-text-secondary">
                    Avg. Form Completion Time
                  </div>
                  <div className="text-3xl font-bold text-quickaid-text-primary mt-2">
                    {summaryMetrics.averageProcessingTime}{" "}
                    <span className="text-base font-normal">mins</span>
                  </div>
                </div>
                <div className="card bg-quickaid-surface p-6 shadow-md rounded-xl">
                  <div className="text-sm font-semibold text-quickaid-text-secondary">
                    Most Common Type
                  </div>
                  <div className="text-3xl font-bold text-quickaid-text-primary mt-2">
                    {summaryMetrics.mostCommonType}
                  </div>
                </div>
                <div className="card bg-quickaid-surface p-6 shadow-md rounded-xl">
                  <div className="text-sm font-semibold text-quickaid-text-secondary">
                    Highest Barangay
                  </div>
                  <div className="text-3xl font-bold text-quickaid-text-primary mt-2">
                    {summaryMetrics.highestBarangay}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card bg-quickaid-surface p-6 shadow-md rounded-xl">
                  <h2 className="text-lg font-semibold text-quickaid-text-primary mb-2">
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
                              fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-gray-400">No gender data available</div>
                  )}
                </div>

                <div className="card bg-quickaid-surface p-6 shadow-md rounded-xl">
                  <h2 className="text-lg font-semibold text-quickaid-text-primary mb-2">
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
                              fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-gray-400">
                      No civil status data available
                    </div>
                  )}
                </div>

                <div className="card bg-quickaid-surface p-6 shadow-md rounded-xl">
                  <h2 className="text-lg font-semibold text-quickaid-text-primary mb-2">
                    Applicants by Age Group
                  </h2>
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
                    <div className="text-center text-gray-400">
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
                <div className="card bg-quickaid-surface p-6 shadow-md rounded-xl">
                  <h2 className="text-lg font-semibold text-quickaid-text-primary mb-2">
                    Monthly Application Trends
                  </h2>
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
                    <div className="text-center text-gray-400">
                      No monthly trend data available
                    </div>
                  )}
                </div>

                <div className="card bg-quickaid-surface p-6 shadow-md rounded-xl">
                  <h2 className="text-lg font-semibold text-quickaid-text-primary mb-2">
                    Form Completion Time by Type
                  </h2>
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
                    <div className="text-center text-gray-400">
                      No processing time data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Predictive Analytics Tab */}
          {activeTab === "predictive" && (
            <div className="card bg-quickaid-surface p-6 shadow-md rounded-xl">
              <h2 className="text-lg font-semibold text-quickaid-text-primary mb-2">
                Predictive Analytics
              </h2>
              <p className="text-quickaid-text-secondary">
                This tab could display visualizations and data related to future trends, such
                as forecasted application volume or predicted needs for specific assistance
                types. Currently, no predictive data is available.
              </p>
            </div>
          )}

          {/* Prescriptive Analytics Tab */}
          {activeTab === "prescriptive" && (
            <div className="card bg-quickaid-surface p-6 shadow-md rounded-xl">
              <h2 className="text-lg font-semibold text-quickaid-text-primary mb-2">
                Prescriptive Analytics
              </h2>
              <p className="text-quickaid-text-secondary">
                This tab could provide recommendations based on the analytics data, such as
                suggesting resource allocation or identifying high-risk areas for outreach.
                Currently, no prescriptive data is available.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
