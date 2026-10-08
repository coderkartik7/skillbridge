import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Clean inline or block spinner component using theme colors
 *
 * @param {{ size?: 'sm' | 'md' | 'lg', className?: string }} props
 */
export default function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2
      className={`animate-spin text-ink ${sizeClasses[size] || sizeClasses.md} ${className}`}
      aria-hidden="true"
    />
  );
}
