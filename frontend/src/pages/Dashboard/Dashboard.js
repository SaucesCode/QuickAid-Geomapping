import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import {
  LayoutDashboard,
  TrendingUp,
  Activity,
  FileText,
  Calendar,
  BarChart2,
  LineChart,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import toast from "react-hot-toast";

const SimpleStatCard = ({ stat }) => {
  const { title, value, loading, icon: Icon, iconColor, gradientEndColor } = stat;
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 h-full flex flex-col justify-between relative overflow-hidden">
      <div
        className="absolute top-0 left-0 bottom-0 w-2 rounded-l-2xl"
        style={{
          background: `linear-gradient(to bottom, #fff, ${gradientEndColor})`,
          opacity: 0.8,
        }}
      ></div>
      <div className="flex items-center justify-between w-full">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
      </div>
      <p className="text-4xl font-bold text-gray-900 mt-2">
        {loading ? "..." : value ?? "N/A"}
      </p>
    </div>
  );
};

const Card = ({ title, icon: Icon, children, gradient = "from-indigo-600 to-blue-700" }) => (
  <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 h-full">
    <div className="flex items-center gap-4 mb-6">
      <div
        className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h2 className="font-bold text-lg text-gray-900 border-l-4 border-blue-500 pl-3">
        {title}
      </h2>
    </div>
    {children}
  </div>
);

const ListSkeleton = ({ items = 5 }) => (
  <ul className="animate-pulse space-y-3">
    {[...Array(items)].map((_, i) => (
      <li
        key={i}
        className="flex justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
      >
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
        <div className="w-16 h-4 bg-gray-200 rounded"></div>
      </li>
    ))}
  </ul>
);

const ChartSkeleton = () => (
  <div className="animate-pulse bg-gray-100 h-[300px] rounded-xl"></div>
);

const Dashboard = () => {
  const fetcher = async url => (await api.get(url)).data;

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryErr,
  } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: () => fetcher("/analytics/dashboard/summary/"),
  });

  const { data: growth, isLoading: growthLoading } = useQuery({
    queryKey: ["growthRate"],
    queryFn: () => fetcher("/analytics/dashboard/growth-rate/"),
  });

  const { data: monthlyTrend, isLoading: trendLoading } = useQuery({
    queryKey: ["monthlyTrend"],
    queryFn: () => fetcher("/analytics/dashboard/total-applicants/"),
  });

  const { data: staffActivity, isLoading: staffLoading } = useQuery({
    queryKey: ["staffLeaderboard"],
    queryFn: () => fetcher("/analytics/performance/staff-leaderboard/"),
  });

  const { data: recentApplicants, isLoading: recentLoading } = useQuery({
    queryKey: ["recentApplicants"],
    queryFn: () => fetcher("/recent_applicants/"),
  });

  if (summaryErr)
    toast.error("Failed to load dashboard data.", {
      style: { background: "#1e293b", color: "#f1f5f9" },
    });

  // Extract values from monthlyTrend
  const daily = monthlyTrend?.daily ?? 0;
  const weekly = monthlyTrend?.weekly ?? 0;
  const monthly = monthlyTrend?.monthly ?? 0;

  // Convert growth rate data into chart-friendly array
  const growthChartData = growth
    ? [
        { name: "Previous Month", count: growth.previous_month ?? 0 },
        { name: "This Month", count: growth.this_month ?? 0 },
      ]
    : [];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <header className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-blue-800">
              Operational Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of QuickAid metrics and recent activities
            </p>
          </div>
        </div>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SimpleStatCard
          stat={{
            title: "Daily Applicants",
            value: daily,
            loading: trendLoading,
            icon: Calendar,
            iconColor: "#06b6d4",
            gradientEndColor: "#06b6d4",
          }}
        />
        <SimpleStatCard
          stat={{
            title: "Weekly Applicants",
            value: weekly,
            loading: trendLoading,
            icon: BarChart2,
            iconColor: "#8b5cf6",
            gradientEndColor: "#8b5cf6",
          }}
        />
        <SimpleStatCard
          stat={{
            title: "Monthly Applicants",
            value: monthly,
            loading: trendLoading,
            icon: LineChart,
            iconColor: "#3b82f6",
            gradientEndColor: "#3b82f6",
          }}
        />
      </div>

      {/* Growth Chart */}
      <Card title="Monthly Application Growth" icon={TrendingUp}>
        {growthLoading ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={growthChartData}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} />
            </RechartsLineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Staff + Recent Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card title="Staff Activity Leaderboard" icon={Activity}>
          {staffLoading ? (
            <ListSkeleton />
          ) : (
            <ul className="space-y-3">
              {staffActivity?.slice(0, 5).map((s, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <span className="font-semibold text-gray-800">{s.staff__username}</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                    {s.count} Processed
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recently Submitted Applications" icon={FileText}>
          {recentLoading ? (
            <ListSkeleton />
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="p-3 text-left font-bold text-gray-700">Applicant</th>
                  <th className="p-3 text-center font-bold text-gray-700">Barangay</th>
                  <th className="p-3 text-center font-bold text-gray-700">Type</th>
                  <th className="p-3 text-right font-bold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentApplicants?.slice(0, 5).map((a, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-blue-50">
                    <td className="p-3 font-medium text-gray-800">
                      {a.background_info?.first_name} {a.background_info?.last_name}
                    </td>
                    <td className="p-3 text-center text-gray-600">
                      {a.background_info?.barangay}
                    </td>
                    <td className="p-3 text-center text-gray-700">{a.type_of_assistance}</td>
                    <td className="p-3 text-right text-gray-500 text-xs">
                      {new Date(a.date_filled).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
