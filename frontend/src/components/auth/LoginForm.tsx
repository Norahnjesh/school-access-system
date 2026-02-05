import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('auth_token', res.token);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as {
          response?: { data?: { message?: string } };
        };
        setError(errorResponse.response?.data?.message || 'Login failed');
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">

      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-80 bg-[#1a2557] min-h-screen flex flex-col text-white">
        <div className="flex flex-col items-center px-6 pt-10 pb-6">
          <div className="mb-4 bg-white p-1 rounded-full border-4 border-[#dc2626] shadow-xl">
            <img
              src="/OIP (1).jpg"
              alt="Little Wonder School Logo"
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>

          <h1 className="text-base font-black uppercase text-center">
            Little Wonder School
          </h1>

          <p className="text-[#dc2626] text-[10px] font-bold tracking-widest italic uppercase">
            "Light Up Your Dreams"
          </p>
        </div>

        <div className="px-6 space-y-3 mt-6">
          <button
            onClick={() => navigate('/register')}
            className="w-full bg-[#dc2626] hover:bg-[#b91c1c] py-3.5 rounded-lg font-bold text-xs uppercase shadow-lg transition"
          >
            Register Student
          </button>

          <button
            onClick={() => navigate('/create-account')}
            className="w-full bg-white/10 hover:bg-white/20 py-3.5 rounded-lg font-semibold text-xs uppercase border border-white/20 transition"
          >
            Create Account
          </button>
        </div>

        <div className="mt-auto px-6 py-6 text-[10px] space-y-2">
          <p>Tel: +254 722 800 328</p>
          <p>Email: littlewondersch@gmail.com</p>
          <p>Web: www.littlewonderschool.sc.ke</p>
          <p className="pt-2 border-t border-white/10">
            Sunton, Kasarani, Ruaraka<br />
            Nairobi, Kenya
          </p>
        </div>
      </aside>

      {/* ================= RIGHT SIDE ================= */}
      <main className="flex-1 relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/home-enroll-left-img.png')" }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* ================= LOGIN CARD ================= */}
        <div className="relative z-10 w-full max-w-[440px] px-6">
          <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl p-10">

            <div className="mb-8 text-center">
              <h2 className="text-3xl font-black text-[#1a237e] uppercase">
                Welcome
              </h2>
              <p className="text-gray-500 text-sm">
                Please login to your account
              </p>
            </div>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 p-3 rounded-xl text-xs font-bold text-red-600">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase text-[#1a237e] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 focus:border-[#dc2626] focus:bg-white outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-[#1a237e] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 focus:border-[#dc2626] focus:bg-white outline-none font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#dc2626] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition disabled:opacity-50"
              >
                {loading ? 'Authenticating…' : 'LOGIN'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t text-center space-y-3">
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-[10px] font-bold uppercase text-gray-400 hover:text-[#dc2626]"
              >
                Forgot Password?
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginForm;
