
import { motion } from "framer-motion";
import LandingPage from "../../assets/AICS 2.png"; 
import React, { useState, useEffect } from "react";


import Navbar from "../../components/Navigation/Navbar";
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
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import aics from "../../assets/AICS-OFFICIAL.png";
import AICSheader from "../../assets/img9 (1).jpg";
import { Stethoscope, HeartHandshake, Cross, Info, Eye, Heart, Target, GraduationCap, Zap, Hospital, CheckCircle, Users, Clock, Sparkles, ArrowRight } from "lucide-react";





const AboutUs = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  
  return (
    <div className="min-h-screen font-sans bg-gray-50">
      <Navbar />

      <section className="relative overflow-hidden pt-20 pb-20 px-6 lg:px-10 h-[105vh] bg-cover bg-center bg-no-repeat" 
      style={{ backgroundImage: `url('${LandingPage}')` }}>
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 -z-10 bg-black/50"></div>

      <div className="relative z-10 flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-20">
        {/* Left Text Section */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl text-center lg:text-left space-y-8"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              // className="inline-block mb-4 px-4 py-1.5 bg-white/20 rounded-full border border-white/40 backdrop-blur"
            >
              
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight"> Delivering{" "} 
              <span className="relative"> 
                <span className="text-transparent text-5xl lg:text-6xl font-bold bg-clip-text bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600"> 
                  Compassionate Assistance </span> 
                  <motion.div 
                  initial={{ scaleX: 0 }} 
                  whileInView={{ scaleX: 1 }} t
                  ransition={{ delay: 0.3, duration: 0.6 }} 
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 origin-left" ></motion.div> 
                  </span> <br /> 
                  </h1>
                  <span className="block text-5xl lg:text-7xl font-bold text-red-600 leading-tight tracking-tight mt-2 "> in Times of Crisis </span>

          </div>

          {/* <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-gray-100 max-w-2xl"
          >
            The Assistance to Individuals in Crisis Situation (AICS) Program provides
            immediate and meaningful support to individuals and families facing life's
            toughest challenges.
          </motion.p> */}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            
          >
            
          </motion.div>
        </motion.div>

        {/* Right Info Cards Section */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative flex-1 min-h-[500px] lg:min-h-[600px] flex items-center justify-center"
        >
          <div className="relative w-full max-w-[450px] h-[500px]">
            {/* Floating Info Cards with enhanced design */}
            <motion.div
              initial={{ opacity: 0, y: -20, rotate: -5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              whileHover={{ y: -5, rotate: 2 }}
              transition={{ delay: 0.3 }}
              className="absolute top-12 right-0 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl px-5 py-3 text-sm text-gray-800 font-bold flex items-center gap-3 border border-white/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="p-2 bg-blue-100/80 rounded-lg flex-shrink-0">
                <Stethoscope className="text-blue-600 w-5 h-5" />
              </div>
              <span>Medical Assistance</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20, rotate: 5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              whileHover={{ y: 5, rotate: -2 }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-24 left-0 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl px-5 py-3 text-sm text-gray-800 font-bold flex items-center gap-3 border border-white/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="p-2 bg-purple-100/80 rounded-lg flex-shrink-0">
                <GraduationCap className="text-purple-600 w-5 h-5" />
              </div>
              <span>Educational Aid</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10, rotate: -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              whileHover={{ y: -2, rotate: 3 }}
              transition={{ delay: 0.5 }}
              className="absolute top-1/2 right-12 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl px-5 py-3 text-sm text-gray-800 font-bold flex items-center gap-3 border border-white/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="p-2 bg-pink-100/80 rounded-lg flex-shrink-0">
                <Cross className="text-pink-600 w-5 h-5" />
              </div>
              <span>Burial Support</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>



      {/* About AICS Program */}
<section className="py-20 bg-gradient-to-b from-white via-blue-50 to-white overflow-hidden">
  <div className="max-w-7xl mx-auto px-6 lg:px-12">
    {/* Heading */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="text-center mb-16"
    >
      <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
        About <span className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500">AICS Program</span>
      </h2>
      <p className="text-lg text-gray-600 max-w-3xl mx-auto">
        Empowering individuals and families in times of crisis through immediate and compassionate assistance.
      </p>
      <div className="mt-6 flex justify-center">
        <div className="w-20 h-1 rounded-full bg-gradient-to-r from-blue-600 to-teal-500"></div>
      </div>
    </motion.div>

    {/* Content Grid */}
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-gray-700 space-y-6 leading-relaxed"
      >
        <p className="text-lg">
          The <span className="font-semibold text-blue-600">Assistance to Individuals in Crisis Situation (AICS)</span> is a vital program dedicated to
          supporting those facing sudden hardships. It aims to provide timely intervention that helps individuals
          recover from physical, emotional, and social challenges.
        </p>
        <p className="text-lg">
          Managed by government and partner organizations, AICS offers immediate assistance covering
          essential needs such as <span className="font-semibold text-blue-600">medical aid, educational support, food,</span> and
          <span className="font-semibold text-blue-600"> burial assistance</span> — ensuring that no one faces crisis situations alone.
        </p>
      </motion.div>

      {/* Video Embed */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex justify-center"
      >
        <div className="relative w-full max-w-md aspect-video rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
          <iframe
            src="https://www.youtube.com/embed/roQntS-coN8"
            title="AICS Program Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>

          {/* Decorative Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-teal-400/10 pointer-events-none"></div>
        </div>
      </motion.div>
    </div>
  </div>
</section>

<section className="bg-white text-gray-900">
      {/* Header and Content */}
      <div className="bg-[#0A2E5C] text-white py-12 px-8 md:px-16 flex flex-col md:flex-row items-center">
        {/* Left Text */}
        <div className="md:w-1/3">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-white">
            Our Mission<br />and Vision Statement
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-200">
            This section presents the mission and vision statement of AICS,
            defining its purpose, goals, and commitment to assist individuals in
            crisis situations through efficient and compassionate service.
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
              To be a leading and trusted government program that provides
              immediate, compassionate, and effective assistance to individuals
              and families in crisis situations across the nation.
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
              To deliver timely, equitable, and people-centered crisis
              interventions through effective management, collaboration, and
              compassionate service to all Filipinos in need.
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
      {/* Key Aspects of Our Assistance */}


     <section className="relative py-40 px-4 lg:px-16 bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50/30 overflow-hidden">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[40%] -right-[20%] w-[1000px] h-[1000px] bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-[40%] -left-[20%] w-[1000px] h-[1000px] bg-gradient-to-tr from-cyan-400/20 via-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>

        {/* Grid overlay with fade */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000,transparent)]"></div>

        <div className="relative max-w-7xl mx-auto">
          {/* Premium Top Bar */}
          <div className="mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-full border border-blue-500/20 mb-6 shadow-lg">
              
              
            </div>
            
            <div className="flex flex-col items-center justify-center text-center gap-12">
  <div className="space-y-6">
    <h2 className="text-5xl lg:text-7xl font-black font-bold text-gray-900 tracking-tight leading-[0.95]">
      Key Aspects of<br />
      <span className="relative inline-block">
        <span
          className="text-5xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 animate-gradient"
          style={{ backgroundSize: "200% 200%" }}
        >
          Our Assistance
        </span>
        <div className="absolute -bottom-3 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-sm"></div>
      </span>
    </h2>
    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
      Comprehensive support tailored to your unique situation, delivered with compassion and expertise
    </p>
  </div>
</div>
          </div>

          {/* F-Pattern Content Blocks */}
          <div className="space-y-16">
            {/* Definition of Crisis */}
            <div 
              className="grid lg:grid-cols-12 gap-10 items-start group"
              onMouseEnter={() => setHoveredIndex(0)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="lg:col-span-2 relative">
                <div className="sticky top-24">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-60 transition-all duration-500"></div>
                    <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <Info className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 h-24 w-1 bg-gradient-to-b from-blue-500/50 to-transparent rounded-full"></div>
                </div>
              </div>
              
              <div className="lg:col-span-10 relative">
                <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-transparent rounded-full group-hover:w-2 transition-all duration-500"></div>
                <div className="relative bg-white/60 backdrop-blur-2xl rounded-3xl p-10 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group-hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <h3 className="text-4xl font-black font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Definition of Crisis
                      </h3>
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-blue-600">Essential</span>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                      A situation that involves diverse factors like mental distress,
                      domestic violence, homelessness, unemployment, medical
                      emergencies, or mental health issues
                    </p>
                    
                  </div>
                </div>
              </div>
            </div>

            {/* Types of Assistance */}
            <div 
              className="grid lg:grid-cols-12 gap-10 items-start group"
              onMouseEnter={() => setHoveredIndex(1)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="lg:col-span-2 relative">
                <div className="sticky top-24">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-60 transition-all duration-500"></div>
                    <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <Heart className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 h-24 w-1 bg-gradient-to-b from-purple-500/50 to-transparent rounded-full"></div>
                </div>
              </div>
              
              <div className="lg:col-span-10">
                <h3 className="text-4xl font-black font-bold text-gray-900 mb-10 group-hover:text-purple-600 transition-colors">
                  Types of Assistance
                </h3>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { icon: GraduationCap, title: 'Educational', subtitle: 'Assistance', desc: 'Support for learning and development opportunities', color: 'from-blue-500 to-cyan-500', accent: 'blue' },
                    { icon: Hospital, title: 'Medical', subtitle: 'Assistance', desc: 'Emergency healthcare support and medical aid', color: 'from-purple-500 to-pink-500', accent: 'purple' },
                    { icon: Cross, title: 'Burial', subtitle: 'Assistance', desc: 'Compassionate support for final arrangements', color: 'from-indigo-500 to-purple-500', accent: 'indigo' }
                  ].map((item, idx) => (
                    <div key={idx} className="group/card relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-3xl blur-xl opacity-0 group-hover/card:opacity-30 transition-all duration-500`}></div>
                      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/60 hover:border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-10 rounded-full blur-2xl group-hover/card:scale-150 transition-transform duration-700`}></div>
                        
                        <div className="relative">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 group-hover/card:scale-110 group-hover/card:rotate-12 transition-all duration-500 shadow-lg`}>
                            <item.icon className="w-7 h-7 text-white" />
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-2xl font-black text-gray-900 leading-tight">{item.title}</h4>
                            <h4 className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${item.color} leading-tight`}>{item.subtitle}</h4>
                          </div>
                          
                          <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            {item.desc}
                          </p>
                          
                          <div className={`h-1 bg-gradient-to-r ${item.color} rounded-full w-0 group-hover/card:w-full transition-all duration-700`}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Our Goals */}
            <div 
              className="grid lg:grid-cols-12 gap-10 items-start group"
              onMouseEnter={() => setHoveredIndex(2)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="lg:col-span-2 relative">
                <div className="sticky top-24">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-60 transition-all duration-500"></div>
                    <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <Target className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-10 relative">
                <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-transparent rounded-full group-hover:w-2 transition-all duration-500"></div>
                <div className="relative bg-white/60 backdrop-blur-2xl rounded-3xl p-10 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group-hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    <h3 className="text-4xl font-black font-bold text-gray-900 mb-10 group-hover:text-emerald-600 transition-colors">
                      Our Goals
                    </h3>
                    
                    <div className="space-y-6">
                      {[
                        { text: 'Ensure immediate safety and stability', detail: 'Providing rapid response to urgent crisis situations', number: '01' },
                        { text: 'Prevent crisis escalation', detail: 'Early intervention and proactive support measures', number: '02' },
                        { text: 'Connect with long-term support', detail: 'Building sustainable pathways to recovery and wellbeing', number: '03' }
                      ].map((goal, idx) => (
                        <div key={idx} className="group/item flex items-start gap-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-50/50 to-transparent hover:from-emerald-50 transition-all">
                          <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-lg opacity-0 group-hover/item:opacity-40 transition-opacity"></div>
                            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg group-hover/item:scale-125 group-hover/item:rotate-12 transition-all">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-black text-2xl text-gray-900 group-hover/item:text-emerald-600 transition-colors">
                                {goal.text}
                              </div>
                              <span className="text-5xl font-black text-emerald-100 group-hover/item:text-emerald-200 transition-colors">
                                {goal.number}
                              </span>
                            </div>
                            <div className="text-gray-600 leading-relaxed">{goal.detail}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Impact Section - Dark Premium */}
      <section className="relative py-40 px-4 lg:px-16 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 overflow-hidden">
        {/* Premium animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-blue-600/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-gradient-to-tr from-purple-600/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Starfield effect */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Premium header */}
          <div className="mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 mb-6 shadow-lg">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300 tracking-widest uppercase">Making a Difference</span>
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 animate-pulse"></div>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
              <div className="flex-1">
                <h2 className="text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95] mb-6">
                  Our Impact
                </h2>
                <p className="text-xl text-blue-100/70 max-w-2xl leading-relaxed font-light">
                  Creating meaningful change in communities through dedicated service and unwavering commitment
                </p>
              </div>
            </div>
          </div>

          {/* Impact cards with stats */}
          <div className="space-y-8">
            {[
              { icon: Users, title: 'Communities Served', desc: 'Supporting diverse communities across the region with culturally sensitive and accessible assistance programs', stat: '15,000+', label: 'Families Helped', color: 'from-blue-500 to-cyan-500' },
              { icon: Clock, title: 'Quick Response', desc: 'Immediate assistance when it matters most, with 24/7 availability and rapid deployment capabilities', stat: '< 24hrs', label: 'Average Response', color: 'from-purple-500 to-pink-500' },
              { icon: Heart, title: 'Compassionate Care', desc: 'Dedicated to providing empathetic support with trained professionals who understand your needs', stat: '100%', label: 'Satisfaction Rate', color: 'from-emerald-500 to-teal-500' }
            ].map((item, idx) => (
              <div key={idx} className="grid lg:grid-cols-12 gap-8 items-center group">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition-all duration-500`}></div>
                    <div className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <item.icon className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-7 relative">
                  <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-white/30 to-transparent rounded-full"></div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 group-hover:bg-white/15 group-hover:border-white/30 transition-all duration-500 overflow-hidden">
                    <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-500`}></div>
                    <div className="relative">
                      <h3 className="text-3xl font-black mb-4 text-white group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-blue-100/70 leading-relaxed text-lg">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-3 text-center lg:text-right">
                  <div className={`text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${item.color} mb-2 leading-none`}>
                    {item.stat}
                  </div>
                  <div className="text-blue-200/60 font-bold uppercase text-sm tracking-wider">
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient {
            animation: gradient 3s ease infinite;
          }
        `}</style>
      </section>

     

      {/* Contact & Location */}
<section className="py-32 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 relative overflow-hidden">
  {/* Animated background elements */}
  <div className="absolute inset-0">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
  </div>
  
  <div className="max-w-7xl mx-auto px-6 relative z-10">
    {/* Section Title */}
    <div className="text-center mb-20">
      <div className="inline-flex items-center gap-3 bg-blue-500/10 backdrop-blur-md border border-blue-400/30 px-8 py-3 rounded-full mb-8 shadow-lg shadow-blue-500/20">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <span className="text-blue-300 font-bold text-sm tracking-widest uppercase">Contact Information</span>
      </div>
      <h2 className="text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
        Get In <span className="text-6xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500">Touch</span>
      </h2>
      <p className="text-blue-200/80 text-xl max-w-3xl mx-auto leading-relaxed">
        We're here to assist you. Reach out or visit us at our location
      </p>
    </div>

    <div className="grid lg:grid-cols-2 gap-10 items-start">
      {/* Contact Info */}
      <div className="space-y-6">
        {/* Address Card */}
        <div className="group relative bg-gradient-to-br from-blue-800/40 to-blue-900/40 backdrop-blur-xl rounded-3xl p-10 border border-blue-400/20 hover:border-blue-400/60 transition-all duration-500 shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-cyan-500/0 to-blue-600/0 group-hover:from-blue-500/10 group-hover:via-cyan-500/5 group-hover:to-blue-600/10 rounded-3xl transition-all duration-500"></div>
          <div className="relative flex items-start gap-6">
            <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/60 group-hover:shadow-blue-400/80 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <FaMapMarkerAlt className="text-3xl text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">Address</h3>
              <p className="text-blue-100/90 text-lg leading-relaxed">
                DSWD Central Office<br />
                Batasan Hills<br />
                Quezon City, Philippines
              </p>
            </div>
          </div>
        </div>

        {/* Phone Card */}
        <div className="group relative bg-gradient-to-br from-blue-800/40 to-blue-900/40 backdrop-blur-xl rounded-3xl p-10 border border-blue-400/20 hover:border-blue-400/60 transition-all duration-500 shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-cyan-500/0 to-blue-600/0 group-hover:from-blue-500/10 group-hover:via-cyan-500/5 group-hover:to-blue-600/10 rounded-3xl transition-all duration-500"></div>
          <div className="relative flex items-start gap-6">
            <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/60 group-hover:shadow-cyan-400/80 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
              <FaPhoneAlt className="text-3xl text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">Phone</h3>
              <p className="text-blue-100/90 text-xl font-semibold">+63 2 8931 8101</p>
            </div>
          </div>
        </div>

        {/* Email Card */}
        <div className="group relative bg-gradient-to-br from-blue-800/40 to-blue-900/40 backdrop-blur-xl rounded-3xl p-10 border border-blue-400/20 hover:border-blue-400/60 transition-all duration-500 shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-cyan-500/0 to-blue-600/0 group-hover:from-blue-500/10 group-hover:via-cyan-500/5 group-hover:to-blue-600/10 rounded-3xl transition-all duration-500"></div>
          <div className="relative flex items-start gap-6">
            <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/60 group-hover:shadow-blue-400/80 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <FaEnvelope className="text-3xl text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">Email</h3>
              <p className="text-blue-100/90 text-xl font-semibold">aics@dswd.gov.ph</p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Map with Pin */}
      <div className="lg:sticky lg:top-8">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>
          <div className="relative rounded-3xl overflow-hidden border-4 border-blue-400/30 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-transparent to-cyan-400/10 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <iframe
              src="https://www.google.com/maps?q=13.936812,121.616434&z=15&output=embed"
              width="100%"
              height="650"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="DSWD Location - Pinpointed"
              className="brightness-110 contrast-110"
            ></iframe>
          </div>
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
