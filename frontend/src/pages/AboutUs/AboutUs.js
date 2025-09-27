import React from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/Navigation/Navbar";
import {FaPhoneAlt} from "react-icons/fa";
import Footer from "../../components/Footer/Footer";
import {
  FaHandsHelping,
  FaInfoCircle,
  FaHandHoldingHeart,
  FaGraduationCap,
  FaHospital,
  FaCross,
  FaBullseye,
  FaCheckCircle,
  FaUsers,
  FaClock,
  FaHeart,
  FaFileAlt,
  FaUserCheck,
  FaGift,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import aics from "../../assets/AICS-OFFICIAL.png";

const AboutUs = () => {
  return (
    <div className="min-h-screen font-sans bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="pt-40 pb-24 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 flex flex-col lg:flex-row items-center justify-between px-4 lg:px-16">
        <div className="text-center lg:text-left max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl lg:text-7xl font-bold text-white leading-tight"
          >
            Assistance to Individuals in{" "}
            <span className="inline-block text-5xl lg:text-7xl bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
              Crisis Situation
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg lg:text-xl text-blue-100"
          >
            Supporting communities through immediate and compassionate aid
          </motion.p>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 lg:mt-0"
        >
          <img
            src={aics}
            alt="AICS Logo"
            className="w-64 lg:w-80 mx-auto lg:mx-0"
          />
        </motion.div>
      </section>

      {/* About AICS Program */}
      <section className="py-16 px-4 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-200"></div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                About AICS Program
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-200"></div>
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 text-gray-700 space-y-4">
              <p>
                Assistance to individuals in crisis refers to the support
                provided to people experiencing a sudden, unexpected, or
                overwhelming situation that requires immediate attention and
                help to overcome their physical, emotional, and social needs.
              </p>
              <p>
                This kind of assistance is typically provided by government
                agencies, non-profits, or community organizations and includes
                immediate intervention, which has high priority in identifying
                the individual and addressing urgent needs.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="w-48 h-48 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white text-6xl shadow-lg">
                <FaHandsHelping />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Aspects */}
      <section className="py-16 px-4 lg:px-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-200"></div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Key Aspects of Our Assistance
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-200"></div>
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Definition of Crisis */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white rounded-2xl shadow-lg p-8 border"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white flex items-center justify-center mb-4">
                <FaInfoCircle />
              </div>
              <h3 className="text-xl font-bold mb-2">Definition of Crisis</h3>
              <p className="text-gray-700 text-sm lg:text-base">
                A situation that involves diverse factors like mental distress,
                domestic violence, homelessness, unemployment, medical
                emergencies, or mental health issues
              </p>
            </motion.div>

            {/* Types of Assistance */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white rounded-2xl shadow-lg p-8 border"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white flex items-center justify-center mb-4">
                <FaHandHoldingHeart />
              </div>
              <h3 className="text-xl font-bold mb-4">Types of Assistance</h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center gap-2">
                  <FaGraduationCap className="text-blue-500" /> Educational
                  Assistance
                </div>
                <div className="flex items-center gap-2">
                  <FaHospital className="text-blue-500" /> Medical Assistance
                </div>
                <div className="flex items-center gap-2">
                  <FaCross className="text-blue-500" /> Burial Assistance
                </div>
              </div>
            </motion.div>

            {/* Our Goals */}
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white rounded-2xl shadow-lg p-8 border"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white flex items-center justify-center mb-4">
                <FaBullseye />
              </div>
              <h3 className="text-xl font-bold mb-4">Our Goals</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-blue-500" /> Ensure immediate
                  safety and stability
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-blue-500" /> Prevent crisis
                  escalation
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-blue-500" /> Connect with
                  long-term support
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Impact */}
      <section className="py-16 px-4 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-200"></div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Our Impact
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-200"></div>
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white rounded-2xl shadow-lg p-8 border text-center"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white flex items-center justify-center mx-auto mb-4">
                <FaUsers />
              </div>
              <h3 className="text-xl font-bold mb-2">Communities Served</h3>
              <p className="text-gray-700 text-sm lg:text-base">
                Supporting diverse communities across the region
              </p>
            </motion.div>
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white rounded-2xl shadow-lg p-8 border text-center"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white flex items-center justify-center mx-auto mb-4">
                <FaClock />
              </div>
              <h3 className="text-xl font-bold mb-2">Quick Response</h3>
              <p className="text-gray-700 text-sm lg:text-base">
                Immediate assistance when it matters most
              </p>
            </motion.div>
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white rounded-2xl shadow-lg p-8 border text-center"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white flex items-center justify-center mx-auto mb-4">
                <FaHeart />
              </div>
              <h3 className="text-xl font-bold mb-2">Compassionate Care</h3>
              <p className="text-gray-700 text-sm lg:text-base">
                Dedicated to providing empathetic support
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl mb-6">
                <FaFileAlt />
              </div>
              <h3 className="text-xl font-semibold mb-4">Step 1</h3>
              <p className="text-gray-700">
                Visit your nearest DSWD office and present valid ID with
                supporting documents.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl mb-6">
                <FaUserCheck />
              </div>
              <h3 className="text-xl font-semibold mb-4">Step 2</h3>
              <p className="text-gray-700">
                Our staff will evaluate your request and verify eligibility for
                the right type of support.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl mb-6">
                <FaGift />
              </div>
              <h3 className="text-xl font-semibold mb-4">Step 3</h3>
              <p className="text-gray-700">
                Receive immediate assistance such as food, medical, or transport
                support tailored to your needs.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Testimonials / Success Stories
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -6 }}
              className="p-6 bg-gray-50 rounded-xl shadow"
            >
              <p className="text-gray-700 italic">
                "AICS helped me pay for my child’s medical treatment. I am
                forever grateful."
              </p>
              <h4 className="mt-4 font-bold text-blue-600">– Maria, Mother</h4>
            </motion.div>
            <motion.div
              whileHover={{ y: -6 }}
              className="p-6 bg-gray-50 rounded-xl shadow"
            >
              <p className="text-gray-700 italic">
                "Through the educational assistance, I was able to finish my
                studies."
              </p>
              <h4 className="mt-4 font-bold text-blue-600">– John, Student</h4>
            </motion.div>
            <motion.div
              whileHover={{ y: -6 }}
              className="p-6 bg-gray-50 rounded-xl shadow"
            >
              <p className="text-gray-700 italic">
                "During our hardest times, AICS gave us immediate support."
              </p>
              <h4 className="mt-4 font-bold text-blue-600">– Ana, Beneficiary</h4>
            </motion.div>
          </div>
        </div>
      </section>
      
     

                  {/* Contact & Location Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Contact & Location
            </h2>
            <p className="text-gray-600 mt-3">
              Get in touch with us or visit our office
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Contact Info */}
            <div className="bg-gray-50 rounded-2xl shadow-lg p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Address</h3>
                  <p className="text-gray-600">
                    DSWD Central Office, Batasan Hills, <br />
                    Quezon City, Philippines
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow">
                  <i className="fas fa-phone-alt"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Phone</h3>
                  <p className="text-gray-600">+63 2 8931 8101</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow">
                  <i className="fas fa-envelope"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Email</h3>
                  <p className="text-gray-600">aics@dswd.gov.ph</p>
                </div>
              </div>
            </div>

            {/* Google Map */}
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.721540986481!2d121.07363437492914!3d14.685401875010888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b7e42b20d8a3%3A0x2b21c2f17720e6a0!2sDSWD%20Central%20Office!5e0!3m2!1sen!2sph!4v1695555555555!5m2!1sen!2sph"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="DSWD AICS Map"
              ></iframe>
            </div>
          </div>
        </div>
      </section>


      {/* Contact & Location Section */}
<section className="py-20 bg-white">
  <div className="max-w-6xl mx-auto px-6">
    {/* Section Title */}
    <div className="text-center mb-12">
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
        Contact & Location
      </h2>
      <p className="text-gray-600 mt-3">
        Get in touch with us or visit our office
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-10 items-center">
      {/* Contact Info */}
      <div className="bg-gray-50 rounded-2xl shadow-lg p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow">
            <FaMapMarkerAlt className="text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Address</h3>
            <p className="text-gray-600">
              DSWD Central Office, Batasan Hills, <br />
              Quezon City, Philippines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow">
            <FaPhoneAlt className="text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Phone</h3>
            <p className="text-gray-600">+63 2 8931 8101</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow">
            <FaEnvelope className="text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Email</h3>
            <p className="text-gray-600">aics@dswd.gov.ph</p>
          </div>
        </div>
      </div>

      {/* Google Map */}
      <div className="rounded-2xl overflow-hidden shadow-lg relative">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.721540986481!2d121.07363437492914!3d14.685401875010888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b7e42b20d8a3%3A0x2b21c2f17720e6a0!2sDSWD%20Central%20Office!5e0!3m2!1sen!2sph!4v1695555555555!5m2!1sen!2sph"
          width="100%"
          height="350"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="DSWD AICS Map"
        ></iframe>
        {/* Pin Icon Overlay (optional aesthetic touch) */}
        <div className="absolute top-4 right-4 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
          <FaMapMarkerAlt />
        </div>
      </div>
    </div>
  </div>
</section>{/* Contact & Location Section */}
<section className="py-20 bg-white">
  <div className="max-w-6xl mx-auto px-6">
    {/* Section Title */}
    <div className="text-center mb-12">
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
        Contact & Location
      </h2>
      <p className="text-gray-600 mt-3">
        Get in touch with us or visit our office
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-10 items-center">
      {/* Contact Info */}
      <div className="bg-gray-50 rounded-2xl shadow-lg p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow">
            <FaMapMarkerAlt className="text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Address</h3>
            <p className="text-gray-600">
              DSWD Central Office, Batasan Hills, <br />
              Quezon City, Philippines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow">
            <FaPhoneAlt className="text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Phone</h3>
            <p className="text-gray-600">+63 2 8931 8101</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow">
            <FaEnvelope className="text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Email</h3>
            <p className="text-gray-600">aics@dswd.gov.ph</p>
          </div>
        </div>
      </div>

      {/* Google Map */}
      <div className="rounded-2xl overflow-hidden shadow-lg relative">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.721540986481!2d121.07363437492914!3d14.685401875010888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b7e42b20d8a3%3A0x2b21c2f17720e6a0!2sDSWD%20Central%20Office!5e0!3m2!1sen!2sph!4v1695555555555!5m2!1sen!2sph"
          width="100%"
          height="350"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="DSWD AICS Map"
        ></iframe>
        {/* Pin Icon Overlay (optional aesthetic touch) */}
        <div className="absolute top-4 right-4 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
          <FaMapMarkerAlt />
        </div>
      </div>
    </div>
  </div>
</section>





      <Footer />
    </div>
  );
};

export default AboutUs;
