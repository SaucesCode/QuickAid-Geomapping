import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronDown,
  ArrowRight,
  Users,
  FileText,
  CheckCircle,
  MessageSquareText,
  FileCheck,
  Shield,
  Award,
} from "lucide-react";
import Navbar from "../../components/Navigation/Navbar";
import Footer from "../../components/Footer/Footer";
import aics from "../../assets/AICS-OFFICIAL.png";
import FloatingStaffLogin from "./FloatingStaffLogin";

import HowToApply from "./How2apply";
import { Link } from "react-router-dom";
import Carousel from "./Carousel";
import bgImage from "../../assets/JPA09392.JPG";

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

const stepsData = [
  {
    icon: FileText,
    title: "Application Submission",
    description:
      "Submit your comprehensive application through our secure digital infrastructure with encrypted data transmission and multi-factor authentication protocols.",
  },
  {
    icon: FileCheck,
    title: "Document Verification",
    description:
      "Our dedicated compliance officers conduct rigorous document authentication and eligibility assessment in accordance with regulatory standards.",
  },
  {
    icon: Clock,
    title: "Processing & Assessment",
    description:
      "Applications undergo systematic review and evaluation by our specialized team, with transparent status tracking and regular progress updates.",
  },
  {
    icon: CheckCircle,
    title: "Approval & Distribution",
    description:
      "Approved applicants receive official notification and benefits are distributed through our secure and audited disbursement system.",
  },
];

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = index => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="font-sans min-h-screen">
      {/* Sticky Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative pt-48 pb-20 overflow-hidden">
        {/* Blurred background image */}
        <img
          src={bgImage}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-100 blur"
        />

        {/* Optional gradient overlay for color tone */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-white/10 to-indigo-50/20"></div>

        {/* Foreground content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
                <span className="text-4xl lg:text-6xl text-blue-400">Assistance</span> to
                Individuals in{" "}
                <span className="text-4xl lg:text-6xl text-blue-400">Crisis</span> Situation
              </h1>

              <p className="text-xl text-blue-200 mb-8 leading-relaxed">
                AICS is a DSWD program providing medical, burial, transport, education, food,
                and financial aid to individuals or families in crisis situations.
              </p>

              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-6 max-w-4xl mx-auto">
                {/* Families Helped */}
                <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm p-3 w-48 h-15 rounded-lg shadow-md hover:shadow-lg transition duration-300 mx-auto">
                  <Users className="w-6 h-6 text-blue-200 mb-1" />
                  <h3 className="text-sm font-semibold text-white text-center">
                    25,000+ Families Helped
                  </h3>
                </div>

                {/* 24/7 Emergency Support */}
                <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm p-3 w-48 h-15 rounded-lg shadow-md hover:shadow-lg transition duration-300 mx-auto">
                  <Clock className="w-6 h-6 text-blue-200 mb-1" />
                  <h3 className="text-sm font-semibold text-white text-center">
                    24/7 Emergency Support
                  </h3>
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
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          {/* Left Visual (Carousel) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center md:justify-start"
          >
            <div className="w-full h-[300px] md:h-[340px] lg:h-[380px] overflow-hidden shadow-xl">
              <Carousel />
            </div>
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
              <span className="font-bold text-4xl lg:text-5xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                OBJECTIVE
              </span>
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              The <strong>AICS Program</strong> aims to provide timely and compassionate
              support to individuals and families experiencing crises. It ensures that their
              immediate and essential needs — including medical, educational, and burial
              assistance — are effectively addressed to restore stability and dignity in times
              of hardship.
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
      <section
        id="services"
        className="py-24 bg-gradient-to-b from-blue-100 via-blue-200/100 to-white relative overflow-hidden"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-blue-700 font-semibold text-sm uppercase tracking-wider">
                What We Offer
              </span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Our{" "}
              <span className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                Services
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We provide comprehensive assistance programs designed to help individuals and
              families overcome crisis situations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Educational Assistance */}
            <Link to="/services/education">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -12 }}
                className="cursor-pointer group relative bg-white p-10 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-500 overflow-hidden h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:via-blue-50/30 group-hover:to-transparent transition-all duration-500"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-blue-500/10"></div>

                <div className="relative">
                  <div className="mb-6 inline-flex p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25 transform transition-all duration-500 group-hover:scale-110 group-hover:shadow-blue-500/40">
                    <FaBookOpen className="text-3xl text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    Educational Assistance
                  </h3>

                  <p className="text-slate-600 leading-relaxed mb-6">
                    Support for tuition and school supplies
                  </p>

                  <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all duration-300">
                    <span className="text-sm">Learn more</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </motion.div>
            </Link>

            {/* Medical Assistance */}
            <Link to="/services/medical">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ y: -12 }}
                className="cursor-pointer group relative bg-white p-10 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-500 overflow-hidden h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:via-blue-50/30 group-hover:to-transparent transition-all duration-500"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-blue-600/10"></div>

                <div className="relative">
                  <div className="mb-6 inline-flex p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transform transition-all duration-500 group-hover:scale-110 group-hover:shadow-blue-600/40">
                    <FaUserMd className="text-3xl text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    Medical Assistance
                  </h3>

                  <p className="text-slate-600 leading-relaxed mb-6">
                    Healthcare and medical expenses coverage
                  </p>

                  <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all duration-300">
                    <span className="text-sm">Learn more</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </motion.div>
            </Link>

            {/* Burial Assistance */}
            <Link to="/services/funeral">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                whileHover={{ y: -12 }}
                className="cursor-pointer group relative bg-white p-10 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-500 overflow-hidden h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:via-blue-50/30 group-hover:to-transparent transition-all duration-500"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-700/5 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-blue-700/10"></div>

                <div className="relative">
                  <div className="mb-6 inline-flex p-4 bg-gradient-to-br from-blue-700 to-blue-800 rounded-xl shadow-lg shadow-blue-700/25 transform transition-all duration-500 group-hover:scale-110 group-hover:shadow-blue-700/40">
                    <FaCross className="text-3xl text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    Burial Assistance
                  </h3>

                  <p className="text-slate-600 leading-relaxed mb-6">
                    Funeral and burial service support
                  </p>

                  <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all duration-300">
                    <span className="text-sm">Learn more</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="py-24 bg-gradient-to-br from-slate-100 via-blue-200 to-white text-slate-900 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="absolute top-20 right-20 w-2 h-2 bg-blue-400/40 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-40 w-1 h-1 bg-blue-400/30 rounded-full animate-pulse delay-75"></div>
          <div className="absolute bottom-20 left-20 w-2 h-2 bg-blue-400/40 rounded-full animate-pulse delay-150"></div>
          <div className="absolute bottom-40 left-40 w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 bg-blue-50 backdrop-blur-sm border border-blue-200 rounded-full mb-6"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-blue-700 font-semibold text-sm uppercase tracking-wider">
                Our Community
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              Who We{" "}
              <span className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent animate-pulse">
                Serve
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-slate-600 max-w-3xl leading-relaxed"
            >
              Our application management system is designed to assist a diverse range of
              beneficiaries in need of support.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Students */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -12 }}
              className="group relative bg-white/80 backdrop-blur-lg p-10 rounded-2xl border border-slate-200 hover:bg-white hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-blue-500/10"></div>

              <div className="relative flex flex-col items-center text-center">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25 transform transition-all duration-500 group-hover:scale-110 group-hover:shadow-blue-400/40 mb-6"
                >
                  <FaUserGraduate className="text-3xl text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                  <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300">
                    Students
                  </span>
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6 group-hover:text-slate-700 transition-colors duration-300">
                  Individuals who are currently enrolled in educational institutions and
                  require financial assistance for their studies.
                </p>
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full transform transition-all duration-500 group-hover:w-24 group-hover:via-blue-600"></div>
              </div>
            </motion.div>

            {/* Patients */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -12 }}
              className="group relative bg-white/80 backdrop-blur-lg p-10 rounded-2xl border border-slate-200 hover:bg-white hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-blue-500/10"></div>

              <div className="relative flex flex-col items-center text-center">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transform transition-all duration-500 group-hover:scale-110 group-hover:shadow-blue-500/40 mb-6"
                >
                  <FaUserInjured className="text-3xl text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                  <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300">
                    Patients
                  </span>
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6 group-hover:text-slate-700 transition-colors duration-300">
                  Individuals who are currently undergoing medical treatment and need financial
                  support.
                </p>
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full transform transition-all duration-500 group-hover:w-24 group-hover:via-blue-300"></div>
              </div>
            </motion.div>

            {/* Burial Services */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ y: -12 }}
              className="group relative bg-white/80 backdrop-blur-lg p-10 rounded-2xl border border-slate-200 hover:bg-white hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-blue-500/10"></div>

              <div className="relative flex flex-col items-center text-center">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-800 rounded-xl shadow-lg shadow-blue-700/25 transform transition-all duration-500 group-hover:scale-110 group-hover:shadow-blue-600/40 mb-6"
                >
                  <FaCross className="text-3xl text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                  <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300">
                    Burial Services
                  </span>
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6 group-hover:text-slate-700 transition-colors duration-300">
                  Individuals who require assistance with burial or funeral services for their
                  loved ones.
                </p>
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full transform transition-all duration-500 group-hover:w-24 group-hover:via-blue-300"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section>
        <HowToApply />
      </section>
      <section className="relative py-32 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-24">
            <div className="inline-flex items-center px-4 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-xs font-semibold tracking-wider uppercase mb-8 letter-spacing-wide">
              <Shield className="w-3.5 h-3.5 mr-2" />
              Standardized Process
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
              Application Process Framework
            </h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-16 h-px bg-slate-300"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-16 h-px bg-slate-300"></div>
            </div>
            <p className="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed font-light">
              Our methodical four-phase approach ensures comprehensive evaluation, regulatory
              compliance, and efficient processing of all assistance applications.
            </p>
          </div>

          {/* Steps Grid - Premium Layout */}
          <div className="relative mb-24">
            {/* Background Timeline */}
            <div className="hidden lg:block absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {stepsData.map((step, index) => (
                <div key={index} className="relative group">
                  {/* Card */}
                  <div className="relative bg-white border border-slate-200 hover:border-slate-300 transition-all duration-500 h-full flex flex-col overflow-hidden">
                    {/* Top Accent Line */}
                    <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                    <div className="p-8">
                      {/* Step Indicator */}
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex-shrink-0">
                          <div className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-3">
                            Phase {index + 1}
                          </div>
                          <div className="text-6xl font-bold text-slate-100 leading-none">
                            {String(index + 1).padStart(2, "0")}
                          </div>
                        </div>
                        <div className="w-14 h-14 bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300">
                          <step.icon className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-bold text-slate-900 mb-4 leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed font-light">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="bg-slate-900 rounded-none p-16 mb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="text-center border-r border-slate-700 last:border-r-0">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 border border-slate-700 mb-6">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
                <div className="text-4xl font-bold text-white mb-2 tracking-tight">15-30</div>
                <div className="text-slate-400 text-sm uppercase tracking-wider font-medium">
                  Business Days
                </div>
              </div>
              <div className="text-center border-r border-slate-700 last:border-r-0">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 border border-slate-700 mb-6">
                  <Shield className="w-8 h-8 text-slate-400" />
                </div>
                <div className="text-4xl font-bold text-white mb-2 tracking-tight">100%</div>
                <div className="text-slate-400 text-sm uppercase tracking-wider font-medium">
                  Secure Platform
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 border border-slate-700 mb-6">
                  <Award className="w-8 h-8 text-slate-400" />
                </div>
                <div className="text-4xl font-bold text-white mb-2 tracking-tight">24/7</div>
                <div className="text-slate-400 text-sm uppercase tracking-wider font-medium">
                  Portal Access
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section - Executive Style */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border-2 border-slate-200 p-12 text-center">
              <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                Initiate Your Application
              </h3>
              <p className="text-slate-600 text-base mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                Access our enterprise-grade application portal with end-to-end encryption,
                comprehensive guidance, and dedicated support throughout the entire process.
              </p>
              <a
                href="/staff-qr"
                className="inline-flex items-center justify-center px-12 py-4 bg-slate-900 text-white text-sm font-semibold tracking-wider uppercase hover:bg-slate-800 transition-all duration-300 border-2 border-slate-900 hover:border-slate-800"
              >
                Access Portal
                <ArrowRight className="ml-3 w-4 h-4" />
              </a>
              <div className="mt-8 pt-8 border-t border-slate-200">
                <p className="text-slate-500 text-xs uppercase tracking-wider font-medium">
                  ISO 27001 Certified • AES-256 Encryption • GDPR Compliant
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* --- */}
          {/* Header Section */}
          {/* --- */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-blue-100/50 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-4 border border-blue-200">
              <MessageSquareText className="w-4 h-4" />
              <span>Common Questions</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Need <span className="text-5xl lg:text-6xl text-blue-600">Answers</span>?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
              Find immediate answers to common questions about the AICS program and application
              process below.
            </p>
          </motion.div>

          {/* --- */}
          {/* FAQ List */}
          {/* --- */}
          <div className="space-y-5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  // Modern card design: strong shadow, rounded corners, clean border
                  className={`bg-white rounded-xl shadow-lg transition-all duration-300 ${
                    isOpen ? "ring-2 ring-blue-500 shadow-xl" : "shadow-md hover:shadow-lg"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-6 text-left flex items-start justify-between transition-colors duration-200"
                  >
                    {/* Question: Bolder text when active */}
                    <h3
                      className={`text-lg font-semibold pr-4 transition-colors duration-200 ${
                        isOpen ? "text-blue-700" : "text-gray-900"
                      }`}
                    >
                      {faq.question}
                    </h3>
                    {/* Chevron Icon: Brighter blue when active */}
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown
                        className={`w-6 h-6 transition-colors duration-200 ${
                          isOpen ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        // Answer content: clear, bordered, padded area
                        className="border-t border-blue-50"
                      >
                        <p className="p-6 pt-4 text-gray-700 leading-relaxed bg-blue-50/30 rounded-b-xl">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
      <FloatingStaffLogin />
    </div>
  );
};

export default LandingPage;
