import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pink' | 'orange' | 'green' | 'gray' | 'red' | 'blue';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'pink', className }) => {
  const variants = {
    pink: 'bg-[#FFF0F6] text-[#E83E8C] border-pink-200/80',
    orange: 'bg-[#FFF4ED] text-[#FF8A3D] border-orange-200/80',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    gray: 'bg-slate-100 text-slate-700 border-slate-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200/80',
    blue: 'bg-sky-50 text-sky-700 border-sky-200/80',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
