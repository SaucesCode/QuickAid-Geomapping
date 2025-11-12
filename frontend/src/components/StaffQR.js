import { QRCodeCanvas } from "qrcode.react";
import { getStaffFormLink } from "../utils/StaffUtils";

const StaffQR = () => {
  const staffLink = getStaffFormLink();

  if (!staffLink) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded-xl shadow-md max-w-md mx-auto text-center space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Online Form Unavailable</h2>
        <p className="text-gray-600">
          Sorry, there is a problem with the online form, or there is no office available
          today. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-white  max-w-md mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Your Applicant Form</h2>
      <p className="text-gray-600 text-center">
        Scan the QR code below or click the link to access the form.
      </p>
      <QRCodeCanvas value={staffLink} size={200} className="border p-2 rounded-lg shadow-md" />
      <a
        href={staffLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline break-all text-center"
      >
        {staffLink}
      </a>
    </div>
  );
};

export default StaffQR;
