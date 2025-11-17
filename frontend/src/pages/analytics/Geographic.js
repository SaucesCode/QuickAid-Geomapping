import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer } from "react-leaflet";
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
  Sparkles,
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
import { api } from "../../services/api";
import AnalyticsFilter from "../../components/AnalyticsFilter";
import { useNavigate } from "react-router-dom";

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
} from "../../components/AnalyticsComponents";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Assistance Type Colors
const ASSISTANCE_COLORS = {
  Educational: "#10B981",
  Medical: "#3B82F6",
  Burial: "#FDE68A",
};

const COLORS = ["#1e40af", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

const Geographic = () => {
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  // Fetch logic
  const fetchData = async endpoint => {
    const params = new URLSearchParams();
    if (filters.start) params.append("start_date", filters.start);
    if (filters.end) params.append("end_date", filters.end);
    if (filters.type) params.append("type", filters.type);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get(`${endpoint}${query}`);
    return res.data;
  };

  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ["geographic", "locations", filters],
    queryFn: () => fetchData("/analytics/geographic/locations/"),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const { data: topBarangays = [], isLoading: topBarangaysLoading } = useQuery({
    queryKey: ["geographic", "topBarangays", filters],
    queryFn: () => fetchData("/analytics/geographic/top-barangays/"),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const { data: barangayByType = [], isLoading: barangayTypeLoading } = useQuery({
    queryKey: ["geographic", "barangayByType", filters],
    queryFn: () => fetchData("/analytics/geographic/barangay-by-type/"),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const { data: approvalRates = [], isLoading: approvalLoading } = useQuery({
    queryKey: ["geographic", "approvalRate", filters],
    queryFn: () => fetchData("/analytics/geographic/approval-rate/"),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const { data: inactiveApplicants = [], isLoading: inactiveLoading } = useQuery({
    queryKey: ["geographic", "inactiveApplicants", filters],
    queryFn: () => fetchData("/analytics/geographic/inactive-applicants/"),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

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
    return approvalRates.slice(0, 5).map(item => ({
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

  return (
    <PageContainer>
      <AnalyticsStack spacing="lg">
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

        <AnalyticsFilter onFilterChange={setFilters} />

        <AnalyticsGrid cols={{ default: 1, sm: 2, lg: 5 }} gap="md">
          <AnalyticsStatCard
            icon={MapPin}
            title="Total Mapped"
            value={totalApplicants.toLocaleString()}
            subtitle="Geocoded applicants"
            color="blue"
            isLoading={loading}
          />
          <AnalyticsStatCard
            icon={Award}
            title="Top Barangay"
            value={topBarangay}
            subtitle="Highest applications"
            color="yellow"
            badge="🏆"
            isLoading={loading}
          />
          <AnalyticsStatCard
            icon={Building2}
            title="Barangays"
            value={barangayCount}
            subtitle="Unique locations"
            color="purple"
            isLoading={loading}
          />
          <AnalyticsStatCard
            icon={Target}
            title="Avg Approval"
            value={`${avgApprovalRate}%`}
            subtitle="Success rate"
            color="green"
            isLoading={loading}
          />
          <AnalyticsStatCard
            icon={Clock}
            title="Inactive"
            value={inactiveApplicants?.length || 0}
            subtitle="6+ months"
            color="red"
            isLoading={loading}
          />
        </AnalyticsGrid>

        <AnalyticsCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
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
          <div className="h-[350px] relative rounded-xl overflow-hidden border border-gray-200">
            <MapContainer
              center={[13.9311, 121.5542]}
              zoom={10}
              className="w-full h-full"
              scrollWheelZoom={false}
              doubleClickZoom={false}
              dragging={false}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            </MapContainer>
          </div>
        </AnalyticsCard>

        <AnalyticsGrid cols={{ default: 1, lg: 2 }} gap="md">
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

        <AnalyticsChartCard
          icon={Activity}
          title="Assistance Types Distribution by Barangay"
          subtitle="Service breakdown across top 6 barangays"
          isLoading={loading}
        >
          <ChartContainer height={350}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
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

        {inactiveApplicants.length > 0 && (
          <AnalyticsAlertCard
            icon={Clock}
            title="Geographic Distribution Alert"
            description={`${inactiveApplicants.length} applicants from various locations haven't submitted new applications in over 6 months.`}
            variant="warning"
          >
            <AnalyticsGrid cols={{ default: 1, sm: 2, md: 3 }} gap="sm">
              {inactiveApplicants.slice(0, 3).map(applicant => (
                <AnalyticsCard
                  key={applicant.id}
                  className="hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm truncate mb-1">
                        {applicant.name}
                      </div>
                      <div className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          Last: {new Date(applicant.last_application).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge variant="warning" className="flex-shrink-0">
                      Inactive
                    </Badge>
                  </div>
                </AnalyticsCard>
              ))}
            </AnalyticsGrid>
            {inactiveApplicants.length > 3 && (
              <div className="mt-3 flex items-center justify-center gap-2 text-orange-700 bg-orange-50 rounded-lg p-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  +{inactiveApplicants.length - 3} more inactive applicants
                </span>
              </div>
            )}
          </AnalyticsAlertCard>
        )}
      </AnalyticsStack>
    </PageContainer>
  );
};

export default Geographic;
