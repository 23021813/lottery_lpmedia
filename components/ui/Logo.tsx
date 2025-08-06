import React, { useState, useEffect } from 'react';

interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = 'h-16 w-auto mx-auto mb-4', 
  alt = 'Logo' 
}) => {
  const [logoExists, setLogoExists] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/logo.png');

  useEffect(() => {
    // Check if logo exists
    const checkLogo = async () => {
      try {
        const response = await fetch('/logo.png', { method: 'HEAD' });
        if (response.ok) {
          setLogoExists(true);
          // Add timestamp to prevent caching
          setLogoUrl(`/logo.png?t=${Date.now()}`);
        } else {
          setLogoExists(false);
        }
      } catch (error) {
        setLogoExists(false);
      }
    };

    checkLogo();
  }, []);

  if (!logoExists) {
    return null;
  }

  return (
    <div className="flex justify-center mb-4">
      <img 
        src={logoUrl}
        alt={alt}
        className={className}
        onError={() => setLogoExists(false)}
        style={{
          maxHeight: '120px',
          objectFit: 'contain'
        }}
      />
    </div>
  );
};