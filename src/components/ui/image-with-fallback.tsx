
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
  
  const fallbackSrc = 'https://placehold.co/600x400?text=ইমেজ+পাওয়া+যায়নি';

  const getValidSrc = (url: string) => {
    if (!url || typeof url !== 'string' || !url.trim() || !url.startsWith('http')) {
      return fallbackSrc;
    }
    return url;
  };

  const currentSrc = error ? fallbackSrc : getValidSrc(src);

  useEffect(() => {
    setError(false);
    setLoading(true);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden bg-slate-100 flex items-center justify-center w-full h-full min-h-[inherit]", className)}>
      {loading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse z-10 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={currentSrc}
        alt={alt || "Product Image"}
        className={cn(
          "transition-all duration-700 w-full h-full",
          loading ? 'blur-md grayscale opacity-0' : 'blur-0 grayscale-0 opacity-100',
          error ? 'opacity-50 object-contain' : 'opacity-100'
        )}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        onLoad={() => setLoading(false)}
        loading="eager"
        unoptimized={true}
        {...props}
      />
    </div>
  );
}
