import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
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

// Color Constants
const COLOR_CLAIMED = "#10B981"; // Green
const COLOR_UNCLAIMED = "#EF4444"; // Red
const COLOR_PRIMARY = "#3B82F6"; // Blue

const ASSISTANCE_COLORS = {
  Medical: "#3B82F6",
  Educational: "#10B981",
  Burial: "#F59E0B",
};

const Budget = () => {
  const [filters, setFilters] = useState({});
  // Fetch Data
  const fetchData = async endpoint => {
    const params = new URLSearchParams();

    if (filters.start) params.append("date_from", filters.start);
    if (filters.end) params.append("date_to", filters.end);
    if (filters.type) params.append("assistance", filters.type);
    if (filters.city) params.append("city", filters.city);
    if (filters.barangay) params.append("barangay", filters.barangay);
    if (filters.batch_id) params.append("batch_id", filters.batch_id);

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get(`${endpoint}${query}`);
    return res.data;
  };

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["budget", "overview", filters],
    queryFn: () => fetchData("/analytics/budget/overview/"),
  });

  const { data: byLocation, isLoading: locationLoading } = useQuery({
    queryKey: ["budget", "location", filters],
    queryFn: () => fetchData("/analytics/budget/location/?level=city"),
  });

  const { data: byAssistance, isLoading: assistanceLoading } = useQuery({
    queryKey: ["budget", "assistance", filters],
    queryFn: () => fetchData("/analytics/budget/assistance/"),
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ["budget", "trends", filters],
    queryFn: () => fetchData("/analytics/budget/trends/?granularity=monthly"),
  });

  const { data: byBatch, isLoading: batchLoading } = useQuery({
    queryKey: ["budget", "batch", filters],
    queryFn: () => fetchData("/analytics/budget/batch/"),
  });

  const { data: comparison, isLoading: comparisonLoading } = useQuery({
    queryKey: ["budget", "comparison", filters.year],
    queryFn: () => fetchData("/analytics/budget/comparison/"),
  });

  console.log("Overview:", overview);
  console.log("byLocation:", byLocation);
  console.log("byAssistance:", byAssistance);
  console.log("trends:", trends);
  console.log("byBatch:", byBatch);
  console.log("comparison:", comparison);

  // Format Currency
  const formatCurrency = value => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Loading states
  const isLoading =
    overviewLoading ||
    locationLoading ||
    assistanceLoading ||
    trendsLoading ||
    batchLoading ||
    comparisonLoading;

  return (
    <PageContainer>
      <AnalyticsStack spacing="lg">
        <PageHeader
          icon={DollarSign}
          title="Budget Analytics Dashboard"
          subtitle="Comprehensive financial insights and budget utilization tracking"
        />

        {/* Filters */}
        <AnalyticsFilter
          onFilterChange={setFilters}
          extraFields={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Optional: Add batch filter here if needed */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Batch</label>
                <select
                  value={filters.batch_id || ""}
                  onChange={e => setFilters({ ...filters, batch_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 bg-white text-sm font-medium"
                >
                  <option value="">All Batches</option>
                  {/* You can fetch batches dynamically here */}
                </select>
              </div>
            </div>
          }
        />

        {/* KPI Cards */}
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

        {/* Charts Row 1: Claimed vs Unclaimed + Budget by Assistance */}
        <AnalyticsGrid cols={{ default: 1, lg: 2 }} gap="md">
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
                  <XAxis dataKey="assistance_type" tick={{ fontSize: 11, fill: "#4b5563" }} />
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

        {/* Charts Row 2: Monthly Trends */}
        <AnalyticsChartCard
          icon={TrendingUp}
          title="Monthly Budget Trends"
          subtitle="Claims and unclaimed amounts over time"
          isLoading={trendsLoading}
        >
          <ChartContainer height={350}>
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

        {/* Charts Row 3: Budget by Location */}
        <AnalyticsChartCard
          icon={MapPin}
          title="Budget by Location (Top 10 Cities)"
          subtitle="Geographic distribution of budget utilization"
          isLoading={locationLoading}
        >
          <ChartContainer height={400}>
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

        {/* Table: Budget by Batch */}
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
                    {batch.payout_date
                      ? new Date(batch.payout_date).toLocaleDateString()
                      : "N/A"}
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

        {/* Year-over-Year Comparison */}
        {comparison && (
          <AnalyticsAlertCard icon={Calendar} title="Year-over-Year Comparison" variant="info">
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
                  <span className="text-sm text-gray-600">vs {comparison.previous_year}</span>
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
                  <span className="text-sm text-gray-600">vs {comparison.previous_year}</span>
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
        )}

        {/* Insights Summary */}
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
