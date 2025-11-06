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
  FileCheck,
  FileSearch,
  FileSignature,
  Banknote,
} from "lucide-react";

export default function FuneralAssistanceProgram() {
  const [currentTab, setCurrentTab] = useState("requirements");

  // Replicating the styled components structure and colors from EducationalAssistance
  const RequirementCard = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-4 p-4 bg-white border border-blue-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <Icon className="w-6 h-6 text-blue-600 flex-shrink-0" />
      <p className="text-slate-700 font-medium">{text}</p>
    </div>
  );

  const ProcessStep = ({ icon: Icon, title, description }) => (
    <div className="flex items-start gap-6 relative">
      {/* Step Circle - Monochromatic Blue */}
      <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-xl flex-shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      {/* Step Content */}
      <div>
        <p className="text-slate-900 font-bold text-lg">{title}</p>
        <p className="text-slate-600 text-sm mt-2">{description}</p>
      </div>
    </div>
  );

  const BenefitCard = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-4 p-4 bg-white border border-blue-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <Icon className="w-6 h-6 text-blue-600 flex-shrink-0" />
      <p className="text-slate-700 font-medium">{text}</p>
    </div>
  );

  // Using the new Eligibility component style (bg-white item inside blue container)
  const EligibilityItem = ({ text }) => (
    <div className="flex items-start gap-4 bg-white text-slate-800 p-4 rounded-lg shadow-sm">
      <CheckCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />{" "}
      {/* Changed to blue-600 */}
      <span className="font-medium">{text}</span>
    </div>
  );

  const renderContent = () => {
    switch (currentTab) {
      case "requirements":
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 border-l-4 border-blue-500 pl-3">
              Requirements
            </h2>

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
                text="Valid ID of the deceased person and the applicant/claimant."
              />{" "}
              {/* Added a card for visual balance */}
            </div>

            <div className="mt-8 p-6 bg-blue-100 border border-blue-300 rounded-lg shadow-inner">
              {" "}
              {/* Blue monochromatic note */}
              <h3 className="font-semibold text-blue-800 mb-2">Important Note:</h3>
              <p className="text-blue-700 text-sm">
                All documents must be original or certified copies. Additional requirements may
                be needed depending on the specific circumstances.
              </p>
            </div>
          </div>
        );

      case "application":
        return (
          <div className="space-y-10 relative">
            <h2 className="text-2xl font-bold text-blue-700 mb-8 border-l-4 border-blue-500 pl-3">
              Application Process
            </h2>
            {/* Vertical Line - Monochromatic Blue */}
            <div className="absolute left-6 top-0 h-full w-1 bg-blue-200"></div>

            <ProcessStep
              icon={FileSignature}
              title="Submit Requirements"
              description="Submit all required documents and IDs to the nearest DSWD office or satellite center."
            />
            <ProcessStep
              icon={FileSearch}
              title="Assessment Interview"
              description="A social worker will interview the applicant to assess eligibility and level of crisis."
            />
            <ProcessStep
              icon={CheckCircle}
              title="Approval Process"
              description="The application will be reviewed and approved based on criteria and available funds."
            />
            <ProcessStep
              icon={Banknote}
              title="Release of Assistance"
              description="Funeral assistance will be released directly to the funeral service provider or the applicant via DSWD offices or partner banks."
            />
          </div>
        );

      case "benefits":
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 border-l-4 border-blue-500 pl-3">
              Benefits Provided
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <BenefitCard
                icon={Heart}
                text="Financial assistance for immediate burial and memorial expenses."
              />
              <BenefitCard
                icon={Users}
                text="Support for funeral and burial transportation costs (if applicable)."
              />
              <BenefitCard
                icon={FileCheck}
                text="Processing fee coverage for necessary documentation."
              />
              <BenefitCard
                icon={Gift}
                text="Support for other immediate necessities during bereavement."
              />
            </div>

            {/* Who Can Apply Section (Monochromatic Blue) */}
            <div className="bg-blue-600 text-white rounded-xl p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-6">Who Can Apply?</h3>
              <div className="space-y-4">
                <EligibilityItem text="Indigent families of deceased persons." />
                <EligibilityItem text="Senior citizens and indigents without sufficient funds for immediate expenses." />
                <EligibilityItem text="Relatives or next of kin unable to meet funeral expenses." />
                <EligibilityItem text="Individuals facing sudden destitution due to the death of a family member." />
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
      <div className="min-h-screen bg-slate-50 pt-32">
        {/* Hero Section - Deep Monochromatic Blue */}
        <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16 relative overflow-hidden shadow-lg">
          <Cross className="absolute right-12 top-12 w-40 h-40 text-blue-500 opacity-10" />

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl text-blue-100 font-bold mb-4">
                  {" "}
                  {/* Changed from extrabold to bold */}
                  Funeral Assistance Program
                </h1>
                <p className="text-lg text-blue-200 max-w-xl font-medium">
                  Providing compassionate support to families in need by assisting with
                  funeral, burial, and memorial expenses for indigent households.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white text-slate-800 rounded-xl shadow-xl p-6 text-center border-t-4 border-blue-500">
                <Users className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                <h3 className="text-2xl font-semibold">50,000+</h3>{" "}
                {/* Changed from bold to semibold */}
                <p className="text-slate-600">Families Assisted</p>
              </div>
              <div className="bg-white text-slate-800 rounded-xl shadow-xl p-6 text-center border-t-4 border-blue-500">
                <Banknote className="w-10 h-10 mx-auto mb-3 text-blue-600" />{" "}
                {/* Consistent icon usage */}
                <h3 className="text-2xl font-semibold">₱200M+</h3>
                <p className="text-slate-600">Aid Distributed</p>
              </div>
              <div className="bg-white text-slate-800 rounded-xl shadow-xl p-6 text-center border-t-4 border-blue-500">
                <Home className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                <h3 className="text-2xl font-semibold">2nd District</h3>
                <p className="text-slate-600">Coverage</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            {/* Tabs - Monochromatic Blue Styling */}
            <div className="flex justify-center space-x-4 mb-10 border-b-2 border-blue-100 pb-2">
              <button
                onClick={() => setCurrentTab("requirements")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-colors shadow-md ${
                  currentTab === "requirements"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                <FileText className="w-5 h-5" /> Requirements
              </button>
              <button
                onClick={() => setCurrentTab("application")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-colors shadow-md ${
                  currentTab === "application"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                <ClipboardList className="w-5 h-5" /> Application Process
              </button>
              <button
                onClick={() => setCurrentTab("benefits")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-colors shadow-md ${
                  currentTab === "benefits"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                <Gift className="w-5 h-5" /> Benefits
              </button>
            </div>

            {/* Tab Content Area */}
            <div className="bg-slate-50 rounded-xl shadow-inner p-8 border border-blue-100">
              {renderContent()}
            </div>
          </div>
        </section>

        <div className="p-8 md:p-12 bg-blue-500 min-h-screen flex items-start justify-center">
          {/* Content card - rounded white background */}
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 lg:p-10 max-w-4xl w-full relative mt-16">
            {/* 'PAALALA' Header/Pill - positioned absolutely at the top-left */}
            <div className="absolute top-0 left-4 md:left-8 transform -translate-y-1/2">
              <div className="bg-red-600 text-white font-bold text-lg md:text-xl py-2 px-6 rounded-full shadow-lg border-2 border-white whitespace-nowrap">
                PAALALA
              </div>
            </div>

            {/* Content Section */}
            <div className="pt-4 md:pt-8 space-y-4">
              {/* Group 1: NO FIXER & NO EXTRA FEES */}
              <div className="flex items-start space-x-4 md:space-x-6">
                {/* NO FIXER Icon */}
                <div className="flex-shrink-0 w-24 h-24 flex flex-col items-center justify-center border-2 border-red-600 rounded-full text-red-600 font-extrabold text-center leading-tight">
                  <span className="text-xl">NO</span>
                  <span className="text-xl">FIXER</span>
                </div>

                {/* Combined Text Block for NO FIXER and NO EXTRA FEES (using clean text) */}
                <div className="text-lg text-gray-800 flex-grow pt-1 space-y-4">
                  <p>
                    Ang lahat ng pinansyal na tulong mula sa Crisis Intervention Division ng
                    DSWD ay buong matatanggap ng mga benepisyaryo.
                  </p>
                  <p>
                    Walang sino mang empleyado o hindi empleyado ng ahensya ang awtorisado na
                    magkaltas o magpataw ng ano mang pinansiyal na singil mula rito.
                  </p>
                </div>
              </div>

              {/* Group 2: FAKE DOCUMENTS */}
              <div className="flex items-start space-x-4 md:space-x-6 pt-4">
                {/* FAKE Icon */}
                <div className="flex-shrink-0 w-24 h-24 flex flex-col items-center justify-center border-2 border-red-600 rounded-lg text-red-600 font-extrabold text-center leading-none">
                  <span
                    className="text-2xl tracking-widest"
                    style={{ letterSpacing: "0.2em" }}
                  >
                    FAKE
                  </span>
                </div>

                {/* Text Block for FAKE DOCUMENTS (using clean text) */}
                {/* This paragraph takes the same width as the combined two above it */}
                <p className="text-lg text-gray-800 flex-grow pt-1">
                  Ang DSWD ay hindi tumatanggap ng mga fake/peke na mga dokumento at ito ay
                  mapatunayan ng DSWD may kaukulang itong parusa at dadaan ito sa tamang
                  proseso upang mabigyan ng tamang aksyon.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Back Button */}
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-6 py-3 rounded-full font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Services
          </Link>
        </div>

        <Footer />
      </div>
    </>
  );
}
