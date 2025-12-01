import React from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
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
  MapReset,
  BarangayZoom,
  MapBounds,
}) {
  return (
    <MapContainer
      center={mapCenter}
      zoom={11}
      minZoom={11}
      maxZoom={17}
      className="w-full h-[calc(100vh-2rem)]"
      scrollWheelZoom={true}
    >
      <MapReset />
      <BarangayZoom />
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
