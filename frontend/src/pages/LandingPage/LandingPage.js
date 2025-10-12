import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Phone, ChevronDown,Sparkles, ArrowRight, Users,FileText,CheckCircle, TrendingUp, Heart, Calendar } from "lucide-react";
import Navbar from "../../components/Navigation/Navbar";
import Footer from "../../components/Footer/Footer";
import aics from "../../assets/AICS-OFFICIAL.png";
import FinpayFeatures from "./AICSfile";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import HowToApply from "./How2apply";
import { Link } from "react-router-dom";



// import { GraduationCap, HeartPulse, Cross } from "lucide-react";

import { FaUserGraduate, FaUserInjured, FaCross } from "react-icons/fa";
import { FaBookOpen, FaUserMd } from "react-icons/fa";



// Mock assets - replace with actual imports
const qaWithout = "https://via.placeholder.com/100x100/2563eb/ffffff?text=QA";
const qaText = "https://via.placeholder.com/150x40/ffffff/2563eb?text=QuickAid";
const heroImage = "https://via.placeholder.com/600x400/f3f4f6/374151?text=AICS+Services";
const educIcon = "https://via.placeholder.com/60x60/3b82f6/ffffff?text=📚";
const medicalIcon = "https://via.placeholder.com/60x60/10b981/ffffff?text=🏥";
const burialIcon = "https://via.placeholder.com/60x60/6366f1/ffffff?text=⚰️";

const beneficiaries = [
  {
    icon: educIcon,
    title: "Students",
    description:
      "Individuals who are currently enrolled in educational institutions and require financial assistance for their studies.",
  },
  {
    icon: medicalIcon,
    title: "Patients",
    description:
      "Individuals who are currently undergoing medical treatment and need financial support.",
  },
  {
    icon: burialIcon,
    title: "Burial Services",
    description:
      "Individuals who require assistance with burial or funeral services for their loved ones.",
  },
];

const services = [
  {
    icon: educIcon,
    title: "Educational Assistance",
    desc: "Support for tuition and school supplies",
  },
  {
    icon: medicalIcon,
    title: "Medical Assistance",
    desc: "Healthcare and medical expenses coverage",
  },
  { icon: burialIcon, title: "Burial Assistance", desc: "Funeral and burial service support" },
];

const faqs = [
  {
    question: "Where do I download the AICS Application Form?",
    answer:
      'You can download the AICS Application Form (AF-AICS) from our official website under the "Downloads" section. The form is available in PDF format.',
  },
  {
    question: "What documents are required for submission?",
    answer:
      "Required documents include: Completed AF-AICS form, Proof of identity, Proof of address, and supporting documents as applicable.",
  },
  {
    question: "How can I contact the AICS Program?",
    answer:
      "For inquiries, contact us via email at aics@example.com or call our hotline at +123 456 7890.",
  },
  {
    question: "How do I get started on the AICS Program?",
    answer:
      "Visit our website, download the AF-AICS form, fill it out with required documents. We'll review your application within 5 business days.",
  },
];

const steps = [
    {
      icon: FileText,
      title: "Prepare Requirements",
      description: "Bring a valid government ID and supporting documents (medical, burial, education, or crisis-related).",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Visit DSWD Office",
      description: "Go to the nearest DSWD Field Office or satellite center and line up for assessment.",
      color: "from-violet-500 to-blue-500",
      bgColor: "bg-violet-50",
      iconBg: "bg-gradient-to-br from-violet-500 to-blue-500"
    },
    {
      icon: CheckCircle,
      title: "Get Approved",
      description: "A social worker will review your documents. Once approved, assistance will be released immediately.",
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500"
    }
  ];


const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="font-sans min-h-screen">
      {/* Sticky Navbar */}
      <Navbar />
      {/* Hero Section */}
      <section
        id="home"
        className="pt-48 pb-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* Logos Section removed as requested */}

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                <span className="text-blue-600 text-4xl lg:text-6xl">Assistance</span> to
                Individuals in{" "}
                <span className="text-blue-600 text-4xl lg:text-6xl">Crisis</span> Situation
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                AICS is a DSWD program providing medical, burial, transport, education, food,
                and financial aid to individuals or families in crisis situations.
              </p>
              

              

              {/* Stats Section */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-6 max-w-4xl mx-auto">
  {/* Families Helped */}
  <div className="flex flex-col items-center">
    <Users className="w-6 h-6 text-blue-600 mb-1" />
    <h3 className="text-sm font-medium text-gray-800">25,000+ Families Helped</h3>
  </div>

  {/* 24/7 Emergency Support */}
  <div className="flex flex-col items-center">
    <Clock className="w-6 h-6 text-teal-600 mb-1" />
    <h3 className="text-sm font-medium text-gray-800">24/7 Emergency Support</h3>
  </div>

  {/* Nationwide Coverage */}
  <div className="flex flex-col items-center">
    <MapPin className="w-6 h-6 text-green-600 mb-1" />
    <h3 className="text-sm font-medium text-gray-800">Nationwide Coverage</h3>
  </div>
</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <img
                src={aics}
                alt="AICS Services"
                className="relative z-10 w-auto mx-auto"
                style={{ width: 320 }}
              />
            </motion.div>
          </div>
        </div>
      </section>

                 {/* Program Objective Section */}
<section className="py-24 bg-gradient-to-r from-blue-50 via-white to-blue-50">
  <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
    
    {/* Left Visual (Image or Illustration) */}
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex justify-center md:justify-start"
    >
      <img
        src={aics}
        alt="Program Objective Illustration"
        className="w-72 lg:w-96 object-contain drop-shadow-lg"
      />
    </motion.div>

    {/* Right Content */}
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="text-left"
    >
      <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-snug mb-6">
        PROGRAM'S{" "}
        <span className="font-bold text-4xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          OBJECTIVE
        </span>
      </h2>

      <p className="text-lg text-gray-700 leading-relaxed mb-8">
        The <strong>AICS Program</strong> aims to provide timely and compassionate
        support to individuals and families experiencing crises. It ensures that
        their immediate and essential needs — including medical, educational, and
        burial assistance — are effectively addressed to restore stability and
        dignity in times of hardship.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <span className="text-gray-800 font-semibold text-lg">
          Empowering individuals through compassionate action.
        </span>
      </div>
    </motion.div>
  </div>
</section>



      {/* Services Section */}
<section id="services" className="py-20 bg-gradient-to-b from-gray-50 to-white">
  
  <div className="max-w-7xl mx-auto px-4">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="mb-20"
    >
      <div className="inline-block px-4 py-2 bg-blue-100 rounded-full mb-4">
        <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
          What We Offer
        </span>
      </div>
      <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
        Our{" "}
        <span className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
          Services
        </span>
      </h2>
      <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
        We provide comprehensive assistance programs designed to help individuals and
        families overcome crisis situations.
      </p>
    </motion.div>

    <div className="grid md:grid-cols-3 gap-6">

      {/* Educational Assistance */}
      <Link to="/services/education">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ y: -8 }}
          className="cursor-pointer group relative bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full blur-3xl transition-all duration-500 group-hover:scale-150"></div>

          <div className="relative flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                Educational Assistance
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Support for tuition and school supplies
              </p>
              <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transform origin-left transition-transform duration-500 group-hover:scale-x-150"></div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 flex-shrink-0">
              <FaBookOpen className="text-2xl" />
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Medical Assistance */}
      <Link to="/services/medical">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ y: -8 }}
          className="cursor-pointer group relative bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-blue-600/10 rounded-full blur-3xl transition-all duration-500 group-hover:scale-150"></div>

          <div className="relative flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                Medical Assistance
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Healthcare and medical expenses coverage
              </p>
              <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-blue-600 rounded-full transform origin-left transition-transform duration-500 group-hover:scale-x-150"></div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 flex-shrink-0">
              <FaUserMd className="text-2xl" />
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Burial Assistance */}
      <Link to="/services/funeral">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          whileHover={{ y: -8 }}
          className="cursor-pointer group relative bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-pink-600/10 rounded-full blur-3xl transition-all duration-500 group-hover:scale-150"></div>

          <div className="relative flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                Burial Assistance
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Funeral and burial service support
              </p>
              <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-pink-600 rounded-full transform origin-left transition-transform duration-500 group-hover:scale-x-150"></div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 flex-shrink-0">
              <FaCross className="text-2xl" />
            </div>
          </div>
        </motion.div>
      </Link>

    </div>
  </div>
</section>


     {/* Who We Serve Section */}
<section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
  {/* Decorative background elements */}
  <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
  <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-900/30 rounded-full blur-3xl"></div>
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
    <div className="absolute top-20 right-20 w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
    <div className="absolute top-40 right-40 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-75"></div>
    <div className="absolute bottom-20 left-20 w-2 h-2 bg-white/40 rounded-full animate-pulse delay-150"></div>
    <div className="absolute bottom-40 left-40 w-1 h-1 bg-white/30 rounded-full animate-pulse"></div>
  </div>

  <div className="max-w-7xl mx-auto px-4 relative z-10">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="mb-20 flex flex-col items-center text-center"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-4"
      >
        <span className="text-white font-semibold text-sm uppercase tracking-wider">Our Community</span>
      </motion.div>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-5xl lg:text-6xl font-bold mb-6 leading-tight"
      >
        Who We <span className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent animate-pulse">Serve</span>
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-xl text-blue-100 max-w-2xl leading-relaxed"
      >
        Our application management system is designed to assist a diverse range of
        beneficiaries in need of support.
      </motion.p>
    </motion.div>

    <div className="grid md:grid-cols-3 gap-6">
      {/* Students */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        whileHover={{ y: -8 }}
        className="group relative bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-500 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transition-all duration-500 group-hover:scale-150"></div>
        
        <div className="relative flex flex-col items-center text-center">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-300/30 to-white/30 backdrop-blur-sm rounded-2xl shadow-lg transform transition-all duration-500 group-hover:scale-110 mb-6"
          >
            <FaUserGraduate className="text-3xl text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-200 transition-colors duration-300">
            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:to-white transition-all duration-300">
              Students
            </span>
          </h3>
          <p className="text-blue-100 leading-relaxed mb-4 group-hover:text-white transition-colors duration-300">
            Individuals who are currently enrolled in educational institutions and
            require financial assistance for their studies.
          </p>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-300 via-white to-blue-300 rounded-full transform transition-transform duration-500 group-hover:scale-x-150 shadow-lg shadow-white/50"></div>
        </div>
      </motion.div>

      {/* Patients */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        whileHover={{ y: -8 }}
        className="group relative bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-500 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transition-all duration-500 group-hover:scale-150"></div>
        
        <div className="relative flex flex-col items-center text-center">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-300/30 to-white/30 backdrop-blur-sm rounded-2xl shadow-lg transform transition-all duration-500 group-hover:scale-110 mb-6"
          >
            <FaUserInjured className="text-3xl text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-200 transition-colors duration-300">
            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:to-white transition-all duration-300">
              Patients
            </span>
          </h3>
          <p className="text-blue-100 leading-relaxed mb-4 group-hover:text-white transition-colors duration-300">
            Individuals who are currently undergoing medical treatment and need
            financial support.
          </p>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-300 via-white to-blue-300 rounded-full transform transition-transform duration-500 group-hover:scale-x-150 shadow-lg shadow-white/50"></div>
        </div>
      </motion.div>

      {/* Burial Services */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
        whileHover={{ y: -8 }}
        className="group relative bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-500 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transition-all duration-500 group-hover:scale-150"></div>
        
        <div className="relative flex flex-col items-center text-center">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-300/30 to-white/30 backdrop-blur-sm rounded-2xl shadow-lg transform transition-all duration-500 group-hover:scale-110 mb-6"
          >
            <FaCross className="text-3xl text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-200 transition-colors duration-300">
            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:to-white transition-all duration-300">
              Burial Services
            </span>
          </h3>
          <p className="text-blue-100 leading-relaxed mb-4 group-hover:text-white transition-colors duration-300">
            Individuals who require assistance with burial or funeral services for
            their loved ones.
          </p>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-300 via-white to-blue-300 rounded-full transform transition-transform duration-500 group-hover:scale-x-150 shadow-lg shadow-white/50"></div>
        </div>
      </motion.div>
    </div>
  </div>
</section>
<section>
  <HowToApply />

</section>
            <section className="relative min-h-screen py-24 px-6 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-900 to-blue-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-3000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-white opacity-5"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Title with Enhanced Animation */}
        <div className="text-center mb-20">
          
          
          <h2 className="text-5xl md:text-7xl font-bold font-black text-white mb-6 leading-tight">
            How to Apply for
            <br />
            <span className="bg-gradient-to-r text-5xl md:text-7xl font-bold from-blue-400 via-blue-400 to-white-400 bg-clip-text text-transparent animate-gradient">
              AICS Program
            </span>
          </h2>
          
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Your journey to assistance starts here. Follow our streamlined process designed with you in mind.
          </p>
        </div>

        {/* Steps Container with 3D Effect */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 perspective-1000">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="group relative transform-gpu"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Glow Effect */}
                <div 
                  className="absolute inset-0 rounded-3xl blur-2xl opacity-0 group-hover:opacity-75 transition-opacity duration-500"
                  style={{ 
                    background: `radial-gradient(circle at center, ${step.glowColor}, transparent 70%)`
                  }}
                ></div>

                {/* Main Card */}
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-[0_20px_80px_rgba(0,0,0,0.3)] transition-all duration-500 transform hover:scale-105 hover:-rotate-1">
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer"></div>
                  </div>

                  {/* Step Number - Floating Badge */}
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-white via-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 border-4 border-slate-900">
                    <span className="text-slate-900 font-black text-2xl">{index + 1}</span>
                  </div>
                  
                  {/* Icon with Gradient Background */}
                  <div className="relative mb-8 mt-4">
                    <div className={`w-20 h-20 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 mx-auto`}>
                      <Icon className="w-10 h-10 text-white drop-shadow-lg" strokeWidth={2.5} />
                    </div>
                    {/* Orbiting Ring */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-white/30 group-hover:animate-spin-slow"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-base">
                      {step.description}
                    </p>

                    {/* Decorative Line */}
                    <div className={`mt-6 h-1 ${step.accentColor} rounded-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                  </div>

                  {/* Corner Accent */}
                  <div className={`absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-br ${step.gradient} rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}></div>
                </div>

                {/* Connecting Arrow for Desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-20">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-xl">
                      <ArrowRight className="w-6 h-6 text-white animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Enhanced CTA Section */}
        <div className="mt-20 text-center">
          
          
          
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.15); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-blob {
          animation: blob 8s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .shimmer {
          animation: shimmer 3s infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .bg-grid-white {
          background-image: 
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </section>

      <section>
  <FinpayFeatures />
</section>


            <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-24 px-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 bg-opacity-10 rounded-full mb-6 backdrop-blur-sm border border-blue-200">
            <Heart className="w-4 h-4 text-blue-600" />
            <p className="text-blue-600 text-sm font-semibold tracking-wide uppercase">
              OUR MISSION
            </p>
          </div>
          
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 mb-6 leading-tight">
            We help those<br />
            who seek help
          </h2>
          
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Thousands of individuals and families in crisis have received 
            assistance, relief, and hope through AICS.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stat 1 */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="text-6xl md:text-7xl font-bold bg-gradient-to-br from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-4">
                50K+
              </div>
              <p className="text-gray-700 text-lg font-semibold">Beneficiaries served</p>
              <div className="mt-4 h-1 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto md:mx-0"></div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-indigo-200 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div className="text-6xl md:text-7xl font-bold bg-gradient-to-br from-indigo-600 to-blue-700 bg-clip-text text-transparent mb-4">
                ₱120M+
              </div>
              <p className="text-gray-700 text-lg font-semibold">Financial aid released</p>
              <div className="mt-4 h-1 w-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full mx-auto md:mx-0"></div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div className="text-6xl md:text-7xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4">
                15+
              </div>
              <p className="text-gray-700 text-lg font-semibold">Years of service</p>
              <div className="mt-4 h-1 w-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto md:mx-0"></div>
            </div>
          </div>
        </div>

        {/* Optional CTA */}
        
      </div>
    </section>
      


      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked{" "}
              <span className="text-blue-600 text-4xl lg:text-5xl">Questions</span>
            </h2>
            <p className="text-xl text-gray-600">
              Find answers to common questions about the AICS program and application process.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-100"
                    >
                      <p className="p-6 text-gray-600 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
            
                  


      <Footer />
    </div>
  );
};

export default LandingPage;
