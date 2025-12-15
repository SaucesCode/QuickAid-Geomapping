import React, { useEffect, useRef } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap,
  LayersControl,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

const { BaseLayer } = LayersControl;

/**
 * @component MapReset
 * @description Resets the map view to a default center and zoom level
 * when the 'trigger' prop is true.
 */
const MapReset = ({ trigger }) => {
  const map = useMap();
  useEffect(() => {
    if (trigger) {
      // Set default view (e.g., [13.918, 121.575] is a center point)
      map.setView([13.918, 121.575], 11, { animate: true });
    }
  }, [trigger, map]);
  return null;
};

/**
 * @component BarangayZoom
 * @description Adjusts the map view to fit all markers within the currently
 * selected city and barangay filters.
 */
const BarangayZoom = ({ locations, barangayFilter, cityFilter }) => {
  const map = useMap();
  useEffect(() => {
    // Only zoom if a city/barangay is selected and there are locations
    if (!barangayFilter || !cityFilter || locations.length === 0) return;

    const positions = locations.map(loc => [loc.latitude, loc.longitude]);

    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      // Fit the map to the bounds of the markers with padding
      map.fitBounds(bounds.pad(0.2), {
        padding: [50, 50],
        animate: true,
        duration: 0.3,
      });
    }
    // Dependency on barangayFilter ensures re-run when filter changes
  }, [barangayFilter, locations, map, cityFilter]);
  return null;
};

/**
 * @component CityPolygon
 * @description Renders the GeoJSON polygon for the selected city boundary
 * and automatically fits the map to its bounds.
 */
const CityPolygon = ({ cityGeoData }) => {
  const map = useMap();
  const cityLayerRef = useRef(null);

  useEffect(() => {
    // 1. Cleanup old layer
    if (cityLayerRef.current) {
      map.removeLayer(cityLayerRef.current);
      cityLayerRef.current = null;
    }

    if (!cityGeoData) return;

    // 2. Add new GeoJSON polygon layer
    const newLayer = L.geoJSON(cityGeoData, {
      style: { color: "#3b82f6", weight: 3, fillOpacity: 0.15 },
    }).addTo(map);

    cityLayerRef.current = newLayer;

    // 3. Fit map to the new polygon's bounds
    const bounds = newLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.1), {
        padding: [50, 50],
        animate: true,
        duration: 0.3,
      });
    }

    // Cleanup function: runs on unmount or before next effect run
    return () => {
      if (cityLayerRef.current) {
        map.removeLayer(cityLayerRef.current);
        cityLayerRef.current = null;
      }
    };
  }, [cityGeoData, map]);

  return null;
};

/**
 * @component EasyPrintController
 * @description Initializes the Leaflet EasyPrint control (for exporting the map)
 * and passes the printer instance back via the onReady callback.
 */
const EasyPrintController = ({ onReady }) => {
  const map = useMap();

  useEffect(() => {
    const printer = L.easyPrint({
      hidden: true, // Don't show the print button on the map
      exportOnly: true, // Used for programmatic export
      sizeModes: ["A4Landscape", "A4Portrait"],
      hideClasses: ["leaflet-control-zoom", "leaflet-control-attribution"],
    }).addTo(map);

    onReady(printer);

    // Cleanup: remove the control when component unmounts
    return () => {
      map.removeControl(printer);
    };
  }, [map, onReady]);

  return null;
};

// --- Map Overlays ---

/**
 * @component MapStatsOverlay
 * @description A UI component that displays filtering summary and location
 * statistics in the top-right corner of the map. Visible during export.
 */
const MapStatsOverlay = ({ stats, total, city, barangay, type }) => {
  return (
    <div className="leaflet-top leaflet-right pointer-events-none">
      <div className="m-4 bg-white/95 rounded-lg shadow-lg border border-gray-300 p-3 text-xs">
        <div className="font-bold text-gray-800 mb-1">QuickAid – Map Summary</div>

        {/* Active Filters */}
        <div className="text-[10px] text-gray-600 mb-2 space-y-0.5">
          <div>
            Scope:
            {city ? ` ${city}` : " All Cities"}
            {barangay ? `, ${barangay}` : ""}
          </div>

          {type && <div>Assistance: {type}</div>}
        </div>

        {/* Total Count */}
        <div className="flex justify-between border-t pt-1 mt-1">
          <span>Total Locations</span>
          <span className="font-semibold">{total}</span>
        </div>

        {/* Detailed Stats */}
        <div className="mt-1 space-y-0.5">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span>{k}</span>
              <span className="font-semibold">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main Map Component ---

/**
 * @component MapCanvas
 * @description The main React-Leaflet component that renders the map,
 * controls, layers, markers, and clustering logic.
 */
const MapCanvas = React.memo(function MapCanvas({
  mapCenter,
  filteredLocations,
  clusterEnabled,
  createClusterCustomIcon,
  createColoredIcon,
  getColor,
  geoData,
  cityGeoData,
  resetTrigger,
  barangayFilter,
  cityFilter,
  stats,
  total,
  exporting,
  typeFilter,
  onPrinterReady,
}) {
  return (
    <MapContainer
      center={mapCenter}
      zoom={11}
      minZoom={11}
      maxZoom={17}
      className="w-full h-[90vh]"
      scrollWheelZoom={true}
    >
      {/* Map Control Components */}
      <CityPolygon cityGeoData={cityGeoData} />
      <MapReset trigger={resetTrigger} />
      <BarangayZoom
        locations={filteredLocations}
        barangayFilter={barangayFilter}
        cityFilter={cityFilter}
      />
      <EasyPrintController onReady={onPrinterReady} />

      {/* Tile Layers and Layer Control */}
      <LayersControl position="bottomleft">
        <BaseLayer checked name="🗺️ OpenStreetMap">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </BaseLayer>

        <BaseLayer name="🛰️ Satellite">
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </BaseLayer>
      </LayersControl>

      {/* Map Overlay (Summary Box) - visible when exporting */}
      {exporting && (
        <MapStatsOverlay
          stats={stats}
          total={total}
          city={cityFilter}
          barangay={barangayFilter}
          type={typeFilter}
        />
      )}

      {/* General GeoJSON Boundary Layer */}
      {geoData && (
        <GeoJSON data={geoData} style={{ color: "#3b82f6", weight: 2, fillOpacity: 0.05 }} />
      )}

      {/* Marker Rendering Logic (Clustered or Individual) */}
      {clusterEnabled ? (
        // Renders clustered markers
        <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
          {filteredLocations.map(loc => (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={createColoredIcon(getColor(loc.type_of_assistance))}
              assistanceType={loc.type_of_assistance}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-blue-700">{loc.full_name}</h3>
                  <p className="text-sm text-blue-600">{loc.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      ) : (
        // Renders individual markers
        filteredLocations.map(loc => (
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={createColoredIcon(getColor(loc.type_of_assistance))}
            assistanceType={loc.type_of_assistance}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-blue-700">{loc.full_name}</h3>
                <p className="text-sm text-blue-600">{loc.address}</p>
              </div>
            </Popup>
          </Marker>
        ))
      )}
    </MapContainer>
  );
});

export default MapCanvas;
