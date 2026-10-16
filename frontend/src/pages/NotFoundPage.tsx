import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Home } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const NotFoundPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-[#FFF0F6] border border-pink-200 text-[#E83E8C] flex items-center justify-center mb-6 shadow-md shadow-pink-500/10">
        <Camera className="w-10 h-10" />
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight">
        404
      </h1>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">
        Picture Not Found
      </h2>
      <p className="mt-3 text-sm text-slate-500 max-w-md">
        The event, page, or photo gallery you are looking for does not exist or may have been moved.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link to={isAuthenticated ? '/dashboard' : '/'}>
          <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
            {isAuthenticated ? 'Back to Dashboard' : 'Return Home'}
          </Button>
        </Link>
      </div>
    </div>
  );
};
