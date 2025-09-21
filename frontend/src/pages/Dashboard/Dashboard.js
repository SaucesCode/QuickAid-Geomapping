import { useEffect, useState, useCallback } from "react";
import { api } from "../../services/api";
import toast from "react-hot-toast";
import {
  Users,
  Clock,
  TrendingUp,
  MapPin,
  LayoutDashboard,
  Activity,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [totals, setTotals] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [staffActivity, setStaffActivity] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "QuickAid | Dashboard";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, totalsRes, growthRes, monthlyRes, staffRes, recentRes] =
        await Promise.all([
          api.get("/analytics/dashboard/summary/"),
          api.get("/analytics/dashboard/total-applicants/"),
          api.get("/analytics/dashboard/growth-rate/"),
          api.get("/analytics/trends/monthly/"),
          api.get("/analytics/performance/staff-leaderboard/"),
          api.get("/recent_applicants/"),
        ]);

      console.log("Monthly Trend Data:", monthlyRes.data);
      console.log("Staff Activity Data:", staffRes.data);
      console.log("Recent Applicants Data:", recentRes.data);
      console.log("Summary Data:", summaryRes.data);
      console.log("Totals Data:", totalsRes.data);
      console.log("Growth Data:", growthRes.data);

      setSummary(summaryRes.data || {});
      setTotals(totalsRes.data || {});
      setGrowth(growthRes.data || {});
      setMonthlyTrend(monthlyRes.data || []);
      setStaffActivity(staffRes.data || []);
      setRecentApplicants(recentRes.data?.results || recentRes.data || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to load dashboard data.", {
        style: { background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155" },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-4 bg-quickaid-bg">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          <span className="loading loading-spinner loading-lg text-quickaid-accent mb-4"></span>
          <p className="text-quickaid-text-secondary font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 bg-quickaid-bg min-h-screen">
      {/* Header */}
      <header>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-quickaid-accent/10 rounded-md flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-quickaid-accent" />
          </div>
          <h1 className="text-xl font-bold text-quickaid-text-primary">Dashboard</h1>
        </div>
        <p className="text-sm text-quickaid-text-secondary">
          Executive summary of QuickAid operations.
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          title="Total Applicants"
          value={summary?.totalApplicants ?? 0}
        />
        <StatCard
          icon={Clock}
          title="Avg. Processing Time"
          value={`${summary?.averageProcessingTime ?? 0} mins`}
        />
        <StatCard
          icon={TrendingUp}
          title="Growth Rate"
          value={`${growth?.growth_rate ?? 0}%`}
        />
        <StatCard
          icon={MapPin}
          title="Top Barangay"
          value={summary?.highestBarangay ?? "N/A"}
        />
      </div>

      {/* Monthly Trend */}
      <Card title="Monthly Applications Trend" icon={TrendingUp}>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Staff Activity + Recent Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card title="Top Staff Activity" icon={Activity}>
          {staffActivity.length > 0 ? (
            <ul className="space-y-2">
              {staffActivity.slice(0, 5).map((s, i) => (
                <li key={i} className="flex justify-between p-2 bg-slate-50 rounded-md">
                  <span className="font-medium">{s.staff__username}</span>
                  <span className="text-sm">{s.count} apps</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No staff activity</p>
          )}
        </Card>

        <Card title="Recent Applicants" icon={FileText}>
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2">Barangay</th>
                <th className="p-2">Assistance</th>
                <th className="p-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentApplicants.slice(0, 5).map((a, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">
                    {a.background_info?.first_name} {a.background_info?.last_name}
                  </td>
                  <td className="p-2 text-center">{a.background_info?.barangay}</td>
                  <td className="p-2 text-center">{a.type_of_assistance}</td>
                  <td className="p-2 text-right">{formatDate(a.date_filled)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

// Reusable UI components
const Card = ({ title, icon: Icon, children }) => (
  <div className="bg-quickaid-surface rounded-lg shadow p-3 border border-slate-200">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-5 h-5 text-quickaid-accent" />
      <h2 className="font-semibold text-quickaid-text-primary">{title}</h2>
    </div>
    {children}
  </div>
);

const StatCard = ({ icon: Icon, title, value }) => (
  <div className="bg-quickaid-surface rounded-lg shadow p-3 border border-slate-200 flex justify-between items-center">
    <div>
      <p className="text-xs text-quickaid-text-secondary">{title}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
    <div className="w-8 h-8 bg-quickaid-accent/10 rounded-md flex items-center justify-center">
      <Icon className="w-5 h-5 text-quickaid-accent" />
    </div>
  </div>
);

export default Dashboard;
