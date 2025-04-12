import React, { useEffect, useState } from "react";
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
} from "recharts";
import { api } from "../services/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Dashboard.css";

const Dashboard = () => {
  const [totalApplicants, setTotalApplicants] = useState({});
  const [byType, setByType] = useState([]);
  const [byBarangay, setByBarangay] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [avgProcessing, setAvgProcessing] = useState(0);
  const [staffActivity, setStaffActivity] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate, selectedType]);

  const fetchAnalytics = async () => {
    const params = {};
    if (startDate) params.start = startDate.toISOString().split("T")[0];
    if (endDate) params.end = endDate.toISOString().split("T")[0];
    if (selectedType) params.type = selectedType;

    try {
      const [total, type, barangays, trends, avg, staff] = await Promise.all([
        api.get("/analytics/total-applicants/", { params }),
        api.get("/analytics/applicants-by-assistance-type/", { params }),
        api.get("/analytics/top-barangays/", { params }),
        api.get("/analytics/trends-over-time/", { params }),
        api.get("/analytics/average-processing-time/", { params }),
        api.get("/analytics/staff-activity/", { params }),
      ]);

      setTotalApplicants(total.data);
      setByType(type.data);
      setByBarangay(barangays.data);
      setTrendData(trends.data);
      setAvgProcessing(avg.data.average_processing_time);
      setStaffActivity(staff.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F", "#FFBB28"];

  return (
    <div className="dashboard-container">
      <div className="filter-container">
        <div className="filter-group">
          <label className="filter-label">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            className="date-picker"
            placeholderText="Select start date"
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            className="date-picker"
            placeholderText="Select end date"
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Assistance Type</label>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="type-select"
          >
            <option value="">All</option>
            <option value="Medical">Medical</option>
            <option value="Burial">Burial</option>
            <option value="Educational">Educational</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h2 className="stat-title">Total Applicants</h2>
          <p className="stat-value">{totalApplicants.daily || 0}</p>
          <p>Today</p>
          <p className="stat-value">{totalApplicants.weekly || 0}</p>
          <p>This Week</p>
          <p className="stat-value">{totalApplicants.monthly || 0}</p>
          <p>This Month</p>
        </div>

        <div className="stat-card">
          <h2 className="stat-title">Average Processing Time</h2>
          <p className="stat-value">
            {avgProcessing ? `${(avgProcessing / 60).toFixed(2)} minutes` : "N/A"}
          </p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2 className="chart-title">Applicants by Type</h2>
          <PieChart width={350} height={250}>
            <Pie
              data={byType}
              dataKey="count"
              nameKey="assistance_type"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {byType.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Top Barangays</h2>
          <BarChart width={350} height={250} data={byBarangay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="barangay" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Application Trends</h2>
          <LineChart width={350} height={250} data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Staff Submissions</h2>
          <BarChart width={350} height={250} data={staffActivity}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="staff" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </div>
      </div>

      <div className="text-right">
        <button className="download-btn" onClick={() => window.print()}>
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
