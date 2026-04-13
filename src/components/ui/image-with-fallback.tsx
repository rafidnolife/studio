
"use client";

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends Omit<ImageProps, 'src'> {
  src: string;
}

export function ImageWithFallback({ src, alt, className, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const fallbackSrc = 'https://placehold.co/600x400?text=ইমেজ+পাওয়া+যায়নি';

  // Basic validation to prevent immediate crash on empty/malformed URLs
  const validSrc = (src && typeof src === 'string' && src.startsWith('http')) ? src : fallbackSrc;

  // Reset states when src changes
  useEffect(() => {
    setError(false);
    setLoading(true);
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-slate-100 flex items-center justify-center ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse z-10 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={error ? fallbackSrc : validSrc}
        alt={alt || "Product Image"}
        className={`object-cover transition-all duration-700 ${loading ? 'scale-105 blur-sm opacity-0' : 'scale-100 blur-0 opacity-100'} ${error ? 'grayscale opacity-50' : ''}`}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        onLoad={() => setLoading(false)}
        loading="lazy"
        {...props}
      />
    </div>
  );
}
