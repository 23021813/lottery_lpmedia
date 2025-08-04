import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    isError?: boolean;
    children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, isError, children, ...props }, ref) => {
    const baseClasses = "w-full px-4 py-3 rounded-lg bg-white/50 border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition appearance-none";
    const errorClasses = "border-red-500 text-red-600 focus:ring-red-500";
    const normalClasses = "border-slate-300/70 focus:border-purple-500";

    return (
        <div className="relative">
            <select ref={ref} className={`${baseClasses} ${isError ? errorClasses : normalClasses} ${className}`} {...props}>
                {children}
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
            </div>
        </div>
    );
});

Select.displayName = 'Select';