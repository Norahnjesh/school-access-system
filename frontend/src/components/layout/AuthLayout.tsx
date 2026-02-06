import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, UserPlusIcon, KeyIcon } from '@heroicons/react/24/outline';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full">
      
      {/* Left Sidebar - Reference Design */}
      <aside className="hidden lg:flex w-80 bg-[#1e3a8a] flex-col">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center pt-12 pb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
            <img
              src="/OIP (1).jpg"
              alt="Little Wonder School Logo"
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
          <h1 className="text-white text-xl font-bold text-center">
            Little Wonder School
          </h1>
          <p className="text-red-500 text-xs italic mt-2">
            "Light Up Your Dreams"
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-8">
          <Link
            to="/login"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 ${
              location.pathname === '/login'
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="font-medium">LOGIN</span>
          </Link>
          
          <Link
            to="/register"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 ${
              location.pathname === '/register'
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <UserPlusIcon className="w-5 h-5" />
            <span className="font-medium">STUDENT REGISTRATION</span>
          </Link>
          
          <Link
            to="/forgot-password"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
              location.pathname === '/forgot-password'
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <KeyIcon className="w-5 h-5" />
            <span className="font-medium">ACCOUNT RECOVERY</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-8 text-center text-xs text-gray-400">
          <p> 2024 Little Wonder School</p>
          <p className="mt-1">Sunton, Kasarani, Nairobi</p>
        </div>
      </aside>

      {/* Right Content Area - Reference Design */}
      <main className="flex-1 relative">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/home-enroll-left-img.png"
            alt="School Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden absolute top-0 left-0 right-0 p-4 bg-black/80 z-10">
          <div className="text-white font-bold">LWS</div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t z-10">
          <div className="flex">
            <Link
              to="/login"
              className={`flex-1 py-3 text-center text-sm ${
                location.pathname === '/login'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600'
              }`}
            >
              LOGIN
            </Link>
            <Link
              to="/register"
              className={`flex-1 py-3 text-center text-sm ${
                location.pathname === '/register'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600'
              }`}
            >
              REGISTER
            </Link>
          </div>
        </div>

        {/* Form Container */}
        <div className="relative z-10 flex items-center justify-center h-full p-8 pb-20 lg:pb-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;