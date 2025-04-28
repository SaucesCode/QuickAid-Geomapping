import React from 'react';
import SectionTitle from '../LandingPage/SectionTitle';
import { UserPlus, Timer, BarChart3 } from 'lucide-react';

interface ImpactCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  stat: string;
}

const ImpactCard: React.FC<ImpactCardProps> = ({ icon, title, description, stat }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="inline-block text-blue-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="text-4xl font-bold text-blue-600">{stat}</div>
    </div>
  );
};

const MissionSection: React.FC = () => {
  const impacts = [
    {
      icon: <UserPlus className="h-10 w-10" />,
      title: "Improve Beneficiary Experience",
      description: "Simpler application processes and faster approvals lead to higher satisfaction rates.",
      stat: "95%"
    },
    {
      icon: <Timer className="h-10 w-10" />,
      title: "Enhance Staff Productivity",
      description: "Automation reduces manual tasks, allowing staff to focus on service delivery.",
      stat: "3x"
    },
    {
      icon: <BarChart3 className="h-10 w-10" />,
      title: "Smarter Resource Allocation",
      description: "Data-driven insights enable optimal distribution of resources where they're needed most.",
      stat: "40%"
    }
  ];

  return (
    <section id="mission" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle 
          title="Why AMS Matters" 
          subtitle="Our system creates meaningful impact across the entire application ecosystem."
          center={true}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {impacts.map((impact, index) => (
            <ImpactCard
              key={index}
              icon={impact.icon}
              title={impact.title}
              description={impact.description}
              stat={impact.stat}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionSection;