import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { api } from "../../services/api";
import "react-datepicker/dist/react-datepicker.css";
import "./Dashboard.css";

const COLORS = ["#4361ee", "#3a0ca3", "#4cc9f0", "#4ade80", "#fbbf24", "#f87171"];

const Dashboard = () => {
  const [totalApplicants, setTotalApplicants] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [avgProcessing, setAvgProcessing] = useState(null);
  const [staffActivity, setStaffActivity] = useState([]);
  const [assistanceTypes, setAssistanceTypes] = useState([]);
  const [trendsOverTime, setTrendsOverTime] = useState([]);
  const [topBarangays, setTopBarangays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(avgProcessing);
    document.title = "Quickaid | Dashboard";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [totalRes, avgRes, staffRes, recentRes, assistTypesRes, trendsRes, topBrgysRes] =
        await Promise.all([
          api.get("/analytics/total-applicants/"),
          api.get("/analytics/average-processing-time/"),
          api.get("/analytics/staff-activity/"),
          api.get("/recent_applicants/"),
          api.get("/analytics/applicants-by-assistance-type/"),
          api.get("/analytics/trends-over-time/"),
          api.get("/analytics/top-barangays/"),
        ]);

      setTotalApplicants(totalRes.data || { daily: 0, weekly: 0, monthly: 0 });
      setAvgProcessing(avgRes.data?.average_processing_time ?? null);
      setStaffActivity(staffRes.data || []);
      setRecentApplicants(recentRes.data?.results || recentRes.data || []);
      setAssistanceTypes(assistTypesRes.data || []);
      setTrendsOverTime(trendsRes.data || []);
      setTopBarangays(topBrgysRes.data || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const assistancePieData = useMemo(
    () =>
      (assistanceTypes || []).map(item => ({
        name: item.type_of_assistance,
        value: item.count,
      })),
    [assistanceTypes]
  );

  const topBarangaysData = useMemo(
    () =>
      (topBarangays || []).map(item => ({
        name: item["background_info__barangay__name"],
        count: item.count,
      })),
    [topBarangays]
  );

  const trendsData = useMemo(
    () => (trendsOverTime || []).map(item => ({ date: item.date, count: item.count })),
    [trendsOverTime]
  );

  const formatProcessingTime = seconds => {
    if (seconds === null || seconds === undefined) return "N/A";
    const totalMinutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${totalMinutes}:${String(remainingSeconds).padStart(2, "0")} min`;
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      minute: "numeric",
      hour: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>📊 QuickAid Dashboard</h1>
        </div>
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 QuickAid Dashboard</h1>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <h2 className="stat-title">Total Applicants</h2>
          <div className="stat-value">Today: {totalApplicants.daily ?? 0}</div>
          <div className="stat-value">This Week: {totalApplicants.weekly ?? 0}</div>
          <div className="stat-value">This Month: {totalApplicants.monthly ?? 0}</div>
        </div>

        <div className="stat-card">
          <h2 className="stat-title">Avg. Processing Time</h2>
          <div className="stat-value">{formatProcessingTime(avgProcessing)}</div>
        </div>

        <div className="stat-card">
          <h2 className="stat-title">Top Staff Activity</h2>
          {(staffActivity || []).length > 0 ? (
            <ul className="staff-list">
              {(staffActivity || []).slice(0, 3).map(s => (
                <li key={s.staff__username}>
                  {s.staff__username} <strong>{s.count}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>No activity recorded</p>
          )}
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h2 className="chart-title">Assistance Types</h2>
          {assistancePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assistancePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {assistancePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">No assistance type data available</div>
          )}
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Top Barangays</h2>
          {topBarangaysData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topBarangaysData} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={90} interval={0} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#4361ee" name="Applicants" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">No barangay data available</div>
          )}
        </div>
      </div>
      {/*  */}
      <div className="charts-grid">
        <div className="chart-card large">
          <h2 className="chart-title">Applicant Trends (Last 30 Days)</h2>
          {trendsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4361ee"
                  strokeWidth={2}
                  name="Applicants"
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">No trend data available</div>
          )}
        </div>
      </div>
      <div className="list-card">
        <h2>🕒 Recent Submissions</h2>
        <div className="table-container">
          <table className="recent-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Barangay</th>
                <th>Assistance</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentApplicants.length > 0 ? (
                recentApplicants.map((a, idx) => (
                  <tr key={a.id || idx}>
                    <td>
                      {`${a.background_info.first_name || ""} ${
                        a.background_info.last_name || ""
                      }`.trim()}
                    </td>
                    <td>{a.background_info.barangay}</td>
                    <td>{a.type_of_assistance}</td>
                    <td>{formatDate(new Date(a.date_filled))}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No recent applicants</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
//
export default Dashboard;
