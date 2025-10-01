import React from "react";
import {
  Map,
  LineChart,
  Network,
} from "lucide-react";

export default function SmartResourceAllocation() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Smart Resource Allocation
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            QuickAid uses advanced geo-mapping and analytics to identify
            high-need areas and optimize resource distribution for maximum
            community impact.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Data Driven Impact */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Data-Driven Impact
            </h3>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Map className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-gray-900">
                    Geographic Intelligence
                  </h4>
                  <p className="text-gray-600">
                    Real-time mapping of assistance requests helps us identify
                    communities with the highest needs and deploy resources
                    accordingly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-4 bg-green-100 rounded-full">
                  <LineChart className="text-green-600 w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-gray-900">
                    Predictive Analytics
                  </h4>
                  <p className="text-gray-600">
                    Our system analyzes trends and patterns to predict where
                    assistance will be needed most, enabling proactive support
                    deployment.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-4 bg-emerald-100 rounded-full">
                  <Network className="text-emerald-600 w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-gray-900">
                    Network Optimization
                  </h4>
                  <p className="text-gray-600">
                    Strategic placement of partner organizations and resources
                    ensures faster response times in underserved areas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Impact Visualization */}
          <div className="bg-white shadow-lg rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Impact Visualization
            </h3>

            {/* Progress Bars */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-700">
                    High-Need Areas Identified
                  </span>
                  <span className="text-red-500">247 zones</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-red-500 h-3 rounded-full w-[80%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-700">Resource Coverage</span>
                  <span className="text-blue-500">94% statewide</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full w-[94%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-700">
                    Response Time Improvement
                  </span>
                  <span className="text-green-500">67% faster</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full w-[67%]"></div>
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-3 gap-6 mt-8 text-center">
              <div>
                <h4 className="text-2xl font-bold text-blue-600">15K+</h4>
                <p className="text-gray-600 text-sm">Cases Mapped</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-green-600">2.3M</h4>
                <p className="text-gray-600 text-sm">People Reached</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-emerald-600">89%</h4>
                <p className="text-gray-600 text-sm">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
