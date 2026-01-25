import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useAnalyticsQuery } from "../../hooks/useAnalyticsQuery";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  BarChart3,
  Clock,
  Target,
  FileText,
  AlertCircle,
} from "lucide-react";
import AnalyticsFilter from "../../components/AnalyticsFilter";
import { getAssistanceColor } from "../../utils/assistanceColors";
import { formatMonthYear, formatShortDate } from "../../utils/dateFormatters";
import {
  calculateGrowthRateFromArray,
  calculateAverage,
  findMax,
  safeLast,
} from "../../utils/analyticsCalculations";

// Import Analytics Components
import {
  PageContainer,
  PageHeader,
  AnalyticsStatCard,
  AnalyticsChartCard,
  AnalyticsAlertCard,
  AnalyticsGrid,
  AnalyticsStack,
  AnalyticsCard,
  HeatmapCell,
  HeatmapLegend,
  ChartContainer,
  InsightCard,
} from "../../components/AnalyticsComponents";

const Trends = () => {
  const [filters, setFilters] = useState({});
  const [colorMap, setColorMap] = useState({});

  usePageTitle("Trends Analysis");

  const { data: monthlyData = [], isLoading: monthlyLoading } = useAnalyticsQuery(
    "/analytics/trends/monthly/",
    filters,
    { queryKey: ["trends", "monthly", filters] }
  );
  const { data: yearlyData = [], isLoading: yearlyLoading } = useAnalyticsQuery(
    "/analytics/trends/yearly/",
    filters,
    { queryKey: ["trends", "yearly", filters] }
  );
  const { data: overtimeData = [], isLoading: overtimeLoading } = useAnalyticsQuery(
    "/analytics/trends/over-time/",
    filters,
    { queryKey: ["trends", "overtime", filters] }
  );
  const { data: cumulativeData = [], isLoading: cumulativeLoading } = useAnalyticsQuery(
    "/analytics/trends/cumulative/",
    filters,
    { queryKey: ["trends", "cumulative", filters] }
  );
  const { data: assistanceTypeData = [], isLoading: assistanceTypeLoading } =
    useAnalyticsQuery("/analytics/trends/assistance-type/", filters, {
      queryKey: ["trends", "assistanceType", filters],
    });
  const { data: assistanceTypeDataOverTime = [], isLoading: assistanceTypeOverTimeLoading } =
    useAnalyticsQuery("/analytics/trends/assistance-type-over-time/", filters, {
      queryKey: ["trends", "assistanceTypeOverTime", filters],
    });
  const { data: applicantHeatmap = [], isLoading: applicantHeatmapLoading } = useAnalyticsQuery(
    "/analytics/trends/applicant-heatmap/",
    filters,
    { queryKey: ["trends", "applicantHeatmap", filters] }
  );

  const loadingStates = {
    monthly: monthlyLoading,
    yearly: yearlyLoading,
    overtime: overtimeLoading,
    cumulative: cumulativeLoading,
    assistanceType: assistanceTypeLoading,
    assistanceTypeOverTime: assistanceTypeOverTimeLoading,
    applicantHeatmap: applicantHeatmapLoading,
  };

  // Data Transformations
  const transformMonthlyData = data =>
    data.map(item => ({
      month: formatMonthYear(item.month),
      count: item.count,
    }));

  const transformYearlyData = data =>
    data.map(item => ({
      year: item.year.toString(),
      count: item.count,
    }));

  const transformOvertimeData = data =>
    data.map(item => ({
      date: formatShortDate(item.day),
      count: item.count,
    }));

  const transformCumulativeData = data =>
    data.map(item => ({
      date: formatShortDate(item.day),
      cumulative: item.cumulative,
    }));

  const transformAssistanceTypeOverTime = data => {
    const grouped = data.reduce((acc, item) => {
      const monthKey = formatMonthYear(item.month);
      if (!acc[monthKey]) acc[monthKey] = { month: monthKey };
      acc[monthKey][item.type_of_assistance] = item.count;
      return acc;
    }, {});
    return Object.values(grouped);
  };

  const transformApplicantHeatmap = data => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: 0,
      intensity: 0,
    }));

    data.forEach(item => {
      if (item.hour >= 0 && item.hour < 24) hours[item.hour].count = item.count;
    });

    const maxCount = Math.max(...hours.map(h => h.count));
    hours.forEach(h => {
      h.intensity = maxCount > 0 ? (h.count / maxCount) * 100 : 0;
    });

    return hours;
  };


  // Dynamic Color Mapping
  useEffect(() => {
    if (assistanceTypeData.length > 0) {
      const uniqueTypes = [
        ...new Set(assistanceTypeData.map(item => item.type_of_assistance)),
      ];
      const fallbackColors = ["#8B5CF6", "#F59E0B", "#EF4444", "#3B82F6"];
      let fallbackIndex = 0;
      const newColorMap = {};

      uniqueTypes.forEach(type => {
        const primaryColor = getAssistanceColor(type);
        if (primaryColor == null) {
          newColorMap[type] = fallbackColors[fallbackIndex % fallbackColors.length];
          fallbackIndex++;
        } else {
          newColorMap[type] = primaryColor;
        }
      });
      setColorMap(newColorMap);
    }
  }, [assistanceTypeData]);

  const transformedMonthlyData = transformMonthlyData(monthlyData);
  const transformedYearlyData = transformYearlyData(yearlyData);
  const transformedOvertimeData = transformOvertimeData(overtimeData);
  const transformedCumulativeData = transformCumulativeData(cumulativeData);
  const transformedAssistanceOverTime = transformAssistanceTypeOverTime(
    assistanceTypeDataOverTime
  );
  const transformedApplicantHeatmap = transformApplicantHeatmap(applicantHeatmap);

  // Calculated Stats
  const isCumulativeLoaded = !loadingStates.cumulative;
  const isMonthlyLoaded = !loadingStates.monthly;
  const isAssistanceTypeLoaded = !loadingStates.assistanceType;

  const totalApplications = isCumulativeLoaded
    ? safeLast(transformedCumulativeData, { cumulative: 0 })?.cumulative || 0
    : "...";

  const monthlyGrowth = isMonthlyLoaded
    ? calculateGrowthRateFromArray(transformedMonthlyData)
    : 0;

  const averageMonthlyApplications = isMonthlyLoaded
    ? calculateAverage(transformedMonthlyData, "count")
    : "...";

  const mostPopularAssistance = isAssistanceTypeLoaded
    ? findMax(assistanceTypeData, "count", {
        type_of_assistance: "N/A",
        count: 0,
      })
    : { type_of_assistance: "...", count: "..." };

  return (
    <PageContainer>
      <AnalyticsStack spacing="md">
        <PageHeader
          icon={TrendingUp}
          title="Application Trends Analysis"
          subtitle="Comprehensive temporal analysis of application patterns and assistance types"
        />

        <AnalyticsFilter onFilterChange={setFilters} />

        {/* Stats Cards */}
        <AnalyticsGrid cols={{ default: 1, md: 2, lg: 4 }} gap="md">
          <AnalyticsStatCard
            icon={FileText}
            title="Total Applications"
            value={
              typeof totalApplications === "number"
                ? totalApplications.toLocaleString()
                : totalApplications
            }
            subtitle="All time"
            color="blue"
            isLoading={!isCumulativeLoaded}
          />
          <AnalyticsStatCard
            icon={TrendingUp}
            title="Monthly Growth"
            value={
              isMonthlyLoaded
                ? `${monthlyGrowth >= 0 ? "+" : ""}${monthlyGrowth.toFixed(1)}%`
                : "..."
            }
            subtitle="vs previous month"
            trend={monthlyGrowth}
            color="green"
            isLoading={!isMonthlyLoaded}
          />
          <AnalyticsStatCard
            icon={BarChart3}
            title="Monthly Average"
            value={
              typeof averageMonthlyApplications === "number"
                ? averageMonthlyApplications.toLocaleString()
                : averageMonthlyApplications
            }
            subtitle="applications per month"
            color="yellow"
            isLoading={!isMonthlyLoaded}
          />
          <AnalyticsStatCard
            icon={Target}
            title="Top Assistance"
            value={mostPopularAssistance.type_of_assistance}
            subtitle={`${mostPopularAssistance.count} applications`}
            color="#0c377eff"
            isLoading={!isAssistanceTypeLoaded}
          />
        </AnalyticsGrid>

        {/* Chart Row 1 */}
        <AnalyticsGrid cols={{ default: 1, lg: 2 }} gap="md">
          <AnalyticsChartCard
            icon={Calendar}
            title="Monthly Trends (Last 12 Months)"
            isLoading={loadingStates.monthly}
          >
            <ChartContainer height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transformedMonthlyData}>
                  <defs>
                    <linearGradient id="monthlyBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis
                    dataKey="month"
                    fontSize={11}
                    tick={{ fill: "#4b5563" }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis fontSize={11} tick={{ fill: "#4b5563" }} />
                  <Tooltip />

                  <Bar dataKey="count" fill="url(#monthlyBarGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </AnalyticsChartCard>

          <AnalyticsChartCard
            icon={BarChart3}
            title="Yearly Application Volume"
            isLoading={loadingStates.yearly}
          >
            <ChartContainer height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transformedYearlyData}>
                  <defs>
                    <linearGradient id="yearlyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e40af" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="year" fontSize={11} tick={{ fill: "#4b5563" }} />
                  <YAxis fontSize={11} tick={{ fill: "#4b5563" }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="url(#yearlyGradient)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </AnalyticsChartCard>
        </AnalyticsGrid>

        {/* Chart Row 2 */}
        <AnalyticsGrid cols={{ default: 1, lg: 2 }} gap="md">
          <AnalyticsChartCard
            icon={Clock}
            title="Daily Application Trends"
            isLoading={loadingStates.overtime}
          >
            <ChartContainer height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={transformedOvertimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis
                    dataKey="date"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fill: "#4b5563" }}
                  />
                  <YAxis fontSize={11} tick={{ fill: "#4b5563" }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ fill: "#EF4444", stroke: "#fff", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </AnalyticsChartCard>

          <AnalyticsChartCard
            icon={TrendingUp}
            title="Cumulative Growth"
            isLoading={loadingStates.cumulative}
          >
            <ChartContainer height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={transformedCumulativeData}>
                  <defs>
                    <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis
                    dataKey="date"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fill: "#4b5563" }}
                  />
                  <YAxis fontSize={11} tick={{ fill: "#4b5563" }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#6366F1"
                    fill="url(#cumulativeGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </AnalyticsChartCard>
        </AnalyticsGrid>

        {/* Chart Row 3 */}
        <AnalyticsGrid cols={{ default: 1, lg: 2 }} gap="md">
          <AnalyticsChartCard
            icon={Target}
            title="Assistance Type Distribution"
            isLoading={loadingStates.assistanceType}
          >
            <ChartContainer height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assistanceTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    dataKey="count"
                    nameKey="type_of_assistance"
                    stroke="#fff"
                  >
                    {assistanceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorMap[entry.type_of_assistance]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </AnalyticsChartCard>

          <AnalyticsChartCard
            icon={BarChart3}
            title="Assistance Types Over Time"
            isLoading={loadingStates.assistanceTypeOverTime}
          >
            <ChartContainer height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transformedAssistanceOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="month" fontSize={11} tick={{ fill: "#4b5563" }} />
                  <YAxis fontSize={11} tick={{ fill: "#4b5563" }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {Object.keys(transformedAssistanceOverTime[0] || {})
                    .filter(key => key !== "month")
                    .map((key, index) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        fill={colorMap[key]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </AnalyticsChartCard>
        </AnalyticsGrid>

        {/* Heatmap */}
        <AnalyticsChartCard
          icon={Clock}
          title="Applicant Activity Heatmap (by Hour)"
          isLoading={loadingStates.applicantHeatmap}
        >
          <div className="grid grid-cols-6 sm:grid-cols-12 xl:grid-cols-24 gap-1.5">
            {transformedApplicantHeatmap.map((hour, index) => (
              <HeatmapCell key={index} {...hour} />
            ))}
          </div>
          <HeatmapLegend className="mt-4" />
        </AnalyticsChartCard>

        {/* Insights */}
        <AnalyticsAlertCard
          icon={AlertCircle}
          title="Trend Analysis Summary & Key Insights"
          description="A snapshot of the most critical temporal and service-related patterns identified in the data."
          variant="info"
        >
          <AnalyticsGrid cols={{ default: 1, md: 3 }} gap="md">
            <InsightCard
              title="Growth Pattern"
              isLoading={loadingStates.monthly}
              icon={TrendingUp}
              variant="info"
              description="Monthly growth analysis"
            >
              <p className="text-gray-700">
                The current application volume shows a{" "}
                <span
                  className={`font-bold ${
                    monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {monthlyGrowth >= 0 ? "Positive" : "Negative"} growth trend
                </span>{" "}
                with {Math.abs(monthlyGrowth).toFixed(1)}% change vs. previous month.
              </p>
            </InsightCard>

            <InsightCard
              title="Peak Activity"
              isLoading={loadingStates.monthly}
              icon={Calendar}
              variant="info"
              description="Monthly application average"
            >
              <p className="text-gray-700">
                The dashboard maintains an average of{" "}
                {averageMonthlyApplications.toLocaleString()} applications per month,
                indicating steady demand.
              </p>
            </InsightCard>

            <InsightCard
              title="Service Demand"
              isLoading={loadingStates.assistanceType}
              icon={Target}
              variant="info"
              description="Most requested assistance type"
            >
              <p className="text-gray-700">
                The most demanded service is {mostPopularAssistance.type_of_assistance} with{" "}
                {mostPopularAssistance.count} requests.
              </p>
            </InsightCard>
          </AnalyticsGrid>
        </AnalyticsAlertCard>
      </AnalyticsStack>
    </PageContainer>
  );
};

export default Trends;
