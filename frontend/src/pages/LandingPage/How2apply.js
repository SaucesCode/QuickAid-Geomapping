import React from "react";
import { ClipboardList, Search, ThumbsUp, Heart, ArrowRight } from "lucide-react";

export default function HowToApply() {
  const steps = [
    {
      icon: ClipboardList,
      title: "Submit Application",
      description: [
        "Fill out the online form or visit your nearest DSWD office.",
        "Prepare and submit the required documents.",
      ],
    },
    {
      icon: Search,
      title: "Review & Validation",
      description: [
        "Your application is reviewed for eligibility.",
        "Verification takes around 24–48 hours.",
      ],
    },
    {
      icon: ThumbsUp,
      title: "Assistance Granted",
      description: [
        "Once approved, assistance will be released immediately.",
        "You'll be notified of the details via SMS or email.",
      ],
    },
    {
      icon: Heart,
      title: "Support Received",
      description: [
        "Receive your aid and follow-up support if needed.",
        "Our team ensures proper assistance delivery.",
      ],
    },
  ];

  const timeline = [
    { time: "0–2 hrs", label: "Application Processing" },
    { time: "24–48 hrs", label: "Review & Validation" },
    { time: "1–3 days", label: "Assistance Deployment" },
    { time: "Ongoing", label: "Follow-up Support" },
  ];

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-6">
        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
        <span className="text-blue-700 font-semibold text-sm uppercase tracking-wider">
          Application Process
        </span>
      </div>
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-5 tracking-tight">
            How to Apply
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Our streamlined process ensures you receive assistance quickly and efficiently
          </p>
        </div>

        {/* Steps */}
        <div className="mb-24">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-8 mb-8 last:mb-0">
              {/* Left Side - Number and Line */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl text-white text-3xl font-bold flex-shrink-0">
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-1 flex-1 bg-gradient-to-b from-blue-600 to-blue-300 mt-4 rounded-full min-h-[80px]"></div>
                )}
              </div>

              {/* Right Side - Content */}
              <div className="flex-1 pb-8">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300">
                  <div className="flex items-start gap-5 mb-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <div className="space-y-3">
                        {step.description.map((line, i) => (
                          <p key={i} className="text-gray-700 leading-relaxed flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{line}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Section */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-3">Expected Timeline</h3>
              <p className="text-blue-200 text-lg">From submission to support delivery</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {timeline.map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 hover:bg-opacity-15 transition-all h-full">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 bg-opacity-30 rounded-full mb-4">
                        <span className="text-2xl font-bold text-white">{index + 1}</span>
                      </div>
                      <p className="text-white font-bold text-3xl mb-3">{item.time}</p>
                      <p className="text-blue-200 text-sm font-medium leading-relaxed">
                        {item.label}
                      </p>
                    </div>
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20">
                      <ArrowRight className="text-blue-400 w-6 h-6" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}