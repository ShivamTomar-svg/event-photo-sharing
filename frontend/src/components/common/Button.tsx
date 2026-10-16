import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'orange' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:shadow-none shadow-sm';

    const variants = {
      primary:
        'bg-[#E83E8C] text-white hover:bg-[#D62F7C] focus:ring-[#E83E8C] hover:shadow-md hover:shadow-pink-500/20',
      secondary:
        'bg-[#FFF0F6] text-[#E83E8C] hover:bg-[#FFE4EE] border border-pink-200/80 focus:ring-[#E83E8C]',
      orange:
        'bg-[#FF8A3D] text-white hover:bg-[#F07524] focus:ring-[#FF8A3D] hover:shadow-md hover:shadow-orange-500/20',
      outline:
        'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 focus:ring-slate-400 hover:border-slate-300',
      ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 shadow-none focus:ring-slate-300',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 hover:shadow-md hover:shadow-rose-600/20',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
