import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function AICSGraph() {
  // Sample data (replace with real values)
  const data = [
    { month: "Jan", Food: 30, Aid: 20, Medical: 10 },
    { month: "Feb", Food: 50, Aid: 25, Medical: 15 },
    { month: "Mar", Food: 60, Aid: 30, Medical: 20 },
    { month: "Apr", Food: 40, Aid: 35, Medical: 25 },
    { month: "May", Food: 70, Aid: 40, Medical: 30 },
    { month: "Jun", Food: 90, Aid: 45, Medical: 35 },
  ];

  return (
    <section className="bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left side: Graph with notes */}
        <div className="relative">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />

              {/* Trend/reference line */}
              <ReferenceLine
                y={50}
                label="Target"
                stroke="black"
                strokeDasharray="3 3"
              />

              {/* Stacked areas */}
              <Area
                type="monotone"
                dataKey="Food"
                stackId="1"
                stroke="#2563eb" // blue
                fill="#2563eb"
                fillOpacity={0.7}
              />
              <Area
                type="monotone"
                dataKey="Aid"
                stackId="1"
                stroke="#dc2626" // red
                fill="#dc2626"
                fillOpacity={0.7}
              />
              <Area
                type="monotone"
                dataKey="Medical"
                stackId="1"
                stroke="#6b7280" // gray
                fill="#6b7280"
                fillOpacity={0.7}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Labels on graph */}
          <div className="absolute top-4 left-4 bg-white shadow-md rounded-xl px-4 py-2 text-sm">
            No unnecessary requirements <br />
            <span className="text-gray-500">
              Focused purely on providing aid
            </span>
          </div>

          <div className="absolute bottom-4 right-4 bg-white shadow-md rounded-xl px-4 py-2 text-sm">
            Quick & Transparent Assistance
          </div>

          {/* Legend placed below chart */}
          <div className="flex justify-center space-x-8 mt-6">
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded bg-blue-600"></span>
              <span className="text-gray-700 text-sm font-medium">Food</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded bg-red-600"></span>
              <span className="text-gray-700 text-sm font-medium">Aid</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded bg-gray-600"></span>
              <span className="text-gray-700 text-sm font-medium">Medical</span>
            </div>
          </div>
        </div>

        {/* Right side: Summary */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Summary</h3>
          <p className="text-gray-600 leading-relaxed">
            The stacked area chart shows how food (blue), aid (red), and medical
            (gray) assistance are distributed over time. The target reference
            line highlights key thresholds, ensuring transparent and fair
            allocation of resources while emphasizing efficiency and impact.
          </p>
        </div>
      </div>
    </section>
  );
}
