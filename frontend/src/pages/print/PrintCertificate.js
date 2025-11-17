// PrintCertificate.js — Fixed alignment using modern-screenshot
import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileDown, Printer, ArrowLeft } from "lucide-react";
import { domToPng } from "modern-screenshot";
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

    try {
      // Wait for fonts to load
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // Wait for images to fully load
      const images = element.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
            setTimeout(resolve, 3000);
          });
        })
      );

      // Additional delay for complete render
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('Starting capture with modern-screenshot...');

      // Capture with modern-screenshot - perfect pixel-for-pixel capture
      const dataUrl = await domToPng(element, {
        quality: 1,
        scale: 3, // 3x for HD quality
        backgroundColor: '#ffffff',
        style: {
          // Ensure everything is captured exactly as displayed
          margin: '0',
          padding: element.style.padding,
        },
        filter: (node) => {
          // Exclude no-print elements
          if (node.classList?.contains?.("no-print")) return false;
          if (node.classList?.contains?.("button-wrapper")) return false;
          return true;
        },
      });

      console.log('Capture complete, creating PDF...');

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

      console.log('Image loaded:', { width: img.width, height: img.height });

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

      const filename = `Certificate_${(applicant.full_name || "Document")
        .replace(/\s+/g, "_")
        .trim()}.pdf`;

      pdf.save(filename);
      
      console.log('PDF generated successfully');
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(`Failed to generate PDF: ${err.message || 'Unknown error'}`);
    } finally {
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
<<<<<<< HEAD
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
          }
          
          .certificate-container img {
            display: block;
            max-width: 100%;
            height: auto;
          }
 zz         
          .certificate-container * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
=======
>>>>>>> 3206257e48a6cad548c5a415042f3914719729b9
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
                overflow: "visible",
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