import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Lock, Eye, EyeOff } from "lucide-react";
import { loginStaff } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "QuickAid | Login";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  const handleLogin = async e => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await loginStaff(username, password);
      toast.success("Login successful 🎉");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      toast.error("Invalid credentials ❌");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex bg-quickaid-bg">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Left Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="w-full bg-cover bg-center relative"
          style={{ backgroundImage: "url('/api/placeholder/800/1200')" }}
        >
          <div className="absolute inset-0 bg-quickaid-primary bg-opacity-80"></div>
          <div className="relative z-10 flex flex-col justify-center h-full px-12">
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-6">Welcome Back</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Log in to access your staff dashboard and management tools
              </p>
              <div className="mt-8 flex items-center space-x-2">
                <div className="w-12 h-1 bg-quickaid-accent rounded-full"></div>
                <div className="w-6 h-1 bg-white bg-opacity-50 rounded-full"></div>
                <div className="w-6 h-1 bg-white bg-opacity-50 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md mx-auto">
          {/* Back to Home Link */}
          <Link
            to="/"
            className="inline-flex items-center text-quickaid-text-secondary hover:text-quickaid-accent transition-colors duration-200 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          {/* Login Card */}
          <div className="card bg-quickaid-surface shadow-md rounded-xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-quickaid-text-primary mb-2">
                Staff Login
              </h2>
              <p className="text-quickaid-text-secondary">
                Enter your credentials to access the dashboard
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-error mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="text-red-800 text-sm">{error}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username Field */}
              <div className="form-control">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-quickaid-text-primary mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-quickaid-text-secondary" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-quickaid-accent focus:border-quickaid-accent"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-control">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-quickaid-text-primary mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-quickaid-text-secondary" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="input input-bordered w-full pl-10 pr-10 focus:ring-2 focus:ring-quickaid-accent focus:border-quickaid-accent"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-quickaid-text-secondary hover:text-quickaid-accent transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-quickaid-text-secondary hover:text-quickaid-accent transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn w-full bg-quickaid-accent hover:bg-teal-600 disabled:bg-teal-300 border-quickaid-accent hover:border-teal-600 disabled:border-teal-300 text-white rounded-lg px-4 py-3 font-medium transition-all duration-200 disabled:cursor-not-allowed relative"
              >
                {isLoading && (
                  <div className="absolute left-1/2 transform -translate-x-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                )}
                <span className={isLoading ? "opacity-0" : "opacity-100"}>Log In</span>
              </button>
            </form>

            {/* Additional Links */}
            <div className="mt-6 text-center">
              <p className="text-sm text-quickaid-text-secondary">
                Having trouble? Contact your administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
