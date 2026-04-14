
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
  
  const fallbackSrc = 'https://placehold.co/800x800?text=ইমেজ+পাওয়া+যায়নি';

  // Basic validation for URL
  const isValidUrl = (url: string) => {
    return url && typeof url === 'string' && url.trim() !== '' && url.startsWith('http');
  };

  const currentSrc = error || !isValidUrl(src) ? fallbackSrc : src;

  useEffect(() => {
    setError(false);
    setLoading(true);
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden flex items-center justify-center w-full h-full min-h-[inherit]", className)}>
      {loading && (
        <div className="absolute inset-0 bg-slate-100/50 animate-pulse z-10 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt || "Product Image"}
        className={cn(
          "transition-all duration-700 w-full h-full object-contain",
          loading ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0',
          error ? 'opacity-40 grayscale' : 'opacity-100'
        )}
        onError={() => {
          if (!error) {
            setError(true);
            setLoading(false);
          }
        }}
        onLoad={() => setLoading(false)}
        loading="lazy"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
