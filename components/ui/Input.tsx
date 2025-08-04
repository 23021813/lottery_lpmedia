import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, isError, ...props }, ref) => {
    const baseClasses = "w-full px-4 py-3 rounded-lg bg-white/50 border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition";
    const errorClasses = "border-red-500 text-red-600 placeholder-red-400 focus:ring-red-500";
    const normalClasses = "border-slate-300/70 focus:border-purple-500";
    
    return <input ref={ref} className={`${baseClasses} ${isError ? errorClasses : normalClasses} ${className}`} {...props} />;
});

Input.displayName = 'Input';