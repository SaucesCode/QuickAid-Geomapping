import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { getStaffFormLink } from "../utils/StaffUtils";
import { Copy, Check } from "lucide-react";

const StaffQR = () => {
  const [staffLink, setStaffLink] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    getStaffFormLink().then(setStaffLink);
  }, []);

  const handleCopy = () => {
    if (staffLink) {
      navigator.clipboard.writeText(staffLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!staffLink) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 border-2 border-red-300 rounded-xl shadow-md max-w-xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold text-red-700">⚠️ Form Error</h2>
        <p className="text-red-600">
          The online form is currently unavailable or the office is closed. Please check back
          later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-8 bg-white border-2 border-[#003a76] rounded-xl shadow-2xl max-w-[30rem] mx-auto space-y-6 transform transition duration-300 hover:shadow-3xl">
      <h2 className="text-2xl font-extrabold text-[#003a76]">Applicant Form Link</h2>

      <p className="text-gray-700 text-center font-medium">
        Scan the QR code below using your mobile camera or click the link to proceed.
      </p>

      <div className="p-3 bg-white border-4 border-[#003a76] rounded-xl shadow-inner">
        <QRCodeCanvas value={staffLink} size={200} />
      </div>

      <div className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 p-3 rounded-lg space-x-2">
        <a
          href={staffLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#003a76] underline hover:text-blue-500 transition-colors duration-200 text-sm font-semibold truncate pr-2"
        >
          {staffLink}
        </a>

        <button
          onClick={handleCopy}
          className={`shrink-0 px-3 py-1 text-sm font-semibold rounded-full flex items-center gap-1 transition-all duration-300 
            ${
              isCopied
                ? "bg-[#003a76] text-white hover:bg-[#003a76]"
                : "bg-blue-100 text-[#003a76] hover:bg-blue-200"
            }`}
        >
          {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-2">This link is temporary and may expire.</p>
    </div>
  );
};

export default StaffQR;
