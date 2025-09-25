import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Phone, ChevronDown, ArrowRight } from "lucide-react";
import Navbar from "../../components/Navigation/Navbar";
import Footer from "../../components/Footer/Footer";
import aics from "../../assets/AICS-OFFICIAL.png";
import FinpayFeatures from "./AICSfile";


// import { GraduationCap, HeartPulse, Cross } from "lucide-react";

import { FaUserGraduate, FaUserInjured, FaCross } from "react-icons/fa";
import { motion } from "framer-motion";


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

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {/* <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors duration-200 flex items-center gap-2 group">
                  Know More
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </button> */}
                {/* <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors duration-200">
                  Learn More
                </button> */}
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>24/7 Support Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Fast Processing</span>
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
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center group hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <img src={service.icon} alt={service.title} className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
  <div className="max-w-7xl mx-auto px-4">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="text-center mb-16"
    >
      <h2 className="text-4xl lg:text-5xl font-bold mb-6">Who We Serve</h2>
      <p className="text-xl text-blue-100 max-w-3xl mx-auto">
        Our application management system is designed to assist a diverse range of
        beneficiaries in need of support.
      </p>
    </motion.div>

    <div className="grid md:grid-cols-3 gap-8">
      {/* Students */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        whileHover={{ y: -10, scale: 1.05 }}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 text-center hover:bg-white/15 transition-all duration-300"
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
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 text-center hover:bg-white/15 transition-all duration-300"
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
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 text-center hover:bg-white/15 transition-all duration-300"
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
