import React from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  siteKey: string;
  className?: string;
}

export const TurnstileComponent: React.FC<TurnstileProps> = ({
  onVerify,
  onError,
  onExpire,
  siteKey,
  className = ''
}) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <Turnstile
        siteKey={siteKey}
        onVerify={onVerify}
        onError={onError}
        onExpire={onExpire}
        options={{
          theme: 'light',
          size: 'normal',
        }}
      />
    </div>
  );
};