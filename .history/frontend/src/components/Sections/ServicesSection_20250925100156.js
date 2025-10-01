import React from "react";
import { motion } from "framer-motion";
import { FaBookOpen, FaUserMd, FaCross } from "react-icons/fa";

const ServicesSection: React.FC = () => {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="text-blue-600">Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide comprehensive assistance programs designed to help individuals and
            families overcome crisis situations.
          </p>
        </motion.div>

        {/* Services Grid */}
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
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-md">
              <FaBookOpen className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Educational Assistance</h3>
            <p className="text-gray-600">
              Supporting students with scholarships, tuition assistance, and school supplies.
            </p>
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
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md">
              <FaUserMd className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Medical Assistance</h3>
            <p className="text-gray-600">
              Providing healthcare support and coverage for medical expenses.
            </p>
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
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-md">
              <FaCross className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Burial Assistance</h3>
            <p className="text-gray-600">
              Offering financial support for funeral and burial expenses during difficult times.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
