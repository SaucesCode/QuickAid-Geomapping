import React, { useEffect, useState } from "react";
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Users,
  Heart,
  Briefcase,
  DollarSign,
  TrendingUp,
  UserCheck,
  AlertCircle,
  Loader2,
  MapPin,
} from "lucide-react";
import AnalyticsFilter from "../../components/AnalyticsFilter";



const COLOR_SINGLE = "#3B82F6";  // Single: Blue
const COLOR_MARRIED = "#EF4444"; // Married: Red
const COLOR_DIVORCED = "#F59E0B"; // Divorced: Yellow (using Amber-500)
const COLOR_WIDOWED = "#1F2937"; // Widowed: Black (using Gray-800)
const COLOR_SEPARATED = "#9CA3AF"; // Separated: Gray (used for any other divprced/separated status)

// --- COLOR HELPER FUNCTIONS (PRESERVED) ---
const COLOR_MALE = "#3B82F6";   // Blue
const COLOR_FEMALE = "#EC4899"; // Pink

const getGenderColor = (gender) => {
  if (!gender) return "#808080";
  const normalized = gender.toString().trim().toLowerCase();
  if (normalized === "male") return COLOR_MALE;
  if (normalized === "female") return COLOR_FEMALE;
  return "#808080";
};



const getCivilStatusColor = (status) => {
    const norm = (status || "").toLowerCase();
    if (norm.includes("married")) return COLOR_MARRIED;
    if (norm.includes("single")) return COLOR_SINGLE;
    if (norm.includes("divorced")) return COLOR_DIVORCED;
    if (norm.includes("widowed")) return COLOR_WIDOWED;
    // Assuming 'divprced' maps to 'Separated' status or similar for the gray color
    if (norm.includes("separated") || norm.includes("divprced")) return COLOR_SEPARATED;
    return "#6B7280"; // Default/Fallback Gray
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

// **FIXED STATCARD COMPONENT: ADDED 'title' ATTRIBUTE FOR HOVER TOOLTIP**
const StatCard = ({ icon: Icon, title, value, subtitle, color, isLoading, iconAlignment = 'inner' }) => {
  return (
    <div
      className={`group bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}
      style={{ borderLeftColor: color }}
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
              {/* Added title={String(value)} to show full text on hover */}
              <h2
                className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r truncate overflow-hidden whitespace-nowrap"
                style={{ backgroundImage: `linear-gradient(to right, ${color}, #6366f1)` }}
                title={String(value)} 
              >
                {value}
              </h2>
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </>
          )}
        </div>
        {/* Icon container: Uses flex-shrink-0 to maintain its size */}
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}
          style={{
            backgroundColor: color,
            background: `linear-gradient(to bottom right, ${color}90, ${color})`,
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

  // **MOCK DATA REMOVED** - Component now relies exclusively on the imported 'api' service.

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

  // Color palettes (Only generic ones remain here)
  const INCOME_COLORS = [
    "#FF9999",
    "#66B2FF",
    "#99FF99",
    "#FFCC99",
    "#FF99CC",
    "#99CCFF",
    "#FFB366",
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-red-50 to-indigo-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative z-10 bg-white p-10 rounded-3xl shadow-2xl border border-red-200 max-w-md w-full mx-4">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-6 shadow-lg">
            <AlertCircle className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Data</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {error || "Failed to fetch trends data. Please try again later."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Header component matched to Geographic.js header style
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
    // New: Matched main container style from Geographic.js, including subtle background effects
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        {HeaderComponent}

        <AnalyticsFilter onFilterChange={setFilters} />

        {/* --- STATS SECTION (Icons Fixed to be Inside and Non-Overlapping) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Total Applicants"
            value={typeof totalApplicants === "number" ? totalApplicants.toLocaleString() : totalApplicants}
            subtitle="Across all demographics"
            color="#3B82F6" 
            isLoading={!isGenderLoaded}
            iconAlignment="inner" // Consistent inside alignment
          />
          <StatCard
            icon={UserCheck}
            title="Dominant Gender"
            value={dominantGender.gender || "N/A"}
            subtitle={`${typeof dominantGender.count === "number" ? dominantGender.count.toLocaleString() : dominantGender.count} applications`}
            // Use helper for color
            color={getGenderColor(dominantGender.gender)} 
            isLoading={!isGenderLoaded}
            iconAlignment="inner" // Consistent inside alignment
          />
          {/* Top Occupation now has long text truncated and a tooltip on hover */}
          <StatCard
            icon={Briefcase} 
            title="Top Occupation"
            value={topOccupation?.occupation || "N/A"}
            subtitle={`${typeof topOccupation?.count === "number" ? topOccupation?.count.toLocaleString() : topOccupation?.count || 0} applicants`}
            color="#10B981" 
            isLoading={!isOccupationLoaded}
            iconAlignment="inner" 
          />
          <StatCard
            icon={DollarSign}
            title="Income Profiles"
            value={typeof totalIncome === "number" ? totalIncome.toLocaleString() : totalIncome}
            subtitle="Total with income data"
            color="#F59E0B" 
            isLoading={!isIncomeLoaded}
            iconAlignment="inner" // Consistent inside alignment
          />
        </div>


        {/* Gender & Civil Status */}
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
                        fill={getGenderColor(entry.gender)} // ✅ this line
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
              <Heart className="mr-2 h-5 w-5 text-pink-600" /> Civil Status Distribution
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
                    {/* **CIVIL STATUS COLORS VIA HELPER FUNCTION** */}
                    {transformedCivilStatusData.map((entry, i) => (
                      <Cell key={`status-cell-${i}`} fill={getCivilStatusColor(entry.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Age & Age by Gender */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Age Groups - Chart Container Matched */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6 border-b pb-3 border-gray-100">
              <TrendingUp className="mr-2 h-5 w-5 text-green-600" /> Age Group Distribution
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
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#06B6D4"
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
                  {/* *** Stacked Bars - Using the new gender colors for the main age groups *** */}
                  <Bar dataKey="Under 18" stackId="a" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="18-35" stackId="a" fill={COLOR_MALE} radius={[4, 4, 0, 0]} /> 
                  <Bar dataKey="36-60" stackId="a" fill={COLOR_FEMALE} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Over 60" stackId="a" fill="#96CEB4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Economics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Occupations - Chart Container Matched */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6 border-b pb-3 border-gray-100">
              <Briefcase className="mr-2 h-5 w-5 text-emerald-600" /> Top 10 Occupations
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
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="count" fill="url(#greenGradient)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Income - Chart Container Matched */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6 border-b pb-3 border-gray-100">
              <DollarSign className="mr-2 h-5 w-5 text-yellow-600" /> Income Distribution
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
                  <Bar dataKey="count" fill="#F59E0B" radius={[8, 8, 0, 0]}>
                    {incomeDistribution.map((e, i) => (
                      <Cell key={i} fill={INCOME_COLORS[i % INCOME_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Key Insights Section - Matched to the alert/insight card style */}
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
                {/* Insight Card 1 */}
                <div className="bg-white p-4 rounded-xl border-2 border-blue-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
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

                {/* Insight Card 2 */}
                <div className="bg-white p-4 rounded-xl border-2 border-green-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <h4 className="font-semibold text-green-800 mb-2">Employment Patterns</h4>
                  {isOccupationLoaded ? (
                    <p className="text-gray-700 text-sm">
                      {topOccupation?.occupation || "Various occupations"} is the most
                      common occupation among applicants
                    </p>
                  ) : (
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  )}
                </div>

                {/* Insight Card 3 */}
                <div className="bg-white p-4 rounded-xl border-2 border-yellow-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <h4 className="font-semibold text-yellow-800 mb-2">Economic Profile</h4>
                  {isIncomeLoaded ? (
                    <p className="text-gray-700 text-sm">
                      Total of {totalIncome.toLocaleString()} applicants provided income
                      data, showing varied economic backgrounds.
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