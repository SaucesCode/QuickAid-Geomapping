import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./pages/auth/Login";
import SettingsPage from "./pages/auth/SettingsPage";

import Dashboard from "./pages/Dashboard/Dashboard";
import MapComponent from "./pages/maps/MapComponent";
import AdminManagement from "./pages/Dashboard/AdminManagement";
import Trends from "./pages/analytics/Trends";
import Geographic from "./pages/analytics/Geographic";
import DemographicsEconomics from "./pages/analytics/DemographicsEconomics";
import Performance from "./pages/analytics/Performance";

import ApplicantForm from "./pages/Applicants/ApplicantForm";
import Applicants from "./pages/Applicants/Applicants";
import Approved from "./pages/Applicants/Approved";
import ArchiveApplicants from "./pages/Applicants/ArchiveApplicants";
import ExportApplicants from "./pages/Applicants/ExportApplicants";

import Disbursement from "./pages/Disbursement/Disbursement";

import MultiStepForm from "./pages/forms/MultiStepForm";
import PrintPage from "./pages/print/PrintPage";
import PrintPagebyID from "./pages/print/PrintPagebyID";
import PrintIntakeSheet from "./pages/print/PrintIntakeSheet";
import PrintCertificate from "./pages/print/PrintCertificate";

import Sidebar from "./components/Sidebar";
import PrivateRoute from "./components/PrivateRoute";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage/LandingPage";
import AboutQuickaid from "./pages/AboutQuickaid/AboutQuickaid";
import AboutUs from "./pages/AboutUs/AboutUs";
import Services from "./pages/LandingPage/Services";
import EducationalAssistanceProgram from "./pages/LandingPage/EducAss";
import MedicalAssistanceProgram from "./pages/LandingPage/MedicalAss";
import FuneralAssistanceProgram from "./pages/LandingPage/FunAss";

import ScrollToTop from "./components/ScrollToTop";
import HeatMap from "./pages/maps/HeatMap";
import "./index.css";

import TermsAndConditions from "./components/Sections/TermsAndConditions";
import PrivacyPolicy from "./components/Sections/PrivacyPolicy";

import StaffQR from "./components/StaffQR";
import CertificateOfEligibility from "./pages/print/CertificateOfEligibility";
import GeneralIntakeSheet from "./pages/print/Intakesheet";
import { Toaster } from "react-hot-toast";
import BarangayFetcher from "./utils/fetchAllBrgys";
import BarangayGeocoder from "./utils/brgyGeocode";
import DataDictionaryDocument from "./utils/DataDictionaryDocument";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/fetch" element={<BarangayFetcher />} />
          <Route path="/geocode" element={<BarangayGeocoder />} />
          <Route path="/data" element={<DataDictionaryDocument />} />
          <Route path="/new-applicant" element={<MultiStepForm />} />
          <Route path="/apply" element={<MultiStepForm />} />
          <Route path="/about-quickaid" element={<AboutQuickaid />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/education" element={<EducationalAssistanceProgram />} />
          <Route path="/services/medical" element={<MedicalAssistanceProgram />} />
          <Route path="/services/funeral" element={<FuneralAssistanceProgram />} />
          <Route path="/print" element={<PrintPage />} />
          <Route path="/print/:id" element={<PrintPagebyID />} />
          <Route path="/print/intake" element={<PrintIntakeSheet />} />
          <Route path="/print/certificate" element={<PrintCertificate />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/staff-qr" element={<StaffQR />} />
          <Route path="/eligibility" element={<CertificateOfEligibility />} />
          <Route path="/intakesheet" element={<GeneralIntakeSheet />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Sidebar />
              </PrivateRoute>
            }
          >
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="register-applicant" element={<ApplicantForm />} />
            <Route path="geomapping" element={<MapComponent />} />
            <Route path="heatmap" element={<HeatMap />} />
            <Route path="admin-management" element={<AdminManagement />} />
            <Route path="analytics">
              <Route path="geographic" element={<Geographic />} />
              <Route path="demographics-economics" element={<DemographicsEconomics />} />
              <Route path="trends" element={<Trends />} />
              <Route path="performance" element={<Performance />} />
            </Route>

            <Route path="applicants" element={<Applicants />} />
            <Route path="export-applicants" element={<ExportApplicants />} />
            <Route path="approved" element={<Approved />} />
            <Route path="archived-applicants" element={<ArchiveApplicants />} />

            <Route path="disbursement" element={<Disbursement />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </QueryClientProvider>
  );
}

export default App;
