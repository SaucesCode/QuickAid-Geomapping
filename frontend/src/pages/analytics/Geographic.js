import React, { useEffect, useState } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useAnalyticsQuery } from "../../hooks/useAnalyticsQuery";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapPin,
  Building2,
  Award,
  Target,
  Clock,
  BarChart3,
  TrendingUp,
  Activity,
  Map,
  ExternalLink,
  BarChart2,
  UserX,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AnalyticsFilter from "../../components/AnalyticsFilter";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import { ASSISTANCE_COLORS } from "../../utils/assistanceColors";

// Import Analytics Components
import {
  PageContainer,
  PageHeader,
  GradientButton,
  AnalyticsCard,
  AnalyticsStatCard,
  AnalyticsChartCard,
  AnalyticsAlertCard,
  AnalyticsGrid,
  AnalyticsStack,
  ChartContainer,
  Badge,
  InsightCard,
  EmptyState,
} from "../../components/AnalyticsComponents";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const COLORS = [
  "#EF4444", // Red
  "#F59E0B", // Amber / Yellow
  "#10B981", // Emerald / Green
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
];

const Geographic = () => {
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  const [inactivePage, setInactivePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  usePageTitle("Geographic Analysis");

  const { data: locations = [], isLoading: locationsLoading } = useAnalyticsQuery(
    "/analytics/geographic/locations/",
    filters,
    { queryKey: ["geographic", "locations", filters] }
  );

  const { data: topBarangays = [], isLoading: topBarangaysLoading } = useAnalyticsQuery(
    "/analytics/geographic/top-barangays/",
    filters,
    { queryKey: ["geographic", "topBarangays", filters] }
  );

  const { data: coverageGaps = [], isLoading: gapsLoading } = useAnalyticsQuery(
    "/analytics/geographic/coverage-gaps/",
    filters,
    { queryKey: ["geographic", "coverage-gaps", filters] }
  );

  const { data: barangayByType = [], isLoading: barangayTypeLoading } = useAnalyticsQuery(
    "/analytics/geographic/barangay-by-type/",
    filters,
    { queryKey: ["geographic", "barangayByType", filters] }
  );

  const { data: approvalRates = [], isLoading: approvalLoading } = useAnalyticsQuery(
    "/analytics/geographic/approval-rate/",
    filters,
    { queryKey: ["geographic", "approvalRate", filters] }
  );

  const { data: inactiveApplicants = [], isLoading: inactiveLoading } = useAnalyticsQuery(
    "/analytics/geographic/inactive-applicants/",
    filters,
    { queryKey: ["geographic", "inactiveApplicants", filters] }
  );

  const loading =
    locationsLoading ||
    topBarangaysLoading ||
    barangayTypeLoading ||
    approvalLoading ||
    inactiveLoading;

  // Data processing
  const validLocations = (locations || []).filter(loc => loc.latitude && loc.longitude);
  const totalApplicants = validLocations.length;
  const topBarangay =
    Array.isArray(topBarangays) && topBarangays.length > 0
      ? topBarangays[0]?.background_info__barangay__name || "N/A"
      : "N/A";
  const barangayCount = [...new Set(validLocations.map(loc => loc.barangay))].length;
  const avgApprovalRate =
    Array.isArray(approvalRates) && approvalRates.length > 0
      ? (
          approvalRates.reduce((sum, item) => sum + (item.approval_rate || 0), 0) /
          approvalRates.length
        ).toFixed(1)
      : 0;

  const initializeHeatmap = locationData => {
    setTimeout(() => {
      const mapContainer = document.querySelector(".leaflet-container");
      if (!mapContainer || !locationData.length) return;
      const map = mapContainer._leaflet_map;
      if (!map) return;
      map.eachLayer(layer => {
        if (layer.options && layer.options.heat) {
          map.removeLayer(layer);
        }
      });
      const heatData = locationData.map(loc => [loc.latitude, loc.longitude, 1.0]);
      if (L.heatLayer) {
        const heatLayer = L.heatLayer(heatData, {
          radius: 20,
          blur: 15,
          maxZoom: 12,
          gradient: {
            0.2: "#bfdbfe",
            0.4: "#60a5fa",
            0.6: "#3b82f6",
            0.8: "#1d4ed8",
            1.0: "#1e3a8a",
          },
        });
        heatLayer.addTo(map);
      }
    }, 500);
  };

  const processBarangayTypeData = () => {
    const safeData = Array.isArray(barangayByType) ? barangayByType : [];
    const barangays = [
      ...new Set(
        safeData
          .map(item => item.barangay)
          .filter(name => typeof name === "string" && name.trim().length > 0)
      ),
    ];
    return barangays.slice(0, 6).map(barangay => {
      const items = safeData.filter(item => item.barangay === barangay);
      const safeBarangayName = barangay || "Unknown";
      const result = {
        barangay:
          safeBarangayName.length > 15
            ? safeBarangayName.substring(0, 15) + "..."
            : safeBarangayName,
      };
      items.forEach(item => {
        result[item.type_of_assistance || "Unknown"] = item.count || 0;
      });
      return result;
    });
  };

  const processApprovalData = () => {
    if (!approvalRates.length) return [];
    return approvalRates.slice(0, 6).map(item => ({
      name: item.location,
      value: item.approval_rate,
      total: item.total,
      approved: item.approved,
    }));
  };

  const chartData = processBarangayTypeData();
  const pieData = processApprovalData();

  useEffect(() => {
    if (validLocations.length > 0) {
      initializeHeatmap(validLocations);
    }
  }, [validLocations]);

  const dominantBarangayCount =
    Array.isArray(topBarangays) && topBarangays.length > 0 ? topBarangays[0]?.count : 0;

  const inactiveCount = inactiveApplicants?.length || 0;

  const topAssistanceType =
    barangayByType.length > 0
      ? Object.entries(
          barangayByType.reduce((acc, curr) => {
            const type = curr.type_of_assistance || "Unknown";
            acc[type] = (acc[type] || 0) + (curr.count || 0);
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1])[0]?.[0]
      : "N/A";

  const sortedGaps = [...(coverageGaps || [])].sort((a, b) => {
    if (b.days_since_last_application !== a.days_since_last_application) {
      return b.days_since_last_application - a.days_since_last_application;
    }
    return a.application_count - b.application_count;
  });

  const totalGapsPages = Math.ceil(sortedGaps.length / itemsPerPage);
  const gapsStartIndex = (inactivePage - 1) * itemsPerPage;
  const gapsEndIndex = gapsStartIndex + itemsPerPage;
  const paginatedGaps = sortedGaps.slice(gapsStartIndex, gapsEndIndex);

  return (
    <PageContainer>
      <AnalyticsStack spacing="lg">
        {/* ===== HEADER ===== */}
        <PageHeader
          icon={MapPin}
          title="Geographic Analytics"
          subtitle="Spatial distribution insights across all regions"
          action={
            <GradientButton onClick={() => navigate("/heatmap")}>
              <Map className="w-4 h-4" />
              View Full Heatmap
              <ExternalLink className="w-3 h-3" />
            </GradientButton>
          }
        />

        {/* ===== FILTERS ===== */}
        <AnalyticsFilter onFilterChange={setFilters} />

        {/* ===== KPI CARDS ===== */}
        <AnalyticsGrid cols={{ default: 1, sm: 2, lg: 5 }} gap="md">
          <AnalyticsStatCard
            icon={MapPin}
            title="Total Mapped"
            value={totalApplicants.toLocaleString()}
            subtitle="Geocoded applicants"
            color="#003a76"
            isLoading={loading}
          />
          <AnalyticsStatCard
            icon={Award}
            title="Top Barangay"
            value={topBarangay}
            subtitle="Highest applications"
            color="#003a76"
            isLoading={loading}
          />
          <AnalyticsStatCard
            icon={Building2}
            title="Barangays"
            value={barangayCount}
            subtitle="Unique locations"
            color="#003a76"
            isLoading={loading}
          />
          <AnalyticsStatCard
            icon={Target}
            title="Avg Approval"
            value={`${avgApprovalRate}%`}
            subtitle="Success rate"
            color="#003a76"
            isLoading={loading}
          />
          <AnalyticsStatCard
            icon={Clock}
            title="Inactive"
            value={inactiveApplicants?.length || 0}
            subtitle="6+ months"
            color="#003a76"
            isLoading={loading}
          />
        </AnalyticsGrid>

        {/* ===== SECTION 1: GEOGRAPHIC VISUALIZATION ===== */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800 px-1">Geographic Visualization</h2>
          <AnalyticsCard>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-5">
                <div className="p-1.5 bg-[#003a76] rounded-lg">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    Distribution Heatmap Preview
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Interactive geographic visualization
                  </p>
                </div>
              </div>
            </div>
            <div className="h-[350px] relative rounded-xl overflow-hidden border border-gray-200 z-10">
              <MapContainer
                center={[13.9311, 121.5542]}
                zoom={10}
                className="w-full h-full z-10"
                scrollWheelZoom={false}
                doubleClickZoom={false}
                dragging={false}
                zoomControl={false}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

                {validLocations.slice(0, 200).map((loc, index) => (
                  <CircleMarker
                    key={index}
                    center={[loc.latitude, loc.longitude]}
                    radius={4}
                    fillOpacity={0.7}
                    color="#2563eb"
                    stroke={false}
                  />
                ))}
              </MapContainer>
            </div>
          </AnalyticsCard>
        </div>

        {/* ===== SECTION 2: TOP PERFORMERS ===== */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800 px-1">Top Performing Areas</h2>
          <AnalyticsGrid cols={{ default: 1, lg: 2 }} gap="md">
            {/* Top Barangays Chart */}
            <AnalyticsChartCard
              icon={BarChart3}
              title="Top Barangays by Applications"
              subtitle="Leading areas by application volume"
              isLoading={loading}
            >
              <ChartContainer height={280}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topBarangays.slice(0, 8)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis
                      dataKey="background_info__barangay__name"
                      tick={{ fontSize: 11, fill: "#4b5563" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#4b5563" }} />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="url(#blueGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </AnalyticsChartCard>

            {/* Approval Rates Chart */}
            <AnalyticsChartCard
              icon={TrendingUp}
              title="Approval Rates by Location"
              subtitle="Success rates across top regions"
              isLoading={loading}
            >
              <ChartContainer height={280}>
                <div className="flex items-center h-full">
                  <ResponsiveContainer width="60%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${value}%`}
                        strokeWidth={3}
                        stroke="#fff"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {pieData.map((item, index) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <div
                          className="w-3 h-3 rounded-md shadow-sm"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-xs font-medium text-gray-700 flex-1">
                          {item.name}
                        </span>
                        <span className="text-xs font-bold text-gray-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartContainer>
            </AnalyticsChartCard>
          </AnalyticsGrid>
        </div>

        {/* ===== SECTION 3: ASSISTANCE TYPE DISTRIBUTION ===== */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800 px-1">
            Service Distribution Analysis
          </h2>
          <AnalyticsChartCard
            icon={Activity}
            title="Assistance Types Distribution by Barangay"
            subtitle="Service breakdown across top 6 barangays"
            isLoading={loading}
          >
            <ChartContainer height={350}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis
                    dataKey="barangay"
                    tick={{ fontSize: 11, fill: "#4b5563" }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#4b5563" }} />
                  <RechartsTooltip />
                  <Bar
                    dataKey="Medical"
                    stackId="a"
                    fill={ASSISTANCE_COLORS.Medical}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Educational"
                    stackId="a"
                    fill={ASSISTANCE_COLORS.Educational}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Burial"
                    stackId="a"
                    fill={ASSISTANCE_COLORS.Burial}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center flex-wrap gap-4 mt-3">
              {Object.entries(ASSISTANCE_COLORS).map(([key, color]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-md" style={{ backgroundColor: color }}></div>
                  <span className="text-xs font-medium text-gray-700">{key}</span>
                </div>
              ))}
            </div>
          </AnalyticsChartCard>
        </div>

        {/* ===== SECTION 4: COVERAGE GAPS ===== */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800 px-1">Service Coverage Gaps</h2>
          <AnalyticsChartCard
            icon={Clock}
            title="Underserved Areas"
            subtitle={`${coverageGaps?.length || 0} barangays requiring attention`}
            isLoading={gapsLoading}
          >
            {paginatedGaps.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No coverage gaps detected</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {paginatedGaps.map((gap, index) => (
                    <div
                      key={gap.id || index}
                      className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {gap.barangay}
                          </h4>

                          <p className="text-xs text-gray-500 mt-0.5">
                            City:{" "}
                            <span className="ml-1 font-medium text-gray-700">{gap.city}</span>
                          </p>

                          <div className="flex gap-3 mt-2">
                            <p className="text-xs text-gray-600">
                              Applicants:{" "}
                              <span className="font-medium">{gap.application_count}</span>
                            </p>
                            <p className="text-xs text-gray-600">
                              Last:{" "}
                              <span className="font-medium">
                                {gap.days_since_last_application} days ago
                              </span>
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            gap.priority === "High"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {gap.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {totalGapsPages >= 1 && (
                  <Pagination
                    currentPage={inactivePage}
                    totalPages={totalGapsPages}
                    handlePageChange={setInactivePage}
                    itemsPerPage={itemsPerPage}
                    handleItemsPerPageChange={e => {
                      const newValue = Number(e.target.value);
                      setItemsPerPage(newValue);
                      setInactivePage(1);
                    }}
                    totalItems={coverageGaps?.length || 0}
                  />
                )}
              </>
            )}
          </AnalyticsChartCard>
        </div>

        {/* ===== SECTION 5: KEY INSIGHTS ===== */}
        <AnalyticsAlertCard
          icon={MapPin}
          title="Key Geographic Insights"
          description="Summary of the most notable geographic patterns from the mapped data."
          variant="info"
        >
          <AnalyticsGrid cols={{ default: 1, md: 3 }} gap="sm">
            <InsightCard
              title="Top Barangay"
              icon={MapPin}
              variant="info"
              description="Highest application density"
              isLoading={loading}
            >
              {topBarangay} has the highest number of applications ({dominantBarangayCount})
            </InsightCard>

            <InsightCard
              title="Average Approval Rate"
              icon={BarChart2}
              variant="info"
              description="Approval rate across all mapped barangays"
              isLoading={loading}
            >
              {avgApprovalRate}% across mapped locations.
            </InsightCard>

            <InsightCard
              title="Inactive Applicants"
              icon={UserX}
              variant="warning"
              description="Applicants inactive for 6+ months"
              isLoading={loading}
            >
              {inactiveCount} applicants haven't submitted applications in over 6 months.
            </InsightCard>
          </AnalyticsGrid>
        </AnalyticsAlertCard>
      </AnalyticsStack>
    </PageContainer>
  );
};

export default Geographic;
