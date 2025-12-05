import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";

const CITY_OPTIONS = [
  { name: "Lucena City", code: "045624000" },
  { name: "Sariaya", code: "045645000" },
  { name: "Candelaria", code: "045608000" },
  { name: "Tiaong", code: "045648000" },
  { name: "San Antonio", code: "045641000" },
  { name: "Dolores", code: "045615000" },
];

const PSGC_BASE = "https://psgc.gitlab.io/api";

export default function BarangayFetcher() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [data, setData] = useState(null);

  const fetchBarangays = async () => {
    setLoading(true);
    setStatus("Fetching barangays...");

    try {
      const allData = [];

      for (const city of CITY_OPTIONS) {
        setStatus(`Fetching barangays for ${city.name}...`);

        const response = await fetch(
          `${PSGC_BASE}/cities-municipalities/${city.code}/barangays`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch data for ${city.name}`);
        }

        const barangays = await response.json();

        allData.push({
          city: city.name,
          cityCode: city.code,
          barangayCount: barangays.length,
          barangays: barangays.map(b => ({
            name: b.name,
            code: b.code,
            city: city.name,
            cityCode: city.code,
          })),
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setData(allData);
      setStatus("Data fetched successfully!");
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!data) return;

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "barangays_quezon.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalBarangays = data?.reduce((sum, city) => sum + city.barangayCount, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Barangay Data Fetcher</h1>
          <p className="text-gray-600 mb-6">
            Fetch barangays from Quezon Province cities/municipalities
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-gray-700 mb-2">Cities to fetch:</h2>
            <ul className="grid grid-cols-2 gap-2">
              {CITY_OPTIONS.map(city => (
                <li key={city.code} className="text-sm text-gray-600">
                  • {city.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={fetchBarangays}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Fetching...
                </>
              ) : (
                "Fetch Barangays"
              )}
            </button>

            {data && (
              <button
                onClick={downloadJSON}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Download size={20} />
                Download JSON
              </button>
            )}
          </div>

          {status && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                status.includes("Error")
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {status}
            </div>
          )}

          {data && (
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Summary: {totalBarangays} barangays across {data.length} cities
              </h3>

              <div className="space-y-4">
                {data.map((city, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-lg text-gray-800 mb-2">
                      {city.city} ({city.barangayCount} barangays)
                    </h4>
                    <div className="max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {city.barangays.map((brgy, i) => (
                          <div key={i} className="text-sm text-gray-600">
                            • {brgy.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
