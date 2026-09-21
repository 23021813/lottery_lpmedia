import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = 'mb-6' }) => {
  return (
    <div className={`flex items-center justify-center gap-4 sm:gap-6 ${className}`}>
      <img 
        src="/logo-obc.png"
        alt="OBC Holdings"
        className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
      />
      <div className="h-7 sm:h-8 w-[1.5px] bg-gradient-to-b from-transparent via-[#ba7c38]/80 to-transparent" />
      <img 
        src="/logo-ak.png"
        alt="AK Tower"
        className="h-11 sm:h-14 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
      />
    </div>
  );
};