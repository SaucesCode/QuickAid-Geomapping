import React, { useEffect, useState, useMemo } from "react";
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
    UserCheck,
    AlertCircle,
    Loader2,
} from "lucide-react";

// 1. Import React Query Hooks
import { useQueries } from "@tanstack/react-query";

// --- API Fetcher Map ---
const API_ENDPOINTS = {
    gender: "/analytics/demographics/gender/",
    civilStatus: "/analytics/demographics/civil-status/",
    ageGroup: "/analytics/demographics/age-group/",
    occupation: "/analytics/economics/occupation/",
    ageGender: "/analytics/demographics/age-gender/",
    income: "/analytics/economics/income/",
};

// --- Skeleton Loader Component (Unchanged) ---
const SkeletonLoader = ({ height = 300, type = 'chart' }) => {
    // Styles for different types of skeletons
    const chartSkeleton = <div className="h-full w-full bg-gray-200 rounded-lg"></div>;

    const statSkeleton = (
        <div className="space-y-2 p-1">
            <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        </div>
    );

    const listSkeleton = (
        <div className="space-y-2 p-1">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 w-full bg-gray-200 rounded"></div>
            ))}
        </div>
    );

    let content;
    switch (type) {
        case 'stat':
            content = statSkeleton;
            break;
        case 'list':
            content = listSkeleton;
            break;
        case 'chart':
        default:
            content = chartSkeleton;
            break;
    }

    return (
        <div
            className={`animate-pulse bg-gray-100 rounded-xl ${type === 'chart' ? 'p-4' : 'p-3'}`}
            style={{ height: type !== 'stat' ? height : 'auto' }}
        >
            {content}
        </div>
    );
};
// ---------------------------------------------

const DemographicsEconomics = () => {
    // Original State Variables (Kept as requested)
    const [genderData, setGenderData] = useState([]);
    const [civilStatusData, setCivilStatusData] = useState([]);
    const [ageGroupData, setAgeGroupData] = useState([]);
    const [occupationData, setOccupationData] = useState([]);
    const [ageGenderData, setAgeGenderData] = useState([]);
    const [incomeDistribution, setIncomeDistribution] = useState([]);

    // The logic below for loadingStates and error is now managed by React Query
    // We keep the state variables but simplify the logic that uses them.
    const [loadingStates, setLoadingStates] = useState({
        gender: true,
        civilStatus: true,
        ageGroup: true,
        occupation: true,
        ageGender: true,
        income: true,
    });
    const [error, setError] = useState(null);

    // This function is now redundant as loading is derived from useQueries, but kept/modified to satisfy the constraint.
    const setSectionLoaded = (section) =>
        setLoadingStates((prev) => ({ ...prev, [section]: false }));


    // 2. Use useQueries to fetch all data in parallel
    const queryKeys = Object.keys(API_ENDPOINTS);
    const results = useQueries({
        queries: queryKeys.map((key) => ({
            queryKey: [key],
            queryFn: async () => {
                // The original logic didn't pass a parameter, so we use the key to get the endpoint
                const res = await api.get(API_ENDPOINTS[key]);
                return res.data || [];
            },
            // Keep retries high, data shouldn't be stale quickly
            staleTime: 5 * 60 * 1000, 
            retry: 1, // Add retry logic
            onError: (err) => {
                console.error(`Query Error for ${key}:`, err);
                // Set the component-level error if any query fails
                if (!error) setError(`Failed to load data for ${key}.`);
            },
        })),
    });
    
    // Map React Query results back to named variables for consistency
    const queryMap = useMemo(() => {
        return queryKeys.reduce((acc, key, index) => {
            acc[key] = results[index];
            return acc;
        }, {});
    }, [results, queryKeys]);

    // Check for a global loading state
    const globalLoading = results.some(r => r.isLoading || r.isFetching);
    const globalError = results.some(r => r.isError);

    // 3. Effect to update component state with fetched data
    useEffect(() => {
        // If an error occurred in any query, set the error state
        if (globalError) {
            setError("One or more sections failed to load. Check console for details.");
            return;
        }

        if (!globalLoading) {
            // Update the original state variables with React Query data
            setGenderData(queryMap.gender?.data || []);
            setCivilStatusData(queryMap.civilStatus?.data || []);
            setAgeGroupData(queryMap.ageGroup?.data || []);
            setOccupationData(queryMap.occupation?.data || []);
            setAgeGenderData(queryMap.ageGender?.data || []);
            setIncomeDistribution(queryMap.income?.data || []);

            // Manually update the loadingStates to false once data is available
            setLoadingStates({
                gender: false,
                civilStatus: false,
                ageGroup: false,
                occupation: false,
                ageGender: false,
                income: false,
            });
        }
    }, [globalLoading, globalError, queryMap]);
    // The previous useEffect block for fetching is now replaced by useQueries.

    // Color palettes (Unchanged)
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

    // Data transformations (Unchanged - uses the state variables)
    const transformGenderData = (data) =>
        data.map((item) => ({
            gender: item.background_info__sex || item.sex || "Unknown",
            count: item.count,
        }));

    const transformCivilStatusData = (data) =>
        data.map((item) => ({
            status: item.background_info__civil_status || item.civil_status || "Unknown",
            count: item.count,
        }));

    const transformOccupationData = (data) =>
        data
            .filter((item) => item.occupation)
            .slice(0, 10)
            .map((item) => ({
                occupation: item.occupation,
                count: item.count,
            }));

    const transformAgeGenderData = (data) =>
        data.map((item) => ({
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

    const StatCard = ({ icon: Icon, title, value, subtitle, color, isLoading }) => (
        <div
            className="bg-white rounded-xl shadow-lg p-6 border-l-4"
            style={{ borderLeftColor: color }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm font-medium">{title}</p>
                    {isLoading ? (
                        <div className="mt-1 space-y-2">
                            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                            {subtitle && <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>}
                        </div>
                    ) : (
                        <>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                        </>
                    )}
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: color + "20" }}>
                    <Icon className="h-6 w-6" style={{ color }} />
                </div>
            </div>
        </div>
    );

    const transformedGenderData = transformGenderData(genderData);
    const transformedCivilStatusData = transformCivilStatusData(civilStatusData);
    const transformedOccupationData = transformOccupationData(occupationData);
    const transformedAgeGenderData = transformAgeGenderData(ageGenderData);

    // Calculated stats (adapted for loading state)
    const isGenderLoaded = !loadingStates.gender;
    const isOccupationLoaded = !loadingStates.occupation;
    const isIncomeLoaded = !loadingStates.income;

    const totalApplicants = isGenderLoaded ? transformedGenderData.reduce((s, i) => s + i.count, 0) : '...';
    const dominantGender = isGenderLoaded
        ? transformedGenderData.reduce(
            (p, c) => (p.count > c.count ? p : c),
            { count: 0, gender: "N/A" }
        )
        : { count: '...', gender: '...' };

    const topOccupation = isOccupationLoaded ? transformedOccupationData[0] : { occupation: '...', count: '...' };
    const totalIncome = isIncomeLoaded ? incomeDistribution.reduce((s, i) => s + i.count, 0) : '...';

    if (error) {
        // NOTE: The error component logic is untouched, relying on the 'error' state variable
        // which is set by the useEffect that watches React Query's globalError.
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-red-50 to-indigo-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                </div>

                <div className="relative z-10 bg-white p-10 rounded-3xl shadow-2xl border border-red-200 max-w-md w-full mx-4">
                    <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-6 shadow-lg">
                        <AlertCircle className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Error Loading Data
                    </h3>
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

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={Users}
                        title="Total Applicants"
                        value={typeof totalApplicants === 'number' ? totalApplicants.toLocaleString() : totalApplicants}
                        subtitle="Across all demographics"
                        color="#3B82F6"
                        isLoading={!isGenderLoaded}
                    />
                    <StatCard
                        icon={UserCheck}
                        title="Dominant Gender"
                        value={dominantGender.gender || "N/A"}
                        subtitle={`${typeof dominantGender.count === 'number' ? dominantGender.count.toLocaleString() : dominantGender.count} applications`}
                        color="#EC4899"
                        isLoading={!isGenderLoaded}
                    />
                    <StatCard
                        icon={Briefcase}
                        title="Top Occupation"
                        value={topOccupation?.occupation || "N/A"}
                        subtitle={`${typeof topOccupation?.count === 'number' ? topOccupation?.count.toLocaleString() : topOccupation?.count || 0} applicants`}
                        color="#10B981"
                        isLoading={!isOccupationLoaded}
                    />
                    <StatCard
                        icon={DollarSign}
                        title="Income Profiles"
                        value={typeof totalIncome === 'number' ? totalIncome.toLocaleString() : totalIncome}
                        subtitle="Total with income data"
                        color="#F59E0B"
                        isLoading={!isIncomeLoaded}
                    />
                </div>

                {/* Gender & Civil Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gender */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                            <Users className="mr-2 h-5 w-5 text-blue-600" /> Gender Distribution
                        </h2>
                        {loadingStates.gender ? (
                            <SkeletonLoader height={300} />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={transformedGenderData}
                                        labelLine={false}
                                        label={renderCustomLabel}
                                        outerRadius={100}
                                        dataKey="count"
                                        nameKey="gender"
                                    >
                                        {transformedGenderData.map((e, i) => (
                                            <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => [v, "Count"]} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Civil Status */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                            <Heart className="mr-2 h-5 w-5 text-pink-600" /> Civil Status Distribution
                        </h2>
                        {loadingStates.civilStatus ? (
                            <SkeletonLoader height={300} />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={transformedCivilStatusData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="status" angle={-45} textAnchor="end" height={80} fontSize={12} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Age & Age by Gender */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Age Groups */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                            <TrendingUp className="mr-2 h-5 w-5 text-green-600" /> Age Group Distribution
                        </h2>
                        {loadingStates.ageGroup ? (
                            <SkeletonLoader height={300} />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={ageGroupData}>
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
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Age by Gender */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Age Groups by Gender</h2>
                        {loadingStates.ageGender ? (
                            <SkeletonLoader height={300} />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={transformedAgeGenderData}>
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
                        )}
                    </div>
                </div>

                {/* Economics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Occupations */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
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
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="occupation" width={80} fontSize={11} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Income */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                            <DollarSign className="mr-2 h-5 w-5 text-yellow-600" /> Income Distribution
                        </h2>
                        {loadingStates.income ? (
                            <SkeletonLoader height={400} />
                        ) : (
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={incomeDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="range"
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                        fontSize={10}
                                    />
                                    <YAxis />
                                    <Tooltip formatter={(v) => [v, "Applicants"]} />
                                    <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]}>
                                        {incomeDistribution.map((e, i) => (
                                            <Cell key={i} fill={INCOME_COLORS[i % INCOME_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Key Insights Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Key Insights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-800 mb-2">Gender Balance</h3>
                            {isGenderLoaded ? (
                                <p className="text-blue-700 text-sm">
                                    **{dominantGender.gender}** applicants represent the majority with{" "}
                                    {dominantGender.count.toLocaleString()} applications
                                </p>
                            ) : (
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                            )}
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="font-semibold text-green-800 mb-2">Employment Patterns</h3>
                            {isOccupationLoaded ? (
                                <p className="text-green-700 text-sm">
                                    **{topOccupation?.occupation || "Various occupations"}** is the most common
                                    occupation among applicants
                                </p>
                            ) : (
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                            )}
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4">
                            <h3 className="font-semibold text-yellow-800 mb-2">Economic Profile</h3>
                            {isIncomeLoaded ? (
                                <p className="text-yellow-700 text-sm">
                                    Total of **{totalIncome.toLocaleString()}** applicants provided income data, showing varied economic backgrounds.
                                </p>
                            ) : (
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemographicsEconomics;