import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

import ForgotPassword from './ForgotPassword';
import sinagLogo from '/PUP-SINAG.png';
import pupSeal from '/pup_1904.png';

const BASE_PATH = '/pup-sinag';

const LogIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      login(data.token);

      if (data.forcePasswordChange) {
        navigate(`${BASE_PATH}/change-password`, { replace: true });
        return;
      }

      const payload = JSON.parse(atob(data.token.split('.')[1]));
      const role = payload.role.toLowerCase();
      localStorage.setItem('role', role);

      const routes = {
        superadmin: '/superadmin',
        coordinator: '/coordinator',
        adviser: '/adviser',
        intern: '/intern',
        supervisor: '/supervisor',
      };

      navigate(`${BASE_PATH}${routes[role] || ''}`, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to login. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #FFD700 0%, #FFF5CC 20%, #FFFFFF 40%, #FFE6F0 60%, #FFD6E8 80%, #F8C8DC 100%)`,
      }}
    >
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-5 left-5 sm:top-10 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-yellow-300/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-5 right-5 sm:bottom-10 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-pink-300/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 sm:w-64 sm:h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* MAIN GLASSY CARD CONTAINER */}
      <div className="flex flex-col lg:flex-row w-full max-w-5xl rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[500px] sm:min-h-[550px] relative z-10 backdrop-blur-xl bg-white/40 border border-white/50">
        {/* LEFT PANEL (Branding) - Glassy */}
        <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-8 xl:p-12 text-[#5E0000] relative overflow-hidden">
          {/* Glassy gradient overlay */}
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{
              background: `linear-gradient(135deg, rgba(255, 215, 0, 0.7) 0%, rgba(255, 245, 204, 0.6) 100%)`,
            }}
          ></div>

          <div className="flex flex-col items-center justify-center space-y-4 xl:space-y-6 relative z-10">
            <h2 className="text-base xl:text-lg font-bold text-center leading-tight drop-shadow-md px-4">
              PUP System for Internship Navigation and Guidance
            </h2>
            <img
              src={sinagLogo}
              alt="PUP SINAG Logo"
              className="w-[220px] xl:w-[280px] h-auto drop-shadow-2xl mx-auto"
            />
          </div>
        </div>

        {/* RIGHT PANEL (Form) - Glassy */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16 relative overflow-hidden">
          {/* Glassy overlay */}
          <div className="absolute inset-0 backdrop-blur-sm bg-white/60"></div>

          <div className="w-full max-w-sm relative z-10">
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-6">
              <img src={sinagLogo} alt="PUP SINAG Logo" className="w-32 sm:w-40 h-auto mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-gray-600 font-medium px-4">
                PUP System for Internship Navigation and Guidance
              </p>
            </div>

            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-white/80 backdrop-blur-md rounded-full p-2 shadow-xl">
                <img src={pupSeal} alt="PUP Seal" className="w-16 sm:w-20 h-auto" />
              </div>
            </div>

            <h1 className="text-lg sm:text-xl font-semibold text-center text-gray-800 mb-6 sm:mb-10 drop-shadow-sm">
              Login your PUP SINAG Account
            </h1>

            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base border border-white/40 rounded-full focus:ring-2 focus:ring-red-800/50 outline-none text-gray-700 shadow-lg transition-all backdrop-blur-md bg-white/60 placeholder-gray-500"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base border border-white/40 rounded-full focus:ring-2 focus:ring-red-800/50 outline-none text-gray-700 shadow-lg transition-all pr-14 sm:pr-16 backdrop-blur-md bg-white/60 placeholder-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-4 sm:right-5 flex items-center text-xs sm:text-sm font-medium text-gray-600 hover:text-red-800"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#800000] to-[#A00000] text-white font-bold py-3 sm:py-3.5 text-sm sm:text-base rounded-full hover:from-[#600000] hover:to-[#800000] transition-all shadow-xl active:scale-[0.98] disabled:opacity-70 backdrop-blur-sm"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              {error && (
                <p className="text-xs sm:text-sm text-red-600 text-center font-medium mt-2 bg-red-50/80 backdrop-blur-sm py-2 px-3 sm:px-4 rounded-full">
                  {error}
                </p>
              )}
            </form>

            <div className="mt-6 sm:mt-8 text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-red-800 transition-colors bg-white/40 backdrop-blur-sm px-4 sm:px-5 py-2 rounded-full hover:bg-white/60"
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </div>
      </div>

      <ForgotPassword isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
    </div>
  );
};

export default LogIn;
