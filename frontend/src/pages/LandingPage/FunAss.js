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
  ClipboardList,
  Cross,
  ArrowLeft,
  Gift,
  Home,
  IdCard,
  FileCheck,
  FileSearch,
  FileSignature,
  Banknote,
} from "lucide-react";

export default function FuneralAssistanceProgram() {
  const [currentTab, setCurrentTab] = useState("requirements");

  const RequirementCard = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
      <Icon className="w-6 h-6 text-blue-600" />
      <p className="text-gray-700">{text}</p>
    </div>
  );

  const ProcessStep = ({ icon: Icon, title, description }) => (
    <div className="flex items-start gap-6 relative">
      {/* Step Circle */}
      <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-md">
        <Icon className="w-6 h-6" />
      </div>
      {/* Step Content */}
      <div>
        <p className="text-gray-900 font-semibold text-lg">{title}</p>
        <p className="text-gray-600 text-sm mt-2">{description}</p>
      </div>
    </div>
  );

  const BenefitCard = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
      <Icon className="w-6 h-6 text-blue-600" />
      <p className="text-gray-700">{text}</p>
    </div>
  );

  const EligibilityItem = ({ text }) => (
    <div className="flex items-center gap-4 bg-white text-gray-800 p-4 rounded-lg shadow-sm">
      <CheckCircle className="w-6 h-6 text-green-500" />
      <span className="font-medium">{text}</span>
    </div>
  );

  const renderContent = () => {
    switch (currentTab) {
      case "requirements":
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Requirements</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <RequirementCard
                icon={Cross}
                text="Death Certificate or Certification from Civil Registrar, Barangay Captain, or Police (if no licensed funeral home)."
              />
              <RequirementCard
                icon={FileText}
                text="Financial documents such as Certificate of Indigence or Statement of Account."
              />
              <RequirementCard
                icon={ClipboardList}
                text="Contract with the funeral service provider."
              />
              <RequirementCard
                icon={User}
                text="Transfer permit (for transfer of cadaver cases)."
              />
            </div>

            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Important Note:</h3>
              <p className="text-yellow-700 text-sm">
                All documents must be original or certified copies. Additional requirements may be
                needed depending on the specific circumstances.
              </p>
            </div>
          </div>
        );

      case "application":
        return (
          <div className="space-y-10 relative">
            <h2 className="text-2xl font-bold text-blue-700 mb-8">
      Application Process
    </h2>
            <div className="absolute left-6 top-0 h-full w-1 bg-gray-200"></div>
            <ProcessStep
              icon={FileSignature}
              title="Submit Requirements"
              description="Submit all required documents and IDs to the nearest DSWD office."
            />
            <ProcessStep
              icon={FileSearch}
              title="Assessment Interview"
              description="A social worker will interview you to assess your eligibility."
            />
            <ProcessStep
              icon={CheckCircle}
              title="Approval Process"
              description="Your application will be reviewed and approved based on criteria and available funds."
            />
            <ProcessStep
              icon={Banknote}
              title="Release of Assistance"
              description="Funeral assistance will be released through DSWD offices or partner agencies."
            />
          </div>
        );

      case "benefits":
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-6">Benefits</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <BenefitCard
                icon={Heart}
                text="Financial assistance for immediate burial and memorial expenses."
              />
              <BenefitCard
                icon={Users}
                text="Support for funeral and burial transportation costs."
              />
            </div>

            {/* Who Can Apply Section */}
            <div className="bg-blue-600 text-white rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6">Who Can Apply?</h3>
              <div className="space-y-4">
                <EligibilityItem text="Indigent families of deceased persons" />
                <EligibilityItem text="Senior citizens and indigents awaiting other assistance" />
                <EligibilityItem text="Relatives or next of kin unable to meet funeral expenses" />
                <EligibilityItem text="Residents facing sudden destitution and in need of support" />
              </div>
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
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 relative overflow-hidden">
          <Cross className="absolute right-12 top-12 w-40 h-40 text-white opacity-10" />
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl text-blue-100 font-extrabold mb-4">
                  Funeral Assistance Program
                </h1>
                <p className="text-lg text-blue-100 max-w-xl">
                  Providing compassionate support to families in need by assisting with funeral,
                  burial, and memorial expenses for indigent households.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white text-blue-800 rounded-xl shadow-lg p-6 text-center">
                <Users className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                <h3 className="text-2xl font-bold">50,000+</h3>
                <p className="text-gray-600">Families Assisted</p>
              </div>
              <div className="bg-white text-blue-800 rounded-xl shadow-lg p-6 text-center">
                <Gift className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                <h3 className="text-2xl font-bold">₱200M+</h3>
                <p className="text-gray-600">Aid Distributed</p>
              </div>
              <div className="bg-white text-blue-800 rounded-xl shadow-lg p-6 text-center">
                <Home className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                <h3 className="text-2xl font-bold">Nationwide</h3>
                <p className="text-gray-600">Coverage</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            {/* Tabs */}
            <div className="flex justify-center space-x-4 mb-10">
              <button
                onClick={() => setCurrentTab("requirements")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  currentTab === "requirements"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FileText className="w-5 h-5" /> Requirements
              </button>
              <button
                onClick={() => setCurrentTab("application")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  currentTab === "application"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <ClipboardList className="w-5 h-5" /> Application Process
              </button>
              <button
                onClick={() => setCurrentTab("benefits")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  currentTab === "benefits"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Gift className="w-5 h-5" /> Benefits
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-lg p-8">{renderContent()}</div>
          </div>
        </section>

        {/* Call-to-Action */}
        <section className="bg-blue-600 text-white py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Need Help Applying for Funeral Assistance?
            </h2>
            <p className="mb-6 text-blue-100">
              Visit your nearest DSWD Office today or check the online portal for more details.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-gray-100 transition"
            >
              Contact Us
            </Link>
          </div>
        </section>

        {/* Back Button */}
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <Link
            to="/services"
            className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-semibold transition-colors"
          >
            ← Back to Services
          </Link>
        </div>

        <Footer />
      </div>
    </>
  );
}
