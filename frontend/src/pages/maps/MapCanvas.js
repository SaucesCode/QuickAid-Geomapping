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

const MapCanvas = React.memo(function MapCanvas({
  mapCenter,
  filteredLocations,
  clusterEnabled,
  createClusterCustomIcon,
  createColoredIcon,
  getColor,
  geoData,
  cityGeoData,
  resetTrigger, // Pass data, not component
  barangayFilter,
  cityFilter,
}) {
  const MapReset = ({ trigger }) => {
    const map = useMap();
    useEffect(() => {
      if (trigger) {
        map.setView([13.918, 121.575], 11, { animate: true });
      }
    }, [trigger, map]);
    return null;
  };

  const BarangayZoom = ({ locations, barangayFilter }) => {
    const map = useMap();
    useEffect(() => {
      if (!barangayFilter || !cityFilter || locations.length === 0) return;
      const positions = locations.map(loc => [loc.latitude, loc.longitude]);
      if (positions.length > 0) {
        const bounds = L.latLngBounds(positions);
        map.fitBounds(bounds.pad(0.2), {
          padding: [50, 50],
          animate: true,
          duration: 0.3,
        });
      }
    }, [barangayFilter]);
    return null;
  };

  const CityPolygon = ({ cityGeoData }) => {
    const map = useMap();
    const cityLayerRef = useRef(null);

    useEffect(() => {
      if (!cityGeoData) {
        // If no city selected, remove polygon
        if (cityLayerRef.current) {
          map.removeLayer(cityLayerRef.current);
          cityLayerRef.current = null;
        }
        return;
      }

      // Remove old polygon
      if (cityLayerRef.current) {
        map.removeLayer(cityLayerRef.current);
      }

      // Add new polygon
      const newLayer = L.geoJSON(cityGeoData, {
        style: { color: "#3b82f6", weight: 3, fillOpacity: 0.15 },
      }).addTo(map);

      cityLayerRef.current = newLayer;

      // Fit to new bounds
      const bounds = newLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.1), {
          padding: [50, 50],
          animate: true,
          duration: 0.3,
        });
      }

      return () => {
        if (cityLayerRef.current) {
          map.removeLayer(cityLayerRef.current);
          cityLayerRef.current = null;
        }
      };
    }, [cityGeoData, map]);

    return null;
  };

  return (
    <MapContainer
      center={mapCenter}
      zoom={11}
      minZoom={11}
      maxZoom={17}
      className="w-full h-[90vh]"
      scrollWheelZoom={true}
    >
      <CityPolygon cityGeoData={cityGeoData} />
      <MapReset trigger={resetTrigger} />
      <BarangayZoom
        locations={filteredLocations}
        barangayFilter={barangayFilter}
        cityFilter={cityFilter}
      />
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

      {geoData && (
        <GeoJSON data={geoData} style={{ color: "#3b82f6", weight: 2, fillOpacity: 0.05 }} />
      )}

      {clusterEnabled ? (
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
        filteredLocations.map(loc => (
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={createColoredIcon(getColor(loc.type_of_assistance))}
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
