// PrintIntake.js — Using modern-screenshot for perfect alignment
import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileDown, Printer, ArrowLeft } from "lucide-react";
import { domToPng } from "modern-screenshot";
import { jsPDF } from "jspdf";
import GeneralIntakeSheet from "./Intakesheet";

export default function PrintIntake() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const applicant = state?.applicant;
  const printRef = useRef(null);

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
    if (!element) return alert("Element not found");

    const buttons = document.querySelectorAll(".no-print");
    buttons.forEach(btn => (btn.style.display = "none"));

    try {
      // Wait for fonts to load
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // Wait for images to fully load
      const images = element.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
            setTimeout(resolve, 3000);
          });
        })
      );

      // Additional delay for complete render
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log("Starting capture with modern-screenshot...");

      // Capture with modern-screenshot - perfect pixel-for-pixel capture
      const dataUrl = await domToPng(element, {
        quality: 1,
        scale: 3, // 3x for HD quality
        backgroundColor: "#ffffff",
        style: {
          margin: "0",
          padding: element.style.padding,
        },
        filter: node => {
          // Exclude no-print elements
          if (node.classList?.contains?.("no-print")) return false;
          if (node.classList?.contains?.("button-wrapper")) return false;
          return true;
        },
      });

      console.log("Capture complete, creating PDF...");

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const img = new Image();
      img.src = dataUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        setTimeout(reject, 10000);
      });

      console.log("Image loaded:", { width: img.width, height: img.height });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate dimensions to fit page
      const imgAspect = img.width / img.height;
      const pageAspect = pdfWidth / pdfHeight;

      let finalWidth, finalHeight;

      if (imgAspect > pageAspect) {
        // Image is wider - fit to width
        finalWidth = pdfWidth;
        finalHeight = pdfWidth / imgAspect;
      } else {
        // Image is taller - fit to height
        finalHeight = pdfHeight;
        finalWidth = finalHeight * imgAspect;
      }

      // Center on page
      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = (pdfHeight - finalHeight) / 2;

      // Add image to PDF
      pdf.addImage(img, "PNG", xOffset, yOffset, finalWidth, finalHeight);

      const fileName = `IntakeSheet_${(applicant.full_name || "Applicant")
        .replace(/\s+/g, "_")
        .trim()}.pdf`;

      pdf.save(fileName);

      console.log("PDF generated successfully");
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(`Failed to generate PDF: ${err.message || "Unknown error"}`);
    } finally {
      buttons.forEach(btn => (btn.style.display = ""));
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

            .intake-container {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 10mm !important;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              page-break-after: avoid !important;
              page-break-inside: avoid !important;
              transform: scale(1) !important;
              transform-origin: top center !important;
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
              align-items: center;
              justify-content: center;
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

          .intake-container {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
          }
          
          .intake-container img {
            display: block;
            max-width: 100%;
            height: auto;
          }
          
          .intake-container * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        `}
      </style>

      <div className="page-container bg-gray-50">
        <div className="content-wrapper">
          <div className="print-area">
            <div
              ref={printRef}
              className="bg-white shadow-lg border border-blue-100 rounded-xl intake-container"
              style={{
                width: "210mm",
                height: "297mm",
                backgroundColor: "#ffffff",
                color: "#000000",
                boxSizing: "border-box",
                padding: "10mm",
                overflow: "visible",
              }}
            >
              <GeneralIntakeSheet applicant={applicant} />
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
