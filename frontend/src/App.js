import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import ApplicantForm from "./pages/ApplicantForm";
import MapComponent from "./components/MapComponent/MapComponent";
import Dashboard from "./pages/Dashboard/Dashboard";
import Sidebar from "./components/Sidebar/Sidebar";
import PrivateRoute from "./components/PrivateRoute";
import AdminManagement from "./pages/AdminManagement/AdminManagement";
quickaid_update
import Analytics from "./pages/Analytics";
import Applicants from "./pages/Applicants";
import Navbar from "./components/LandingPage/Navbar";
import ChallengesSection from "./components/Sections/ChallengesSection";
import GoalsSection from "./components/Sections/GoalsSection";
import ServicesSection from "./components/Sections/ServicesSection";
import MissionSection from "./components/Sections/MissionSection";
import HeroSection from "./components/Sections/HeroSection";
import BeneficiariesSection from "./components/Sections/BeneficiariesSection";
import './index.css';
import Footer from "./components/LandingPage/Footer";

my-website

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Now Routes are separate */}
      <Routes>
        <Route path="/login" element={<Login />} />

{/* quickaid_update */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Sidebar />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="register-applicant" element={<ApplicantForm />} />
        <Route path="geomapping" element={<MapComponent />} />
        <Route path="admin-management" element={<AdminManagement />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="applicants" element={<Applicants />} />
      </Route>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Sidebar />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="register-applicant" element={<ApplicantForm />} />
          <Route path="geomapping" element={<MapComponent />} />
          <Route path="admin-management" element={<AdminManagement />} />
          <Route path="Step1" element={<ApplicantForm />} />
        </Route>
      </Routes>
    </div>
//  my-website
  );
}

export default App;
