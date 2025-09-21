import React, { useEffect, useState, useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { BarChart3, Users, Clock, Award, MapPin, TrendingUp, RotateCcw } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../../services/api";

const GENDER_COLORS = ["#2563eb", "#f59e0b", "#ef4444"];
const STATUS_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const Overview = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // Summary metrics
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalApplicants: 0,
    averageProcessingTime: 0,
    mostCommonType: "",
    highestBarangay: "",
  });

  // Extra metrics
  const [growthRate, setGrowthRate] = useState({
    growth_rate: 0,
    this_month: 0,
    previous_month: 0,
  });
  const [repeatApplicants, setRepeatApplicants] = useState(0);

  // Chart data
  const [genderData, setGenderData] = useState([]);
  const [civilStatusData, setCivilStatusData] = useState([]);
  const [ageGroupData, setAgeGroupData] = useState([]);
  const [occupationData, setOccupationData] = useState([]);
  const [ageGenderData, setAgeGenderData] = useState([]);

  useEffect(() => {
    document.title = "QuickAid | Analytics Overview";

    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          summaryRes,
          genderRes,
          civilRes,
          ageRes,
          growthRes,
          repeatRes,
          occRes,
          ageGenderRes,
        ] = await Promise.all([
          api.get("/analytics/summary-metrics/"),
          api.get("/analytics/by-gender/"),
          api.get("/analytics/by-civil-status/"),
          api.get("/analytics/by-age-group/"),
          api.get("/analytics/applicant-growth-rate/"),
          api.get("/analytics/repeat-applicants/"),
          api.get("/analytics/by-occupation/"),
          api.get("/analytics/by-age-gender/"),
        ]);

        setSummaryMetrics(summaryRes.data);
        setGenderData(genderRes.data || []);
        setCivilStatusData(civilRes.data || []);
        setAgeGroupData(ageRes.data || []);
        setGrowthRate(growthRes.data || { growth_rate: 0, this_month: 0, previous_month: 0 });
        setRepeatApplicants(repeatRes.data?.repeat_applicants || 0);
        setOccupationData(occRes.data || []);
        setAgeGenderData(ageGenderRes.data || []);
      } catch (err) {
        console.error("Overview analytics error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const metricCards = [
    {
      title: "Total Applicants",
      value: summaryMetrics.totalApplicants,
      icon: Users,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Avg. Processing Time",
      value: `${summaryMetrics.averageProcessingTime}`,
      suffix: "mins",
      icon: Clock,
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Most Common Type",
      value: summaryMetrics.mostCommonType || "N/A",
      icon: Award,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Highest Barangay",
      value: summaryMetrics.highestBarangay || "N/A",
      icon: MapPin,
      color: "bg-orange-500",
      gradient: "from-orange-500 to-orange-600",
    },
    {
      title: "Growth Rate",
      value: `${growthRate.growth_rate}%`,
      subtitle: "vs last month",
      icon: TrendingUp,
      color: "bg-pink-500",
      gradient: "from-pink-500 to-pink-600",
    },
    {
      title: "Repeat Applicants",
      value: repeatApplicants,
      icon: RotateCcw,
      color: "bg-indigo-500",
      gradient: "from-indigo-500 to-indigo-600",
    },
  ];

  return (
    <div className="min-h-screen bg-quickaid-bg">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-quickaid-surface shadow border-b border-slate-200 h-16">
        <div className="flex items-center justify-between h-full px-6">
          <div>
            <h1 className="text-xl font-semibold text-quickaid-text-primary flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-quickaid-accent" />
              Analytics Overview
            </h1>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Navigation Tabs */}
        <div className="bg-quickaid-surface rounded-xl shadow-sm border border-slate-200 p-1 mb-6">
          <div className="flex">
            <Link
              to="/analytics/overview"
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium text-center transition-all duration-200 ${
                location.pathname.includes("overview")
                  ? "bg-quickaid-accent text-white shadow-sm"
                  : "text-quickaid-text-secondary hover:text-quickaid-text-primary hover:bg-slate-50"
              }`}
            >
              Overview
            </Link>
            <Link
              to="/analytics/reports"
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium text-center transition-all duration-200 ${
                location.pathname.includes("reports")
                  ? "bg-quickaid-accent text-white shadow-sm"
                  : "text-quickaid-text-secondary hover:text-quickaid-text-primary hover:bg-slate-50"
              }`}
            >
              Reports
            </Link>
            <Link
              to="/analytics/trends"
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium text-center transition-all duration-200 ${
                location.pathname.includes("trends")
                  ? "bg-quickaid-accent text-white shadow-sm"
                  : "text-quickaid-text-secondary hover:text-quickaid-text-primary hover:bg-slate-50"
              }`}
            >
              Trends
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="bg-quickaid-surface rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <div className="w-8 h-8 border-4 border-quickaid-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-medium text-quickaid-text-primary mb-1">
              Loading Overview
            </h3>
            <p className="text-quickaid-text-secondary">Fetching analytics data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metricCards.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div
                    key={index}
                    className="group relative bg-quickaid-surface rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
                    ></div>
                    <div className="relative">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-quickaid-text-secondary mb-1">
                            {metric.title}
                          </p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-quickaid-text-primary">
                              {typeof metric.value === "number"
                                ? metric.value.toLocaleString()
                                : metric.value}
                            </span>
                            {metric.suffix && (
                              <span className="text-sm font-medium text-quickaid-text-secondary">
                                {metric.suffix}
                              </span>
                            )}
                          </div>
                          {metric.subtitle && (
                            <p className="text-xs text-quickaid-text-secondary mt-1">
                              {metric.subtitle}
                            </p>
                          )}
                        </div>
                        <div
                          className={`w-12 h-12 rounded-xl ${metric.color} bg-opacity-10 flex items-center justify-center`}
                        >
                          <IconComponent
                            className={`w-6 h-6 ${metric.color.replace("bg-", "text-")}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Gender Distribution */}
              <div className="bg-quickaid-surface rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-quickaid-text-primary">
                      Gender Distribution
                    </h3>
                    <p className="text-sm text-quickaid-text-secondary">
                      Applicants by gender
                    </p>
                  </div>
                </div>

                {genderPieData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {genderPieData.map((entry, index) => (
                            <Cell
                              key={`cell-gender-${index}`}
                              fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={value => [value, "Count"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-quickaid-text-secondary">No gender data available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Civil Status Distribution */}
              <div className="bg-quickaid-surface rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-quickaid-text-primary">
                      Civil Status
                    </h3>
                    <p className="text-sm text-quickaid-text-secondary">
                      Distribution by status
                    </p>
                  </div>
                </div>

                {civilStatusPieData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={civilStatusPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {civilStatusPieData.map((entry, index) => (
                            <Cell
                              key={`cell-status-${index}`}
                              fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={value => [value, "Count"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Award className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-quickaid-text-secondary">
                        No civil status data available
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Age Group Distribution */}
              <div className="bg-quickaid-surface rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2 xl:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-quickaid-text-primary">
                      Age Groups
                    </h3>
                    <p className="text-sm text-quickaid-text-secondary">Distribution by age</p>
                  </div>
                </div>

                {ageGroupBarData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageGroupBarData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          axisLine={{ stroke: "#e2e8f0" }}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          axisLine={{ stroke: "#e2e8f0" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#8b5cf6"
                          name="Applicants"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-quickaid-text-secondary">
                        No age group data available
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview;
