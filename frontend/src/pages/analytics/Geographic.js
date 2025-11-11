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
  GradientButton,
} from "../../components/DesignSystem";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Assistance Type Colors - KEPT UNCHANGED
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

  // Fetch logic - KEPT UNCHANGED
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

  // Data processing - KEPT UNCHANGED
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
      <Stack spacing="lg">
        {/* REDESIGNED: Using PageHeader from Design System */}
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

        {/* REDESIGNED: Using Grid and StatCard from Design System */}
        <Grid cols={{ default: 1, sm: 2, lg: 5 }} gap="md">
          <StatCard
            icon={MapPin}
            title="Total Mapped"
            value={totalApplicants.toLocaleString()}
            color="blue"
            isLoading={loading}
          />
          <StatCard
            icon={Award}
            title="Top Barangay"
            value={topBarangay}
            color="blue"
            isLoading={loading}
          />
          <StatCard
            icon={Building2}
            title="Barangays"
            value={barangayCount}
            color="blue"
            isLoading={loading}
          />
          <StatCard
            icon={Target}
            title="Avg Approval"
            value={`${avgApprovalRate}%`}
            color="blue"
            isLoading={loading}
          />
          <StatCard
            icon={Clock}
            title="Inactive"
            value={inactiveApplicants?.length || 0}
            color="blue"
            isLoading={loading}
          />
        </Grid>

        {/* REDESIGNED: Using Card from Design System */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Distribution Heatmap Preview</h3>
            </div>
          </div>
          <div className="h-[350px] relative rounded-xl overflow-hidden">
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
        </Card>

        {/* REDESIGNED: Using Grid and ChartCard from Design System */}
        <Grid cols={{ default: 1, lg: 2 }} gap="lg">
          <ChartCard
            icon={BarChart3}
            title="Top Barangays by Applications"
            isLoading={loading}
          >
            <ResponsiveContainer width="100%" height={280}>
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
          </ChartCard>

          <ChartCard icon={TrendingUp} title="Approval Rates by Location" isLoading={loading}>
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={280}>
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
              <div className="flex-1 space-y-3">
                {pieData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <div
                      className="w-4 h-4 rounded-md shadow-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      {item.name}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </Grid>

        <ChartCard
          icon={Activity}
          title="Assistance Types Distribution by Barangay"
          isLoading={loading}
        >
          <ResponsiveContainer width="100%" height={350}>
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
          <div className="flex justify-center flex-wrap gap-6 mt-4">
            {Object.entries(ASSISTANCE_COLORS).map(([key, color]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md" style={{ backgroundColor: color }}></div>
                <span className="text-sm font-medium text-gray-700">{key}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* REDESIGNED: Using AlertCard from Design System */}
        {inactiveApplicants.length > 0 && (
          <AlertCard
            icon={Clock}
            title="Geographic Distribution Alert"
            description={`${inactiveApplicants.length} applicants from various locations haven't submitted new applications in over 6 months.`}
            variant="info"
          >
            <Grid cols={{ default: 1, md: 3 }} gap="md">
              {inactiveApplicants.slice(0, 3).map(applicant => (
                <Card key={applicant.id} className="hover:-translate-y-1 transition-all">
                  <div className="font-bold text-gray-900 mb-1">{applicant.name}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last: {new Date(applicant.last_application).toLocaleDateString()}
                  </div>
                </Card>
              ))}
            </Grid>
            {inactiveApplicants.length > 3 && (
              <div className="mt-4 flex items-center gap-2 text-blue-700">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  +{inactiveApplicants.length - 3} more inactive applicants
                </span>
              </div>
            )}
          </AlertCard>
        )}
      </Stack>
    </PageContainer>
  );
};

export default Geographic;
