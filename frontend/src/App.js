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
import Navbar from "./components/LandingPage/Navbar";
import ChallengesSection from "./components/Sections/ChallengesSection";
import GoalsSection from "./components/Sections/GoalsSection";
import ServicesSection from "./components/Sections/ServicesSection";
import MissionSection from "./components/Sections/MissionSection";
import HeroSection from "./components/Sections/HeroSection";
import BeneficiariesSection from "./components/Sections/BeneficiariesSection";
import "./index.css";
import Footer from "./components/LandingPage/Footer";
import MultiStepForm from "./forms/MultiStepForm";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
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
        </Route>
      </Routes>
    </div>
  );
}

export default App;
