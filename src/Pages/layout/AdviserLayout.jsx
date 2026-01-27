import { useAuth } from '@/Context/AuthContext';
import { Building, FileText, GraduationCap, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const AdviserLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: 'dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Interns', path: 'interns', icon: <GraduationCap size={20} /> },
    { name: 'HTE', path: 'hte', icon: <Building size={20} /> },
    { name: 'Reports', path: 'reports', icon: <FileText size={20} /> },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      console.log('Logging out adviser...');
      logout();
      navigate('/pup-sinag');
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden w-full">
      {/* Enhanced Navigation Bar */}
      <nav className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white shadow-xl sticky top-0 z-50 border-b-4 border-yellow-400 w-full">
        <div className="px-3 lg:px-6">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo/Brand Section */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                <GraduationCap className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-300" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg lg:text-xl font-bold text-white">PUP SINAG</h1>
                <p className="text-xs text-yellow-200">Adviser Portal</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 font-medium group relative overflow-hidden
                    ${
                      isActive
                        ? 'bg-yellow-400 text-red-900 shadow-lg'
                        : 'text-white hover:bg-white/10 hover:text-yellow-300'
                    }`
                  }
                >
                  <span className="relative z-10">{item.icon}</span>
                  <span className="relative z-10">{item.name}</span>
                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </NavLink>
              ))}
            </div>

            {/* Desktop Profile & Logout */}
            <div className="hidden lg:flex items-center gap-2">
              <NavLink
                to="profile"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 font-medium
                  ${
                    isActive
                      ? 'bg-white text-red-900 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20 hover:text-yellow-300'
                  }`
                }
              >
                <User size={18} />
                <span>Profile</span>
              </NavLink>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-700 hover:bg-red-600 text-white transition-all duration-300 shadow-md hover:shadow-lg font-medium"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4 space-y-1 border-t border-red-700">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-yellow-400 text-red-900 font-bold shadow-md'
                      : 'text-white hover:bg-white/10 hover:text-yellow-300'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}

            <div className="border-t border-red-700 pt-2 mt-2 space-y-1">
              <NavLink
                to="profile"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 hover:text-yellow-300 transition-all duration-200"
              >
                <User size={20} />
                <span>Profile</span>
              </NavLink>

              <button
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 hover:text-yellow-300 transition-all duration-200 w-full text-left"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area with Enhanced Styling */}
      <div className="p-3 lg:p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdviserLayout;
