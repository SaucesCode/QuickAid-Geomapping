// src/components/CustomToast.js
import React from "react";
import { LogIn, LogOut, Archive, Send, Pencil, X } from "lucide-react";
import toast from "react-hot-toast";

const toastVariants = {
  login: {
    title: "Welcome back!",
    message: "You have successfully logged in.",
    color: "bg-green-50",
    text: "text-green-900",
    accent: "bg-green-100 text-green-600",
    icon: <LogIn className="w-5 h-5" />,
  },
  logout: {
    title: "Goodbye!",
    message: "You have been logged out safely.",
    color: "bg-slate-50",
    text: "text-slate-900",
    accent: "bg-slate-100 text-slate-600",
    icon: <LogOut className="w-5 h-5" />,
  },
  archive: {
    title: "Applicant Archived",
    message: "This applicant has been moved to archive.",
    color: "bg-amber-50",
    text: "text-amber-900",
    accent: "bg-amber-100 text-amber-600",
    icon: <Archive className="w-5 h-5" />,
  },
  submit: {
    title: "Form Submitted",
    message: "Your application has been submitted.",
    color: "bg-blue-50",
    text: "text-blue-900",
    accent: "bg-blue-100 text-blue-600",
    icon: <Send className="w-5 h-5" />,
  },
  edit: {
    title: "Profile Updated",
    message: "Your changes have been saved.",
    color: "bg-purple-50",
    text: "text-purple-900",
    accent: "bg-purple-100 text-purple-600",
    icon: <Pencil className="w-5 h-5" />,
  },
};

const CustomToast = ({ t, type }) => {
  const { title, message, color, text, accent, icon } = toastVariants[type] || {};
  return (
    <div
      className={`${
        t.visible ? "animate-custom-enter" : "animate-custom-leave"
      } max-w-sm w-full ${color} shadow-lg rounded-xl pointer-events-auto flex items-center ring-1 ring-black ring-opacity-5`}
    >
      {/* Icon Section */}
      <div className="flex-shrink-0 ml-4">
        <div className={`w-10 h-10 flex items-center justify-center rounded-full ${accent}`}>
          {icon}
        </div>
      </div>

      {/* Text Section */}
      <div className="ml-3 flex-1 py-3">
        <p className={`text-sm font-semibold ${text}`}>{title}</p>
        <p className="text-sm text-gray-600">{message}</p>
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
