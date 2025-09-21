import React, { useEffect, useState } from "react";
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
} from "lucide-react";

const DemographicsEconomics = () => {
  const [genderData, setGenderData] = useState([]);
  const [civilStatusData, setCivilStatusData] = useState([]);
  const [ageGroupData, setAgeGroupData] = useState([]);
  const [occupationData, setOccupationData] = useState([]);
  const [ageGenderData, setAgeGenderData] = useState([]);
  const [incomeDistribution, setIncomeDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("Occupations", occupationData);

  // Color palettes for different charts
  const GENDER_COLORS = ["#3B82F6", "#EC4899", "#10B981", "#F59E0B"];
  const CIVIL_STATUS_COLORS = ["#8B5CF6", "#06B6D4", "#84CC16", "#F97316", "#EF4444"];
  const AGE_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];
  const INCOME_COLORS = [
    "#FF9999",
    "#66B2FF",
    "#99FF99",
    "#FFCC99",
    "#FF99CC",
    "#99CCFF",
    "#FFB366",
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          genderRes,
          civilStatusRes,
          ageGroupRes,
          occupationRes,
          ageGenderRes,
          incomeDistributionRes,
        ] = await Promise.all([
          api.get("/analytics/demographics/gender/"),
          api.get("/analytics/demographics/civil-status/"),
          api.get("/analytics/demographics/age-groups/"),
          api.get("/analytics/demographics/occupation/"),
          api.get("/analytics/demographics/age-gender/"),
          api.get("/analytics/economics/income-distribution/"),
        ]);

        setGenderData(genderRes.data || []);
        setCivilStatusData(civilStatusRes.data || []);
        setAgeGroupData(ageGroupRes.data || []);
        setOccupationData(occupationRes.data || []);
        setAgeGenderData(ageGenderRes.data || []);
        setIncomeDistribution(incomeDistributionRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform gender data for display
  const transformGenderData = data => {
    return data.map(item => ({
      gender: item.background_info__sex || item.sex || "Unknown",
      count: item.count,
      percentage: 0, // Will be calculated
    }));
  };

  // Transform civil status data
  const transformCivilStatusData = data => {
    return data.map(item => ({
      status: item.background_info__civil_status || item.civil_status || "Unknown",
      count: item.count,
    }));
  };

  // Transform occupation data (top 10)
  const transformOccupationData = data => {
    return data
      .filter(item => item.occupation)
      .slice(0, 10)
      .map(item => ({
        occupation: item.occupation,
        count: item.count,
      }));
  };

  // Transform age-gender cross data for stacked bar
  const transformAgeGenderData = data => {
    return data.map(item => ({
      gender: item.background_info__sex || item.sex || "Unknown",
      "Under 18": item.under18 || 0,
      "18-35": item.between18_35 || 0,
      "36-60": item.between36_60 || 0,
      "Over 60": item.above60 || 0,
    }));
  };

  // Custom label for pie charts
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

  // Statistics cards
  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div
      className="bg-white rounded-xl shadow-lg p-6 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: color + "20" }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  const transformedGenderData = transformGenderData(genderData);
  const transformedCivilStatusData = transformCivilStatusData(civilStatusData);
  const transformedOccupationData = transformOccupationData(occupationData);
  const transformedAgeGenderData = transformAgeGenderData(ageGenderData);

  const totalApplicants = transformedGenderData.reduce((sum, item) => sum + item.count, 0);
  const dominantGender = transformedGenderData.reduce(
    (prev, current) => (prev.count > current.count ? prev : current),
    { count: 0 }
  );
  const topOccupation = transformedOccupationData[0];
  const totalIncome = incomeDistribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Demographics & Economics Analysis
          </h1>
          <p className="text-gray-600 text-lg">
            Comprehensive insights into applicant demographics and economic profiles
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Total Applicants"
            value={totalApplicants.toLocaleString()}
            subtitle="Across all demographics"
            color="#3B82F6"
          />
          <StatCard
            icon={UserCheck}
            title="Dominant Gender"
            value={dominantGender.gender || "N/A"}
            subtitle={`${dominantGender.count} applications`}
            color="#EC4899"
          />
          <StatCard
            icon={Briefcase}
            title="Top Occupation"
            value={topOccupation?.occupation || "N/A"}
            subtitle={`${topOccupation?.count || 0} applicants`}
            color="#10B981"
          />
          <StatCard
            icon={DollarSign}
            title="Income Profiles"
            value={totalIncome.toLocaleString()}
            subtitle="Total with income data"
            color="#F59E0B"
          />
        </div>

        {/* Demographics Row 1: Gender and Civil Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gender Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-600" />
                Gender Distribution
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transformedGenderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="gender"
                >
                  {transformedGenderData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={value => [value, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Civil Status Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Heart className="mr-2 h-5 w-5 text-pink-600" />
                Civil Status Distribution
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={transformedCivilStatusData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="status"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Age Group Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                Age Group Distribution
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={ageGroupData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age_group" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#06B6D4"
                  fill="#06B6D4"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Age by Gender Cross-Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Age Groups by Gender</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={transformedAgeGenderData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="gender" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Under 18" stackId="a" fill="#FF6B6B" />
                <Bar dataKey="18-35" stackId="a" fill="#4ECDC4" />
                <Bar dataKey="36-60" stackId="a" fill="#45B7D1" />
                <Bar dataKey="Over 60" stackId="a" fill="#96CEB4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Economics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Occupations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-blue-600" />
                Top 10 Occupations
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={transformedOccupationData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="occupation" width={80} fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Income Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-yellow-600" />
                Income Distribution
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={incomeDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="range"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={10}
                />
                <YAxis />
                <Tooltip formatter={value => [value, "Applicants"]} />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]}>
                  {incomeDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={INCOME_COLORS[index % INCOME_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Gender Balance</h3>
              <p className="text-blue-700 text-sm">
                {dominantGender.gender} applicants represent the majority with{" "}
                {dominantGender.count} applications
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Employment Patterns</h3>
              <p className="text-green-700 text-sm">
                {topOccupation?.occupation || "Various occupations"} is the most common
                occupation among applicants
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Economic Profile</h3>
              <p className="text-yellow-700 text-sm">
                Income distribution shows varied economic backgrounds across applicant base
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicsEconomics;
