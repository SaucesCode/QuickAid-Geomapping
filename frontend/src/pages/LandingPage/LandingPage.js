import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Phone, ChevronDown, ArrowRight, Users,FileText,CheckCircle } from "lucide-react";
import Navbar from "../../components/Navigation/Navbar";
import Footer from "../../components/Footer/Footer";
import aics from "../../assets/AICS-OFFICIAL.png";
import FinpayFeatures from "./AICSfile";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import HowToApply from "./How2apply";



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
                className="relative z-10 w-auto mx-auto rounded-2xl shadow-2xl object-contain"
                style={{ width: 320 }}
              />
            </motion.div>
          </div>
        </div>
      </section>

                  {/* Program Objective Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              PROGRAM'S <span className="text-blue-600 text-4xl lg:text-5xl font-bold">OBJECTIVE</span>
            </h2>

            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              The objective of the AICS Program is to provide support to individuals and families 
              experiencing crises, ensuring that their immediate and essential needs are adequately addressed.
            </p>
          </motion.div>
        </div>
      </section>


      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-4">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="text-center mb-16"
    >
      <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
        Our <span className="text-blue-600 text-4xl lg:text-5xl">Services</span>
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        We provide comprehensive assistance programs designed to help individuals and
        families overcome crisis situations.
      </p>
    </motion.div>

    <div className="grid md:grid-cols-3 gap-8">
      {/* Educational Assistance */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        whileHover={{ y: -10, scale: 1.05 }}
        className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center hover:shadow-2xl transition-all duration-300"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white">
          <FaBookOpen className="text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Educational Assistance</h3>
        <p className="text-gray-600">Support for tuition and school supplies</p>
      </motion.div>

      {/* Medical Assistance */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        whileHover={{ y: -10, scale: 1.05 }}
        className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center hover:shadow-2xl transition-all duration-300"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center text-white">
          <FaUserMd className="text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Medical Assistance</h3>
        <p className="text-gray-600">Healthcare and medical expenses coverage</p>
      </motion.div>

      {/* Burial Assistance */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
        whileHover={{ y: -10, scale: 1.05 }}
        className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center hover:shadow-2xl transition-all duration-300"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white">
          <FaCross className="text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Burial Assistance</h3>
        <p className="text-gray-600">Funeral and burial service support</p>
      </motion.div>
    </div>
  </div>
</section>
      {/* Who We Serve Section */}
      <section className="py-40 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
  <div className="max-w-7xl mx-auto px-4">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="text-center mb-20"
    >
      <h2 className="text-4xl lg:text-5xl font-bold mb-6">Who We Serve</h2>
      <p className="text-xl text-blue-100 max-w-3xl mx-auto">
        Our application management system is designed to assist a diverse range of
        beneficiaries in need of support.
      </p>
    </motion.div>

    <div className="grid md:grid-cols-3 gap-10">
      {/* Students */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        whileHover={{ y: -10, scale: 1.05 }}
        className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl border border-white/20 text-center hover:bg-white/15 transition-all duration-300"
      >
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-white/20 rounded-full">
          <FaUserGraduate className="text-4xl text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Students</h3>
        <p className="text-blue-100 leading-relaxed">
          Individuals who are currently enrolled in educational institutions and
          require financial assistance for their studies.
        </p>
      </motion.div>

      {/* Patients */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        whileHover={{ y: -10, scale: 1.05 }}
        className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl border border-white/20 text-center hover:bg-white/15 transition-all duration-300"
      >
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-white/20 rounded-full">
          <FaUserInjured className="text-4xl text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Patients</h3>
        <p className="text-blue-100 leading-relaxed">
          Individuals who are currently undergoing medical treatment and need
          financial support.
        </p>
      </motion.div>

      {/* Burial Services */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
        whileHover={{ y: -10, scale: 1.05 }}
        className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl border border-white/20 text-center hover:bg-white/15 transition-all duration-300"
      >
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-white/20 rounded-full">
          <FaCross className="text-4xl text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Burial Services</h3>
        <p className="text-blue-100 leading-relaxed">
          Individuals who require assistance with burial or funeral services for
          their loved ones.
        </p>
      </motion.div>
    </div>
  </div>
</section>
<section>
  <HowToApply />

</section>
            <section className="bg-gray-50 py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          How to Apply for <span className="text-blue-600 text-3xl md:text-4xl font-bold">AICS</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          Follow these simple steps to apply for the DSWD’s Assistance to Individuals in Crisis Situation (AICS) program.
        </p>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <FileText className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Step 1: Prepare Requirements</h3>
            <p className="text-gray-600 text-sm mt-2">
              Bring a valid government ID and supporting documents (medical, burial, education, or crisis-related).
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <Users className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Step 2: Visit the Nearest DSWD Office</h3>
            <p className="text-gray-600 text-sm mt-2">
              Go to the nearest DSWD Field Office or satellite center and line up for assessment.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="w-10 h-10 text-teal-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Step 3: Assessment & Assistance</h3>
            <p className="text-gray-600 text-sm mt-2">
              A social worker will review your documents. Once approved, assistance will be released immediately.
            </p>
          </div>
        </div>
      </div>
    </section>

      <section>
  <FinpayFeatures />
</section>


            {/* Mission Stats Section */}
      <section className="bg-gray-10 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header Section */}
          <div className="mb-16">
            <p className="text-blue-500 text-xl font-bold tracking-wider uppercase mb-4">
              OUR MISSION
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              We help<br />
              those who seek help
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Thousands of individuals and families in crisis<br />
              have received assistance, relief, and hope through AICS.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {/* Stat 1 */}
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">50K+</div>
              <p className="text-gray-600 text-lg font-medium">Beneficiaries served</p>
            </div>

            {/* Stat 2 */}
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">₱120M+</div>
              <p className="text-gray-600 text-lg font-medium">Financial aid released</p>
            </div>

            {/* Stat 3 */}
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">15+</div>
              <p className="text-gray-600 text-lg font-medium">Years of service</p>
            </div>
          </div>
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
