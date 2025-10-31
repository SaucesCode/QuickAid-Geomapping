import React from "react";
import {
  Map,
  LineChart,
  Network,
  CheckCircle,
} from "lucide-react";

export default function SmartResourceAllocation() {
  const primaryColor = "blue"; // Tailwind default color for professionalism
  const darkBg = "gray-800"; // Dark background for the top section (matches snippet)
  const lightBg = "gray-50"; // Light background for the bottom section

  // Helper component for cleaner stat display - KEEPING THIS AS IS
  const StatItem = ({ value, label, color, icon: Icon, darkText = false }) => (
    <div className="flex flex-col items-center">
      {/* Conditionally set text color based on background */}
      <h4 className={`text-3xl font-bold ${darkText ? `text-${color}-700` : 'text-white'}`}>{value}</h4> 
      <p className={`text-sm font-medium mt-1 ${darkText ? 'text-gray-600' : 'text-gray-300'}`}>{label}</p>
    </div>
  );

  // Component for the progress bars in the dark section
  const ProgressBar = ({ label, valueText, percentage, barColor }) => (
    <div>
      <div className="flex justify-between text-base font-medium mb-1">
        <span className="text-gray-200">{label}</span>
        <span className={`text-${barColor}-300 font-semibold`}>{valueText}</span>
      </div>
      <div className="w-full bg-gray-600 rounded-full h-2">
        <div 
          className={`bg-${barColor}-400 h-2 rounded-full`}
          style={{ width: percentage }} // Use style for dynamic width
        ></div>
      </div>
    </div>
  );

  return (
    // Outer container for the entire two-part layout
    <div className="font-sans">
      
      {/* 1. Top Section: Dark Background with Title/Intro and Progress Bars (like snippet) */}
      <section className={`bg-${darkBg} py-20 px-6`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Left Side: Title and Intro Text (like snippet's text block) */}
          <div>
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Data-Driven <span className={`text-${primaryColor}-400 text-5xl lg:text-6xl`}>Resource Allocation</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-lg mb-6">
              QuickAid uses advanced geo-mapping and analytics to identify high-need areas and optimize resource distribution for maximum community impact.
            </p>
            
          </div>

          {/* Right Side: Progress Bars (like snippet's right side) */}
          <div className="space-y-6 pt-2">
            <ProgressBar 
              label="High-Need Areas Identified"
              valueText="247 zones"
              percentage="80%"
              barColor={primaryColor} // blue
            />
            <ProgressBar 
              label="Resource Coverage"
              valueText="94% statewide"
              percentage="94%"
              barColor={primaryColor} // accent
            />
            <ProgressBar 
              label="Response Time Improvement"
              valueText="67% faster"
              percentage="67%"
              barColor={primaryColor} // blue
            />
            {/* Added two more bars to match the visual length of the snippet's bar section */}
             <ProgressBar 
              label="Operational Efficiency"
              valueText="88% target met"
              percentage="88%"
              barColor={primaryColor} // accent
            />
             <ProgressBar 
              label="Volunteer Engagement"
              valueText="75% active"
              percentage="75%"
              barColor={primaryColor} // blue
            />
          </div>

        </div>
      </section>

      <section className={`bg-gray-100 py-24 px-6 overflow-hidden`}>
  <div className="max-w-7xl mx-auto">

    {/* Title Block: Matches the "Our Special Features" text and centered description */}
    <div className="text-center mb-20 max-w-4xl mx-auto">
      <h3 className="text-5xl lg:text-6xl font-bold text-gray-800">
        Our Core <span className={`text-blue-600 text-5xl lg:text-6xl`}>Operational Features</span>
      </h3>
      <p className="text-lg text-gray-600 mt-4 px-4">
        QuickAid's operational strategy is powered by three key pillars, utilizing advanced technology to guarantee optimal resource deployment and maximum community benefit.
      </p>
    </div>

    <div className="flex space-x-6 md:space-x-8 overflow-x-scroll no-scrollbar p-2 -mx-6 md:mx-0">
      
      {/* Feature Card 1: Geographic Intelligence */}
      <div className="flex-shrink-0 w-80 md:w-full max-w-sm bg-gray-300 shadow-xl rounded-xl p-8 transform hover:scale-[1.02] transition duration-300 cursor-pointer">
        <div className="text-4xl font-bold text-gray-600 mb-4">
          <span className="text-5xl font-extrabold text-gray-700 mr-2">01</span>
        </div>
        <h4 className={`text-xl font-bold text-gray-700 mb-2`}>
          Geo-Mapping Intelligence
        </h4>
        <p className="text-gray-700 text-sm">
          Real-time mapping of assistance requests helps us identify communities with the highest needs and deploy resources accordingly. This minimizes delay in crucial areas.
        </p>
        {/* <Map className="w-8 h-8 text-gray-600 mt-4" /> */}
      </div>

      {/* Feature Card 2: Predictive Analytics (Middle Card) */}
      <div className="flex-shrink-0 w-80 md:w-full max-w-sm bg-gray-300 shadow-xl rounded-xl p-8 transform hover:scale-[1.02] transition duration-300 cursor-pointer">
        <div className="text-4xl font-bold text-gray-600 mb-4">
          <span className="text-5xl font-extrabold text-gray-700 mr-2">02</span>
        </div>
        <h4 className={`text-xl font-bold text-gray-700 mb-2`}>
          Predictive Demand Modeling
        </h4>
        <p className="text-gray-700 text-sm">
          Our system analyzes historical data and real-time trends to predict where assistance will be needed most, enabling proactive support deployment before a crisis fully escalates.
        </p>
        {/* <LineChart className="w-8 h-8 text-gray-600 mt-4" /> */}
      </div>

      {/* Feature Card 3: Network Optimization */}
      <div className="flex-shrink-0 w-80 md:w-full max-w-sm bg-gray-300 shadow-xl rounded-xl p-8 transform hover:scale-[1.02] transition duration-300 cursor-pointer">
        <div className="text-4xl font-bold text-gray-600 mb-4">
          <span className="text-5xl font-extrabold text-gray-700 mr-2">03</span>
        </div>
        <h4 className={`text-xl font-bold text-gray-700 mb-2`}>
          Global Network Optimization
        </h4>
        <p className="text-gray-700 text-sm">
          Strategic placement of partner organizations and resources ensures faster response times in underserved areas by calculating the optimal distribution routes in real-time.
        </p>
        {/* <Network className="w-8 h-8 text-gray-600 mt-4" /> */}
      </div>

      {/* Placeholder for the 'peek' card on the right (Optional) */}
      <div className="flex-shrink-0 w-16 bg-gray-200 rounded-xl"></div>
    </div>
    
  </div>
  {/* The bottom stats row from the previous design has been removed as it doesn't fit the new snippet */}
</section>
    </div>
  );
}