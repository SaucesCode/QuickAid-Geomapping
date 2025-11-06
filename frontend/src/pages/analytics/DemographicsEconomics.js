import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api"; // This is the actual imported API service
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
  AlertCircle,
  VenusAndMars,
  MapPin,
} from "lucide-react";
import AnalyticsFilter from "../../components/AnalyticsFilter";

// --- Standardized BLUE Colors ---
const COLOR_PRIMARY = "#3B82F6"; // Blue-500
const COLOR_SECONDARY = "#6366F1"; // Indigo-500
const COLOR_TERTIARY = "#2563EB"; // Blue-600
const COLOR_ACCENT = "#1D4ED8"; // Blue-700
const COLOR_PINK = "#EC4899";

// Gender & Civil Status will now use Blue shades
const COLOR_SINGLE = COLOR_PRIMARY;
const COLOR_MARRIED = COLOR_TERTIARY;
const COLOR_DIVORCED = COLOR_SECONDARY;
const COLOR_WIDOWED = COLOR_ACCENT;
const COLOR_SEPARATED = "#93C5FD"; // Blue-300

// --- COLOR HELPER FUNCTIONS (Modified to be blue-centric) ---
const COLOR_MALE = COLOR_PRIMARY; // Blue
const COLOR_FEMALE = COLOR_PINK; // Indigo

const getGenderColor = gender => {
  if (!gender) return "#94A3B8"; // Slate-400
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
  return "#94A3B8"; // Default/Fallback Slate
};

// Fallback skeleton loader component for charts and lists
const SkeletonLoader = ({ height = 300, type = "chart" }) => {
  // Styles for different types of skeletons
  const chartSkeleton = <div className="h-full w-full bg-gray-200 rounded-xl"></div>;

  const statSkeleton = (
    <div className="space-y-2 p-1">
      <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
    </div>
  );

  let content;
  switch (type) {
    case "stat":
      content = statSkeleton;
      break;
    case "list":
    default:
      content = chartSkeleton;
      break;
  }

  return (
    <div
      className={`animate-pulse bg-gray-100 rounded-3xl ${type === "chart" ? "p-4" : "p-3"}`}
      style={{ height: type !== "stat" ? height : "auto" }}
    >
      {content}
    </div>
  );
};

// **StatCard Component Modified for All Blue & No Color Shadow**
const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
  isLoading,
  iconAlignment = "inner",
}) => {
  // Use a fixed Blue-Indigo gradient for the value text for visual consistency
  const valueGradient = `linear-gradient(to right, ${COLOR_PRIMARY}, ${COLOR_SECONDARY})`;
  // Use a fixed Blue-Indigo gradient for the icon background
  const iconGradient = `linear-gradient(to bottom right, ${COLOR_TERTIARY}, ${COLOR_ACCENT})`;

  return (
    <div
      className={`group bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}
      // The colored left border (style={{ borderLeftColor: color }}) has been removed.
    >
      <div className="flex items-center gap-4 justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 font-semibold">{title}</p>

          {isLoading ? (
            <div className="mt-1 space-y-2">
              <div className="h-8 w-20 bg-gray-300 rounded animate-pulse"></div>
              {subtitle && <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>}
            </div>
          ) : (
            <>
              {/* Value uses fixed blue-indigo gradient for consistency */}
              <h2
                className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r truncate overflow-hidden whitespace-nowrap"
                style={{ backgroundImage: valueGradient }}
                title={String(value)}
              >
                {value}
              </h2>
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </>
          )}
        </div>
        {/* Icon container: Uses flex-shrink-0 to maintain its size and a fixed shadow/gradient */}
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}
          // Removed dynamic color for a fixed blue gradient and removed color-specific shadow
          style={{
            background: iconGradient,
            zIndex: 10,
          }}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
};

const DemographicsEconomics = () => {
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchData = async endpoint => {
    const params = new URLSearchParams();

    if (filters.start) params.append("start_date", filters.start);
    if (filters.end) params.append("end_date", filters.end);
    if (filters.type) params.append("type", filters.type);

    const query = params.toString() ? `?${params.toString()}` : "";

    // **LOGIC MODIFIED**: Directly use the imported 'api' to fetch data.
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

  // Color palettes (Changed to Blue/Indigo variants)
  const INCOME_COLORS = [
    "#3B82F6", // Blue-500
    "#2563EB", // Blue-600
    "#1D4ED8", // Blue-700
    "#6366F1", // Indigo-500
    "#4F46E5", // Indigo-600
    "#4338CA", // Indigo-700
    "#93C5FD", // Blue-300
  ];

  // Data transformations (NO LOGIC CHANGE)
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

  // Calculated stats (adapted for loading state)
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

  if (error) {
    // Error state retained but with blue/indigo primary colors
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative z-10 bg-white p-10 rounded-3xl shadow-2xl border border-blue-200 max-w-md w-full mx-4">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mx-auto mb-6 shadow-lg">
            <AlertCircle className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Data</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {error || "Failed to fetch trends data. Please try again later."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Header component
  const HeaderComponent = (
    <header className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
          <Users className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Demographics & Economics Analysis
          </h1>
          <p className="text-gray-600 text-lg mt-1">
            Comprehensive insights into applicant demographics and economic profiles
          </p>
        </div>
      </div>
    </header>
  );

  return (
    // Main container style retained for blue/indigo background
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        {HeaderComponent}

        <AnalyticsFilter onFilterChange={setFilters} />

        {/* --- STATS SECTION (All Blue Colors & Same Alignment) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Total Applicants"
            value={
              typeof totalApplicants === "number"
                ? totalApplicants.toLocaleString()
                : totalApplicants
            }
            subtitle="Across all demographics"
            color={COLOR_PRIMARY} // Blue
            isLoading={!isGenderLoaded}
            iconAlignment="inner" // Consistent inside alignment
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
            color={COLOR_SECONDARY} // Indigo
            isLoading={!isGenderLoaded}
            iconAlignment="inner" // Consistent inside alignment
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
            color={COLOR_TERTIARY} // Blue-600
            isLoading={!isOccupationLoaded}
            iconAlignment="inner"
          />
          <StatCard
            icon={DollarSign}
            title="Income Profiles"
            value={
              typeof totalIncome === "number" ? totalIncome.toLocaleString() : totalIncome
            }
            subtitle="Total with income data"
            color={COLOR_ACCENT} // Blue-700
            isLoading={!isIncomeLoaded}
            iconAlignment="inner" // Consistent inside alignment
          />
        </div>

        {/* Gender & Civil Status - SAME SIZE AND ALIGNMENT (grid-cols-2 enforces this) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gender - Chart Container Matched */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6 border-b pb-3 border-gray-100">
              <Users className="mr-2 h-5 w-5 text-blue-600" /> Gender Distribution
            </h2>
            {loadingStates.gender ? (
              <SkeletonLoader height={300} />
            ) : (
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
                      <Cell
                        key={`cell-${index}`}
                        fill={getGenderColor(entry.gender)} // Uses blue/indigo helper
                      />
                    ))}
                  </Pie>

                  {/* Tooltip style matched */}
                  <Tooltip
                    formatter={v => [v, "Count"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "2px solid #dbeafe",
                      borderRadius: "12px",
                      fontSize: "14px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Civil Status - Chart Container Matched */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6 border-b pb-3 border-gray-100">
              <Heart className="mr-2 h-5 w-5 text-indigo-600" /> Civil Status Distribution
            </h2>
            {loadingStates.civilStatus ? (
              <SkeletonLoader height={300} />
            ) : (
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
                  {/* Tooltip style matched */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "2px solid #dbeafe",
                      borderRadius: "12px",
                      fontSize: "14px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {/* **CIVIL STATUS COLORS NOW USES BLUE/INDIGO HELPER FUNCTION** */}
                    {transformedCivilStatusData.map((entry, i) => (
                      <Cell
                        key={`status-cell-${i}`}
                        fill={getCivilStatusColor(entry.status)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Age & Age by Gender - SAME SIZE AND ALIGNMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Age Groups - Chart Container Matched */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6 border-b pb-3 border-gray-100">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-600" /> Age Group Distribution
            </h2>
            {loadingStates.ageGroup ? (
              <SkeletonLoader height={300} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={ageGroupData}
                  margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="age_group" tick={{ fill: "#4b5563" }} />
                  <YAxis tick={{ fill: "#4b5563" }} />
                  {/* Tooltip style matched */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "2px solid #dbeafe",
                      borderRadius: "12px",
                      fontSize: "14px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLOR_PRIMARY} stopOpacity={0.8} />{" "}
                      {/* Blue-500 */}
                      <stop offset="95%" stopColor={COLOR_PRIMARY} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={COLOR_ACCENT} // Blue-700
                    fill="url(#areaGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Age by Gender - Chart Container Matched */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6 border-b pb-3 border-gray-100">
              <Users className="mr-2 h-5 w-5 text-indigo-600" /> Age Groups by Gender
            </h2>
            {loadingStates.ageGender ? (
              <SkeletonLoader height={300} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={transformedAgeGenderData}
                  margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="gender" tick={{ fill: "#4b5563" }} />
                  <YAxis tick={{ fill: "#4b5563" }} />
                  {/* Tooltip style matched */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "2px solid #dbeafe",
                      borderRadius: "12px",
                      fontSize: "14px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  {/* *** Stacked Bars - Using a gradient of Blue/Indigo/Lighter Blue *** */}
                  <Bar
                    dataKey="Under 18"
                    stackId="a"
                    fill={COLOR_PRIMARY} // Blue-500
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="18-35"
                    stackId="a"
                    fill={COLOR_SECONDARY} // Indigo-500
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="36-60"
                    stackId="a"
                    fill={COLOR_TERTIARY} // Blue-600
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Over 60"
                    stackId="a"
                    fill={COLOR_ACCENT} // Blue-700
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Economics - SAME SIZE AND ALIGNMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Occupations - Chart Container Matched */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6 border-b pb-3 border-gray-100">
              <Briefcase className="mr-2 h-5 w-5 text-blue-600" /> Top 10 Occupations
            </h2>
            {loadingStates.occupation ? (
              <SkeletonLoader height={400} />
            ) : (
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
                  {/* Tooltip style matched */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "2px solid #dbeafe",
                      borderRadius: "12px",
                      fontSize: "14px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={COLOR_TERTIARY} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={COLOR_ACCENT} stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="count" fill="url(#blueGradient)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Income - Chart Container Matched */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6 border-b pb-3 border-gray-100">
              <DollarSign className="mr-2 h-5 w-5 text-indigo-600" /> Income Distribution
            </h2>
            {loadingStates.income ? (
              <SkeletonLoader height={400} />
            ) : (
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
                  {/* Tooltip style matched */}
                  <Tooltip
                    formatter={v => [v, "Applicants"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "2px solid #dbeafe",
                      borderRadius: "12px",
                      fontSize: "14px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="count" fill={COLOR_PRIMARY} radius={[8, 8, 0, 0]}>
                    {incomeDistribution.map((e, i) => (
                      <Cell key={i} fill={INCOME_COLORS[i % INCOME_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Key Insights Section - Matched to the alert/insight card style and all blue */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-3xl p-8 shadow-xl backdrop-blur-xl mt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-blue-900 mb-3">
                Key Demographics Insights
              </h3>
              <p className="text-blue-800 mb-6 leading-relaxed text-base">
                A snapshot of the most critical demographic and economic patterns identified in
                the data.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Insight Card 1 (All Blue) */}
                <div className="bg-white p-4 rounded-xl border-2 border-blue-300 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <h4 className="font-semibold text-blue-800 mb-2">Gender Balance</h4>
                  {isGenderLoaded ? (
                    <p className="text-gray-700 text-sm">
                      {dominantGender.gender} applicants represent the majority with{" "}
                      {dominantGender.count.toLocaleString()} applications
                    </p>
                  ) : (
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  )}
                </div>

                {/* Insight Card 2 (All Blue) */}
                <div className="bg-white p-4 rounded-xl border-2 border-indigo-300 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <h4 className="font-semibold text-indigo-800 mb-2">Employment Patterns</h4>
                  {isOccupationLoaded ? (
                    <p className="text-gray-700 text-sm">
                      {topOccupation?.occupation || "Various occupations"} is the most common
                      occupation among applicants
                    </p>
                  ) : (
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  )}
                </div>

                {/* Insight Card 3 (All Blue) */}
                <div className="bg-white p-4 rounded-xl border-2 border-blue-400 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <h4 className="font-semibold text-blue-900 mb-2">Economic Profile</h4>
                  {isIncomeLoaded ? (
                    <p className="text-gray-700 text-sm">
                      Total of {totalIncome.toLocaleString()} applicants provided income data,
                      showing varied economic backgrounds.
                    </p>
                  ) : (
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicsEconomics;
