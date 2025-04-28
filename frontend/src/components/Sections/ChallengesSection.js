import React from 'react';
import { Clock, FileText, AlertCircle, MessageSquare, Search } from 'lucide-react';

interface ChallengeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="p-3 bg-blue-100 rounded-full mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-center">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  );
};

const ChallengesSection: React.FC = () => {
  const challenges = [
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Long Queues and Waiting Times",
      description: "Applicants face frustratingly long waiting periods and unpredictable processing times."
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Time-Consuming Application Process",
      description: "Complex paper forms and repetitive information collection slow down the entire workflow."
    },
    {
      icon: <AlertCircle className="h-8 w-8" />,
      title: "Heavy Encoding Workload",
      description: "Manual data entry leads to human errors and inefficient resource allocation."
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Miscommunication Among Team Members",
      description: "Information gaps between departments cause delays and confusion."
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "Manual Cross-Matching",
      description: "Inefficient verification processes impact the quality and speed of service delivery."
    }
  ];

  return (
    <section id="challenges" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The Challenges We Aim to Solve</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our system addresses key pain points in the traditional application management process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {challenges.map((challenge, index) => (
            <ChallengeCard
              key={index}
              icon={challenge.icon}
              title={challenge.title}
              description={challenge.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChallengesSection;