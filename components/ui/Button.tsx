import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', isLoading = false, variant = 'primary', ...props }) => {
  const baseClasses = 'w-full font-bold py-3.5 px-6 rounded-full focus:outline-none transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm uppercase tracking-wider';
  
  const variantClasses = {
    primary: 'bg-[#ba7c38] hover:bg-[#9f6527] text-white shadow-lg shadow-black/40 focus:ring-2 focus:ring-[#ba7c38] focus:ring-offset-2 focus:ring-offset-[#140f0b]',
    secondary: 'bg-[#1c140e] hover:bg-[#281c13] text-[#ba7c38] border border-[#ba7c38] focus:ring-2 focus:ring-[#ba7c38]',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        children
      )}
    </button>
  );
};