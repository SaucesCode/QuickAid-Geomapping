import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Users,
  Heart,
  Briefcase,
  DollarSign,
  TrendingUp,
  User,
  VenusAndMars,
} from "lucide-react";
import AnalyticsFilter from "../../components/AnalyticsFilter";

// Import Design System Components
import {
  PageContainer,
  PageHeader,
  Card,
  StatCard,
  ChartCard,
  AlertCard,
  Stack,
  Grid,
} from "../../components/DesignSystem";

// Color Constants - KEPT UNCHANGED
const COLOR_PRIMARY = "#3B82F6";
const COLOR_SECONDARY = "#6366F1";
const COLOR_TERTIARY = "#2563EB";
const COLOR_ACCENT = "#1D4ED8";
const COLOR_PINK = "#EC4899";

const COLOR_SINGLE = COLOR_PRIMARY;
const COLOR_MARRIED = COLOR_TERTIARY;
const COLOR_DIVORCED = COLOR_SECONDARY;
const COLOR_WIDOWED = COLOR_ACCENT;
const COLOR_SEPARATED = "#93C5FD";

const COLOR_MALE = COLOR_PRIMARY;
const COLOR_FEMALE = COLOR_PINK;

// Color Helper Functions - KEPT UNCHANGED
const getGenderColor = gender => {
  if (!gender) return "#94A3B8";
  const normalized = gender.toString().trim().toLowerCase();
  if (normalized === "male") return COLOR_MALE;
  if (normalized === "female") return COLOR_FEMALE;
  return "#94A3B8";
};

const getCivilStatusColor = status => {
  const norm = (status || "").toLowerCase();
  if (norm.includes("married")) return COLOR_MARRIED;
  if (norm.includes("single")) return COLOR_SINGLE;
  if (norm.includes("divorced")) return COLOR_DIVORCED;
  if (norm.includes("widowed")) return COLOR_WIDOWED;
  if (norm.includes("separated") || norm.includes("divprced")) return COLOR_SEPARATED;
  return "#94A3B8";
};

const INCOME_COLORS = [
  "#3B82F6",
  "#2563EB",
  "#1D4ED8",
  "#6366F1",
  "#4F46E5",
  "#4338CA",
  "#93C5FD",
];

const DemographicsEconomics = () => {
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  // Fetch Logic - KEPT UNCHANGED
  const fetchData = async endpoint => {
    const params = new URLSearchParams();
    if (filters.start) params.append("start_date", filters.start);
    if (filters.end) params.append("end_date", filters.end);
    if (filters.type) params.append("type", filters.type);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get(`${endpoint}${query}`);
    return res.data;
  };

  const { data: genderData = [], isLoading: genderLoading } = useQuery({
    queryKey: ["demographics", "gender", filters],
    queryFn: () => fetchData("/analytics/demographics/gender/"),
  });

  const { data: civilStatusData = [], isLoading: civilStatusLoading } = useQuery({
    queryKey: ["demographics", "civil-status", filters],
    queryFn: () => fetchData("/analytics/demographics/civil-status/"),
  });

  const { data: ageGroupData = [], isLoading: ageGroupLoading } = useQuery({
    queryKey: ["demographics", "age-groups", filters],
    queryFn: () => fetchData("/analytics/demographics/age-groups/"),
  });

  const { data: occupationData = [], isLoading: occupationLoading } = useQuery({
    queryKey: ["demographics", "occupation", filters],
    queryFn: () => fetchData("/analytics/demographics/occupation/"),
  });

  const { data: ageGenderData = [], isLoading: ageGenderLoading } = useQuery({
    queryKey: ["demographics", "age-gender", filters],
    queryFn: () => fetchData("/analytics/demographics/age-gender/"),
  });

  const { data: incomeDistribution = [], isLoading: incomeLoading } = useQuery({
    queryKey: ["economics", "income-distribution", filters],
    queryFn: () => fetchData("/analytics/economics/income-distribution/"),
  });

  const loadingStates = {
    gender: genderLoading,
    civilStatus: civilStatusLoading,
    ageGroup: ageGroupLoading,
    occupation: occupationLoading,
    ageGender: ageGenderLoading,
    income: incomeLoading,
  };

  // Data Transformations - KEPT UNCHANGED
  const transformGenderData = data =>
    data.map(item => ({
      gender: item.background_info__sex || item.sex || "Unknown",
      count: item.count,
    }));

  const transformCivilStatusData = data =>
    data.map(item => ({
      status: item.background_info__civil_status || item.civil_status || "Unknown",
      count: item.count,
    }));

  const transformOccupationData = data =>
    data
      .filter(item => item.occupation)
      .slice(0, 10)
      .map(item => ({
        occupation: item.occupation,
        count: item.count,
      }));

  const transformAgeGenderData = data =>
    data.map(item => ({
      gender: item.background_info__sex || item.sex || "Unknown",
      "Under 18": item.under18 || 0,
      "18-35": item.between18_35 || 0,
      "36-60": item.between36_60 || 0,
      "Over 60": item.above60 || 0,
    }));

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  const transformedGenderData = transformGenderData(genderData);
  const transformedCivilStatusData = transformCivilStatusData(civilStatusData);
  const transformedOccupationData = transformOccupationData(occupationData);
  const transformedAgeGenderData = transformAgeGenderData(ageGenderData);

  // Calculated Stats - KEPT UNCHANGED
  const isGenderLoaded = !loadingStates.gender;
  const isOccupationLoaded = !loadingStates.occupation;
  const isIncomeLoaded = !loadingStates.income;

  const totalApplicants = isGenderLoaded
    ? transformedGenderData.reduce((s, i) => s + i.count, 0)
    : "...";
  const dominantGender = isGenderLoaded
    ? transformedGenderData.reduce((p, c) => (p.count > c.count ? p : c), {
        count: 0,
        gender: "N/A",
      })
    : { count: "...", gender: "..." };

  const topOccupation = isOccupationLoaded
    ? transformedOccupationData[0]
    : { occupation: "...", count: "..." };
  const totalIncome = isIncomeLoaded
    ? incomeDistribution.reduce((s, i) => s + i.count, 0)
    : "...";

  return (
    <PageContainer>
      <Stack spacing="lg">
        {/* REDESIGNED: Using PageHeader from Design System */}
        <PageHeader
          icon={Users}
          title="Demographics & Economics Analysis"
          subtitle="Comprehensive insights into applicant demographics and economic profiles"
        />

        <AnalyticsFilter onFilterChange={setFilters} />

        {/* REDESIGNED: Using Grid and StatCard from Design System */}
        <Grid cols={{ default: 1, sm: 2, lg: 4 }} gap="md">
          <StatCard
            icon={Users}
            title="Total Applicants"
            value={
              typeof totalApplicants === "number"
                ? totalApplicants.toLocaleString()
                : totalApplicants
            }
            subtitle="Across all demographics"
            color="blue"
            isLoading={!isGenderLoaded}
          />
          <StatCard
            icon={VenusAndMars}
            title="Dominant Gender"
            value={dominantGender.gender || "N/A"}
            subtitle={`${
              typeof dominantGender.count === "number"
                ? dominantGender.count.toLocaleString()
                : dominantGender.count
            } applications`}
            color="blue"
            isLoading={!isGenderLoaded}
          />
          <StatCard
            icon={Briefcase}
            title="Top Occupation"
            value={topOccupation?.occupation || "N/A"}
            subtitle={`${
              typeof topOccupation?.count === "number"
                ? topOccupation?.count.toLocaleString()
                : topOccupation?.count || 0
            } applicants`}
            color="blue"
            isLoading={!isOccupationLoaded}
          />
          <StatCard
            icon={DollarSign}
            title="Income Profiles"
            value={
              typeof totalIncome === "number" ? totalIncome.toLocaleString() : totalIncome
            }
            subtitle="Total with income data"
            color="blue"
            isLoading={!isIncomeLoaded}
          />
        </Grid>

        {/* REDESIGNED: Using Grid and ChartCard from Design System */}
        <Grid cols={{ default: 1, lg: 2 }} gap="lg">
          <ChartCard icon={Users} title="Gender Distribution" isLoading={loadingStates.gender}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transformedGenderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="gender"
                  stroke="#fff"
                >
                  {transformedGenderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getGenderColor(entry.gender)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            icon={Heart}
            title="Civil Status Distribution"
            isLoading={loadingStates.civilStatus}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={transformedCivilStatusData}
                margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis
                  dataKey="status"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  tick={{ fill: "#4b5563" }}
                />
                <YAxis tick={{ fill: "#4b5563" }} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {transformedCivilStatusData.map((entry, i) => (
                    <Cell key={`status-cell-${i}`} fill={getCivilStatusColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid cols={{ default: 1, lg: 2 }} gap="lg">
          <ChartCard
            icon={TrendingUp}
            title="Age Group Distribution"
            isLoading={loadingStates.ageGroup}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={ageGroupData}
                margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="age_group" tick={{ fill: "#4b5563" }} />
                <YAxis tick={{ fill: "#4b5563" }} />
                <Tooltip />
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLOR_PRIMARY} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLOR_PRIMARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={COLOR_ACCENT}
                  fill="url(#areaGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            icon={Users}
            title="Age Groups by Gender"
            isLoading={loadingStates.ageGender}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={transformedAgeGenderData}
                margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="gender" tick={{ fill: "#4b5563" }} />
                <YAxis tick={{ fill: "#4b5563" }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="Under 18"
                  stackId="a"
                  fill={COLOR_PRIMARY}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="18-35"
                  stackId="a"
                  fill={COLOR_SECONDARY}
                  radius={[4, 4, 0, 0]}
                />
                <Bar dataKey="36-60" stackId="a" fill={COLOR_TERTIARY} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Over 60" stackId="a" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid cols={{ default: 1, lg: 2 }} gap="lg">
          <ChartCard
            icon={Briefcase}
            title="Top 10 Occupations"
            isLoading={loadingStates.occupation}
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={transformedOccupationData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis type="number" tick={{ fill: "#4b5563" }} />
                <YAxis
                  type="category"
                  dataKey="occupation"
                  width={80}
                  fontSize={11}
                  tick={{ fill: "#4b5563" }}
                />
                <Tooltip />
                <defs>
                  <linearGradient id="blueGradientHoriz" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={COLOR_TERTIARY} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={COLOR_ACCENT} stopOpacity={1} />
                  </linearGradient>
                </defs>
                <Bar dataKey="count" fill="url(#blueGradientHoriz)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            icon={DollarSign}
            title="Income Distribution"
            isLoading={loadingStates.income}
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={incomeDistribution}
                margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis
                  dataKey="range"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={10}
                  tick={{ fill: "#4b5563" }}
                />
                <YAxis tick={{ fill: "#4b5563" }} />
                <Tooltip formatter={v => [v, "Applicants"]} />
                <Bar dataKey="count" fill={COLOR_PRIMARY} radius={[8, 8, 0, 0]}>
                  {incomeDistribution.map((e, i) => (
                    <Cell key={i} fill={INCOME_COLORS[i % INCOME_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* REDESIGNED: Using AlertCard from Design System */}
        <AlertCard
          icon={Users}
          title="Key Demographics Insights"
          description="A snapshot of the most critical demographic and economic patterns identified in the data."
          variant="info"
        >
          <Grid cols={{ default: 1, md: 3 }} gap="md">
            <Card>
              <h4 className="font-semibold text-blue-800 mb-2">Gender Balance</h4>
              {isGenderLoaded ? (
                <p className="text-gray-700 text-sm">
                  {dominantGender.gender} applicants represent the majority with{" "}
                  {dominantGender.count.toLocaleString()} applications
                </p>
              ) : (
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              )}
            </Card>

            <Card>
              <h4 className="font-semibold text-indigo-800 mb-2">Employment Patterns</h4>
              {isOccupationLoaded ? (
                <p className="text-gray-700 text-sm">
                  {topOccupation?.occupation || "Various occupations"} is the most common
                  occupation among applicants
                </p>
              ) : (
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              )}
            </Card>

            <Card>
              <h4 className="font-semibold text-blue-900 mb-2">Economic Profile</h4>
              {isIncomeLoaded ? (
                <p className="text-gray-700 text-sm">
                  Total of {totalIncome.toLocaleString()} applicants provided income data,
                  showing varied economic backgrounds.
                </p>
              ) : (
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              )}
            </Card>
          </Grid>
        </AlertCard>
      </Stack>
    </PageContainer>
  );
};

export default DemographicsEconomics;
