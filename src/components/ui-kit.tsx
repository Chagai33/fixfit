import React from 'react';
import { motion } from 'framer-motion';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all focus-visible:ring-2 focus-visible:ring-action ring-offset-2";

  const variants = {
    primary: "bg-primary text-white hover:bg-action",
    secondary: "bg-surface-mid text-primary border border-border-standard hover:bg-surface-soft",
    ghost: "bg-transparent text-primary hover:bg-surface-soft",
    danger: "bg-error text-white hover:opacity-90"
  };

  const sizes = {
    sm: "px-4 py-2 text-[9px]",
    md: "px-8 py-3 text-[11px]",
    lg: "px-12 py-5 text-[12px]"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </motion.button>
  );
};

// --- Card ---
export const Card = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`bg-white border border-border-standard p-6 transition-colors hover:bg-surface-soft ${className}`}
    {...props}
  >
    {children}
  </div>
);

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => (
  <div className="space-y-2 group">
    {label && (
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-focus-within:text-action transition-colors">
        {label}
      </label>
    )}
    <input
      className={`w-full bg-transparent border-b border-border-standard py-3 text-sm focus:outline-none focus:border-action transition-all placeholder:text-gray-200 ${error ? 'border-error' : ''} ${className}`}
      {...props}
    />
    {error && <p className="text-[9px] font-bold text-error uppercase tracking-widest">{error}</p>}
  </div>
);
