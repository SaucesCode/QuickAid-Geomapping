import React from 'react';
import { Star, Building2, ChevronDown } from 'lucide-react';

export default function FinpayFeatures() {
  // Sample data for the chart
  const chartData = [
    { month: 'Jan', value: 1200000 },
    { month: 'Feb', value: 1350000 },
    { month: 'Mar', value: 1450000 },
    { month: 'Apr', value: 1600000 },
    { month: 'May', value: 1750000 },
    { month: 'Jun', value: 1876580 }
  ];

  const svgWidth = 400;
  const svgHeight = 150;
  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value));
  
  const pathData = chartData.map((point, index) => {
    const x = (index / (chartData.length - 1)) * svgWidth;
    const y = svgHeight - ((point.value - minValue) / (maxValue - minValue)) * (svgHeight - 20);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const areaPath = `${pathData} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

  return (
    <div className="bg-gray-200 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Main Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-16">
          DSWD <span className="text-4xl md:text-5xl font-bold text-blue-500">AICS</span>
        </h2>

        {/* Top Row (2 small boxes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Box 1 */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="text-6xl font-bold text-blue-600 mb-4">3k+</div>
            <h3 className="text-2xl font-bold text-gray-900">
              Families assisted nationwide
            </h3>
          </div>

          {/* Box 2 (Quick & Transparent Assistance only) */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Quick & Transparent Assistance
            </h3>
            <div className="flex items-center justify-center space-x-6">
              {/* Left Arrow */}
              <div className="w-0 h-0 border-t-4 border-b-4 border-r-8 border-r-gray-300 border-t-transparent border-b-transparent"></div>

              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                <Star className="w-8 h-8 text-white" fill="white" />
              </div>

              {/* Line */}
              <div className="flex-1 h-0.5 bg-gray-300">
                <div className="w-full h-full bg-gradient-to-r from-blue-600 to-red-800"></div>
              </div>

              <div className="w-16 h-16 bg-red-800 rounded-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>

              {/* Right Arrow */}
              <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-l-gray-300 border-t-transparent border-b-transparent"></div>
            </div>
          </div>
        </div>

        {/* Bottom Wide Box (Summary + Chart + No unnecessary requirements) */}
        <div className="bg-gray-50 rounded-2xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-600 text-sm mb-2">Summary</p>
              <p className="text-3xl font-bold text-gray-900">$1,876,580</p>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="text-sm">6 Months</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Chart */}
          <div className="relative h-40">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <path d={areaPath} fill="rgba(20, 184, 166, 0.1)" />
              <path d={pathData} fill="none" stroke="rgb(20, 184, 166)" strokeWidth="3" />
            </svg>
          </div>

          {/* Months */}
          <div className="flex justify-between mt-4 text-sm text-gray-500">
            {chartData.map((point, index) => (
              <span key={index}>{point.month}</span>
            ))}
          </div>

          {/* No unnecessary requirements */}
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
