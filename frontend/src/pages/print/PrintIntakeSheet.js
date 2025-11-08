import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileDown, Printer, ArrowLeft } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import GeneralIntakeSheet from "./Intakesheet"; // Assumes Intakesheet.jsx exports GeneralIntakeSheet

export default function PrintIntake() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const applicant = state?.applicant;
    const printRef = useRef(null);

    // Guard clause for missing data with improved error styling
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

        // 1. Hide control buttons and any print-unfriendly elements
        const hiddenEls = element.querySelectorAll(".no-download");
        hiddenEls.forEach((el) => (el.style.display = "none"));

        // 2. Temporarily set component's width to ensure full capture (important for responsiveness)
        const initialWidth = element.style.width;
        element.style.width = "794px"; // Approximately A4 width at 96dpi
        
        // 3. Give DOM time to update
        await new Promise((r) => setTimeout(r, 100));

        // Use a higher scale for better resolution in the final PDF
        const scaleFactor = 2.5; 
        const canvas = await html2canvas(element, {
            scale: scaleFactor, 
            useCORS: true,
            backgroundColor: "#ffffff",
            scrollX: 0,
            scrollY: 0,
            logging: false,
            windowWidth: element.offsetWidth,
            windowHeight: element.offsetHeight,
        });

        // 4. Restore hidden elements and original width
        hiddenEls.forEach((el) => (el.style.display = "")); 
        element.style.width = initialWidth; 

        // Compress image to JPEG (quality 0.9) for smaller file size
        const imgData = canvas.toDataURL("image/jpeg", 0.9);

        // Calculate dimensions: (Canvas Pixels / Scale Factor) * 0.264583 = Millimeters
        const pdfWidth = (canvas.width / scaleFactor) * 0.264583;
        const pdfHeight = (canvas.height / scaleFactor) * 0.264583;

        // Create PDF with custom dimensions for exact fit
        const pdf = new jsPDF("p", "mm", [pdfWidth, pdfHeight]);

        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        
        // Clean filename generation
        const fileName = `IntakeSheet_${(applicant.full_name || "applicant").replace(/\s+/g, "_").trim()}`;
        pdf.save(`${fileName}.pdf`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-4 px-2 print:p-0">
            {/* Refined print-specific CSS */}
            <style>
                {`
                    @media print {
                        .no-print, .no-download {
                            display: none !important;
                            visibility: hidden !important;
                        }
                        body { 
                            background: white; 
                            margin: 0;
                            padding: 0;
                        }
                        @page {
                            size: A4;
                            margin: 10mm;
                        }
                    }
                `}
            </style>

            {/* The intake sheet component is rendered here inside the ref'd container */}
            <div
                ref={printRef}
                // Reduced padding to p-2 and added max-width for A4-like appearance
                className="bg-white shadow-xl rounded-xl border border-blue-100 p-2 mx-auto max-w-[200mm]"
            >
                <GeneralIntakeSheet applicant={applicant} />
            </div>

            {/* Print/Download Controls (no-print) - MOVED TO THE BOTTOM */}
            <div className="no-print flex justify-center gap-4 mt-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2.5 bg-gray-700 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-gray-800 transition"
                >
                    <ArrowLeft size={18} /> Back
                </button>
                <button
                    onClick={() => window.print()}
                    className="px-6 py-2.5 bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-blue-800 transition"
                >
                    <Printer size={18} /> Print
                </button>
                <button
                    onClick={handleDownloadPDF}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-green-700 transition"
                >
                    <FileDown size={18} /> Download PDF
                </button>
            </div>
        </div>
    );
}