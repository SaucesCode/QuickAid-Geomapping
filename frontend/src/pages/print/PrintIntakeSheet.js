// PrintIntake.js — One-page A4 print and exact PDF capture (Tailwind-compatible)
import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileDown, Printer, ArrowLeft } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import GeneralIntakeSheet from "./Intakesheet"; // Ensure correct path

export default function PrintIntake() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const applicant = state?.applicant;
  const printRef = useRef(null);

  // Guard clause for missing data
  if (!applicant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-red-600 font-semibold p-8 bg-white rounded-lg shadow-lg">
          Applicant data missing. Cannot render intake sheet.
        </p>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    // Hide download buttons temporarily
    const hiddenEls = element.querySelectorAll(".no-download");
    hiddenEls.forEach((el) => (el.style.display = "none"));

    // Fix width for proper capture
    const initialWidth = element.style.width;
    element.style.width = "210mm";
    element.style.height = "297mm";

    await new Promise((r) => setTimeout(r, 100)); // Wait for re-render

    const scaleFactor = 3; // High resolution
    const canvas = await html2canvas(element, {
      scale: scaleFactor,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    hiddenEls.forEach((el) => (el.style.display = ""));
    element.style.width = initialWidth;

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    // Define PDF size as exact A4
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);

    const fileName = `IntakeSheet_${(applicant.full_name || "Applicant")
      .replace(/\s+/g, "_")
      .trim()}.pdf`;

    pdf.save(`${fileName}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 print:p-0 flex flex-col items-center justify-center">
      <style>
        {`
          @media print {
            .no-print, .no-download {
              display: none !important;
              visibility: hidden !important;
            }
            body, html {
              margin: 0 !important;
              padding: 0 !important;
              width: 210mm;
              height: 297mm;
              background: white !important;
              overflow: hidden !important;
            }
            @page {
              size: A4;
              margin: 0 !important;
            }
            #print-content {
              width: 210mm;
              height: 297mm;
              margin: 0 auto;
              transform: scale(1);
              transform-origin: top center;
              page-break-after: avoid;
              overflow: hidden;
            }
          }
        `}
      </style>

      {/* Printable Content */}
      <div
        id="print-content"
        ref={printRef}
        className="bg-white border border-blue-100 mx-auto shadow-xl rounded-none"
        style={{
          width: "210mm",
          height: "297mm",
          boxSizing: "border-box",
          padding: "10mm",
          overflow: "hidden",
        }}
      >
        <GeneralIntakeSheet applicant={applicant} />
      </div>

      {/* Buttons */}
      <div className="button-wrapper no-print mt-8"> {/* ✅ Added gap here */}
        <div className="flex justify-center gap-4 max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-blue-700 text-white rounded-lg flex items-center gap-2 hover:bg-blue-800 transition-colors"
          >
            <Printer size={18} /> Print
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-6 py-3 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            <FileDown size={18} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
