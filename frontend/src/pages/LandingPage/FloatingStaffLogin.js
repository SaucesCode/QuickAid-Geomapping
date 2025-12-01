import React from "react";
import { ArrowDown } from "lucide-react";

const ScrollToFooter = () => {
  const scrollToFooter = () => {
    document.getElementById("footer")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <button
      onClick={scrollToFooter}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-110 transform transition-all duration-300 flex items-center justify-center group"
      title="Scroll to Footer"
      aria-label="Scroll to Footer"
    >
      <ArrowDown className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-1" />
    </button>
  );
};

export default ScrollToFooter;
