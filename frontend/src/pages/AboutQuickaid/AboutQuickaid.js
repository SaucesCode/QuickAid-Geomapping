import React from "react";
import { motion } from "framer-motion";
// Ensure these imports point to your actual component paths
import Navbar from "../../components/Navigation/Navbar";
import Footer from "../../components/Footer/Footer";
// Updated LP1 source
import LP1 from "../../assets/quickaid-text.png" 
import QA from "../../assets/QUICKAID white stroke LOGO.png";
import AICSFile from "../LandingPage/AICSfile";
// Lucide icons
import { Target, Eye, Database, BarChart3, ShieldCheck, Zap } from "lucide-react"; 

// --- Framer Motion Variants for cleaner code ---
const fadeIn = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemFadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};


const AboutQuickaid = () => {
  return (
    <div className="min-h-screen font-sans bg-slate-50 text-gray-800 antialiased">
      <Navbar />

      {/* HERO SECTION: About QuickAid */}
      <section className="relative py-32 bg-white overflow-hidden">
  {/* CONTENT CONTAINER */}
  <div className="relative max-w-7xl mx-auto px-4">
    <div className="grid md:grid-cols-2 gap-20 items-center">
      
      {/* LEFT COLUMN: Image */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex justify-center items-center order-2 md:order-1"
      >
        <img
          src={QA}
          alt="QuickAid Logo"
          className="w-2/3 md:w-3/5 h-auto object-contain bg-transparent border-none shadow-none translate-y-6"
        />
      </motion.div>

      {/* RIGHT COLUMN: Content */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="space-y-8 order-1 md:order-2"
      >
        {/* Tag */}
        <div className="inline-block">
        </div>

        {/* Heading */}
        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight flex items-baseline gap-4">
          About
          <img
            src={LP1}
            alt="QuickAid Logo"
            className="w-40 lg:w-52 object-contain align-baseline translate-y-1 bg-transparent"
          />
        </h1>

        {/* Description */}
        <div className="space-y-5">
          <p className="text-lg text-gray-500 leading-relaxed">
            QuickAid is an innovative digital platform designed to streamline government
            and community assistance programs. It centralizes aid applications,
            making the process faster, more transparent, and easier to manage for both
            administrators and beneficiaries.
          </p>

          <p className="text-lg text-gray-500 leading-relaxed">
            By integrating data-driven tools, real-time tracking, and secure information
            management, QuickAid ensures that help reaches those who need it most—
            efficiently and fairly. The system empowers local governments and organizations
            to deliver aid with integrity, accuracy, and accountability.
          </p>
        </div>
      </motion.div>
    </div>
  </div>
</section>


      {/* 2. CORE PRINCIPLES (Mission & Vision) - Blue Monochromatic Cards */}
      <section className="bg-white text-gray-900 py-24">
        {/* Header and Content - Using dark blue background and white cards */}
        <div className="max-w-7xl mx-auto px-4">
            <div 
              className="bg-[#0A2E5C] text-white py-12 px-8 md:px-16 flex flex-col md:flex-row items-center rounded-2xl shadow-xl"
              style={{ background: 'linear-gradient(135deg, #0A2E5C 0%, #153C7D 100%)' }}
            >
                {/* Left Text */}
                <div className="md:w-1/3">
                    <motion.h2 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.6 }}
                      className="text-4xl md:text-5xl font-bold leading-tight text-white"
                    >
                        Our Mission<br />and Vision
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="mt-4 text-sm leading-relaxed text-gray-200"
                    >
                        Defining QuickAid's commitment to efficient, transparent, and compassionate aid delivery through digital transformation.
                    </motion.p>
                </div>

                {/* Vision & Mission Cards (Asterisks removed) */}
                <div className="md:w-2/3 grid md:grid-cols-2 gap-8 mt-10 md:mt-0 md:pl-16">
                    {/* Vision Card (Blue border) */}
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.7, delay: 0.2 }}
                      className="bg-white shadow-xl rounded-xl text-center p-6 border-t-4 border-blue-600"
                    >
                        <div className="flex justify-center mb-3">
                            <div className="bg-[#0A2E5C] p-3 rounded-full shadow-md">
                                <Eye className="text-white w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-[#0A2E5C] mb-2">Vision: Integrity & Efficiency</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            To be the global digital standard in public welfare service management, fostering data-driven governance for resilient and inclusive communities.
                        </p>
                    </motion.div>

                    {/* Mission Card (Cyan/Accent Blue border) */}
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.7, delay: 0.3 }}
                      className="bg-white shadow-xl rounded-xl text-center p-6 border-t-4 border-cyan-500"
                    >
                        <div className="flex justify-center mb-3">
                            <div className="bg-[#0A2E5C] p-3 rounded-full shadow-md">
                                <Target className="text-white w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-[#0A2E5C] mb-2">Mission: Enable Rapid Aid</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            To empower organizations by providing a fast, transparent, and secure platform for managing and delivering government aid applications.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
      </section>

      {/* 3. OPERATIONAL EXCELLENCE - Blue Monochromatic Accents */}
      <section className="py-24 bg-white">
  <div className="max-w-7xl mx-auto px-6 lg:px-8">
    
    {/* 1. Centered and Professional Title Block */}
    <motion.div
      initial="hidden"
      whileInView="show"
      variants={fadeIn}
      viewport={{ once: true, amount: 0.3 }}
      className="text-center mb-16 max-w-4xl mx-auto"
    >
      <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-4 tracking-tight">
        Core Pillars of <span className="text-5xl lg:text-6xl font-bold text-blue-600">Operational Excellence</span>
      </h2>
      <p className="text-lg text-slate-600 max-w-3xl mx-auto">
        Our commitment is structured around delivering superior quality, rigorous security, and data-driven insights to maximize community impact.
      </p>
      {/* Simple, clean separator line */}
      <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full mt-4"></div>
    </motion.div>

    {/* 2. Three-Column Feature Cards (Clean, Uniform Style) */}
    <motion.div 
      initial="hidden"
      whileInView="show"
      variants={staggerContainer}
      viewport={{ once: true, amount: 0.3 }}
      className="grid md:grid-cols-3 gap-8"
    >
      
      {/* Pillar 1: Centralized Storage */}
      <motion.div
        variants={itemFadeUp}
        // Unified clean card style: white background, subtle shadow, light border
        className="group relative bg-white rounded-xl shadow-lg p-8 border border-slate-100 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
      >
        <div className="relative text-center">
          {/* Accent Circle/Icon Holder (Primary Blue) */}
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-6 shadow-md">
            <Database className="w-8 h-8" /> 
          </div>

          <h3 className="text-xl font-bold mb-3 text-slate-900">
            Centralized Data Storage
          </h3>
          <p className="text-slate-600 text-base leading-relaxed">
            We implement automated, secure data management protocols for efficient storage and immediate retrieval of all critical application records.
          </p>
          
          {/* Accent line for emphasis */}
          <div className="mt-6 w-10 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>
      </motion.div>

      {/* Pillar 2: Data Visualization */}
      <motion.div
        variants={itemFadeUp}
        className="group relative bg-white rounded-xl shadow-lg p-8 border border-slate-100 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
      >
        <div className="relative text-center">
          {/* Accent Circle/Icon Holder (Cyan Accent) */}
          <div className="w-16 h-16 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center mx-auto mb-6 shadow-md">
            <BarChart3 className="w-8 h-8" /> 
          </div>
          
          <h3 className="text-xl font-bold mb-3 text-slate-900">
            Real-Time Data Visualization
          </h3>
          <p className="text-slate-600 text-base leading-relaxed">
            Intuitive dashboard tools provide immediate, actionable insights, empowering strategic planning and rapid resource allocation decisions.
          </p>
          
          {/* Accent line for emphasis */}
          <div className="mt-6 w-10 h-1 bg-cyan-600 mx-auto rounded-full"></div>
        </div>
      </motion.div>

      {/* Pillar 3: Quality & Security */}
      <motion.div
        variants={itemFadeUp}
        className="group relative bg-white rounded-xl shadow-lg p-8 border border-slate-100 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
      >
        <div className="relative text-center">
          {/* Accent Circle/Icon Holder (Primary Blue) */}
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-6 shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          
          <h3 className="text-xl font-bold mb-3 text-slate-900">
            Certified Quality & Security
          </h3>
          <p className="text-slate-600 text-base leading-relaxed">
            Our platform is compliant with rigorous software quality and security standards, ensuring maximum reliability, integrity, and user trust.
          </p>
          
          {/* Accent line for emphasis */}
          <div className="mt-6 w-10 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>
      </motion.div>
    </motion.div>
  </div>
</section>
      <section>
        <AICSFile />
      </section>

      {/* 4. CALL TO ACTION (CTA) Banner - Blue Monochromatic Gradient */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-blue-950 to-blue-800 relative overflow-hidden">
        
        {/* Pattern overlay from AboutUs style */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(45deg, transparent 48%, white 49%, white 51%, transparent 52%)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
      </section>

      <Footer />
    </div>
  );
};

export default AboutQuickaid;