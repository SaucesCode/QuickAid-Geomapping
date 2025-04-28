import React, { useState } from 'react';
import Button from "../LandingPage/Button";
import Modal from "../LandingPage/Modal";

const HeroSection: React.FC = () => {
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);

  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-blue-50 rounded-bl-[100px]"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-12 mb-10 md:mb-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Revolutionizing Beneficiary Application Management
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Faster processing. Smarter workflows. Better service delivery.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="large" onClick={() => setIsGetStartedOpen(true)}>Get Started</Button>
              <Button variant="outline" size="large" onClick={() => setIsLearnMoreOpen(true)}>Learn More</Button>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full opacity-60"></div>
              <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-blue-100 rounded-full opacity-60"></div>
              <img 
                src="https://images.pexels.com/photos/6893825/pexels-photo-6893825.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" 
                alt="Application Management System" 
                className="relative z-10 w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Get Started Modal */}
      <Modal
        isOpen={isGetStartedOpen}
        onClose={() => setIsGetStartedOpen(false)}
        title="Get Started with AMS"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            To get started with our Application Management System, please fill out the following information:
          </p>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Organization Name</label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your organization name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                id="phone"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
            </div>
            <Button className="w-full">Submit Request</Button>
          </form>
        </div>
      </Modal>

      {/* Learn More Modal */}
      <Modal
        isOpen={isLearnMoreOpen}
        onClose={() => setIsLearnMoreOpen(false)}
        title="Learn More About AMS"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-lg text-gray-900">Streamlined Application Process</h4>
            <p className="text-gray-600">Our system simplifies the entire application workflow, from submission to approval.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-lg text-gray-900">Efficient Processing</h4>
            <p className="text-gray-600">Automated workflows reduce processing time from weeks to days.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-lg text-gray-900">Real-time Updates</h4>
            <p className="text-gray-600">Track application status and receive instant notifications on progress.</p>
          </div>
          <div className="mt-6">
            <Button className="w-full" onClick={() => {
              setIsLearnMoreOpen(false);
              setIsGetStartedOpen(true);
            }}>
              Get Started Now
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default HeroSection;