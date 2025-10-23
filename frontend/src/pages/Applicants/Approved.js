import { useState } from "react";
import { api } from "../../services/api";

export default function Approved() {
  // LOGIC AND STATE (PRESERVED)
  const [file, setFile] = useState(null);

  const handleFile = e => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    // Note: The original implementation used an alert() and a synchronous approach.
    // We keep the original logic flow without introducing state like isUploading.
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/upload-sheet/", formData);
      alert("File uploaded!");
      setFile(null); // Clear file after upload attempt
    } catch (error) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error.response?.data?.detail || "Server error"}`);
    }
  };


  const isButtonDisabled = !file;
  
  

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10">
      
      {/* Centered Main Container - Professional Card Look */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl border border-blue-100 p-6 sm:p-8 lg:p-12">
        
        {/* Header */}
        <header className="mb-8 border-b pb-4 border-blue-100">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800">
            Approved List Upload
          </h1>
          <p className="text-gray-500 mt-2 text-md">
            Synchronize system data by uploading the consolidated list of approved applications.
          </p>
        </header>

        {/* Upload Area Wrapper */}
        <div className="space-y-6">
          
          {/* File Selection Dropzone Area */}
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 sm:p-10 transition-colors duration-300 hover:border-blue-500 hover:bg-blue-50">
            <div className="flex flex-col items-center justify-center space-y-4">
              
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                {/* Visual indicator (no Lucide icon) */}
                <div className="w-6 h-6 bg-blue-500 rounded-sm"></div>
              </div>

              <p className="text-lg font-semibold text-gray-700">
                {file ? "File Selected" : "Select the approved list file"}
              </p>
              
              <p className="text-sm text-gray-500">
                Only `.xlsx` and `.csv` files are accepted.
              </p>

              {/* Custom Styled File Input (acts as the "Browse" button) */}
              <label 
                htmlFor="file-input" 
                className="cursor-pointer px-6 py-3 rounded-full text-sm font-semibold text-blue-700 bg-blue-100 border border-blue-300 hover:bg-blue-200 transition-all duration-300"
              >
                {file ? "Change File" : "Browse Files"}
              </label>
              
              <input 
                id="file-input"
                type="file" 
                accept=".xlsx,.csv" 
                onChange={handleFile} 
                className="hidden" // Hide the default ugly file input
              />
            </div>
          </div>
          
          {/* File Information and Action Button */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            
            {file ? (
              // Display file name when selected
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="font-medium text-blue-800 truncate" title={file.name}>
                  {file.name}
                </span>
                <span className="text-xs text-gray-600 ml-4 flex-shrink-0">
                  Ready
                </span>
              </div>
            ) : (
              // Placeholder when no file is selected
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500 text-sm">
                No file currently selected.
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={isButtonDisabled}
              className={`w-full py-3 rounded-lg font-bold text-lg text-white transition-all duration-300 shadow-md 
                ${isButtonDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:shadow-xl"
                }
              `}
            >
              Start Upload
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
}

