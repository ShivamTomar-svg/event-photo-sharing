import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, UploadCloud, Users, Share2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-150px] left-[10%] w-[450px] h-[450px] rounded-full bg-[#E83E8C]/15 blur-[120px]" />
        <div className="absolute top-[-50px] right-[10%] w-[500px] h-[500px] rounded-full bg-[#FF8A3D]/15 blur-[130px]" />
      </div>

      {/* Hero Section */}
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0F6] border border-pink-200/80 text-xs font-bold text-[#E83E8C] mb-8 animate-fade-in shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Next Generation of Event Photography</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Capture every angle.{' '}
          <span className="gradient-brand-text">Share every memory.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Momento lets hosts and guests effortlessly collect, organize, and download high-resolution
          photos in one private collaborative space.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link to={isAuthenticated ? '/dashboard' : '/register'} className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start an Event for Free'}
            </Button>
          </Link>
          <Link to={isAuthenticated ? '/events' : '/login'} className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              {isAuthenticated ? 'Browse Events' : 'Sign In to Your Account'}
            </Button>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Original Quality Uploads
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Private RSVP Access
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Lightning Fast Lightbox
          </span>
        </div>
      </section>

      {/* Interactive Mockup Preview */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-20">
        <div className="relative rounded-3xl p-3 sm:p-5 bg-gradient-to-tr from-pink-500/10 via-orange-500/10 to-pink-500/5 border border-pink-100 shadow-2xl backdrop-blur-xl">
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-lg">
            {/* Mock Header */}
            <div className="h-12 bg-slate-50 border-b border-slate-100 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="text-xs font-semibold text-slate-400">
                Momento Live Event Gallery • Sunset Wedding 2026
              </div>
              <div className="w-12" />
            </div>

            {/* Mock Gallery Grid */}
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/50">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 shadow-sm flex flex-col justify-end p-3 text-white text-xs font-bold">
                Ceremony Moments
              </div>
              <div className="aspect-square rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 shadow-sm flex flex-col justify-end p-3 text-white text-xs font-bold">
                Toast & Cheers
              </div>
              <div className="aspect-square rounded-xl bg-gradient-to-br from-rose-400 to-pink-600 shadow-sm flex flex-col justify-end p-3 text-white text-xs font-bold">
                Evening Dance
              </div>
              <div className="aspect-square rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 shadow-sm flex flex-col justify-end p-3 text-white text-xs font-bold">
                Sparkler Exit
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights / Features Grid */}
      <section className="py-20 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Built for weddings, parties, and celebrations
            </h2>
            <p className="mt-4 text-slate-600 text-sm sm:text-base">
              Say goodbye to messy group chats and compressed images. Collect every high-res photo from all your guests seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-[#FAFAFB] border border-slate-200/70 hover:border-pink-200 hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FFF0F6] text-[#E83E8C] flex items-center justify-center mb-6">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Zero Compression Uploads</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Upload photos up to 10MB in their original crisp clarity. Batch upload queues with progress tracking.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-[#FAFAFB] border border-slate-200/70 hover:border-orange-200 hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FFF4ED] text-[#FF8A3D] flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Private Guest RSVPs</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Invite registered guests with direct email invitations. Real-time RSVP responses ensure private event galleries.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-[#FAFAFB] border border-slate-200/70 hover:border-pink-200 hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FFF0F6] text-[#E83E8C] flex items-center justify-center mb-6">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Instant Downloads & Lightbox</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Browse fullscreen with keyboard arrow keys, zoom into memorable moments, and download original files directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl gradient-brand p-10 sm:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to create your next event gallery?
            </h2>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              Join Momento today. Create an event in 30 seconds and start sharing memories with friends, family, and attendees.
            </p>
            <div className="pt-2">
              <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white text-[#E83E8C] hover:bg-slate-50 border-none font-bold shadow-lg"
                >
                  {isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
