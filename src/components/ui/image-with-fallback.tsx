"use client";

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ImageWithFallbackProps extends Omit<ImageProps, 'src'> {
  src: string;
}

export function ImageWithFallback({ src, alt, className, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const fallbackSrc = PlaceHolderImages.find(img => img.id === 'broken-fallback')?.imageUrl || 'https://placehold.co/600x400?text=No+Image';

  return (
    <div className={`relative overflow-hidden bg-muted ${className}`}>
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        className={`object-cover transition-opacity duration-300 ${error ? 'opacity-50' : 'opacity-100'}`}
        onError={() => setError(true)}
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        {...props}
      />
    </div>
  );
}