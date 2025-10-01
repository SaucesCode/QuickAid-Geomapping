import React from "react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
        <p className="text-gray-700 mb-4">
          QuickAid values your privacy. This policy explains how we collect, use,
          and protect your personal information.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <p className="text-gray-700 mb-4">
          We may collect personal details such as name, contact number, address,
          and other necessary information to process your request.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Information</h2>
        <p className="text-gray-700 mb-4">
          Information is used solely for verifying eligibility, processing aid
          requests, and improving QuickAid services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Information Sharing</h2>
        <p className="text-gray-700 mb-4">
          Your data will only be shared with authorized government agencies as
          required. We will never sell or misuse your personal information.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Protection</h2>
        <p className="text-gray-700 mb-4">
          We apply security measures, including encryption and access controls,
          to safeguard your data from unauthorized access.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Rights</h2>
        <p className="text-gray-700 mb-4">
          You may request access, correction, or deletion of your personal data
          by contacting our support team.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Cookies & Tracking</h2>
        <p className="text-gray-700 mb-4">
          If cookies or analytics are used, they will only be applied to improve
          your user experience.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">7. Policy Updates</h2>
        <p className="text-gray-700 mb-4">
          We may update this Privacy Policy from time to time. Changes will be
          posted on this page.
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

export default PrivacyPolicy;
