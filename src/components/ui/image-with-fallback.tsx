
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
}

export function ImageWithFallback({ 
  src, 
  alt, 
  className, 
  fallbackSrc = 'https://placehold.co/800x800?text=ইমেজ+পাওয়া+যায়নি',
  fill,
  ...props 
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  const isValidUrl = (url: string) => {
    return url && typeof url === 'string' && url.trim() !== '' && url.startsWith('http');
  };

  const currentSrc = error || !isValidUrl(src) ? fallbackSrc : src;

  useEffect(() => {
    setError(false);
    if (imgRef.current && imgRef.current.complete) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [src]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    if (!error) {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "relative overflow-hidden flex items-center justify-center w-full h-full min-h-[inherit]", 
      className
    )}>
      {loading && (
        <div className="absolute inset-0 bg-slate-100/50 animate-pulse z-10 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt || "Product Image"}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
        loading="eager"
        className={cn(
          "transition-all duration-700 w-full h-full",
          loading ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100 blur-0',
          error ? 'opacity-40 grayscale' : 'opacity-100'
        )}
        {...props}
      />
    </div>
  );
}
