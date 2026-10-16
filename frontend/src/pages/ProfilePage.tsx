import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Shield, LogOut, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { invitationService } from '../services/invitationService';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [hostedEventsCount, setHostedEventsCount] = useState<number>(0);
  const [invitationsCount, setInvitationsCount] = useState<number>(0);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const events = await eventService.getAll();
        setHostedEventsCount(events.filter((e) => e.organizerId === user?.id).length);

        const invs = await invitationService.getMyInvitations();
        setInvitationsCount(invs.length);
      } catch {
        // ignore
      }
    };

    fetchUserStats();
  }, [user?.id]);

  const handleConfirmLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Account Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account credentials, view roles, and sign out.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-slate-100 text-center sm:text-left">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-3xl gradient-brand flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-pink-500/20">
            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{user?.fullName}</h2>
              <Badge variant="pink" className="self-center sm:self-auto">
                {user?.role || 'GUEST'}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user?.email}</span>
            </p>
            <p className="text-xs text-slate-400">
              User ID: <span className="font-mono">{user?.id}</span>
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsLogoutModalOpen(true)}
            leftIcon={<LogOut className="w-4 h-4 text-rose-600" />}
            className="text-rose-600 hover:bg-rose-50 border-rose-200"
          >
            Sign Out
          </Button>
        </div>

        {/* Activity Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/events"
            className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-pink-300 hover:bg-[#FFF0F6]/40 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F6] text-[#E83E8C] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Events Hosted</p>
                <h4 className="text-xl font-extrabold text-slate-900">{hostedEventsCount}</h4>
              </div>
            </div>
            <span className="text-xs font-bold text-[#E83E8C] group-hover:underline">
              View Events →
            </span>
          </Link>

          <Link
            to="/invitations"
            className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-orange-300 hover:bg-[#FFF4ED]/40 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFF4ED] text-[#FF8A3D] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Invitations Received</p>
                <h4 className="text-xl font-extrabold text-slate-900">{invitationsCount}</h4>
              </div>
            </div>
            <span className="text-xs font-bold text-[#FF8A3D] group-hover:underline">
              Manage RSVPs →
            </span>
          </Link>
        </div>

        {/* Security & Session Info */}
        <div className="p-5 rounded-2xl bg-pink-50/40 border border-pink-100 text-xs text-slate-600 space-y-2">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-sm text-[#E83E8C]">
            <Shield className="w-4 h-4" />
            <span>Secure Stateless Session</span>
          </div>
          <p>
            Your session is secured using stateless JSON Web Tokens (JWT) signed with HMAC-SHA384 by the Spring Boot backend. Tokens expire automatically after 24 hours.
          </p>
        </div>
      </div>

      {/* Logout Confirmation */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out of Momento?"
        message="Are you sure you want to end your current session? You can sign back in at any time with your credentials."
        confirmLabel="Sign Out"
        isDangerous={false}
      />
    </div>
  );
};
