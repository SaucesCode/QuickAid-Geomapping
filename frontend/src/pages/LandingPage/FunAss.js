import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navigation/Navbar";
import Footer from "../../components/Footer/Footer";
import {
  CheckCircle,
  Users,
  Heart,
  FileText,
  User,
  Shield,
  ClipboardList,
  Cross,
  ArrowLeft,
} from "lucide-react";

export default function FuneralAssistanceProgram() {
  const [currentTab, setCurrentTab] = useState("requirements");

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2 ${
        isActive
          ? "text-blue-600 border-blue-600 bg-blue-50"
          : "text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-300"
      }`}
    >
      {label}
    </button>
  );

  const BenefitCard = ({ icon: Icon, title, description, color = "blue" }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div
        className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center mb-4`}
      >
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );

  const ProcessStep = ({ number, title, description, isLast }) => (
    <div className="flex items-start">
      <div className="flex flex-col items-center mr-4">
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
          {number}
        </div>
        {!isLast && <div className="w-0.5 h-16 bg-blue-200 mt-2"></div>}
      </div>
      <div className="flex-1 pb-8">
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );

  const RequirementCard = ({ icon: Icon, title, description }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );

  const EligibilityItem = ({ text }) => (
    <div className="flex items-center py-3 px-4 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors duration-200">
      <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
      <span className="text-gray-700 text-sm">{text}</span>
    </div>
  );

  const renderContent = () => {
    switch (currentTab) {
      case "benefits":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Program Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BenefitCard
                  icon={Heart}
                  title="Financial Support"
                  description="Assistance for immediate burial and memorial expenses for qualifying families."
                />
                <BenefitCard
                  icon={Users}
                  title="Transport Assistance"
                  description="Support for funeral and burial transportation costs."
                />
              </div>
            </div>

            <div className="bg-blue-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Who Can Apply?</h3>
              <div className="space-y-3">
                <EligibilityItem text="Indigent families of deceased persons" />
                <EligibilityItem text="Seniors and indigents with other assistance pending" />
                <EligibilityItem text="Relatives or next of kin unable to meet funeral expenses" />
                <EligibilityItem text="Working residents experiencing first-time destitution" />
              </div>
            </div>
          </div>
        );

      case "application":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Process</h2>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <ProcessStep
                  number={1}
                  title="Submit Requirements"
                  description="Submit all required documents and valid IDs to our DSWD Office."
                />
                <ProcessStep
                  number={2}
                  title="Assessment Interview"
                  description="A social worker will interview you to assess your needs and eligibility."
                />
                <ProcessStep
                  number={3}
                  title="Approval Process"
                  description="Your application will be reviewed by our approving committee for approval."
                />
                <ProcessStep
                  number={4}
                  title="Receive Assistance"
                  description="Once approved, you will receive the funeral assistance according to your needs."
                  isLast={true}
                />
              </div>
            </div>
          </div>
        );

      case "requirements":
        return (
          <div className="space-y-8">
            {/* Requirements for Funeral Bill Payment */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Requirements for Funeral Bill Payment
              </h2>
              <p className="text-gray-600 mb-6">
                Basic requirements needed for all types of funeral assistance:
              </p>

              <div className="space-y-4">
                <RequirementCard
                  icon={Cross}
                  title="Death Certificate"
                  description="Death Certificate or Certification from the Civil Registrar Office, Barangay Captain/Mayor, Tribal Chieftain, or Police in places without a licensed Funeral Home."
                />
                <RequirementCard
                  icon={FileText}
                  title="Financial Documents"
                  description="Any financial status proof, Certificate of Indigence, or Statement of Account."
                />
                <RequirementCard
                  icon={ClipboardList}
                  title="Funeral Contract"
                  description="Contract with the funeral service provider."
                />
              </div>
            </div>

            {/* Requirements for Transfer of Cadaver */}
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Requirements for Transfer of Cadaver
              </h2>

              <div className="space-y-4">
                <RequirementCard
                  icon={Cross}
                  title="Death Certificate"
                  description="Death Certificate or Certification from the Civil Registrar Office, Barangay Captain/Mayor, Tribal Chieftain, or Police in places without a licensed Funeral Home."
                />
                <RequirementCard
                  icon={User}
                  title="Transfer Permit"
                  description="Official permit for the transfer of remains."
                />
              </div>
            </div>

            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Important Note:</h3>
              <p className="text-yellow-700 text-sm">
                All documents must be original or certified copies. Additional requirements may
                be needed depending on the specific circumstances of the case.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-32">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-600 text-white py-14 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-3xl md:text-4xl text-white font-extrabold tracking-wide uppercase">
              Funeral Assistance Program
            </h1>
            <p className="mt-3 text-blue-100 text-base md:text-lg max-w-2xl mx-auto">
              The Department of Social Welfare and Development (DSWD) provides funeral
              assistance to help Filipinos with their burial and memorial needs.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex space-x-1">
              <TabButton
                id="requirements"
                label="Requirements"
                isActive={currentTab === "requirements"}
                onClick={setCurrentTab}
              />
              <TabButton
                id="application"
                label="Application Process"
                isActive={currentTab === "application"}
                onClick={setCurrentTab}
              />
              <TabButton
                id="benefits"
                label="Benefits"
                isActive={currentTab === "benefits"}
                onClick={setCurrentTab}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">{renderContent()}</div>

        {/* Back to Services */}
        <div className="max-w-4xl mx-auto px-6 pb-12">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
        </div>

        <Footer />
      </div>
    </>
  );
}
