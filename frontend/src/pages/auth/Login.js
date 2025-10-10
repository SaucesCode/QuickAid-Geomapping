import aicsLogo from "../../assets/AICS-OFFICIAL.png";
import dswdLogo from "../../assets/dswd-logo.png";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  ShieldCheck,
  KeyRound,
  Users,
} from "lucide-react";
import { loginStaff } from "../../services/api";
import toast from "react-hot-toast"; // ✅ import toast
import CustomToast from "../../components/CustomToast"; // ✅ import your custom toast

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "QuickAid | Login";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setIsLoading(true);

    try {
      await loginStaff(username, password);

      // ✅ Show custom toast after successful login
      toast.custom((t) => <CustomToast t={t} type="login" />);

      navigate("/dashboard");
    } catch (err) {
      setShowModal(true);

      // Clear fields after failed login
      setUsername("");
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && token !== "undefined" && token !== "null") {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Section with Gradient + Icons */}
      <div className="hidden lg:flex lg:w-1/2 relative text-white flex-col justify-between p-8 overflow-hidden bg-gradient-to-b from-white via-blue-100 to-blue-700">
        {/* Faint Icon Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-12">
            <ShieldCheck className="w-24 h-24 text-blue-900" />
          </div>
          <div className="absolute top-1/3 right-16">
            <KeyRound className="w-28 h-28 text-blue-800" />
          </div>
          <div className="absolute bottom-20 left-24">
            <Users className="w-32 h-32 text-blue-900" />
          </div>
        </div>

        {/* Logos */}
        <div className="relative z-10 flex items-center space-x-8">
          <img src={dswdLogo} alt="DSWD Logo" className="h-20 w-auto drop-shadow-lg" />
          <img src={aicsLogo} alt="AICS Logo" className="h-20 w-auto drop-shadow-lg" />
        </div>

        {/* Welcome Text */}
        <div className="relative z-10 flex flex-col justify-center flex-1 px-6">
          <h1 className="text-5xl text-blue-900 font-extrabold mb-6 leading-tight drop-shadow-md">
            Welcome Back
          </h1>
          <p className="text-lg text-blue-800 leading-relaxed">
            Sign in to continue managing QuickAid’s{" "}
            <span className="font-semibold text-blue-900">AICS system</span>{" "}
            with ease and efficiency.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          {/* Back to Home */}
          <Link
            to="/"
            className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors duration-200 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          {/* Login Card */}
          <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                Staff Login
              </h2>
              <p className="text-gray-500 text-sm">
                Enter your credentials to access your dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6" noValidate>
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500 hover:text-blue-600 transition" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500 hover:text-blue-600 transition" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={!username || !password || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed relative"
              >
                {isLoading && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  </div>
                )}
                <span className={isLoading ? "opacity-0" : "opacity-100"}>
                  Log In
                </span>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Having trouble?{" "}
                <span className="text-blue-600 font-medium">
                  Contact your administrator
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Login Failed
              </h3>
              <p className="text-sm text-gray-600">
                Invalid credentials. Please try again.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
