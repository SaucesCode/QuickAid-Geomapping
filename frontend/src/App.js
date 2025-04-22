import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import ApplicantForm from "./pages/ApplicantForm";
import MapComponent from "./components/MapComponent/MapComponent";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./components/LandingPage/LandingPage";
import Sidebar from "./components/Sidebar/Sidebar";
import PrivateRoute from "./components/PrivateRoute";
import AdminManagement from "./pages/AdminManagement";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

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
        {/* <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="admin-management" element={<AdminManagement />} /> */}
      </Route>
    </Routes>
  );
}

export default App;
