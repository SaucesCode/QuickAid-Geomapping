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
  Users,
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

// Import Analytics Components
import {
  PageContainer,
  PageHeader,
  AnalyticsStatCard,
  AnalyticsChartCard,
  AnalyticsGrid,
  AnalyticsStack,
  ChartContainer,
  AnalyticsTable,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
} from "../../components/AnalyticsComponents";

// Assistance Type Colors
const ASSISTANCE_COLORS = {
  medical: "info",
  educational: "success",
  burial: "warning",
  default: "default",
};

const getAssistanceTypeVariant = type => {
  const normalized = (type || "").toLowerCase();
  if (normalized.includes("medical")) return ASSISTANCE_COLORS.medical;
  if (normalized.includes("educational")) return ASSISTANCE_COLORS.educational;
  if (normalized.includes("burial")) return ASSISTANCE_COLORS.burial;
  return ASSISTANCE_COLORS.default;
};

const Dashboard = () => {
  // Fetch Logic
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

  // Data Processing
  const daily = monthlyTrend?.daily ?? 0;
  const weekly = monthlyTrend?.weekly ?? 0;
  const monthly = monthlyTrend?.monthly ?? 0;

  const growthChartData = growth
    ? [
        { name: "Previous Month", count: growth.previous_month ?? 0 },
        { name: "This Month", count: growth.this_month ?? 0 },
      ]
    : [];

  // Calculate growth percentage
  const growthPercentage = growth
    ? growth.previous_month > 0
      ? (((growth.this_month - growth.previous_month) / growth.previous_month) * 100).toFixed(
          1
        )
      : 0
    : 0;

  return (
    <PageContainer>
      <AnalyticsStack spacing="lg">
        <PageHeader
          icon={LayoutDashboard}
          title="Operational Dashboard"
          subtitle="Comprehensive overview of QuickAid metrics and recent activities"
        />

        <AnalyticsGrid cols={{ default: 1, sm: 2, lg: 3 }} gap="md">
          <AnalyticsStatCard
            icon={Calendar}
            title="Daily Applicants"
            value={daily}
            subtitle="Today's submissions"
            color="blue"
            isLoading={trendLoading}
          />
          <AnalyticsStatCard
            icon={BarChart2}
            title="Weekly Applicants"
            value={weekly}
            subtitle="Last 7 days"
            color="green"
            isLoading={trendLoading}
          />
          <AnalyticsStatCard
            icon={LineChart}
            title="Monthly Applicants"
            value={monthly}
            subtitle="This month"
            color="purple"
            trend={parseFloat(growthPercentage)}
            isLoading={trendLoading}
          />
        </AnalyticsGrid>

        <AnalyticsChartCard
          icon={TrendingUp}
          title="Monthly Application Growth"
          subtitle="Comparison of previous and current month"
          isLoading={growthLoading}
        >
          <ChartContainer height={350}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={growthChartData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  padding={{ left: 30, right: 30 }}
                  tick={{ fill: "#4b5563" }}
                />
                <YAxis stroke="#6b7280" tick={{ fill: "#4b5563" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#ffffff",
                  }}
                  labelStyle={{ fontWeight: "bold", color: "#1f2937" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </AnalyticsChartCard>

        <AnalyticsGrid cols={{ default: 1, lg: 5 }} gap="md">
          {/* Staff Leaderboard */}
          <div className="lg:col-span-2">
            <AnalyticsChartCard
              icon={Activity}
              title="Staff Activity Leaderboard"
              subtitle="Top 5 performers"
              isLoading={staffLoading}
            >
              <div className="space-y-2">
                {staffActivity?.slice(0, 5).map((s, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-sm hover:border-blue-300"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-base font-bold ${
                          i < 3 ? "text-blue-600" : "text-gray-600"
                        }`}
                      >
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                      </span>
                      <span className="font-semibold text-gray-800 text-sm">
                        {s.staff__username}
                      </span>
                    </div>
                    <Badge variant="info" className="text-xs">
                      {s.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </AnalyticsChartCard>
          </div>

          {/* Recent Applicants */}
          <div className="lg:col-span-3">
            <AnalyticsChartCard
              icon={FileText}
              title="Recently Submitted Applications"
              subtitle="Latest 5 submissions"
              isLoading={recentLoading}
            >
              <AnalyticsTable>
                <TableHeader>
                  <TableHeaderCell>Applicant</TableHeaderCell>
                  <TableHeaderCell className="hidden sm:table-cell">Barangay</TableHeaderCell>
                  <TableHeaderCell className="hidden md:table-cell">Type</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {recentApplicants?.slice(0, 5).map((a, i) => {
                    const typeVariant = getAssistanceTypeVariant(a.type_of_assistance);

                    return (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {a.background_info?.first_name} {a.background_info?.last_name}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {a.background_info?.barangay}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={typeVariant}>{a.type_of_assistance}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(a.date_filled).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </AnalyticsTable>
            </AnalyticsChartCard>
          </div>
        </AnalyticsGrid>
      </AnalyticsStack>
    </PageContainer>
  );
};

export default Dashboard;
