import React from "react";
import { ClipboardList, Search, ThumbsUp, Heart } from "lucide-react";

export default function HowToApply() {
  return (
    <section className="bg-gray-50 py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          How it Works
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-12">
          Our streamlined four-step process ensures you get the help you need quickly and efficiently
        </p>

        {/* Steps */}
        <div className="grid md:grid-cols-4 gap-10 mb-16">
          {/* Step 1 */}
          <div className="text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mx-auto mb-4">
              <ClipboardList className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              1. Submit Application
            </h3>
            <p className="text-gray-600">
              Fill out the online form or visit your nearest DSWD office to
              submit the required documents.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto mb-4">
              <Search className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              2. Review & Validation
            </h3>
            <p className="text-gray-600">
              Your application will be reviewed within 24–48 hours for
              eligibility and assessment.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mx-auto mb-4">
              <ThumbsUp className="w-10 h-10 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              3. Assistance Granted
            </h3>
            <p className="text-gray-600">
              Once approved, financial or material assistance will be released
              immediately.
            </p>
          </div>

          {/* Step 4 */}
          <div className="text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mx-auto mb-4">
              <Heart className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              4. Support Received
            </h3>
            <p className="text-gray-600">
              Beneficiaries receive assistance plus follow-up support if needed.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-8">
            Typical Timeline
          </h3>
          <div className="flex flex-col md:flex-row justify-around items-center gap-6 md:gap-0">
            <div className="text-center">
              <p className="text-blue-600 font-bold text-xl">0–2 hrs</p>
              <p className="text-gray-600">Application Processing</p>
            </div>
            <span className="text-gray-400 text-2xl">→</span>
            <div className="text-center">
              <p className="text-green-600 font-bold text-xl">24–48 hrs</p>
              <p className="text-gray-600">Review & Validation</p>
            </div>
            <span className="text-gray-400 text-2xl">→</span>
            <div className="text-center">
              <p className="text-yellow-600 font-bold text-xl">1–3 days</p>
              <p className="text-gray-600">Assistance Deployment</p>
            </div>
            <span className="text-gray-400 text-2xl">→</span>
            <div className="text-center">
              <p className="text-purple-600 font-bold text-xl">Ongoing</p>
              <p className="text-gray-600">Follow-up Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
