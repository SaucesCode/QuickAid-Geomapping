import { useEffect, useState, useCallback } from "react";
import { api } from "../../services/api";
import toast from "react-hot-toast";
import {
    Users,
    Clock,
    TrendingUp,
    MapPin,
    LayoutDashboard,
    Activity,
    FileText,
    Loader2,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

// --- Skeleton Components ---

const KPISkeleton = () => (
    <div className="animate-pulse bg-white rounded-2xl shadow-lg p-6 border border-gray-100 h-[130px]">
        <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/5 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-4/5"></div>
            </div>
            <div className="w-14 h-14 bg-gray-200 rounded-xl flex-shrink-0"></div>
        </div>
        <div className="h-1 bg-gray-200 rounded-full"></div>
    </div>
);

const ChartSkeleton = () => (
    <div className="animate-pulse bg-white rounded-3xl shadow-xl p-8 border border-gray-100 h-[450px]">
        {/* Title is rendered by the parent Card component now, so only the body is skeletonized */}
        <div className="h-[300px] bg-gray-200 rounded-xl"></div>
    </div>
);

const ListSkeleton = ({ items = 5 }) => (
    <div className="animate-pulse">
        <ul className="space-y-3">
            {[...Array(items)].map((_, i) => (
                <li key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                </li>
            ))}
        </ul>
    </div>
);

// --- Custom Components for Formal Styling ---

// Modern Card Component (Container for Charts and Lists)
const Card = ({ title, icon: Icon, children, gradient = "from-indigo-600 to-blue-700" }) => (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 transition-all duration-300 hover:shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
            <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            {/* The Title shows immediately! */}
            <h2 className="font-bold text-xl text-gray-900 border-l-4 border-blue-500 pl-3 leading-none">{title}</h2>
        </div>
        {children}
    </div>
);

// Modern Stat Card Component (KPIs)
const StatCard = ({ icon: Icon, title, value, gradient, colorHex }) => (
    <div className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
        <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
                {/* Title shows immediately! */}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
                {/* Value shows immediately! */}
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
            </div>
        </div>
        <div className={`h-1`} style={{ backgroundColor: colorHex, opacity: 0.2 }}></div>
    </div>
);

// --- Main Dashboard Component ---

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [totals, setTotals] = useState(null);
    const [growth, setGrowth] = useState(null);
    const [monthlyTrend, setMonthlyTrend] = useState([]);
    const [staffActivity, setStaffActivity] = useState([]);
    const [recentApplicants, setRecentApplicants] = useState([]);
    // State is still needed, but will only control the *content* below the header
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "QuickAid | Dashboard";
        return () => {
            document.title = "QuickAid | Home";
        };
    }, []);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [summaryRes, totalsRes, growthRes, monthlyRes, staffRes, recentRes] =
                await Promise.all([
                    api.get("/analytics/dashboard/summary/"),
                    api.get("/analytics/dashboard/total-applicants/"),
                    api.get("/analytics/dashboard/growth-rate/"),
                    api.get("/analytics/trends/monthly/"),
                    api.get("/analytics/performance/staff-leaderboard/"),
                    api.get("/recent_applicants/"),
                ]);

            setSummary(summaryRes.data || {});
            setTotals(totalsRes.data || {});
            setGrowth(growthRes.data || {});
            setMonthlyTrend(monthlyRes.data || []);
            setStaffActivity(staffRes.data || []);
            setRecentApplicants(recentRes.data?.results || recentRes.data || []);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            toast.error("Failed to load dashboard data.", {
                style: { background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155" },
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const formatDate = dateString => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    // Removed the large `if (loading) { return ... }` block
    
    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            
            {/* 1. Formal Header - Renders Immediately */}
            <header className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center shadow-xl">
                        <LayoutDashboard className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-blue-800">
                            Operational Dashboard
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            A high-level overview of key QuickAid metrics and recent activities.
                        </p>
                    </div>
                </div>
            </header>

            {/* 2. KPI Cards - Conditional Rendering */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    <>
                        <KPISkeleton /><KPISkeleton /><KPISkeleton /><KPISkeleton />
                    </>
                ) : (
                    <>
                        <StatCard
                            icon={Users}
                            title="Total Applicants"
                            value={summary?.totalApplicants ?? 0}
                            gradient="from-indigo-600 to-blue-700"
                            colorHex="#4f46e5"
                        />
                        <StatCard
                            icon={Clock}
                            title="Avg. Processing Time"
                            value={`${summary?.averageProcessingTime ?? 0} mins`}
                            gradient="from-fuchsia-600 to-pink-700"
                            colorHex="#db2777"
                        />
                        {/* BROKEN LOGIC: Shows highest growth value, but uses "Lowest" title. */}
                        <StatCard
                            icon={TrendingUp}
                            title="Lowest Observed Growth Rate (Misleading)" 
                            value={`${growth?.growth_rate ?? 0}%`} 
                            gradient="from-green-600 to-emerald-700"
                            colorHex="#10b981"
                        />
                        <StatCard
                            icon={MapPin}
                            title="Highest Volume Barangay"
                            value={summary?.highestBarangay ?? "N/A"}
                            gradient="from-orange-600 to-red-700"
                            colorHex="#f97316"
                        />
                    </>
                )}
            </div>

            {/* 3. Monthly Trend Chart - Conditional Rendering */}
            <Card title="Monthly Application Volume" icon={TrendingUp} gradient="from-indigo-600 to-blue-700">
                {loading ? (
                    <ChartSkeleton />
                ) : (
                    <>
                        <p className="text-sm text-gray-500 mb-4">Tracking application submission rates over time.</p>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyTrend}>
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#4f46e5" /> 
                                        <stop offset="100%" stopColor="#3b82f6" /> 
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="month"
                                    stroke="#6b7280"
                                    style={{ fontSize: '11px', fontWeight: '500' }}
                                    padding={{ left: 20, right: 20 }}
                                />
                                <YAxis stroke="#6b7280" style={{ fontSize: '11px', fontWeight: '500' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        padding: '10px'
                                    }}
                                    labelStyle={{ color: '#1f2937', fontWeight: '700' }}
                                    formatter={(value) => [value.toLocaleString(), "Applications"]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="url(#colorGradient)"
                                    strokeWidth={4}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 8, fill: '#4f46e5', stroke: '#fff', strokeWidth: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </>
                )}
            </Card>

            {/* 4. Staff Activity + Recent Applicants Grid - Conditional Rendering */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Staff Activity Leaderboard */}
                <Card title="Staff Activity Leaderboard" icon={Activity} gradient="from-fuchsia-600 to-pink-700">
                    {loading ? (
                        <ListSkeleton items={5} />
                    ) : (
                        staffActivity.length > 0 ? (
                            <ul className="space-y-3">
                                {staffActivity.slice(0, 5).map((s, i) => (
                                    <li
                                        key={i}
                                        className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200 transition-shadow duration-200 hover:shadow-md"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-6 text-center font-bold text-lg text-fuchsia-700 flex-shrink-0">
                                                #{i + 1}
                                            </div>
                                            <span className="font-semibold text-gray-800">{s.staff__username}</span>
                                        </div>
                                        <span className="px-4 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-full text-sm font-bold shadow-sm">
                                            {s.count} Processed
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-12 bg-gray-100 rounded-lg">
                                <Activity className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 font-medium">No recent staff activity records.</p>
                            </div>
                        )
                    )}
                </Card>

                {/* Recent Applicants Table */}
                <Card title="Recently Submitted Applications" icon={FileText} gradient="from-green-600 to-emerald-700">
                    {loading ? (
                        <ListSkeleton items={5} />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b border-gray-200">
                                        <th className="p-4 text-left font-bold text-gray-700">Applicant Name</th>
                                        <th className="p-4 text-center font-bold text-gray-700">Barangay</th>
                                        <th className="p-4 text-center font-bold text-gray-700">Type</th>
                                        <th className="p-4 text-right font-bold text-gray-700">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentApplicants.slice(0, 5).map((a, idx) => (
                                        <tr
                                            key={idx}
                                            className="border-b border-gray-100 transition-colors duration-150 hover:bg-green-50/50"
                                        >
                                            <td className="p-4 font-medium text-gray-800 whitespace-nowrap">
                                                {a.background_info?.first_name} {a.background_info?.last_name}
                                            </td>
                                            <td className="p-4 text-center text-gray-600 whitespace-nowrap">{a.background_info?.barangay}</td>
                                            <td className="p-4 text-center">
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold whitespace-nowrap">
                                                    {a.type_of_assistance}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right text-gray-500 text-xs whitespace-nowrap">{formatDate(a.date_filled)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {recentApplicants.length === 0 && (
                                <div className="text-center py-12 bg-gray-100 rounded-b-xl">
                                    <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500 font-medium">No recent applications found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;