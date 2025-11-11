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

// Import Design System Components
import {
  PageContainer,
  PageHeader,
  Card,
  StatCard,
  ChartCard,
  Stack,
  Grid,
} from "../../components/DesignSystem";

// Assistance Type Colors - KEPT UNCHANGED
const ASSISTANCE_COLORS = {
  medical: "text-blue-800 bg-blue-100",
  educational: "text-green-800 bg-green-100",
  burial: "text-yellow-800 bg-yellow-100",
  default: "text-gray-800 bg-gray-100",
};

const getAssistanceTypeColor = type => {
  const normalized = (type || "").toLowerCase();
  if (normalized.includes("medical")) return ASSISTANCE_COLORS.medical;
  if (normalized.includes("educational")) return ASSISTANCE_COLORS.educational;
  if (normalized.includes("burial")) return ASSISTANCE_COLORS.burial;
  return ASSISTANCE_COLORS.default;
};

const Dashboard = () => {
  // Fetch Logic - KEPT UNCHANGED
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

  // Data Processing - KEPT UNCHANGED
  const daily = monthlyTrend?.daily ?? 0;
  const weekly = monthlyTrend?.weekly ?? 0;
  const monthly = monthlyTrend?.monthly ?? 0;

  const growthChartData = growth
    ? [
        { name: "Previous Month", count: growth.previous_month ?? 0 },
        { name: "This Month", count: growth.this_month ?? 0 },
      ]
    : [];

  return (
    <PageContainer>
      <Stack spacing="lg">
        {/* REDESIGNED: Using PageHeader from Design System */}
        <PageHeader
          icon={LayoutDashboard}
          title="Operational Dashboard"
          subtitle="Comprehensive overview of QuickAid metrics and recent activities"
        />

        {/* REDESIGNED: Using Grid and StatCard from Design System */}
        <Grid cols={{ default: 1, sm: 2, lg: 3 }} gap="md">
          <StatCard
            icon={Calendar}
            title="Daily Applicants"
            value={daily}
            color="blue"
            isLoading={trendLoading}
          />
          <StatCard
            icon={BarChart2}
            title="Weekly Applicants"
            value={weekly}
            color="blue"
            isLoading={trendLoading}
          />
          <StatCard
            icon={LineChart}
            title="Monthly Applicants"
            value={monthly}
            color="blue"
            isLoading={trendLoading}
          />
        </Grid>

        {/* REDESIGNED: Using ChartCard from Design System */}
        <ChartCard
          icon={TrendingUp}
          title="Monthly Application Growth"
          isLoading={growthLoading}
        >
          <ResponsiveContainer width="100%" height={350}>
            <RechartsLineChart
              data={growthChartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" padding={{ left: 30, right: 30 }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ fontWeight: "bold", color: "#1f2937" }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={4}
                dot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* REDESIGNED: Using Grid and ChartCard from Design System */}
        <Grid cols={{ default: 1, lg: 5 }} gap="lg">
          {/* Staff Leaderboard */}
          <div className="lg:col-span-2">
            <ChartCard
              icon={Activity}
              title="Staff Activity Leaderboard"
              isLoading={staffLoading}
            >
              <div className="space-y-3">
                {staffActivity?.slice(0, 5).map((s, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200"
                  >
                    <span
                      className={`text-lg font-bold ${
                        i < 3 ? "text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {i + 1}.
                    </span>
                    <span className="font-semibold text-gray-800 flex-grow ml-4">
                      {s.staff__username}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold shadow-sm">
                      {s.count} Processed
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Recent Applicants */}
          <div className="lg:col-span-3">
            <ChartCard
              icon={FileText}
              title="Recently Submitted Applications"
              isLoading={recentLoading}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-50 border-b-2 border-blue-100">
                      <th className="p-4 text-left font-bold text-blue-800 uppercase tracking-wider">
                        Applicant
                      </th>
                      <th className="p-4 text-center font-bold text-blue-800 uppercase tracking-wider hidden sm:table-cell">
                        Barangay
                      </th>
                      <th className="p-4 text-center font-bold text-blue-800 uppercase tracking-wider hidden md:table-cell">
                        Type
                      </th>
                      <th className="p-4 text-right font-bold text-blue-800 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplicants?.slice(0, 5).map((a, i) => {
                      const typeClasses = getAssistanceTypeColor(a.type_of_assistance);

                      return (
                        <tr
                          key={i}
                          className="border-b border-gray-100 transition-colors duration-200 hover:bg-blue-50/50"
                        >
                          <td className="p-4 font-semibold text-gray-800">
                            {a.background_info?.first_name} {a.background_info?.last_name}
                          </td>
                          <td className="p-4 text-center text-gray-600 hidden sm:table-cell">
                            {a.background_info?.barangay}
                          </td>
                          <td className="p-4 text-center hidden md:table-cell">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${typeClasses}`}
                            >
                              {a.type_of_assistance}
                            </span>
                          </td>
                          <td className="p-4 text-right text-gray-500 text-xs font-medium">
                            {new Date(a.date_filled).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>
        </Grid>
      </Stack>
    </PageContainer>
  );
};

export default Dashboard;
