import React from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

const FloatingStaffLogin = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/login")}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transform transition-all duration-300 flex items-center justify-center group"
      title="Staff Login"
      aria-label="Staff Login"
    >
      <LogIn className="w-5 h-5 relative z-10" />

      {/* Pulse Animation */}
      <div className="absolute inset-0 rounded-full bg-blue-500 opacity-75 animate-ping"></div>
    </button>
  );
};

export default FloatingStaffLogin;
