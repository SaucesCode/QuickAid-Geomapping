import React from "react";
import { ClipboardList, Search, ThumbsUp, Heart, ArrowRight } from "lucide-react";

export default function HowToApply() {
  const steps = [
    {
      icon: ClipboardList,
      title: "1. Submit Application",
      description: "Fill out the online form or visit your nearest DSWD office to submit the required documents.",
    },
    {
      icon: Search,
      title: "2. Review & Validation",
      description: "Your application will be reviewed within 24–48 hours for eligibility and assessment.",
    },
    {
      icon: ThumbsUp,
      title: "3. Assistance Granted",
      description: "Once approved, financial or material assistance will be released immediately.",
    },
    {
      icon: Heart,
      title: "4. Support Received",
      description: "Beneficiaries receive assistance plus follow-up support if needed.",
    },
  ];

  const timeline = [
    { time: "0–2 hrs", label: "Application Processing" },
    { time: "24–48 hrs", label: "Review & Validation" },
    { time: "1–3 days", label: "Assistance Deployment" },
    { time: "Ongoing", label: "Follow-up Support" },
  ];

  return (
    // Crisp white background for a professional look
    <section className="bg-white py-24 px-6 sm:py-32">
      <div className="max-w-6xl mx-auto text-center">
        
        {/* Section Title: Strong, authoritative blue text */}
        <h2 className="text-5xl lg:text-6x font-bold text-blue-900 mb-4 tracking-tight">
          Our Simple <span className="text-5xl lg:text-6x text-blue-600">Process</span>
        </h2>
        
        {/* Subtitle: Muted, high-contrast text */}
        <p className="text-lg text-gray-500 max-w-4xl mx-auto mb-20 leading-relaxed">
          Our streamlined four-step process ensures you get the help you need quickly and efficiently.
        </p>

        {/* Steps: Modern, elevated cards with number badges */}
        <div className="grid md:grid-cols-4 gap-8 mb-28">
          {steps.map((step, index) => (
            <div 
              key={index}
              // Card design: subtle shadow, rounded corners, clean hover effect
              className="relative text-center p-8 bg-white border border-blue-50/50 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] group"
            >
              {/* Step Number Badge: Monochromatic blue circle for visual hierarchy */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">{index + 1}</span>
              </div>
              
              {/* Icon Container: Primary blue icon on a slightly lighter blue background */}
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mx-auto mt-2 mb-6">
                <step.icon className="w-7 h-7 text-blue-600" />
              </div>
              
              {/* Title: Dark, readable blue heading */}
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                {step.title.substring(3)} {/* Remove the number from the title since we have the badge */}
              </h3>
              
              {/* Description: Clean gray text for readability */}
              <p className="text-gray-500 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Timeline: Dark blue, high-contrast, professional block */}
        <div className="bg-blue-800 text-white rounded-xl p-8 lg:p-12 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-10 border-b border-blue-600 pb-5">
            Expected Timeline 
          </h3>
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 md:gap-4 lg:gap-10">
            
            {timeline.map((item, index) => (
              <React.Fragment key={index}>
                {/* Timeline Item */}
                <div className="text-center flex-1 py-2">
                  <p className="text-blue-200 font-bold text-3xl mb-2">{item.time}</p>
                  <p className="text-blue-300 text-sm font-semibold uppercase tracking-wider">{item.label}</p>
                </div>
                
                {/* Arrow Divider: Bright blue arrow for visual separation (hidden on small screens) */}
                {index < timeline.length - 1 && (
                  <ArrowRight className="text-blue-500 w-6 h-6 hidden md:block flex-none" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}