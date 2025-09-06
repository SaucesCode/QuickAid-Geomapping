import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import ApplicantForm from "./pages/ApplicantForm/ApplicantForm";
import MapComponent from "./components/MapComponent/MapComponent";
import Dashboard from "./pages/Dashboard/Dashboard";
import Sidebar from "./components/Sidebar/Sidebar";
import PrivateRoute from "./components/PrivateRoute";
import AdminManagement from "./pages/AdminManagement/AdminManagement";
import Analytics from "./pages/Analytics/Analytics";
import Applicants from "./pages/Applicants/Applicants";
import LandingPage from "./components/LandingPage/LandingPage";
import MultiStepForm from "./forms/MultiStepForm";
import PrintPage from "./forms/PrintPage";
import PrintPagebyID from "./forms/PrintPagebyID";
import ArchiveApplicants from "./pages/Archive/ArchiveApplicants";
import SettingsPage from "./pages/SettingsPage/SettingsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";
import AboutQuickaid from "./pages/AboutQuickaid/AboutQuickaid";
import AboutUs from "./pages/AboutUs/AboutUs";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop";
import Services from "./pages/Services";
import EducationalAssistanceProgram from "./pages/EducAss";
import MedicalAssistanceProgram from "./pages/MedicalAss";
import FuneralAssistanceProgram from "./pages/FunAss";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/new-applicant" element={<MultiStepForm />} />
        <Route path="/about-quickaid" element={<AboutQuickaid />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/education" element={<EducationalAssistanceProgram />} />
        <Route path="/services/medical" element={<MedicalAssistanceProgram />} />
        <Route path="/services/funeral" element={<FuneralAssistanceProgram />} />
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
          <Route path="admin-management" element={<AdminManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="applicants" element={<Applicants />} />
          <Route path="archived-applicants" element={<ArchiveApplicants />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
