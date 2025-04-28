import React from 'react';
import { FileText, User, GraduationCap, Users } from 'lucide-react';

interface BeneficiaryCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const BeneficiaryCard: React.FC<BeneficiaryCardProps> = ({ icon, title, description }) => {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 max-w-xs mx-auto">{description}</p>
    </div>
  );
};

const BeneficiariesSection: React.FC = () => {
  const beneficiaries = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Applicants",
      description: "Individuals seeking various forms of assistance through our streamlined application system."
    },
    {
      icon: <User className="h-8 w-8" />,
      title: "Patients",
      description: "Those requiring medical assistance for treatments, procedures, and healthcare services."
    },
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: "Students",
      description: "Learners of all ages seeking educational support, scholarships, and academic resources."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Parents/Guardians",
      description: "Family members applying on behalf of dependents for various support programs."
    }
  ];

  return (
    <section id="beneficiaries" className="py-20 bg-blue-600 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Who We Serve</h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Our application management system is designed to assist a diverse range of beneficiaries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {beneficiaries.map((beneficiary, index) => (
            <BeneficiaryCard
              key={index}
              icon={beneficiary.icon}
              title={beneficiary.title}
              description={beneficiary.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeneficiariesSection;
