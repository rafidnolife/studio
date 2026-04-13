
"use client";

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader2 } from 'lucide-react';

interface ImageWithFallbackProps extends Omit<ImageProps, 'src'> {
  src: string;
}

export function ImageWithFallback({ src, alt, className, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const fallbackSrc = PlaceHolderImages.find(img => img.id === 'broken-fallback')?.imageUrl || 'https://placehold.co/600x400?text=No+Image';

  // Basic validation to prevent immediate crash on empty/malformed URLs
  const validSrc = src && src.startsWith('http') ? src : fallbackSrc;

  return (
    <div className={`relative overflow-hidden bg-slate-100 flex items-center justify-center ${className}`}>
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary opacity-30" />
        </div>
      )}
      <Image
        src={error ? fallbackSrc : validSrc}
        alt={alt}
        className={`object-cover transition-opacity duration-500 ${error ? 'opacity-50' : 'opacity-100'} ${loading ? 'opacity-0' : 'opacity-100'}`}
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
