import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import ApplicantForm from "./pages/ApplicantForm";
import MapComponent from "./components/MapComponent";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register-applicant" element={<ApplicantForm />} />
      <Route path="/geomapping" element={<MapComponent />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
