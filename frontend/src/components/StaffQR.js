// components/StaffQR.js
import { QRCodeCanvas } from "qrcode.react";
import { getStaffFormLink } from "../utils/StaffUtils";

const StaffQR = () => {
  const staffLink = getStaffFormLink();

  if (!staffLink) {
    return <p>Please login to see your QR code.</p>;
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-semibold">Your Applicant Form Link</h2>
      <QRCodeCanvas value={staffLink} size={200} />
      <p className="text-blue-600 underline">
        <a href={staffLink} target="_blank" rel="noopener noreferrer">
          {staffLink}
        </a>
      </p>
    </div>
  );
};

export default StaffQR;
