import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginStaff } from "../../services/api";
import "./Login.css";

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
      <div
        className="login-image-section"
        style={{ backgroundImage: "url('/api/placeholder/800/1200')" }}
      >
        <div className="login-image-overlay"></div>
        <div className="login-image-content">
          <h1>Welcome Back</h1>
          <p>Log in to access your staff dashboard and management tools</p>
        </div>
      </div>

      <div className="login-form-section">
        <Link to="/" className="back-to-home">
          <span className="back-arrow">←</span> Back to Home
        </Link>

        <div className="login-card">
          <h2>Staff Login</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-button">
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
