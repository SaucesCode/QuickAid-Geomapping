import React, { useEffect, useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  FileBarChart,
  Users,
  MapPin,
  CheckCircle,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../../services/api";

const Reports = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // Data states
  const [byType, setByType] = useState([]);
  const [topBarangays, setTopBarangays] = useState([]);
  const [approvalByGroup, setApprovalByGroup] = useState([]);
  const [typeOverTime, setTypeOverTime] = useState([]);
  const [staffProductivity, setStaffProductivity] = useState([]);
  const [approvalLocation, setApprovalLocation] = useState([]);
  const [timeToApproval, setTimeToApproval] = useState(0);
  const [staffLeaderboard, setStaffLeaderboard] = useState([]);
  const [procDistribution, setProcDistribution] = useState([]);

  useEffect(() => {
    document.title = "QuickAid | Analytics Reports";

    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          typeRes,
          barangayRes,
          approvalGroupRes,
          typeOverTimeRes,
          staffProdRes,
          timeApprovalRes,
          staffLeadRes,
          procDistRes,
        ] = await Promise.all([
          api.get("/analytics/applicants-by-assistance-type/"),
          api.get("/analytics/top-barangays/"),
          api.get("/analytics/approval-rate-by-group/"),
          api.get("/analytics/assistance-type-over-time/"),
          api.get("/analytics/staff-productivity/"),
          api.get("/analytics/time-to-approval/"),
          api.get("/analytics/staff-leaderboard/"),
          api.get("/analytics/processing-distribution/"),
        ]);
        setByType(typeRes.data || []);
        setTopBarangays(barangayRes.data || []);
        setApprovalByGroup(approvalGroupRes.data || []);
        setTypeOverTime(typeOverTimeRes.data || []);
        setStaffProductivity(staffProdRes.data || []);
        setTimeToApproval(timeApprovalRes.data?.average_time_to_approval_days || 0);
        setStaffLeaderboard(staffLeadRes.data || []);
        setProcDistribution(procDistRes.data || []);
      } catch (err) {
        console.error("Reports analytics error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memoized datasets
  const typeBarData = useMemo(
    () => byType.map(item => ({ name: item.type_of_assistance, count: item.count })),
    [byType]
  );

  const barangayBarData = useMemo(
    () =>
      topBarangays.map(item => ({
        name: item.background_info__barangay__name,
        count: item.count,
      })),
    [topBarangays]
  );

  const approvalGroupData = useMemo(
    () =>
      approvalByGroup.map(item => ({
        name: item.group,
        rate: item.approval_rate,
      })),
    [approvalByGroup]
  );

  const staffProdData = useMemo(
    () =>
      staffProductivity.map(item => ({
        name: item.username,
        Applications: item.applications,
        Approvals: item.approvals,
      })),
    [staffProductivity]
  );

  return (
    <div className="min-h-screen bg-quickaid-bg">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-quickaid-surface shadow border-b border-slate-200 h-16">
        <div className="flex items-center justify-between h-full px-6">
          <div>
            <h1 className="text-xl font-semibold text-quickaid-text-primary flex items-center gap-3">
              <FileBarChart className="w-6 h-6 text-quickaid-accent" />
              Detailed Reports
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
              Loading Reports
            </h3>
            <p className="text-quickaid-text-secondary">Fetching detailed analytics data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Time to Approval</p>
                    <p className="text-3xl font-bold">{timeToApproval}</p>
                    <p className="text-blue-100 text-xs">days average</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Active Staff</p>
                    <p className="text-3xl font-bold">{staffProductivity.length}</p>
                    <p className="text-emerald-100 text-xs">processing applications</p>
                  </div>
                  <Users className="w-8 h-8 text-emerald-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Top Barangays</p>
                    <p className="text-3xl font-bold">{topBarangays.length}</p>
                    <p className="text-purple-100 text-xs">with applications</p>
                  </div>
                  <MapPin className="w-8 h-8 text-purple-200" />
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Assistance Type Distribution */}
              <div className="bg-quickaid-surface rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-quickaid-text-primary">
                      Assistance Type Distribution
                    </h3>
                    <p className="text-sm text-quickaid-text-secondary">
                      Applications by type of assistance needed
                    </p>
                  </div>
                </div>

                {typeBarData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={typeBarData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          axisLine={{ stroke: "#e2e8f0" }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
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
                          fill="#3b82f6"
                          name="Applications"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Award className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-quickaid-text-secondary">
                        No assistance type data available
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Top Barangays */}
              <div className="bg-quickaid-surface rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-quickaid-text-primary">
                      Top Barangays
                    </h3>
                    <p className="text-sm text-quickaid-text-secondary">
                      Most active locations by application volume
                    </p>
                  </div>
                </div>

                {barangayBarData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barangayBarData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          axisLine={{ stroke: "#e2e8f0" }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
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
                          fill="#f97316"
                          name="Applications"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MapPin className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-quickaid-text-secondary">
                        No barangay data available
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Full Width Charts */}
            <div className="space-y-6">
              {/* Assistance Type Over Time */}
              <div className="bg-quickaid-surface rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-quickaid-text-primary">
                      Assistance Type Trends Over Time
                    </h3>
                    <p className="text-sm text-quickaid-text-secondary">
                      Monthly breakdown of assistance requests by category
                    </p>
                  </div>
                </div>

                {typeOverTime.length > 0 ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={typeOverTime}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          axisLine={{ stroke: "#e2e8f0" }}
                        />
                        <YAxis
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
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="Medical"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Educational"
                          stroke="#ef4444"
                          strokeWidth={3}
                          dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Burial"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-quickaid-text-secondary">
                        No assistance trend data available
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Approval Rate by Group and Staff Productivity */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Approval Rate by Group */}
                <div className="bg-quickaid-surface rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-quickaid-text-primary">
                        Approval Rate by Group
                      </h3>
                      <p className="text-sm text-quickaid-text-secondary">
                        Success rates across different groups
                      </p>
                    </div>
                  </div>

                  {approvalGroupData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={approvalGroupData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            axisLine={{ stroke: "#e2e8f0" }}
                          />
                          <YAxis
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
                            formatter={value => [`${value}%`, "Approval Rate"]}
                          />
                          <Bar
                            dataKey="rate"
                            fill="#10b981"
                            name="Approval Rate %"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-quickaid-text-secondary">
                          No approval rate data available
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Staff Productivity */}
                <div className="bg-quickaid-surface rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-quickaid-text-primary">
                        Staff Productivity
                      </h3>
                      <p className="text-sm text-quickaid-text-secondary">
                        Applications processed vs approved per staff
                      </p>
                    </div>
                  </div>

                  {staffProdData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={staffProdData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            axisLine={{ stroke: "#e2e8f0" }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
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
                          <Legend />
                          <Bar
                            dataKey="Applications"
                            fill="#8b5cf6"
                            name="Applications"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="Approvals"
                            fill="#ec4899"
                            name="Approvals"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-quickaid-text-secondary">
                          No staff productivity data available
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
