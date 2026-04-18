'use client';

import React, { useState } from 'react';
import { cn } from '@/utils/cn';

interface PodoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PodoLogo = ({ className, size = 'md' }: PodoLogoProps) => {
  const [hasError, setHasError] = useState(false);

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn(
      'rounded-full bg-primary/10 overflow-hidden border border-primary/20 flex items-center justify-center shrink-0',
      sizes[size],
      className
    )}>
      {!hasError ? (
        <img 
          src="/podo.png" 
          alt="Podo" 
          className="w-full h-full object-cover" 
          onError={() => setHasError(true)} 
        />
      ) : (
        <span className="text-primary font-bold text-[10px]">PODO</span>
      )}
    </div>
  );
};
