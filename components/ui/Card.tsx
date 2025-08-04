import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-white/60 backdrop-blur-md rounded-xl shadow-lg p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
};