import React, { useState } from "react";
import { Download, Play, Pause, AlertCircle, CheckCircle, MapPin } from "lucide-react";

export default function BarangayGeocoder() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState([]);
  const [flagged, setFlagged] = useState([]);

  const handleFileUpload = async e => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    try {
      const text = await uploadedFile.text();
      const jsonData = JSON.parse(text);
      setFile(uploadedFile.name);
      setData(jsonData);
      setResults([]);
      setFlagged([]);
      setProgress({ current: 0, total: 0 });
    } catch (error) {
      alert("Error reading file: " + error.message);
    }
  };

  const geocodeAddress = async (barangay, city) => {
    // Try multiple query formats for better accuracy
    const queries = [
      `${barangay}, ${city}, Quezon, Philippines`,
      `${barangay}, ${city}, Quezon Province, Philippines`,
      `Barangay ${barangay}, ${city}, Philippines`,
    ];

    for (const query of queries) {
      try {
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const coords = data.features[0].geometry.coordinates;
          return {
            lat: coords[1],
            lng: coords[0],
            query: query,
            properties: data.features[0].properties,
          };
        }
      } catch (error) {
        console.error(`Error geocoding with query: ${query}`, error);
      }
    }

    return null;
  };

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const startGeocoding = async () => {
    if (!data) return;

    setGeocoding(true);
    setPaused(false);
    const newResults = [...results];
    const newFlagged = [];

    // Calculate total barangays
    const totalBarangays = data.reduce((sum, city) => sum + city.barangays.length, 0);
    let currentIndex = results.length; // Resume from where we left off

    setProgress({ current: currentIndex, total: totalBarangays });

    for (let cityIndex = 0; cityIndex < data.length; cityIndex++) {
      const city = data[cityIndex];

      for (let brgyIndex = 0; brgyIndex < city.barangays.length; brgyIndex++) {
        // Skip already geocoded
        const globalIndex =
          data.slice(0, cityIndex).reduce((sum, c) => sum + c.barangays.length, 0) + brgyIndex;
        if (globalIndex < currentIndex) continue;

        if (paused) {
          setGeocoding(false);
          return;
        }

        const barangay = city.barangays[brgyIndex];

        // Clean barangay name (remove (Pob.) etc)
        let cleanName = barangay.name.replace(/\s*\(Pob\.\)\s*/g, "").trim();

        const geoResult = await geocodeAddress(cleanName, city.city);

        const resultEntry = {
          ...barangay,
          coordinates: geoResult ? { lat: geoResult.lat, lng: geoResult.lng } : null,
          geocoded: !!geoResult,
          query: geoResult?.query || "Failed",
          confidence: geoResult
            ? calculateConfidence(barangay.name, city.city, geoResult.properties)
            : "low",
        };

        newResults.push(resultEntry);

        // Flag potentially inaccurate results
        if (!geoResult || resultEntry.confidence === "low") {
          newFlagged.push({
            index: globalIndex,
            barangay: barangay.name,
            city: city.city,
            reason: !geoResult ? "No results found" : "Low confidence match",
            coordinates: resultEntry.coordinates,
          });
        }

        setResults([...newResults]);
        setFlagged([...newFlagged]);
        setProgress({ current: globalIndex + 1, total: totalBarangays });

        // Rate limiting: 1 request per second
        await sleep(1000);
      }
    }

    setGeocoding(false);
  };

  const calculateConfidence = (barangayName, cityName, properties) => {
    if (!properties) return "low";

    const name = properties.name?.toLowerCase() || "";
    const city = properties.city?.toLowerCase() || "";
    const barangayLower = barangayName.toLowerCase();
    const cityLower = cityName.toLowerCase();

    // High confidence if both barangay and city match
    if (name.includes(barangayLower.split(" ")[0]) && city.includes(cityLower.split(" ")[0])) {
      return "high";
    }

    // Medium if at least city matches
    if (city.includes(cityLower.split(" ")[0])) {
      return "medium";
    }

    return "low";
  };

  const downloadResults = () => {
    if (results.length === 0) return;

    // Reconstruct the original structure with coordinates
    const geocodedData = data.map(city => ({
      ...city,
      barangays: city.barangays.map(brgy => {
        const result = results.find(r => r.code === brgy.code);
        return result || brgy;
      }),
    }));

    const jsonString = JSON.stringify(geocodedData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "barangays_geocoded.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalBarangays = data ? data.reduce((sum, city) => sum + city.barangays.length, 0) : 0;
  const successRate =
    results.length > 0
      ? ((results.filter(r => r.geocoded).length / results.length) * 100).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Barangay Geocoder</h1>
          <p className="text-gray-600 mb-6">
            Upload your barangays JSON file to geocode all locations using Photon API
          </p>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Upload Barangays JSON File
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="mt-2 text-sm text-green-600">
                ✓ Loaded: {file} ({totalBarangays} barangays)
              </p>
            )}
          </div>

          {/* Controls */}
          {data && (
            <div className="flex gap-4 mb-6">
              <button
                onClick={geocoding ? () => setPaused(true) : startGeocoding}
                disabled={geocoding && !paused && progress.current === progress.total}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {geocoding && !paused ? (
                  <>
                    <Pause size={20} />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    {results.length > 0 ? "Resume" : "Start"} Geocoding
                  </>
                )}
              </button>

              {results.length > 0 && (
                <button
                  onClick={downloadResults}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Download size={20} />
                  Download JSON
                </button>
              )}
            </div>
          )}

          {/* Progress */}
          {progress.total > 0 && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progress: {progress.current} / {progress.total}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  Success Rate: {successRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Flagged Items */}
          {flagged.length > 0 && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-yellow-800 mb-3">
                <AlertCircle size={20} />
                Flagged for Review ({flagged.length})
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {flagged.map((item, idx) => (
                  <div key={idx} className="bg-white rounded p-3 text-sm">
                    <div className="font-medium text-gray-800">
                      {item.barangay}, {item.city}
                    </div>
                    <div className="text-yellow-700">{item.reason}</div>
                    {item.coordinates && (
                      <div className="text-gray-600 text-xs mt-1">
                        Coords: {item.coordinates.lat.toFixed(6)},{" "}
                        {item.coordinates.lng.toFixed(6)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Preview */}
          {results.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Results Preview ({results.length} geocoded)
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {results
                  .slice(-10)
                  .reverse()
                  .map((result, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg p-3 ${
                        result.geocoded ? "bg-green-50" : "bg-red-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {result.name}, {result.city}
                          </div>
                          <div className="text-sm text-gray-600">Query: {result.query}</div>
                          {result.coordinates && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <MapPin size={12} />
                              {result.coordinates.lat.toFixed(6)},{" "}
                              {result.coordinates.lng.toFixed(6)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          {result.geocoded ? (
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                result.confidence === "high"
                                  ? "bg-green-200 text-green-800"
                                  : result.confidence === "medium"
                                  ? "bg-yellow-200 text-yellow-800"
                                  : "bg-orange-200 text-orange-800"
                              }`}
                            >
                              {result.confidence}
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded bg-red-200 text-red-800">
                              failed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              {results.length > 10 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Showing last 10 results
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
