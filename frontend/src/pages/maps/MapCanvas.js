import React, { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

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
}) {
  const addJitter = (latitude, longitude) => {
    const jitterAmount = 0.0051; // Adjust this value as needed
    const jitterLat = latitude + (Math.random() - 0.5) * jitterAmount;
    const jitterLng = longitude + (Math.random() - 0.5) * jitterAmount;
    return [jitterLat, jitterLng];
  };

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
      if (!barangayFilter || locations.length === 0) return;
      const positions = locations.map(loc => [loc.latitude, loc.longitude]);
      if (positions.length > 0) {
        const bounds = L.latLngBounds(positions);
        map.fitBounds(bounds.pad(0.2), {
          padding: [50, 50],
          animate: true,
          duration: 0.3,
        });
      }
    }, [barangayFilter, locations, map]);
    return null;
  };

  const MapBounds = ({ cityGeoData }) => {
    const map = useMap();
    useEffect(() => {
      if (!cityGeoData) return;
      const timeout = setTimeout(() => {
        try {
          const bounds = L.geoJSON(cityGeoData).getBounds();
          map.fitBounds(bounds.pad(0.01), {
            padding: [20, 20],
            maxZoom: 14,
            animate: true,
            duration: 0.5,
          });
        } catch (err) {
          console.error("Error setting bounds:", err);
        }
      }, 50);
      return () => clearTimeout(timeout);
    }, [cityGeoData, map]);
    return null;
  };

  return (
    <MapContainer
      center={mapCenter}
      zoom={11}
      minZoom={11}
      maxZoom={17}
      className="w-full h-[calc(100vh-2rem)]"
      scrollWheelZoom={true}
    >
      <MapReset trigger={resetTrigger} />
      <BarangayZoom locations={filteredLocations} barangayFilter={barangayFilter} />
      <MapBounds cityGeoData={cityGeoData} />
      <TileLayer
        attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />

      <TileLayer
        attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        url="https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
      />

      <MapBounds />
      {geoData && (
        <GeoJSON data={geoData} style={{ color: "#3b82f6", weight: 2, fillOpacity: 0.05 }} />
      )}
      {cityGeoData && (
        <GeoJSON
          data={cityGeoData}
          style={{ color: "#3b82f6", weight: 3, fillOpacity: 0.1 }}
        />
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
            position={addJitter(loc.latitude, loc.longitude)}
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
