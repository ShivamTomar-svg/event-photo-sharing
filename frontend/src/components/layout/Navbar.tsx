import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Camera, Mail, LogOut, User as UserIcon, Plus, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export interface NavbarProps {
  onOpenCreateEvent?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateEvent }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#E83E8C] to-[#FF8A3D] bg-clip-text text-transparent">
                Momento
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                Photo Share
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-[#FFF0F6] text-[#E83E8C]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/events"
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/events')
                      ? 'bg-[#FFF0F6] text-[#E83E8C]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  Events
                </Link>
                <Link
                  to="/invitations"
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/invitations')
                      ? 'bg-[#FFF0F6] text-[#E83E8C]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Invitations</span>
                </Link>

                <div className="h-5 w-px bg-slate-200 mx-2" />

                {onOpenCreateEvent && (
                  <Button
                    variant="orange"
                    size="sm"
                    onClick={onOpenCreateEvent}
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="mr-2"
                  >
                    New Event
                  </Button>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors focus:outline-none"
                    aria-label="User menu"
                  >
                    <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                      {user?.fullName || 'My Account'}
                    </span>
                    <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-30 animate-scale-in">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {user?.fullName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-[#FFF0F6] text-[#E83E8C]">
                            {user?.role || 'GUEST'}
                          </span>
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>Profile & RSVPs</span>
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/60 transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" rightIcon={<Sparkles className="w-3.5 h-3.5" />}>
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && onOpenCreateEvent && (
              <Button
                variant="orange"
                size="sm"
                onClick={onOpenCreateEvent}
                className="p-2"
                aria-label="Create Event"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 bg-slate-50 rounded-xl mb-3">
                <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#FFF0F6] hover:text-[#E83E8C]"
              >
                Dashboard
              </Link>
              <Link
                to="/events"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#FFF0F6] hover:text-[#E83E8C]"
              >
                All Events
              </Link>
              <Link
                to="/invitations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#FFF0F6] hover:text-[#E83E8C]"
              >
                My Invitations
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#FFF0F6] hover:text-[#E83E8C]"
              >
                Profile Settings
              </Link>
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl gradient-brand text-sm font-semibold text-white shadow-md shadow-pink-500/20"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
