import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full overflow-hidden font-sans">

      {/* LEFT SIDEBAR */}
      <aside className="hidden lg:flex w-80 bg-[#1a237e] flex-col text-white p-8 border-r border-white/10 shrink-0">

        {/* Branding */}
        <div className="flex flex-col items-center mt-4">
          <div className="bg-white p-1 rounded-full border-4 border-[#d32f2f] mb-4 shadow-xl">
            <img
              src="/OIP (1).jpg"
              alt="Logo"
              className="w-24 h-24 rounded-full object-contain"
            />
          </div>

          <h1 className="text-xl font-black tracking-tight text-center uppercase leading-tight">
            Little Wonder School
          </h1>

          <p className="text-[#d32f2f] text-[10px] font-bold tracking-[0.2em] mt-2 italic">
            "LIGHT UP YOUR DREAMS"
          </p>
        </div>

        {/* Navigation */}
        <nav className="mt-12 space-y-3">
          <button
            onClick={() => navigate('/login')}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all ${
              location.pathname === '/login'
                ? 'bg-[#d32f2f] text-white'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            Login
          </button>

          <button
            onClick={() => navigate('/register')}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              location.pathname === '/register'
                ? 'bg-[#d32f2f] text-white'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            Student Registration
          </button>
        </nav>

        {/* Contact Info */}
        <div className="mt-auto pt-8 border-t border-white/10 space-y-5 text-[11px]">
          <div className="space-y-1">
            <p className="text-[#d32f2f] font-bold uppercase tracking-widest text-[9px]">
              Contact Details
            </p>
            <p className="opacity-70">Tel: +254 722 800 328</p>
            <p className="opacity-70">Email: littlewondersch@gmail.com</p>
            <p className="opacity-70">Web: www.littlewonderschool.sc.ke</p>
          </div>

          <div className="space-y-1">
            <p className="text-[#d32f2f] font-bold uppercase tracking-widest text-[9px]">
              Location
            </p>
            <p className="opacity-70 leading-relaxed">
              Sunton, Kasarani, Ruaraka,
              <br />
              Nairobi, Kenya
            </p>
          </div>
        </div>
      </aside>

      {/* RIGHT CONTENT */}
      <main
        className="flex-1 relative flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/home-enroll-left-img.png')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

        {/* Auth Card */}
        <div className="relative z-10 w-full max-w-[440px] mx-4">
          <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">

            {/* Mobile Header */}
            <div className="lg:hidden flex flex-col items-center pt-8 bg-[#151b54]">
              <img
                src="/OIP (1).jpg"
                alt="Logo"
                className="w-16 h-16 rounded-full border-2 border-[#d32f2f] mb-2"
              />
              <p className="text-white text-xs font-bold uppercase tracking-widest pb-4">
                Little Wonder School
              </p>
            </div>

            <div className="p-8 sm:p-12">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
