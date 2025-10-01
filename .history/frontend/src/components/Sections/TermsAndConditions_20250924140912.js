import React from "react";
import { useNavigate } from "react-router-dom";

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Terms and Conditions</h1>
        <p className="text-gray-700 mb-4">
          By accessing and using <strong>QuickAid</strong>, you agree to comply with
          the following terms and conditions. Please read them carefully.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
        <p className="text-gray-700 mb-4">
          By using this platform, you agree to follow these Terms and Conditions. 
          If you do not agree, you must stop using QuickAid immediately.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Use of Services</h2>
        <p className="text-gray-700 mb-4">
          QuickAid is provided to assist individuals in crisis. Misuse of this
          service, including providing false information, is strictly prohibited.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Eligibility</h2>
        <p className="text-gray-700 mb-4">
          Only individuals who meet the program’s requirements may use QuickAid 
          to apply for assistance.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Accuracy of Information</h2>
        <p className="text-gray-700 mb-4">
          Users are responsible for providing accurate and truthful information.
          False or misleading data may result in denial of services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Service Availability</h2>
        <p className="text-gray-700 mb-4">
          QuickAid may update, suspend, or discontinue services at any time
          without prior notice.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Limitation of Liability</h2>
        <p className="text-gray-700 mb-4">
          QuickAid is not liable for delays, technical issues, or interruptions
          in service delivery.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">7. Governing Law</h2>
        <p className="text-gray-700 mb-4">
          These Terms shall be governed by and interpreted in accordance with the
          laws of the Republic of the Philippines.
        </p>

        {/* Back button */}
        <div className="mt-8">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
