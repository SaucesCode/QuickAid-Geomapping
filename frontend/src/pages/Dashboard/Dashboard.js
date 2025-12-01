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
  TimerIcon,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
  BarChart,
  Bar,
} from "recharts";

// Import Analytics Components
import {
  PageContainer,
  PageHeader,
  AnalyticsStatCard,
  AnalyticsChartCard,
  AnalyticsAlertCard,
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
  InsightCard,
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

  const { data: growth, isLoading: growthLoading } = useQuery({
    queryKey: ["growthRate"],
    queryFn: () => fetcher("/analytics/dashboard/growth-rate/"),
  });

  const { data: forecastData, isLoading: forecastLoading } = useQuery({
    queryKey: ["forecast"],
    queryFn: () => fetcher("/analytics/dashboard/application-forecast/"),
  });

  const { data: assistanceTrend, isLoading: assistanceLoading } = useQuery({
    queryKey: ["assistanceTrend"],
    queryFn: () => fetcher("/analytics/trends/assistance-type-trend/"),
  });

  const { data: monthlyComparison, isLoading: comparisonLoading } = useQuery({
    queryKey: ["dashboard", "monthly-comparison"],
    queryFn: () => fetcher("/analytics/dashboard/monthly-comparison/"),
  });

  const { data: monthlyTrend, isLoading: trendLoading } = useQuery({
    queryKey: ["monthlyTrend"],
    queryFn: () => fetcher("/analytics/dashboard/total-applicants/"),
  });

  const { data: alerts } = useQuery({
    queryKey: ["dashboard", "capacity-alerts"],
    queryFn: () => fetcher("/analytics/dashboard/capacity-alerts/"),
  });

  const { data: staffActivity, isLoading: staffLoading } = useQuery({
    queryKey: ["staffLeaderboard"],
    queryFn: () => fetcher("/analytics/performance/staff-leaderboard/"),
  });

  const { data: recentApplicants, isLoading: recentLoading } = useQuery({
    queryKey: ["recentApplicants"],
    queryFn: () => fetcher("/recent_applicants/"),
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

  const assistanceLineData = assistanceTrend
    ? assistanceTrend.labels.map((label, index) => ({
        date: label,
        medical: assistanceTrend.medical[index] ?? 0,
        educational: assistanceTrend.educational[index] ?? 0,
        burial: assistanceTrend.burial[index] ?? 0,
      }))
    : [];

  // Calculate growth percentage
  const growthPercentage = growth
    ? growth.previous_month > 0
      ? (((growth.this_month - growth.previous_month) / growth.previous_month) * 100).toFixed(
          1
        )
      : 0
    : 0;

  const combinedForecastData = [];

  if (forecastData?.historical?.dates) {
    forecastData.historical.dates.forEach((d, i) => {
      combinedForecastData.push({
        date: d,
        actual: forecastData.historical.counts?.[i] ?? 0,
        forecast: null,
        upper: null,
        lower: null,
      });
    });
  }

  if (forecastData?.forecast?.dates) {
    forecastData.forecast.dates.forEach((d, i) => {
      combinedForecastData.push({
        date: d,
        actual: null,
        forecast: forecastData.forecast.counts?.[i] ?? 0,
        upper: forecastData.forecast.upper?.[i] ?? 0,
        lower: forecastData.forecast.lower?.[i] ?? 0,
      });
    });
  }

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
          icon={LineChart}
          title="Assistance Type Volume (This Month)"
          subtitle="Medical vs Educational vs Burial"
          isLoading={assistanceLoading}
        >
          <ChartContainer height={350}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={assistanceLineData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" vertical={false} />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: "#4b5563" }} />
                <YAxis stroke="#6b7280" tick={{ fill: "#4b5563" }} />
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />

                <Line
                  type="monotone"
                  dataKey="medical"
                  name="Medical"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="educational"
                  name="Educational"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="burial"
                  name="Burial"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={false}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </AnalyticsChartCard>

        <AnalyticsChartCard
          icon={TrendingUp}
          title="Applicant Trend + 7-Day Forecast"
          subtitle="Includes prediction confidence range"
          isLoading={forecastLoading}
        >
          <ChartContainer height={400}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={combinedForecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                <XAxis dataKey="date" tick={{ fill: "#4b5563", fontSize: 11 }} />
                <YAxis tick={{ fill: "#4b5563", fontSize: 11 }} />
                <Tooltip />

                {/* Confidence range shading */}
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="#10b98122"
                  activeDot={false}
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="#10b98122"
                  activeDot={false}
                />

                {/* Actual Data */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  connectNulls={true}
                />

                {/* Forecast Line */}
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="Forecast"
                  stroke="#10b981"
                  strokeDasharray="5 5"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  connectNulls={true}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </AnalyticsChartCard>

        <AnalyticsChartCard
          icon={TrendingUp}
          title="Monthly Application Growth"
          subtitle="Previous vs Current Month"
          isLoading={growthLoading}
        >
          <ChartContainer height={350}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={growthChartData}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  tick={{ fill: "#4b5563", fontSize: 12 }}
                />
                <YAxis stroke="#6b7280" tick={{ fill: "#4b5563", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#ffffff",
                  }}
                  labelStyle={{ fontWeight: "bold", color: "#1f2937" }}
                />
                <Bar dataKey="count" fill="#6366f1" barSize={400} />
              </BarChart>
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
        <AnalyticsAlertCard
          icon={AlertCircle}
          title="Capacity Alerts"
          description="System-generated alerts on capacity thresholds"
          variant="info"
        >
          {alerts && alerts.alerts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {alerts.alerts.map((alert, idx) => (
                <InsightCard
                  key={idx}
                  icon={
                    alert.severity === "critical"
                      ? AlertCircle
                      : alert.severity === "warning"
                      ? AlertTriangle
                      : Info
                  }
                  title={alert.title}
                  description={alert.message}
                  variant={
                    alert.severity === "critical"
                      ? "danger"
                      : alert.severity === "warning"
                      ? "warning"
                      : "info"
                  }
                >
                  <div className="mt-2 text-sm">
                    <p className="font-medium">{alert.detail}</p>
                  </div>
                </InsightCard>
              ))}
            </div>
          )}
        </AnalyticsAlertCard>
      </AnalyticsStack>
    </PageContainer>
  );
};

export default Dashboard;
