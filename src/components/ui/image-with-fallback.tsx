"use client";

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends Omit<ImageProps, 'src'> {
  src: string;
}

export function ImageWithFallback({ src, alt, className, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const fallbackSrc = 'https://placehold.co/800x600?text=Image+Not+Found';

  // Basic validation for URL
  const isValidUrl = (url: string) => {
    return url && typeof url === 'string' && url.trim() !== '' && url.startsWith('http');
  };

  const currentSrc = error || !isValidUrl(src) ? fallbackSrc : src;

  // Reset states when src changes
  useEffect(() => {
    setError(false);
    setLoading(true);
    
    // Safety timeout to prevent infinite loading spinners
    const timer = setTimeout(() => {
      setLoading(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden flex items-center justify-center w-full h-full min-h-[inherit]", className)}>
      {loading && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse z-10 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={currentSrc}
        alt={alt || "Product Image"}
        className={cn(
          "transition-all duration-1000 w-full h-full",
          loading ? 'opacity-0 scale-90' : 'opacity-100 scale-100',
          error ? 'object-contain p-8 opacity-40' : 'object-contain'
        )}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        onLoad={() => setLoading(false)}
        loading="eager"
        unoptimized={true} // IMPORTANT: Ensures HD quality by bypassing Next.js resizing
        {...props}
      />
    </div>
  );
}