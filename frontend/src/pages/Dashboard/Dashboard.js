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

// ---
// ## Components
// ---

const SimpleStatCard = ({ stat }) => {
  const { title, value, loading, icon: Icon, iconColor, gradientEndColor } = stat;
  // Enhanced shadow, cleaner border, and removal of the side gradient for a flatter, more modern look.
  // Using a soft blue gradient for the icon background to tie into the theme.
  const blueGradient = "from-blue-500 to-indigo-600";
  return (
    <div className="bg-white rounded-xl shadow-xl p-5 border border-blue-50 h-full flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-blue-100">
      <div className="flex items-center justify-between w-full">
        {/* Title is slightly larger, bold, and uses a dark blue color */}
        <p className="text-md font-bold text-gray-700 uppercase tracking-wider">{title}</p>
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br ${blueGradient}`}
        >
          {/* Icon is larger and white for contrast */}
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {/* Value is larger and uses a deep blue color */}
      <p className="text-5xl font-bold text-gray-900 mt-4">
        {loading ? "..." : value ?? "N/A"}
      </p>
    </div>
  );
};

const Card = ({ title, icon: Icon, children, gradient = "from-blue-600 to-indigo-700" }) => (
  // Modern, large radius, premium shadow, and responsive column span
  <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100 h-full col-span-1 lg:col-span-2">
    <div className="flex items-center gap-4 mb-6 border-b pb-4 border-gray-100">
      <div
        className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-blue-500/50 shadow-md`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      {/* Title is prominent, bold, and uses the main blue color */}
      <h2 className="font-bold text-xl text-gray-900">
        {title}
      </h2>
    </div>
    {children}
  </div>
);

const ListSkeleton = ({ items = 5 }) => (
  <ul className="animate-pulse space-y-4">
    {[...Array(items)].map((_, i) => (
      <li
        key={i}
        className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200"
      >
        <div className="w-1/3 h-5 bg-blue-100 rounded-full"></div>
        <div className="w-1/6 h-5 bg-blue-200 rounded-full"></div>
      </li>
    ))}
  </ul>
);

const ChartSkeleton = () => (
  // Updated height for better visual balance
  <div className="animate-pulse bg-gray-100 h-[350px] rounded-xl"></div>
);

// ---
// ## Dashboard Component
// ---

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
    // Background uses a very light blue to match the theme
    <div className="p-4 md:p-8 space-y-6 bg-blue-50 min-h-screen">
      {/* Header with deep shadow for a premium feel */}
      <header className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <div>
            {/* Prominent title with blue gradient text */}
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800">
              Operational Dashboard
            </h1>
            <p className="text-md text-gray-500 mt-1">
              Comprehensive overview of QuickAid metrics and recent activities
            </p>
          </div>
        </div>
      </header>

      {/* KPI Section - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SimpleStatCard
          stat={{
            title: "Daily Applicants",
            value: daily,
            loading: trendLoading,
            icon: Calendar,
            iconColor: "#0ea5e9", // Sky Blue
            gradientEndColor: "#0ea5e9",
          }}
        />
        <SimpleStatCard
          stat={{
            title: "Weekly Applicants",
            value: weekly,
            loading: trendLoading,
            icon: BarChart2,
            iconColor: "#4f46e5", // Indigo
            gradientEndColor: "#4f46e5",
          }}
        />
        <SimpleStatCard
          stat={{
            title: "Monthly Applicants",
            value: monthly,
            loading: trendLoading,
            icon: LineChart,
            iconColor: "#3b82f6", // Blue
            gradientEndColor: "#3b82f6",
          }}
        />
      </div>

      {/* Growth Chart - Uses the Card component for consistent styling */}
      <Card title="Monthly Application Growth" icon={TrendingUp} gradient="from-blue-600 to-cyan-500">
        {growthLoading ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <RechartsLineChart data={growthChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              {/* Cleaner grid lines */}
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              {/* Axes text with a subdued color */}
              <XAxis dataKey="name" stroke="#9ca3af" padding={{ left: 30, right: 30 }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
              />
              {/* Prominent blue line */}
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={4}
                dot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Staff + Recent Applicants - Responsive grid (1:4 or 2:3 split on large screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Staff Leaderboard - Takes 2/5ths of the space on large screens */}
        <div className="lg:col-span-2">
            <Card title="Staff Activity Leaderboard" icon={Activity} gradient="from-indigo-600 to-purple-600">
            {staffLoading ? (
                <ListSkeleton />
            ) : (
                <ul className="space-y-4">
                {staffActivity?.slice(0, 5).map((s, i) => (
                    <li
                    key={i}
                    className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200"
                    >
                    {/* Ranking emphasis with color */}
                    <span className={`text-lg font-bold ${i < 3 ? 'text-blue-600' : 'text-gray-700'}`}>{i + 1}.</span>
                    <span className="font-semibold text-gray-800 flex-grow ml-4">{s.staff__username}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold shadow-sm">
                        {s.count} Processed
                    </span>
                    </li>
                ))}
                </ul>
            )}
            </Card>
        </div>

        {/* Recent Applicants - Takes 3/5ths of the space on large screens */}
        <div className="lg:col-span-3">
            <Card title="Recently Submitted Applications" icon={FileText} gradient="from-teal-500 to-blue-500">
            {recentLoading ? (
                <ListSkeleton items={5} />
            ) : (
                <div className="overflow-x-auto"> {/* Ensures table is responsive */}
                    <table className="min-w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-blue-50 border-b-2 border-blue-100">
                        <th className="p-4 text-left font-bold text-blue-800 uppercase tracking-wider">Applicant</th>
                        <th className="p-4 text-center font-bold text-blue-800 uppercase tracking-wider hidden sm:table-cell">Barangay</th>
                        <th className="p-4 text-center font-bold text-blue-800 uppercase tracking-wider hidden md:table-cell">Type</th>
                        <th className="p-4 text-right font-bold text-blue-800 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentApplicants?.slice(0, 5).map((a, i) => (
                        <tr key={i} className="border-b border-gray-100 transition-colors duration-200 hover:bg-blue-50/50">
                            <td className="p-4 font-semibold text-gray-800">
                            {a.background_info?.first_name} {a.background_info?.last_name}
                            </td>
                            <td className="p-4 text-center text-gray-600 hidden sm:table-cell">
                            {a.background_info?.barangay}
                            </td>
                            <td className="p-4 text-center text-blue-700 font-medium hidden md:table-cell">{a.type_of_assistance}</td>
                            <td className="p-4 text-right text-gray-500 text-xs font-medium">
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
                </div>
            )}
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;