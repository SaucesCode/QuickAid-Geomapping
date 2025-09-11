import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import SettingsPage from "./pages/auth/SettingsPage";

import Dashboard from "./pages/dashboard/Dashboard";
import Analytics from "./pages/analytics/Analytics";
import MapComponent from "./pages/maps/MapComponent";
import AdminManagement from "./pages/dashboard/AdminManagement";

import ApplicantForm from "./pages/applicants/ApplicantForm";
import Applicants from "./pages/applicants/Applicants";
import Approved from "./pages/applicants/Approved";
import ArchiveApplicants from "./pages/applicants/ArchiveApplicants";
import ExportApplicants from "./pages/applicants/ExportApplicants";

import MultiStepForm from "./pages/forms/MultiStepForm";
import PrintPage from "./pages/print/PrintPage";
import PrintPagebyID from "./pages/print/PrintPagebyID";

import Sidebar from "./components/Sidebar";
import PrivateRoute from "./components/PrivateRoute";
import ProtectedRoute from "./components/ProtectedRoute";

import ChallengesSection from "./components/Sections/ChallengesSection";
import GoalsSection from "./components/Sections/GoalsSection";
import ServicesSection from "./components/Sections/ServicesSection";
import MissionSection from "./components/Sections/MissionSection";
import HeroSection from "./components/Sections/HeroSection";
import BeneficiariesSection from "./components/Sections/BeneficiariesSection";
import Footer from "./components/LandingPage/Footer";
import "./index.css";
import HeatMap from "./pages/maps/HeatMap";

//
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route
          path="/"
          element={
            <>
              {/* <Navbar /> */}
              <main>
                <HeroSection />
                <ChallengesSection />
                <GoalsSection />
                <ServicesSection />
                <BeneficiariesSection />
                <MissionSection />
              </main>
              <Footer />
            </>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/new-applicant" element={<MultiStepForm />} />
        <Route path="/print" element={<PrintPage />} />
        <Route path="/print/:id" element={<PrintPagebyID />} />

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
          <Route path="analytics" element={<Analytics />} />
          <Route path="applicants" element={<Applicants />} />
          <Route path="export-applicants" element={<ExportApplicants />} />
          <Route path="approved" element={<Approved />} />
          <Route path="archived-applicants" element={<ArchiveApplicants />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
