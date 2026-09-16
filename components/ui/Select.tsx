import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    isError?: boolean;
    children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className = '', isError, children, ...props }, ref) => {
    const baseClasses = "w-full px-4 py-3 rounded-xl bg-[#1c140e]/90 text-white border focus:outline-none transition appearance-none text-sm font-medium cursor-pointer";
    const errorClasses = "border-red-500 text-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500";
    const normalClasses = "border-[#ba7c38]/30 focus:border-[#ba7c38] focus:ring-1 focus:ring-[#ba7c38] hover:border-[#ba7c38]/50";

    return (
        <div className="relative">
            <select ref={ref} className={`${baseClasses} ${isError ? errorClasses : normalClasses} ${className}`} {...props}>
                {children}
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#ba7c38]">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
            </div>
        </div>
    );
});

Select.displayName = 'Select';