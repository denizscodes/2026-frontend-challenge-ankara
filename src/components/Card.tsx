import React from 'react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isHoverable?: boolean;
}

export const Card = ({ children, className, onClick, isHoverable = true }: CardProps) => {
  return (
    <motion.div
      whileHover={isHoverable ? { y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'rounded-xl border border-border bg-card p-6 shadow-sm',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  );
};
