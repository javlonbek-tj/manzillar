'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  fullPage?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
}

const sizeClasses = {
  sm: 'size-4',
  md: 'size-8',
  lg: 'size-12',
  xl: 'size-16',
};

export function LoadingSpinner({ 
  fullPage = true, 
  className, 
  size = 'md',
  message = "Yuklanmoqda..." 
}: LoadingSpinnerProps) {
  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500",
      className
    )}>
      <div className="relative">
        {/* Decorative background pulse */}
        <div className={cn(
          "absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150",
          size === 'sm' && 'scale-125'
        )} />
        
        {/* Main Spinner */}
        <div className="relative bg-background p-2 rounded-full shadow-lg border border-primary/10">
          <Loader2 
            className={cn(
              "text-primary animate-spin",
              sizeClasses[size]
            )} 
          />
        </div>
      </div>
      
      {message && (
        <p className={cn(
          "text-sm font-medium text-muted-foreground animate-pulse",
          size === 'sm' && 'text-xs'
        )}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/60 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      {content}
    </div>
  );
}
