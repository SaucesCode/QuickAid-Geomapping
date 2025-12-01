import { motion } from "framer-motion";
import LandingPage from "../../assets/AICS 2.png";
import { useState, useEffect } from "react";

import Navbar from "../../components/Navigation/Navbar";
import Footer from "../../components/Footer/Footer";
import AICSheader from "../../assets/img9 (1).jpg";
import {
  Stethoscope,
  Shield,
  TrendingUp,
  MapPin,
  Award,
  Phone,
  Mail,
  Cross,
  Info,
  Eye,
  Heart,
  Target,
  GraduationCap,
  CheckCircle,
  Users,
  Clock,
} from "lucide-react";
import FloatingStaffLogin from "../LandingPage/FloatingStaffLogin";

const AboutUs = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans bg-gray-50">
      <Navbar />

      <section
        className="relative overflow-hidden pt-32 pb-12 px-6 lg:px-10 min-h-[55vh] bg-cover bg-[center_bottom] bg-no-repeat mt-[64px]"
        style={{ backgroundImage: `url('${LandingPage}')` }}
      >
        {/* Dark overlay for text readability: Increased opacity for more contrast */}
        <div className="absolute inset-0 -z-10 bg-black/70"></div>

        {/* Subtle blue gradient overlay for a professional color cast */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-900/40 to-transparent"></div>

        <div className="relative z-10 flex flex-col-reverse lg:flex-row items-center justify-between h-full gap-16 lg:gap-20 max-w-7xl mx-auto">
          {/* Left Text Section */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-center lg:text-left space-y-8 pt-12 lg:pt-0" // Added top padding for better vertical alignment
          >
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                // Keeping this motion.div empty but present to preserve logic
              ></motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold text-blue-200 leading-tight tracking-tight">
                Delivering{" "}
                <span className="relative">
                  {/* Monochromatic Blue Gradient Text */}
                  <span className="text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-300 to-red-500">
                    Compassionate Assistance
                  </span>
                  {/* Gradient underline follows existing motion logic */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 origin-left"
                  ></motion.div>
                </span>
                <br />
                {/* Secondary line changed from harsh red to a clean, high-contrast white */}
                <span className="block text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold text-blue-200 leading-tight tracking-tight mt-2 ">
                  Times of Crisis
                </span>
              </h1>
            </div>

            {/* Detailed Subtext - Added professional detail */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-lg text-blue-200 max-w-xl mx-auto lg:mx-0"
            ></motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
            ></motion.div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-24 px-4 lg:px-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40"></div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 rounded-full border border-blue-100 mb-6">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700 tracking-wide uppercase">
                Our Program
              </span>
            </div>

            <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              About <span className="text-5xl lg:text-6xl text-blue-700">AICS Program</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Empowering individuals and families in times of crisis through immediate and
              compassionate assistance
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Text Content */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <p className="text-lg text-slate-700 leading-relaxed mb-4">
                  The{" "}
                  <span className="font-bold text-blue-700">
                    Assistance to Individuals in Crisis Situation (AICS)
                  </span>{" "}
                  is a vital program dedicated to supporting those facing sudden hardships. It
                  aims to provide timely intervention that helps individuals recover from
                  physical, emotional, and social challenges.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Managed by government and partner organizations, AICS offers immediate
                  assistance covering essential needs such as{" "}
                  <span className="font-semibold text-blue-700">
                    medical aid, educational support, food,
                  </span>{" "}
                  and <span className="font-semibold text-blue-700">burial assistance</span> —
                  ensuring that no one faces crisis situations alone.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Users, label: "Communities", value: "100+" },
                  { icon: Heart, label: "Support Types", value: "5+" },
                  { icon: TrendingUp, label: "Success Rate", value: "95%" },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-2">
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-blue-700 mb-1">{stat.value}</div>
                    <div className="text-xs text-slate-600 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Embed */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-2xl">
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                  <iframe
                    src="https://www.youtube.com/embed/roQntS-coN8"
                    title="AICS Program Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>

                {/* Video caption */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-600">
                    Learn more about how AICS is making a difference
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: "Immediate Response", desc: "24/7 crisis intervention" },
              { title: "Comprehensive Care", desc: "Multiple support programs" },
              { title: "Expert Team", desc: "Trained professionals" },
              { title: "Community Focus", desc: "Localized assistance" },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white text-gray-900">
        {/* Header and Content */}
        <div className="bg-[#0A2E5C] text-white py-12 px-8 md:px-16 flex flex-col md:flex-row items-center">
          {/* Left Text */}
          <div className="md:w-1/3">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-white">
              Our Mission
              <br />
              and Vision Statement
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-200">
              This section presents the mission and vision statement of AICS, defining its
              purpose, goals, and commitment to assist individuals in crisis situations through
              efficient and compassionate service.
            </p>
          </div>

          {/* Vision & Mission Cards */}
          <div className="md:w-2/3 grid md:grid-cols-2 gap-8 mt-10 md:mt-0 md:pl-16">
            {/* Vision */}
            <div className="bg-white shadow-md rounded-md text-center p-6 border border-gray-200">
              <div className="flex justify-center mb-3">
                <div className="bg-[#0A2E5C] p-3 rounded-full">
                  <Eye className="text-white w-6 h-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#0A2E5C] mb-2">Vision</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                To be a leading and trusted government program that provides immediate,
                compassionate, and effective assistance to individuals and families in crisis
                situations across the nation.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white shadow-md rounded-md text-center p-6 border border-gray-200">
              <div className="flex justify-center mb-3">
                <div className="bg-[#0A2E5C] p-3 rounded-full">
                  <Target className="text-white w-6 h-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#0A2E5C] mb-2">Mission</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                To deliver timely, equitable, and people-centered crisis interventions through
                effective management, collaboration, and compassionate service to all Filipinos
                in need.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Image Section */}
        <div className="relative w-full overflow-hidden">
          <img
            src={AICSheader}
            alt="AICS Team Collaboration"
            className="w-full h-[300px] md:h-[400px] object-cover object-center filter grayscale brightness-90"
          />
          {/* Blue Tint Overlay */}
          <div className="absolute inset-0 bg-[#0A2E5C]/40 mix-blend-multiply"></div>

          {/* Left Blue Rectangle */}
          <div className="absolute left-0 top-0 h-full w-16 bg-[#0A2E5C]"></div>
          {/* Small Red Accent */}
          <div className="absolute left-12 top-1/2 -translate-y-1/2 h-10 w-12 bg-[#C33A3A]"></div>

          {/* Right Red Accent */}
          <div className="absolute right-0 top-0 h-full w-16 bg-[#C33A3A]/70"></div>
        </div>
      </section>

      <section className="relative py-32 px-4 lg:px-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40"></div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-20 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 rounded-full border border-blue-100 mb-6">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <span className="text-sm font-semibold text-blue-700 tracking-wide uppercase">
                Our Services
              </span>
            </div>

            <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Key Aspects of
              <span className="text-5xl lg:text-6xl block mt-2 text-blue-700">
                Our Assistance
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive support tailored to your unique situation, delivered with
              compassion and expertise
            </p>
          </div>

          {/* Content Blocks */}
          <div className="space-y-12">
            {/* Definition of Crisis */}
            <div
              className="group"
              onMouseEnter={() => setHoveredIndex(0)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-32 bg-gradient-to-br from-blue-600 to-blue-700 p-8 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Info className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 p-8 lg:p-10">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-3xl font-bold text-slate-900">
                        Definition of Crisis
                      </h3>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                        Essential
                      </span>
                    </div>

                    <p className="text-lg text-slate-600 leading-relaxed">
                      A situation that involves diverse factors like mental distress, domestic
                      violence, homelessness, unemployment, medical emergencies, or mental
                      health issues
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Types of Assistance */}
            <div
              className="group"
              onMouseEnter={() => setHoveredIndex(1)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 lg:p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900">Types of Assistance</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: GraduationCap,
                      title: "Educational Assistance",
                      desc: "Support for learning and development opportunities",
                    },
                    {
                      icon: Stethoscope,
                      title: "Medical Assistance",
                      desc: "Emergency healthcare support and medical aid",
                    },
                    {
                      icon: Cross,
                      title: "Burial Assistance",
                      desc: "Compassionate support for final arrangements",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="group/card bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform">
                        <item.icon className="w-6 h-6 text-white" />
                      </div>

                      <h4 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h4>

                      <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Our Goals */}
            <div
              className="group"
              onMouseEnter={() => setHoveredIndex(2)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 lg:p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900">Our Goals</h3>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      text: "Ensure immediate safety and stability",
                      detail: "Providing rapid response to urgent crisis situations",
                      number: "01",
                    },
                    {
                      text: "Prevent crisis escalation",
                      detail: "Early intervention and proactive support measures",
                      number: "02",
                    },
                    {
                      text: "Connect with long-term support",
                      detail: "Building sustainable pathways to recovery and wellbeing",
                      number: "03",
                    },
                  ].map((goal, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-5 p-5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all duration-300 group/item"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="text-lg font-bold text-slate-900">{goal.text}</h4>
                          <span className="text-3xl font-bold text-slate-200 group-hover/item:text-blue-200 transition-colors flex-shrink-0">
                            {goal.number}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{goal.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative pt-8 pb-32 px-6 bg-blue-200 -mt-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 border border-slate-200 rounded-full mb-8">
              <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-xs font-semibold text-slate-700 tracking-widest uppercase">
                Performance Metrics
              </span>
            </div>

            <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Measurable Impact
            </h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-16 h-px bg-slate-300"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-16 h-px bg-slate-300"></div>
            </div>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
              Data-driven results demonstrating our commitment to excellence, efficiency, and
              meaningful community engagement across all service delivery channels.
            </p>
          </div>

          {/* Main Impact Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: Users,
                title: "Community Reach",
                desc: "Comprehensive support infrastructure serving diverse populations through evidence-based assistance programs with proven outcomes.",
                stat: "15,000+",
                label: "Beneficiaries Served",
              },
              {
                icon: Clock,
                title: "Operational Efficiency",
                desc: "Streamlined processing systems ensuring rapid response capabilities with optimized workflows and resource allocation.",
                stat: "< 24",
                label: "Hour Response Time",
              },
              {
                icon: Heart,
                title: "Service Excellence",
                desc: "Quality assurance protocols maintaining highest standards of professional service delivery and stakeholder satisfaction.",
                stat: "98.5%",
                label: "Satisfaction Rating",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative bg-white border-2 border-slate-200 hover:border-slate-300 transition-all duration-500 overflow-hidden"
              >
                {/* Top Accent */}
                <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                <div className="p-10">
                  {/* Icon */}
                  <div className="mb-8">
                    <div className="inline-flex w-16 h-16 bg-slate-50 border border-slate-200 items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300">
                      <item.icon className="w-7 h-7 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 leading-relaxed mb-8 text-sm font-light">
                    {item.desc}
                  </p>

                  {/* Divider */}
                  <div className="h-px bg-slate-200 mb-8"></div>

                  {/* Statistics */}
                  <div className="mb-4">
                    <div className="text-5xl font-bold text-slate-900 mb-2 tracking-tight">
                      {item.stat}
                    </div>
                    <div className="text-slate-600 font-medium text-sm uppercase tracking-wider mb-3">
                      {item.label}
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Key Performance Indicators Bar */}
          <div className="bg-slate-900 p-12 mb-20">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-700">
                <div className="text-center pt-8 md:pt-0 first:pt-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 border border-slate-700 mb-4">
                    <Award className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 tracking-tight">24/7</div>
                  <div className="text-slate-400 text-xs uppercase tracking-widest font-medium">
                    Service Availability
                  </div>
                </div>

                <div className="text-center pt-8 md:pt-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 border border-slate-700 mb-4">
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 tracking-tight">50+</div>
                  <div className="text-slate-400 text-xs uppercase tracking-widest font-medium">
                    Certified Staff
                  </div>
                </div>

                <div className="text-center pt-8 md:pt-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 border border-slate-700 mb-4">
                    <Shield className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 tracking-tight">10+</div>
                  <div className="text-slate-400 text-xs uppercase tracking-widest font-medium">
                    Years Experience
                  </div>
                </div>

                <div className="text-center pt-8 md:pt-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 border border-slate-700 mb-4">
                    <CheckCircle className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 tracking-tight">100%</div>
                  <div className="text-slate-400 text-xs uppercase tracking-widest font-medium">
                    Compliance Rate
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Accreditation Footer */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-50 border border-slate-200 p-10 text-center">
              <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-4">
                Accreditations & Certifications
              </div>
              <div className="flex flex-wrap items-center justify-center gap-8">
                <div className="text-slate-600 text-sm font-medium">
                  ISO 9001:2015 Certified
                </div>
                <div className="w-px h-6 bg-slate-300"></div>
                <div className="text-slate-600 text-sm font-medium">Government Accredited</div>
                <div className="w-px h-6 bg-slate-300"></div>
                <div className="text-slate-600 text-sm font-medium">Audited Annually</div>
                <div className="w-px h-6 bg-slate-300"></div>
                <div className="text-slate-600 text-sm font-medium">Data Protected</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 px-4 lg:px-16 bg-gradient-to-br from-white-900 via-white-900 to-white-900">
        {/* Subtle background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(209, 216, 227, 0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-500/10 backdrop-blur-sm rounded-full border border-blue-400/30 mb-6">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-sm font-semibold text-blue-600 tracking-wide uppercase">
                Contact Us
              </span>
            </div>

            <h2 className="text-5xl lg:text-6xl font-bold text-black mb-6 tracking-tight">
              Get In Touch
            </h2>
            <p className="text-xl text-blue-600/80 max-w-2xl mx-auto leading-relaxed">
              We're here to assist you. Reach out or visit us at our location
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-5 gap-8 mb-12">
            {/* Contact Information - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Address */}
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 lg:p-5 overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-400/40 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">Address</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      104 P. Gomez St.
                      <br />
                      Lucena City, Philippines
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 lg:p-5 overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-400/40 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">Phone</h3>
                    <a
                      href="tel:+6328931810"
                      className="text-blue-100 hover:text-blue-300 transition-colors text-sm font-medium"
                    >
                      +63 2 8931 8101
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 lg:p-5 overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-blue/100 hover:border-blue-400/40 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">Email</h3>
                    <a
                      href="mailto:aics@dswd.gov.ph"
                      className="text-blue-100 hover:text-blue-300 transition-colors text-sm font-medium"
                    >
                      aics@dswd.gov.ph
                    </a>
                  </div>
                </div>
              </div>

              {/* Office Hours */}
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 lg:p-5 overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-400/40 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">Office Hours</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      Monday - Friday
                      <br />
                      8:00 AM - 5:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map - Right Side */}
            <div className="lg:col-span-3">
              <div
                className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                style={{ height: "600px" }}
              >
                <iframe
                  src="https://www.google.com/maps?q=13.936812,121.616434&z=15&output=embed"
                  width="100%"
                  height="600"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="DSWD Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingStaffLogin />
    </div>
  );
};

export default AboutUs;
