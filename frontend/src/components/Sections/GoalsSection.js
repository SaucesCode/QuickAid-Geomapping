import React from 'react';
import SectionTitle from '../LandingPage/SectionTitle';
import { Target, Zap, CheckCircle, MessageCircle, RefreshCw } from 'lucide-react';

interface GoalCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const GoalCard: React.FC<GoalCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start">
        <div className="mr-4 text-blue-600">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-xl mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
};

const GoalsSection: React.FC = () => {
  const goals = [
    {
      icon: <Target className="h-7 w-7" />,
      title: "Streamline Application Processes",
      description: "Transform complex application workflows into intuitive, user-friendly experiences."
    },
    {
      icon: <Zap className="h-7 w-7" />,
      title: "Accelerate Processing",
      description: "Reduce application processing time from weeks to days through automation."
    },
    {
      icon: <CheckCircle className="h-7 w-7" />,
      title: "Minimize Errors",
      description: "Improve data accuracy with validation checks and structured data collection."
    },
    {
      icon: <MessageCircle className="h-7 w-7" />,
      title: "Improve Communication",
      description: "Enable seamless information sharing and status updates across departments."
    },
    {
      icon: <RefreshCw className="h-7 w-7" />,
      title: "Automate Cross-Matching",
      description: "Implement intelligent verification systems to identify duplicates and ensure eligibility."
    }
  ];

  return (
    <section id="goals" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Goals</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to transforming application management through these key objectives.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal, index) => (
            <GoalCard
              key={index}
              icon={goal.icon}
              title={goal.title}
              description={goal.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoalsSection;