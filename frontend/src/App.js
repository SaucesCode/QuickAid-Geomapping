import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import ApplicantForm from "./pages/ApplicantForm";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register-applicant" element={<ApplicantForm />} />
    </Routes>
  );
}

export default App;
