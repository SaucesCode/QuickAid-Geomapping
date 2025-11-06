import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileDown, Printer, ArrowLeft } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import CertificateOfEligibility from "./CertificateOfEligibility";

export default function PrintCertificate() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const applicant = state?.applicant;
  const printRef = useRef();

  if (!applicant) return <p>Applicant data missing.</p>;

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`Certificate_${applicant.full_name}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <style>
        {`@media print { .no-print { display: none !important; } body { background: white; } }`}
      </style>

      <div ref={printRef} className="bg-white shadow-xl rounded-xl border border-blue-100 p-6">
        <CertificateOfEligibility applicant={applicant} />
      </div>

      <div className="no-print flex justify-center gap-4 mt-8">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-blue-700 text-white rounded-lg flex items-center gap-2"
        >
          <Printer size={18} /> Print
        </button>
        <button
          onClick={handleDownloadPDF}
          className="px-6 py-3 bg-green-600 text-white rounded-lg flex items-center gap-2"
        >
          <FileDown size={18} /> Download PDF
        </button>
      </div>
    </div>
  );
}
