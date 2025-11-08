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
    if (!element) return;

    // Hide unwanted elements (like buttons)
    const hiddenEls = element.querySelectorAll(".no-download");
    hiddenEls.forEach((el) => (el.style.display = "none"));

    await new Promise((r) => setTimeout(r, 200));

    // Lower scale slightly to reduce size, and use JPEG compression
    const canvas = await html2canvas(element, {
      scale: 2, // ⬅️ 2 gives balance of quality & file size
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.documentElement.scrollWidth,
    });

    hiddenEls.forEach((el) => (el.style.display = ""));

    // Convert to JPEG with 0.85 compression quality
    const imgData = canvas.toDataURL("image/jpeg", 0.85);

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(
      `Certificate_${(applicant.full_name || "Applicant")
        .replace(/\s+/g, "_")
        .trim()}.pdf`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <style>
        {`
          @media print {
            .no-print, .no-download {
              display: none !important;
              visibility: hidden !important;
            }
            body { background: white; }
          }
        `}
      </style>

      <div
        ref={printRef}
        className="bg-white shadow-xl rounded-xl border border-blue-100 p-6"
      >
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
