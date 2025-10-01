import React from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/Navigation/Navbar";
import Footer from "../../components/Footer/Footer";

// Lucide icons
import { Target, Eye, Database, BarChart3, ShieldCheck } from "lucide-react";

const AboutQuickaid = () => {
  return (
    <div className="min-h-screen font-sans bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-56 pb-20 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-6xl font-bold text-white"
          >
            What is{" "}
            <span className="text-blue-400 text-4xl lg:text-6xl">
              QUICKAID
            </span>
            ?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto"
          >
            QUICKAID streamlines the AICS application process with a secure and
            user-friendly platform for applicants and administrators.
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-8 border"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                QUICKAID aims to empower communities in crisis by delivering a
                fast, transparent, and accessible digital platform for
                government aid application and management. Through innovation
                and automation, it reduces processing time, eliminates redundant
                tasks, and improves the quality of public service delivery.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8 border"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To become a pioneering digital solution in public welfare
                service management, enabling programs like AICS to operate with
                integrity, efficiency, and compassion while promoting
                data-driven decisions for inclusive and resilient communities.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Centralized Storage */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-2xl shadow-lg p-8 border"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Centralized Storage</h3>
              <p className="text-gray-700">
                Automated data management for efficient storage and retrieval.
              </p>
            </motion.div>

            {/* Data Visualization */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-2xl shadow-lg p-8 border"
            >
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Data Visualization</h3>
              <p className="text-gray-700">
                Advanced tools to support decision-making and service delivery.
              </p>
            </motion.div>

            {/* ISO Standards */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-2xl shadow-lg p-8 border"
            >
              <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">ISO Standards</h3>
              <p className="text-gray-700">
                Compliant with ISO/IEC 25010:2017 quality standards.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* System Description */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-8 border"
          >
            <p className="text-gray-700 leading-relaxed">
              The system incorporates automated centralized storage, application
              history tracking, and data visualization tools to support
              decision-making and service delivery. By using PostgreSQL and
              implementing ISO/IEC 25010:2017 software quality standards,
              QUICKAID ensures accuracy, data integrity, and performance
              reliability.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutQuickaid;
