// src/components/CustomToast.js
import React from "react";
import {
  LogIn,
  LogOut,
  ArchiveBox,
  SendHorizonal,
  Wand2,
  X,
  CheckCircle2,
  ShieldCheck,
  FolderArchive,
  Rocket,
  Upload,
  RotateCcw,
  FileSpreadsheet,
  BarChart3,
  FileWarning,
} from "lucide-react";
import toast from "react-hot-toast";

const toastVariants = {
  login: {
    title: "Welcome back!",
    message: "You have successfully logged in.",
    color: "bg-green-50",
    text: "text-green-900",
    accent: "bg-green-100 text-green-600",
    icon: <ShieldCheck className="w-6 h-6" strokeWidth={2.5} />,
  },
  logout: {
    title: "Goodbye!",
    message: "You have been logged out safely.",
    color: "bg-slate-50",
    text: "text-slate-900",
    accent: "bg-slate-100 text-slate-600",
    icon: <LogOut className="w-6 h-6" strokeWidth={2.5} />,
  },
  archive: {
    title: "Applicant Archived",
    message: "This applicant has been moved to archive.",
    color: "bg-amber-50",
    text: "text-amber-900",
    accent: "bg-amber-100 text-amber-600",
    icon: <FolderArchive className="w-6 h-6" strokeWidth={2.5} />,
  },
  submit: {
    title: "Form Submitted",
    message: "Your application has been sent successfully.",
    color: "bg-blue-50",
    text: "text-blue-900",
    accent: "bg-blue-100 text-blue-600",
    icon: <Rocket className="w-6 h-6" strokeWidth={2.5} />,
  },
  edit: {
    title: "Profile Updated",
    message: "Your changes have been saved.",
    color: "bg-purple-50",
    text: "text-purple-900",
    accent: "bg-purple-100 text-purple-600",
    icon: <Wand2 className="w-6 h-6" strokeWidth={2.5} />,
  },
  editApplicant: {
    title: "Applicant Updated Successfully",
    message: "Your changes have been saved.",
    color: "bg-purple-50",
    text: "text-purple-900",
    accent: "bg-purple-100 text-purple-600",
    icon: <Wand2 className="w-6 h-6" strokeWidth={2.5} />,
  },
  success: {
    title: "Action Completed",
    message: "Everything went smoothly!",
    color: "bg-emerald-50",
    text: "text-emerald-900",
    accent: "bg-emerald-100 text-emerald-600",
    icon: <CheckCircle2 className="w-6 h-6" strokeWidth={2.5} />,
  },
  upload: {
    title: "Upload Successful!",
    message: "Your file has been processed successfully.",
    color: "bg-green-50",
    text: "text-green-900",
    accent: "bg-green-100 text-green-600",
    icon: <Upload className="w-6 h-6" strokeWidth={2.5} />,
  },
  uploadError: {
    title: "Upload Failed!",
    message: "There was an error processing your file.",
    color: "bg-red-50",
    text: "text-red-900",
    accent: "bg-red-100 text-red-600",
    icon: <FileWarning className="w-6 h-6" strokeWidth={2.5} />,
  },
  restore: {
    title: "Applicant Restored",
    message: "The applicant has been successfully moved back to active records.",
    color: "bg-teal-50",
    text: "text-teal-900",
    accent: "bg-teal-100 text-teal-600",
    icon: <RotateCcw className="w-6 h-6" strokeWidth={2.5} />,
  },
  analyticsExport: {
    title: "Analytics Report Generated",
    message: "Your analytics report has been successfully exported.",
    color: "bg-blue-50",
    text: "text-blue-900",
    accent: "bg-blue-100 text-blue-600",
    icon: <BarChart3 className="w-6 h-6" strokeWidth={2.5} />,
  },
  applicantExport: {
    title: "Applicant Data Exported",
    message: "The CSV file has been exported successfully.",
    color: "bg-emerald-50",
    text: "text-emerald-900",
    accent: "bg-emerald-100 text-emerald-600",
    icon: <FileSpreadsheet className="w-6 h-6" strokeWidth={2.5} />,
  },
};

const CustomToast = ({ t, type, customMessage }) => {
  const { title, message, color, text, accent, icon } = toastVariants[type] || {};
  return (
    <div
      className={`${
        t.visible ? "animate-custom-enter" : "animate-custom-leave"
      } max-w-sm w-full z-[1000000] ${color} shadow-lg rounded-xl pointer-events-auto flex items-center ring-1 ring-black ring-opacity-5`}
    >
      {/* Icon Section */}
      <div className="flex-shrink-0 ml-4">
        <div
          className={`w-11 h-11 flex items-center justify-center rounded-full ${accent} shadow-sm`}
        >
          {icon}
        </div>
      </div>

      {/* Text Section */}
      <div className="ml-3 flex-1 py-3">
        <p className={`text-sm font-semibold ${text}`}>{title}</p>
        <p className="text-sm text-gray-600">{customMessage || message}</p>
      </div>

      {/* Close Button */}
      <button
        onClick={() => toast.dismiss(t.id)}
        className="mr-3 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CustomToast;
