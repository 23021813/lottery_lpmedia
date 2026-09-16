import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', isError, ...props }, ref) => {
    const baseClasses = "w-full px-4 py-3 rounded-xl bg-[#1c140e]/90 text-white placeholder-[#888] border focus:outline-none transition text-sm font-medium";
    const errorClasses = "border-red-500 text-red-300 placeholder-red-400/70 focus:border-red-500 focus:ring-1 focus:ring-red-500";
    const normalClasses = "border-[#ba7c38]/30 focus:border-[#ba7c38] focus:ring-1 focus:ring-[#ba7c38] hover:border-[#ba7c38]/50";
    
    return <input ref={ref} className={`${baseClasses} ${isError ? errorClasses : normalClasses} ${className}`} {...props} />;
});

Input.displayName = 'Input';