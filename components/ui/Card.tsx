import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[#140f0b]/92 backdrop-blur-xl border border-[#ba7c38]/40 shadow-2xl shadow-black/70 rounded-2xl p-6 md:p-8 text-[#e8ded1] transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};