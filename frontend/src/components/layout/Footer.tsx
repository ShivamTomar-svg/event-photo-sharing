import React from 'react';
import { Camera, Heart, Shield, Cloud, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white shadow-sm">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[#E83E8C] to-[#FF8A3D] bg-clip-text text-transparent">
                Momento
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Momento is a modern event photography sharing platform designed for seamless event
              photo aggregation, high-fidelity gallery curation, and collaborative celebrations.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" /> JWT Auth
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-blue-500" /> MySQL
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5 text-[#FF8A3D]" /> Media Storage
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li>
                <Link to="/events" className="hover:text-[#E83E8C] transition-colors">
                  Explore Events
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#E83E8C] transition-colors">
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link to="/invitations" className="hover:text-[#E83E8C] transition-colors">
                  Event Invitations
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#E83E8C] transition-colors">
                  Account Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Security
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li>Stateless JWT Tokens</li>
              <li>Spring Security 7 Engine</li>
              <li>Role-based Contributor Access</li>
              <li>Client-side Validation</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Momento Event Share. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3 h-3 text-[#E83E8C] fill-[#E83E8C]" /> for unforgettable celebrations.
          </p>
        </div>
      </div>
    </footer>
  );
};
