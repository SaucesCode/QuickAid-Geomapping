// PrintCertificate.js — Full Screen Display, Scaled Print to Single A4
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
    if (!element) return alert("Certificate not found");

    const buttons = document.querySelectorAll(".no-print");
    buttons.forEach((btn) => (btn.style.display = "none"));

    // Store original styles
    const originalWidth = element.style.width;
    const originalHeight = element.style.height;
    const originalTransform = element.querySelector(".certificate-inner")?.style.transform;

    try {
      // Wait for fonts to load
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // Set exact A4 dimensions for capture
      element.style.width = "794px"; // 210mm at 96dpi
      element.style.height = "1123px"; // 297mm at 96dpi

      const inner = element.querySelector(".certificate-inner");
      if (inner) inner.style.transform = "scale(1)";

      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        foreignObjectRendering: false,
        imageTimeout: 0,
        scrollX: 0,
        scrollY: 0,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = 210;
      const pdfHeight = 297;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const filename = `Certificate_${(applicant.full_name || "Document")
        .replace(/\s+/g, "_")
        .trim()}.pdf`;

      pdf.save(filename);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF");
    } finally {
      // Restore original styles
      element.style.width = originalWidth;
      element.style.height = originalHeight;
      const inner = element.querySelector(".certificate-inner");
      if (inner && originalTransform) inner.style.transform = originalTransform;
      buttons.forEach((btn) => (btn.style.display = ""));
    }
  };

  return (
    <>
      <style>
        {`
          @page {
            size: A4 portrait;
            margin: 0;
          }

          @media print {
            html, body {
              width: 210mm;
              height: 297mm;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
            }

            body * {
              visibility: hidden;
            }

            .print-area, .print-area * {
              visibility: visible;
            }

            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 210mm;
              height: 297mm;
              margin: 0;
              padding: 0;
              overflow: hidden;
            }

            .certificate-container {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              box-sizing: border-box !important;
              overflow: visible !important;
              page-break-after: avoid !important;
              page-break-inside: avoid !important;
            }

            .certificate-inner {
              width: 100% !important;
              height: 100% !important;
              transform: scale(0.88) !important;
              transform-origin: top center !important;
              overflow: visible !important;
              display: flex !important;
              flex-direction: column !important;
            }

            .no-print {
              display: none !important;
            }
          }

          @media screen {
            .page-container {
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }

            .content-wrapper {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2rem 1.5rem;
            }

            .button-wrapper {
              padding: 2rem 1.5rem;
              background: white;
              border-top: 1px solid #e5e7eb;
            }
          }

          .certificate-container {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        `}
      </style>

      <div className="page-container bg-gray-50">
        <div className="content-wrapper">
          <div className="print-area">
            <div
              ref={printRef}
              className="bg-white shadow-lg border border-blue-100 rounded-xl certificate-container"
              style={{
                width: "210mm",
                minHeight: "297mm",
                backgroundColor: "#ffffff",
                color: "#000000",
                boxSizing: "border-box",
                padding: "8mm",
              }}
            >
              <div className="certificate-inner">
                <CertificateOfEligibility applicant={applicant} />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons at bottom */}
        <div className="button-wrapper no-print">
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
    </>
  );
}
