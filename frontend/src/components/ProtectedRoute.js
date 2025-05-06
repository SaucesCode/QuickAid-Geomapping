import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { logoutUser } from "../services/api";

const checkTokenValidity = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  try {
    const { exp } = jwtDecode(token);
    return Date.now() < exp * 1000;
  } catch (e) {
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!checkTokenValidity()) {
      logoutUser();
      navigate("/login");
    }
  }, []);

  return children;
};

export default ProtectedRoute;
