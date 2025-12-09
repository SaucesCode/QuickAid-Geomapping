import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  ShieldCheck,
  KeyRound,
  Users,
} from "lucide-react";
import { loginStaff } from "../../services/api";
import { api } from "../../services/api";
import toast from "react-hot-toast";
import CustomToast from "../../components/CustomToast";
import bg from "../../assets/cis-payout.jpg";
import LP1 from "../../assets/QUICKAID white stroke LOGO.png";
import header from "../../assets/aics_header_new 2.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "QuickAid | Login";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  const handleLogin = async e => {
    e.preventDefault();
    if (!username || !password) return;
    setIsLoading(true);
    try {
      await loginStaff(username, password);
      toast.custom(t => <CustomToast t={t} type="login" />);
      navigate("/dashboard");
    } catch (err) {
      setShowModal(true);
      setUsername("");
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmitAdmin = async e => {
    e.preventDefault();

    if (!validateEmail(contactForm.email)) {
      setEmailError("Please enter a valid email address (e.g., user@example.com).");
      return;
    }
    setEmailError("");

    setSending(true);
    try {
      await api.post("/contact-admin/", contactForm);
      toast.custom(t => <CustomToast t={t} type="contactAdmin" />);
      setContactForm({ name: "", email: "", message: "" });
      setShowContactModal(false);
    } catch {
      toast.error("Failed to send message. Try again later.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && token !== "undefined" && token !== "null") {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex bg-cover bg-center"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundColor: "#1a202c",
      }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      <div className="hidden lg:flex lg:w-1/2 relative text-white flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-12">
            <ShieldCheck className="w-24 h-24 text-sky-300" />
          </div>
          <div className="absolute top-1/3 right-16">
            <KeyRound className="w-28 h-28 text-sky-400" />
          </div>
          <div className="absolute bottom-20 left-24">
            <Users className="w-32 h-32 text-sky-300" />
          </div>
        </div>

        {/* Logos */}
        <div className="relative z-10 flex items-center space-x-8">
          <img src={header} alt="DSWD Logo" className="h-19 w-auto drop-shadow-lg" />
          {/* <img src={aicsLogo} alt="AICS Logo" className="h-16 w-auto drop-shadow-lg" /> */}
        </div>

        {/* Welcome Text */}
        <div className="relative z-10 flex flex-col justify-center flex-1 px-6 text-center lg:text-left -mt-20">
          <div className="relative mx-auto lg:mx-0 w-fit">
            <img src={LP1} alt="QuickAid Logo" className="w-64 drop-shadow-lg mx-auto" />
            <p className="absolute bottom-[-1.8rem] right-[-90%] text-lg text-blue-200 whitespace-nowrap">
              Authorized Staff Login Portal for the AICS Information System
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="relative z-10 inline-flex items-center text-sky-200 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home Page
        </Link>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          {/* 🎨 Login Card - GLASSMORHPISM EFFECT */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 shadow-2xl shadow-white/30 border border-white/20">
            <div className="mb-8 text-left text-white">
              <h2 className="text-3xl font-semibold text-white mb-1">Welcome back</h2>
              <p className="text-sky-200 text-base opacity-80">Please enter your details.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6" noValidate autoComplete="off">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-white/50 text-white rounded-none pl-0 pr-3 py-2 focus:border-white focus:outline-none transition-colors placeholder:text-white/60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-white/50 text-white rounded-none pl-0 pr-10 py-2 focus:border-white focus:outline-none transition-colors placeholder:text-white/60"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-0 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-white/70 hover:text-white transition" />
                    ) : (
                      <Eye className="h-5 w-5 text-white/70 hover:text-white transition" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={!username || !password || isLoading}
                className="w-full bg-[#003a76] text-white hover:bg-blue-300 rounded-lg px-4 py-3 font-medium transition-all duration-200 shadow-xl shadow-blue-500/40 disabled:bg-blue-500/50 disabled:cursor-not-allowed relative"
              >
                {isLoading && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  </div>
                )}
                <span className={isLoading ? "opacity-0" : "opacity-100 text-white"}>
                  Log in
                </span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-white/70">
                Having trouble?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setShowContactModal(true);
                    setEmailError(""); // Reset error when opening modal
                  }}
                  className="text-sky-300 font-medium hover:underline focus:outline-none"
                >
                  Contact your administrator
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🛑 Redesigned Error Modal 🛑 */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm">
          {/* Modal Card - Enhanced Glassmorphism Style */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-3xl shadow-red-500/10 max-w-sm w-full p-8 relative border border-red-500/30 transform transition-all duration-300 scale-100">
            <button
              className="absolute top-4 right-4 p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setShowModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="w-14 h-14 text-red-400 mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold text-white mb-2">Access Denied</h3>
              <p className="text-sm text-sky-200/80">
                Invalid **username** or **password**. Please verify your credentials and try
                again.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition shadow-lg shadow-red-500/30"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-3xl shadow-blue-500/10 max-w-md w-full p-8 relative border border-blue-500/30 transform transition-all duration-300 scale-100">
            <button
              className="absolute top-4 right-4 p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setShowContactModal(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Contact Administrator
            </h3>

            <form onSubmit={handleSubmitAdmin} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={contactForm.name}
                  onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  className="w-full border border-white/30 rounded-lg px-4 py-3 bg-white/10 text-white placeholder:text-white/60 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                />
              </div>

              {/* Email Input with Validation */}
              <div>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={contactForm.email}
                  onChange={e => {
                    setContactForm({ ...contactForm, email: e.target.value });
                    if (emailError && validateEmail(e.target.value)) {
                      setEmailError("");
                    }
                  }}
                  required
                  className={`w-full border rounded-lg px-4 py-3 bg-white/10 text-white placeholder:text-white/60 focus:ring-2 transition 
                    ${
                      emailError
                        ? "border-red-500 focus:ring-red-400 focus:border-red-400"
                        : "border-white/30 focus:ring-blue-400 focus:border-blue-400"
                    }`}
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-400 flex items-center font-medium">
                    <AlertCircle className="w-4 h-4 mr-1" /> {emailError}
                  </p>
                )}
              </div>

              <div>
                <textarea
                  placeholder="Describe your issue or request for help..."
                  value={contactForm.message}
                  onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                  className="w-full border border-white/30 rounded-lg px-4 py-3 h-28 bg-white/10 text-white placeholder:text-white/60 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                />
              </div>

              <button
                type="submit"
                disabled={
                  sending ||
                  !contactForm.name ||
                  !contactForm.email ||
                  !contactForm.message ||
                  emailError
                }
                className="w-full bg-blue-500 text-white hover:bg-blue-600 rounded-lg px-4 py-3 font-bold transition disabled:bg-blue-900/50 relative shadow-lg shadow-blue-500/30"
              >
                {sending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
