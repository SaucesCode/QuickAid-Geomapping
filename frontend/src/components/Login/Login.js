import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginStaff } from "../../services/api";
import "./Login.css";
import qaWithout from '../../assets/qa-withoutText.png';
import qaText from '../../assets/quickaid-text.png';
import aicslogin from '../../assets/AICSlogin.jpg';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Quickaid | Login";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);

  const handleLogin = async e => {
    e.preventDefault();
    try {
      await loginStaff(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="login-page">
      <div className="login-image-section">
        <img src={aicslogin} alt="AICS" className="aics-background" />
      </div>

      <div className="login-form-section">
        <div className="login-card">
          <div className="login-header">
            <h2>Staff Login</h2>
            <p className="login-subtitle">Welcome back! Please enter your credentials.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-group">
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-group">
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-button">
              Log In
            </button>

            <Link to="/" className="back-to-home">
              <span className="back-arrow">←</span> Back to Home
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
