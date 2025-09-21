import React from 'react';
import { BookOpenIcon, LoginIcon, UsersIcon } from '../components/Icons';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-slate-50 -m-4 sm:-m-6 lg:-m-8">
      {/* Hero Section */}
      <div className="relative bg-slate-800 pt-20 pb-24 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1742&q=80" 
            alt="Students learning" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
              Dr. APJ Abdul Kalam Educational Institute
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-3xl mx-auto">
              Empowering the next generation with quality education and practical skills through our state-of-the-art online learning platform.
            </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-12 sm:py-16 -mt-16 sm:-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ActionCard 
                icon={<BookOpenIcon className="h-8 w-8 text-sky-500"/>}
                bgColor="bg-sky-100"
                title="Student Portal"
                description="Access your courses, watch video lectures, and continue your learning journey."
                buttonText="Go to Courses"
                buttonColor="text-sky-600 group-hover:text-sky-700"
                onClick={() => onNavigate('#courses')}
              />
              <ActionCard 
                icon={<UsersIcon className="h-8 w-8 text-teal-500"/>}
                bgColor="bg-teal-100"
                title="Login / Sign Up"
                description="Create an account or log in to track your progress and manage your profile."
                buttonText="Access Your Account"
                buttonColor="text-teal-600 group-hover:text-teal-700"
                onClick={() => onNavigate('#login')}
              />
            </div>
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ icon, bgColor, title, description, buttonText, buttonColor, onClick }: {
    icon: React.ReactNode, bgColor: string, title: string, description: string, buttonText: string, buttonColor: string, onClick: () => void
}) => (
    <a 
        href="#" 
        onClick={(e) => {
            e.preventDefault();
            onClick();
        }}
        className="group block p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-200"
    >
        <div className={`flex items-center justify-center h-16 w-16 ${bgColor} rounded-full mb-6`}>
            {icon}
        </div>
        <h3 className="text-2xl font-semibold text-slate-800">{title}</h3>
        <p className="mt-2 text-slate-500">
            {description}
        </p>
        <span className={`mt-6 inline-block font-semibold ${buttonColor}`}>
            {buttonText} &rarr;
        </span>
    </a>
);

export default HomePage;