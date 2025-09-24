import React from "react";
import { Star, Building2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function FinpayFeatures() {
  // Example single data for cumulative values
  const chartData = [
    { month: "Jan", value: 400 },
    { month: "Feb", value: 600 },
    { month: "Mar", value: 900 },
    { month: "Apr", value: 1200 },
    { month: "May", value: 1600 },
    { month: "Jun", value: 1876 },
  ];

  return (
    <div className="bg-gray-200 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Main Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-16">
          DSWD{" "}
          <span className="text-4xl md:text-5xl font-bold text-blue-500">
            AICS
          </span>
        </h2>

        {/* Top Row (2 small boxes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Box 1 */}
          <div className="bg-gray-50 rounded-2xl p-8 shadow-md hover:shadow-lg transition">
            <div className="text-6xl font-bold text-blue-600 mb-4">3k+</div>
            <h3 className="text-2xl font-bold text-gray-900">
              Families assisted nationwide
            </h3>
          </div>

          {/* Box 2 */}
          <div className="bg-gray-50 rounded-2xl p-8 shadow-md hover:shadow-lg transition">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Quick & Transparent Assistance
            </h3>
            <div className="flex items-center justify-center space-x-6">
              {/* Left Arrow */}
              <div className="w-0 h-0 border-t-4 border-b-4 border-r-8 border-r-gray-300 border-t-transparent border-b-transparent"></div>

              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                <Star className="w-8 h-8 text-white" fill="white" />
              </div>

              {/* Line */}
              <div className="flex-1 h-0.5 bg-gray-300">
                <div className="w-full h-full bg-gradient-to-r from-blue-600 to-red-800"></div>
              </div>

              <div className="w-16 h-16 bg-red-800 rounded-2xl flex items-center justify-center shadow-md">
                <Building2 className="w-8 h-8 text-white" />
              </div>

              {/* Right Arrow */}
              <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-l-gray-300 border-t-transparent border-b-transparent"></div>
            </div>
          </div>
        </div>

        {/* Bottom Wide Box (Summary + Area Chart + Requirements) */}
        <div className="bg-gray-50 rounded-2xl p-8 shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-600 text-sm mb-2">Summary</p>
              <p className="text-3xl font-bold text-gray-900">$1,876,580</p>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="text-sm">6 Months</span>
            </div>
          </div>

          {/* Single Area Chart */}
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#4b5563", fontSize: 12 }}
                />
                <YAxis hide /> {/* Hide Y-axis to match the clean look */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "0.5rem",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#14b8a6"
                  fill="#14b8a6"
                  fillOpacity={0.2}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Requirements */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No unnecessary requirements
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Focused purely on providing aid to those who need it most.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
