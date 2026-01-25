import { useState } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Download, Database, BarChart3 } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Card,
  GradientButton,
  GhostButton,
} from "../../components/DesignSystem";
import { cn } from "../../utils/cn";
import AnalyticsExport from "./components/AnalyticsExport";
import ApplicantExport from "./components/ApplicantsExport";

const ExportApplicants = () => {
  const [activeTab, setActiveTab] = useState("applicants");

  usePageTitle("Export Data");

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        icon={Download}
        title="Export Center"
        subtitle="Download applicant data and analytics reports"
      />

      {/* Tab Navigation */}
      <Card className="overflow-hidden p-0">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("applicants")}
            className={cn(
              "flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2",
              activeTab === "applicants"
                ? "bg-[#003a76]  border-b-4 border-indigo-700 text-white"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Database className="w-4 h-4 sm:w-5 sm:h-5" />
            <span
              className={
                activeTab === "applicants" ? "hidden sm:inline text-white" : "text-black"
              }
            >
              Applicant Data (CSV)
            </span>
            <span className="sm:hidden">Applicants</span>
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={cn(
              "flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2",
              activeTab === "analytics"
                ? "bg-[#003a76] text-white border-b-4 border-indigo-700"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span
              className={
                activeTab === "analytics" ? "hidden sm:inline text-white" : "text-black"
              }
            >
              Analytics Report
            </span>
            <span className="sm:hidden">Analytics</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === "applicants" ? <ApplicantExport /> : <AnalyticsExport />}
        </div>
      </Card>
    </PageContainer>
  );
};

export default ExportApplicants;
