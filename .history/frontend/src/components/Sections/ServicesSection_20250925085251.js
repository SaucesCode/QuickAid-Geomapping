import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, HeartPulse, Users } from 'lucide-react';
import Button from '../LandingPage/Button';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -10, scale: 1.03 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col"
    >
      {/* Icon + Title */}
      <div className={`p-8 ${color} text-white text-center`}>
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <h3 className="text-2xl font-bold">{title}</h3>
      </div>

      {/* Description + Button */}
      <div className="p-6 flex-grow text-center flex flex-col">
        <p className="text-gray-600 mb-6">{description}</p>
        <Button variant="outline" className="mt-auto w-full">
          fuck
        </Button>
      </div>
    </motion.div>
  );
};

const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: <GraduationCap className="h-10 w-10" strokeWidth={2.5} />,
      title: 'Educational Assistance',
      description:
        'Supporting students with scholarships, tuition assistance, and educational subsidies to promote access to quality education.',
      color: 'bg-blue-600',
    },
    {
      icon: <HeartPulse className="h-10 w-10" strokeWidth={2.5} />,
      title: 'Medical Assistance',
      description:
        'Providing financial aid for treatments, hospital costs, medications, and medical procedures to support health and wellbeing.',
      color: 'bg-blue-700',
    },
    {
      icon: <Users className="h-10 w-10" strokeWidth={2.5} />,
      title: 'Burial Assistance',
      description:
        'Offering support for funeral expenses to families during difficult times, helping manage costs and administrative processes.',
      color: 'bg-blue-800',
    },
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="text-blue-600">Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide comprehensive support through our streamlined application system.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              color={service.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
