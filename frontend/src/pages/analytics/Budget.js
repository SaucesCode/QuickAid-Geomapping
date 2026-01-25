import { useState } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useAnalyticsQuery } from "../../hooks/useAnalyticsQuery";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  MapPin,
  FileText,
  Calendar,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import AnalyticsFilter from "../../components/AnalyticsFilter";
import { ASSISTANCE_COLORS } from "../../utils/assistanceColors";
import { COLOR_CLAIMED, COLOR_UNCLAIMED, COLOR_PRIMARY } from "../../utils/chartColors";
import { formatLongDate } from "../../utils/dateFormatters";

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
  InsightCard,
  AnalyticsTable,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
} from "../../components/AnalyticsComponents";

const BUDGET_QUERY_OPTS = {
  paramMap: { start_date: "date_from", end_date: "date_to", type: "assistance" },
  extraKeys: ["batch_id"],
};

const Budget = () => {
  const [filters, setFilters] = useState({});

  usePageTitle("Budget Analytics");

  const { data: overview, isLoading: overviewLoading } = useAnalyticsQuery(
    "/analytics/budget/overview/",
    filters,
    { queryKey: ["budget", "overview", filters], ...BUDGET_QUERY_OPTS }
  );

  const { data: byLocation, isLoading: locationLoading } = useAnalyticsQuery(
    "/analytics/budget/location/?level=city",
    filters,
    { queryKey: ["budget", "location", filters], ...BUDGET_QUERY_OPTS }
  );

  const { data: byAssistance, isLoading: assistanceLoading } = useAnalyticsQuery(
    "/analytics/budget/assistance/",
    filters,
    { queryKey: ["budget", "assistance", filters], ...BUDGET_QUERY_OPTS }
  );

  const { data: trends, isLoading: trendsLoading } = useAnalyticsQuery(
    "/analytics/budget/trends/?granularity=monthly",
    filters,
    { queryKey: ["budget", "trends", filters], ...BUDGET_QUERY_OPTS }
  );

  const { data: byBatch, isLoading: batchLoading } = useAnalyticsQuery(
    "/analytics/budget/batch/",
    filters,
    { queryKey: ["budget", "batch", filters], ...BUDGET_QUERY_OPTS }
  );

  const { data: comparison, isLoading: comparisonLoading } = useAnalyticsQuery(
    "/analytics/budget/comparison/",
    filters,
    { queryKey: ["budget", "comparison", filters.year], ...BUDGET_QUERY_OPTS }
  );

  const { data: allocatedByLocation, isLoading: allocatedLocationLoading } = useAnalyticsQuery(
    "/analytics/budget/allocated/location/?level=city",
    filters,
    { queryKey: ["budget", "allocated-location", filters], ...BUDGET_QUERY_OPTS }
  );

  const { data: allocatedAnnual, isLoading: allocatedAnnualLoading } = useAnalyticsQuery(
    "/analytics/budget/allocated/assistance/annual/",
    filters,
    { queryKey: ["budget", "allocated-annual", filters], ...BUDGET_QUERY_OPTS }
  );

  const { data: allocatedSummary, isLoading: allocatedSummaryLoading } = useAnalyticsQuery(
    "/analytics/budget/allocated/summary/",
    filters,
    { queryKey: ["budget", "allocated-summary", filters], ...BUDGET_QUERY_OPTS }
  );

  const { data: topLocations, isLoading: topLocationsLoading } = useAnalyticsQuery(
    "/analytics/budget/allocated/top-locations/?limit=10",
    filters,
    { queryKey: ["budget", "top-locations", filters], ...BUDGET_QUERY_OPTS }
  );

  const { data: yearlyComparison, isLoading: yearlyComparisonLoading } = useAnalyticsQuery(
    "/analytics/budget/allocated/yearly-comparison/",
    filters,
    { queryKey: ["budget", "yearly-comparison"], ...BUDGET_QUERY_OPTS }
  );

  // Format Currency
  const formatCurrency = value => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <PageContainer>
      <AnalyticsStack spacing="lg">
        {/* ===== HEADER ===== */}
        <PageHeader
          icon={DollarSign}
          title="Budget Analytics Dashboard"
          subtitle="Comprehensive financial insights and budget utilization tracking"
        />

        {/* ===== FILTERS ===== */}
        <AnalyticsFilter onFilterChange={setFilters} />

        {/* ===== KPI CARDS ===== */}
        <AnalyticsGrid cols={{ default: 1, sm: 2, lg: 4 }} gap="md">
          <AnalyticsStatCard
            icon={DollarSign}
            title="Total Budget"
            value={formatCurrency(overview?.total_budget || 0)}
            subtitle="Allocated amount"
            color="blue"
            isLoading={overviewLoading}
          />

          <AnalyticsStatCard
            icon={CheckCircle}
            title="Total Claimed"
            value={formatCurrency(overview?.total_claimed || 0)}
            subtitle={`${overview?.claim_rate || 0}% utilization`}
            color="green"
            isLoading={overviewLoading}
          />

          <AnalyticsStatCard
            icon={AlertCircle}
            title="Total Unclaimed"
            value={formatCurrency(overview?.total_unclaimed || 0)}
            subtitle={`${overview?.unclaimed_count || 0} beneficiaries`}
            color="red"
            isLoading={overviewLoading}
          />

          <AnalyticsStatCard
            icon={TrendingUp}
            title="Avg Claim Amount"
            value={formatCurrency(overview?.avg_claim_amount || 0)}
            subtitle="Per beneficiary"
            color="purple"
            isLoading={overviewLoading}
          />
        </AnalyticsGrid>

        {/* ===== SECTION 1: BUDGET STATUS OVERVIEW (AFFECTED BY FILTERS) ===== */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800 px-1">Budget Status Overview</h2>
          <AnalyticsGrid cols={{ default: 1, lg: 2 }} gap="md">
            {/* Claimed vs Unclaimed Pie Chart */}
            <AnalyticsChartCard
              icon={DollarSign}
              title="Budget Allocation Status"
              subtitle="Claimed vs Unclaimed breakdown"
              isLoading={overviewLoading}
            >
              <ChartContainer height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Claimed",
                          value: overview?.total_claimed || 0,
                        },
                        {
                          name: "Unclaimed",
                          value: overview?.total_unclaimed || 0,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={100}
                      dataKey="value"
                      stroke="#fff"
                    >
                      <Cell fill={COLOR_CLAIMED} />
                      <Cell fill={COLOR_UNCLAIMED} />
                    </Pie>
                    <Tooltip formatter={value => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </AnalyticsChartCard>

            {/* Budget by Assistance Type */}
            <AnalyticsChartCard
              icon={FileText}
              title="Budget by Assistance Type"
              subtitle="Program-wise budget allocation"
              isLoading={assistanceLoading}
            >
              <ChartContainer height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byAssistance?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis
                      dataKey="assistance_type"
                      tick={{ fontSize: 11, fill: "#4b5563" }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#4b5563" }} />
                    <Tooltip formatter={value => formatCurrency(value)} />
                    <Legend />
                    <Bar
                      dataKey="total_claimed"
                      fill={COLOR_CLAIMED}
                      name="Claimed"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="total_unclaimed"
                      fill={COLOR_UNCLAIMED}
                      name="Unclaimed"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </AnalyticsChartCard>
          </AnalyticsGrid>
        </div>

        {/* ===== SECTION 2: TRENDS & GEOGRAPHIC (AFFECTED BY FILTERS) ===== */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800 px-1">
            Trends & Geographic Analysis
          </h2>
          <AnalyticsGrid cols={{ default: 1, lg: 2 }} gap="md">
            {/* Batch Budget Trends */}
            <AnalyticsChartCard
              icon={TrendingUp}
              title="Budget Trends Over Time"
              subtitle="Claims and unclaimed amounts per batch"
              isLoading={trendsLoading}
            >
              <ChartContainer height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 10, fill: "#4b5563" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#4b5563" }} />
                    <Tooltip formatter={value => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total_claimed"
                      stroke={COLOR_CLAIMED}
                      strokeWidth={2}
                      name="Claimed"
                      dot={{ fill: COLOR_CLAIMED }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total_unclaimed"
                      stroke={COLOR_UNCLAIMED}
                      strokeWidth={2}
                      name="Unclaimed"
                      dot={{ fill: COLOR_UNCLAIMED }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total_allocated"
                      stroke={COLOR_PRIMARY}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Total Budget"
                      dot={{ fill: COLOR_PRIMARY }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </AnalyticsChartCard>

            {/* Geographic Distribution */}
            <AnalyticsChartCard
              icon={MapPin}
              title="Budget by Location (Top 10 Cities)"
              subtitle="Geographic distribution of budget utilization"
              isLoading={locationLoading}
            >
              <ChartContainer height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(byLocation?.data || []).slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#4b5563" }} />
                    <YAxis
                      type="category"
                      dataKey="location_name"
                      tick={{ fontSize: 11, fill: "#4b5563" }}
                      width={100}
                    />
                    <Tooltip formatter={value => formatCurrency(value)} />
                    <Legend />
                    <Bar
                      dataKey="total_claimed"
                      fill={COLOR_CLAIMED}
                      name="Claimed"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="total_unclaimed"
                      fill={COLOR_UNCLAIMED}
                      name="Unclaimed"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </AnalyticsChartCard>
          </AnalyticsGrid>
        </div>

        {/* ===== SECTION 3: BATCH DETAILS (AFFECTED BY FILTERS) ===== */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800 px-1">
            Disbursement Batch Breakdown
          </h2>
          <AnalyticsChartCard
            icon={Package}
            title="Budget by Disbursement Batch"
            subtitle="Batch-level budget breakdown"
            isLoading={batchLoading}
          >
            <AnalyticsTable>
              <TableHeader>
                <TableHeaderCell>Batch Name</TableHeaderCell>
                <TableHeaderCell>Payout Date</TableHeaderCell>
                <TableHeaderCell>Total Budget</TableHeaderCell>
                <TableHeaderCell>Claimed</TableHeaderCell>
                <TableHeaderCell>Unclaimed</TableHeaderCell>
                <TableHeaderCell>Claim Rate</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {(byBatch?.data || []).slice(0, 10).map((batch, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{batch.batch_name}</TableCell>
                    <TableCell>
                      {batch.payout_date ? formatLongDate(batch.payout_date) : "N/A"}
                    </TableCell>
                    <TableCell>{formatCurrency(batch.total_allocated)}</TableCell>
                    <TableCell className="text-green-600 font-semibold">
                      {formatCurrency(batch.total_claimed)}
                    </TableCell>
                    <TableCell className="text-red-600 font-semibold">
                      {formatCurrency(batch.total_unclaimed)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          batch.claim_rate >= 80
                            ? "success"
                            : batch.claim_rate >= 60
                            ? "warning"
                            : "danger"
                        }
                      >
                        {batch.claim_rate?.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          batch.batch_status === "FINALIZED"
                            ? "success"
                            : batch.batch_status === "CLOSED"
                            ? "warning"
                            : "default"
                        }
                      >
                        {batch.batch_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </AnalyticsTable>
          </AnalyticsChartCard>
        </div>

        {/* ===== SECTION 4: YEAR-OVER-YEAR COMPARISON (NOT AFFECTED BY MOST FILTERS) ===== */}
        {comparison && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-800 px-1">Year-over-Year Comparison</h2>
            <AnalyticsAlertCard icon={Calendar} title="YoY Budget Analysis" variant="info">
              <AnalyticsGrid cols={{ default: 1, md: 3 }} gap="sm">
                <InsightCard title="Budget Change" isLoading={comparisonLoading}>
                  <div className="flex items-center gap-2">
                    {comparison.changes?.budget_change_percentage >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                    <span
                      className={`text-lg font-bold ${
                        comparison.changes?.budget_change_percentage >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {comparison.changes?.budget_change_percentage >= 0 ? "+" : ""}
                      {comparison.changes?.budget_change_percentage?.toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-600">
                      vs {comparison.previous_year}
                    </span>
                  </div>
                </InsightCard>

                <InsightCard title="Claims Change" isLoading={comparisonLoading}>
                  <div className="flex items-center gap-2">
                    {comparison.changes?.claimed_change_percentage >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                    <span
                      className={`text-lg font-bold ${
                        comparison.changes?.claimed_change_percentage >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {comparison.changes?.claimed_change_percentage >= 0 ? "+" : ""}
                      {comparison.changes?.claimed_change_percentage?.toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-600">
                      vs {comparison.previous_year}
                    </span>
                  </div>
                </InsightCard>

                <InsightCard title="Claim Rate" isLoading={comparisonLoading}>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-semibold">{comparison.current_year}:</span>{" "}
                      {comparison.current?.claim_rate}%
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">{comparison.previous_year}:</span>{" "}
                      {comparison.previous?.claim_rate}%
                    </div>
                  </div>
                </InsightCard>
              </AnalyticsGrid>
            </AnalyticsAlertCard>
          </div>
        )}

        {/* ===== SECTION 5: ALLOCATED BUDGET ANALYTICS (NOT AFFECTED BY MOST FILTERS) ===== */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800 px-1">Allocated Budget Deep Dive</h2>

          {/* Allocated Budget Summary */}
          {allocatedSummary && (
            <AnalyticsAlertCard
              icon={DollarSign}
              title="Budget Allocation Overview"
              variant="info"
            >
              <AnalyticsGrid cols={{ default: 1, md: 3 }} gap="sm">
                <InsightCard title="Total Allocated" isLoading={allocatedSummaryLoading}>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(allocatedSummary?.total_allocated || 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Across {allocatedSummary?.total_beneficiaries || 0} beneficiaries
                  </div>
                </InsightCard>

                <InsightCard title="Average Allocation" isLoading={allocatedSummaryLoading}>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(allocatedSummary?.avg_allocation || 0)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Per beneficiary</div>
                </InsightCard>

                <InsightCard title="Top Program" isLoading={allocatedSummaryLoading}>
                  <div className="text-lg font-bold text-green-600">
                    {allocatedSummary?.assistance_breakdown?.[0]?.assistance_type || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {allocatedSummary?.assistance_breakdown?.[0]?.percentage || 0}% of total
                  </div>
                </InsightCard>
              </AnalyticsGrid>
            </AnalyticsAlertCard>
          )}

          {/* Annual Trends Side by Side */}
          <AnalyticsGrid cols={{ default: 1, lg: 2 }} gap="md">
            {/* Annual Allocation Trends */}
            {yearlyComparison && (
              <AnalyticsChartCard
                icon={Calendar}
                title="Annual Budget Allocation Trends"
                subtitle="Year-over-year allocation comparison"
                isLoading={yearlyComparisonLoading}
              >
                <ChartContainer height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearlyComparison?.data || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#4b5563" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#4b5563" }} />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "yoy_percentage") return `${value}%`;
                          return formatCurrency(value);
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="total_allocated"
                        fill={COLOR_PRIMARY}
                        name="Total Allocated"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="beneficiary_count"
                        fill="#10B981"
                        name="Beneficiaries"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>

                {/* YoY Change Summary */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    Year-over-Year Changes
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {yearlyComparison?.data
                      ?.filter(item => item.yoy_percentage !== null)
                      .slice(-3)
                      .map((item, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-medium">{item.year}: </span>
                          <span
                            className={`font-bold ${
                              item.yoy_percentage >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {item.yoy_percentage >= 0 ? "+" : ""}
                            {item.yoy_percentage}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </AnalyticsChartCard>
            )}

            {/* Assistance Type Annual Breakdown */}
            {allocatedAnnual && (
              <AnalyticsChartCard
                icon={TrendingUp}
                title="Annual Budget by Assistance Type"
                subtitle="Allocation trends by program over years"
                isLoading={allocatedAnnualLoading}
              >
                <ChartContainer height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={allocatedAnnual?.data || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#4b5563" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#4b5563" }} />
                      <Tooltip formatter={value => formatCurrency(value)} />
                      <Legend />
                      {allocatedAnnual?.assistance_types?.map((type, idx) => (
                        <Line
                          key={type}
                          type="monotone"
                          dataKey={`by_assistance.${type}.total_allocated`}
                          stroke={ASSISTANCE_COLORS[type] || COLOR_PRIMARY}
                          strokeWidth={2}
                          name={type}
                          dot={{ fill: ASSISTANCE_COLORS[type] || COLOR_PRIMARY }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </AnalyticsChartCard>
            )}
          </AnalyticsGrid>

          {/* Top 10 Cities Table */}
          <AnalyticsChartCard
            icon={MapPin}
            title="Top 10 Cities by Allocated Budget"
            subtitle="Highest budget allocations by location"
            isLoading={topLocationsLoading}
          >
            <AnalyticsTable>
              <TableHeader>
                <TableHeaderCell>Rank</TableHeaderCell>
                <TableHeaderCell>City</TableHeaderCell>
                <TableHeaderCell>Total Allocated</TableHeaderCell>
                <TableHeaderCell>Beneficiaries</TableHeaderCell>
                <TableHeaderCell>% of Total</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {(topLocations?.data || []).map((loc, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Badge
                        variant={
                          loc.rank === 1 ? "success" : loc.rank <= 3 ? "warning" : "default"
                        }
                      >
                        #{loc.rank}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{loc.location_name}</TableCell>
                    <TableCell className="font-semibold text-blue-600">
                      {formatCurrency(loc.total_allocated)}
                    </TableCell>
                    <TableCell>{loc.beneficiary_count.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="info">{loc.percentage}%</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </AnalyticsTable>
          </AnalyticsChartCard>
        </div>

        <AnalyticsAlertCard icon={AlertCircle} title="Budget Analysis Insights" variant="info">
          <AnalyticsGrid cols={{ default: 1, md: 3 }} gap="sm">
            <InsightCard title="Budget Utilization" isLoading={overviewLoading}>
              The current claim rate of{" "}
              <span className="font-bold">{overview?.claim_rate?.toFixed(1)}%</span> indicates{" "}
              {overview?.claim_rate >= 80
                ? "excellent"
                : overview?.claim_rate >= 60
                ? "good"
                : "low"}{" "}
              budget utilization.
            </InsightCard>

            <InsightCard title="Unclaimed Funds" isLoading={overviewLoading}>
              A total of{" "}
              <span className="font-bold">
                {formatCurrency(overview?.total_unclaimed || 0)}
              </span>{" "}
              remains unclaimed across {overview?.unclaimed_count || 0} beneficiaries.
            </InsightCard>

            <InsightCard title="Program Performance" isLoading={assistanceLoading}>
              {byAssistance?.data?.[0]?.assistance_type || "Medical"} assistance has the
              highest budget allocation with{" "}
              <span className="font-bold">
                {formatCurrency(byAssistance?.data?.[0]?.total_allocated || 0)}
              </span>
              .
            </InsightCard>
          </AnalyticsGrid>
        </AnalyticsAlertCard>
      </AnalyticsStack>
    </PageContainer>
  );
};

export default Budget;
