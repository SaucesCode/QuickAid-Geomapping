import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileDown, Printer, ArrowLeft } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import GeneralIntakeSheet from "./Intakesheet";

export default function PrintIntake() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const applicant = state?.applicant;
  const printRef = useRef();

  if (!applicant) return <p>Applicant data missing.</p>;

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    // hide elements that shouldn’t appear
    const hiddenEls = element.querySelectorAll(".no-download");
    hiddenEls.forEach((el) => (el.style.display = "none"));
    await new Promise((r) => setTimeout(r, 200));

    const canvas = await html2canvas(element, {
      scale: 1.8, // reduced from 3 to lower memory footprint
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    hiddenEls.forEach((el) => (el.style.display = "")); // restore hidden elements

    // compress image to JPEG instead of PNG
    const imgData = canvas.toDataURL("image/jpeg", 0.85);

    // convert exact pixel dimensions to mm
    const pdfWidth = canvas.width * 0.264583;
    const pdfHeight = canvas.height * 0.264583;
    const pdf = new jsPDF("p", "mm", [pdfWidth, pdfHeight]);

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(
      `IntakeSheet_${(applicant.full_name || "applicant")
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
        <GeneralIntakeSheet applicant={applicant} />
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
