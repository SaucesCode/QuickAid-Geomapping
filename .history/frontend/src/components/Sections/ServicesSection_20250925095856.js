import React from 'react';
import SectionTitle from '../LandingPage/SectionTitle';
import Card from '../LandingPage/Card';
import Button from '../LandingPage/Button';
import { FaUserGraduate, FaUserInjured, FaCross } from "react-icons/fa";
import { FaBookOpen, FaUserMd } from "react-icons/fa";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description, color }) => {
  return (
    <Card className="h-full flex flex-col">
      <div className={`p-6 ${color} text-white text-center`}>
        <div className="mb-4 flex justify-center">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
      </div>
      <div className="p-6 flex-grow text-center">
        <p className="text-gray-600 mb-6">{description}</p>
        <Button variant="outline" className="mt-auto">Learn More</Button>
      </div>
    </Card>
  );
};

const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: <FaBookOpen className="h-10 w-10" />,
      title: "Educational Assistance",
      description: "Supporting students with scholarships, tuition assistance, and educational subsidies to promote access to quality education.",
      color: "bg-blue-600"
    },
    {
      icon: <FaUserMd className="h-10 w-10" />,
      title: "Medical Assistance",
      description: "Providing financial aid for treatments, hospital costs, medications, and medical procedures to support health and wellbeing.",
      color: "bg-blue-700"
    },
    {
      icon: <FaCross className="h-10 w-10" />,
      title: "Burial Assistance",
      description: "Offering support for funeral expenses to families during difficult times, helping manage costs and administrative processes.",
      color: "bg-blue-800"
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide comprehensive support through our streamlined application system.
          </p>
        </div>
        
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