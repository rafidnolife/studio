
"use client";

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  imageUrls: string[];
  mainImageIndex?: number;
  category: string;
  stock: number;
  isFeatured?: boolean;
  description?: string;
  unit?: string;
  variants?: string[];
  colors?: string[];
}

function ProductCardComponent({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { toast } = useToast();
  
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.some((p: any) => p.id === product.id));
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let updated;
    if (isWishlisted) {
      updated = wishlist.filter((p: any) => p.id !== product.id);
      toast({ title: 'উইশলিস্ট থেকে সরানো হয়েছে' });
    } else {
      updated = [...wishlist, product];
      toast({ title: 'উইশলিস্টে যুক্ত করা হয়েছে' });
    }
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setIsWishlisted(!isWishlisted);
  };

  const displayImage = product.imageUrls?.[product.mainImageIndex || 0] || product.imageUrls?.[0] || '';

  return (
    <Card className={cn(
      "group relative overflow-hidden border-none transition-all duration-500 bg-white rounded-[1.5rem] md:rounded-[2rem] flex flex-col h-full shadow-md hover:shadow-xl",
      product.isFeatured && "ring-1 ring-primary/20"
    )}>
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-20">
          <Badge className="bg-red-500 text-white border-none px-2 py-0.5 rounded-lg font-black text-[9px] md:text-[10px] uppercase">
            {discountPercent}% OFF
          </Badge>
        </div>
      )}
      
      <div className="absolute top-3 right-3 z-20">
        <button 
          className={cn(
            "rounded-xl h-8 w-8 md:h-10 md:w-10 bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 shadow-sm border border-white/50",
            isWishlisted ? "text-red-500" : "text-slate-400"
          )}
          onClick={toggleWishlist}
        >
          <Heart className={cn("w-4 h-4 md:w-5 md:h-5", isWishlisted && "fill-current")} />
        </button>
      </div>

      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-50/30">
        <div className="w-full h-full transition-all duration-700 group-hover:scale-105">
           <ImageWithFallback
              src={displayImage}
              alt={product.name}
              className="object-contain p-2 md:p-3" 
            />
        </div>
        
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px] z-30">
            <span className="text-slate-900 border-slate-900 border-2 font-black text-[10px] md:text-sm px-3 py-1 rounded-lg uppercase tracking-widest rotate-12 shadow-lg bg-white/80">
              STOCK OUT
            </span>
          </div>
        )}
      </Link>

      <CardContent className="p-3 md:p-5 flex flex-col flex-grow space-y-2">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[7px] md:text-[9px] font-black text-primary/80 uppercase tracking-widest px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10">
              {product.category}
            </span>
            {product.isFeatured && (
              <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[7px] md:text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Sparkles className="w-2 h-2" /> SPECIAL
              </Badge>
            )}
          </div>
          <Link href={`/product/${product.id}`}>
            <h3 className="font-bold text-[11px] md:text-lg text-slate-800 line-clamp-1 leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="pt-1 mt-auto flex items-center justify-between gap-1">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1 md:gap-2">
              <span className="font-black text-xs md:text-xl text-slate-900">
                ৳{hasDiscount ? product.discountPrice : product.price}
              </span>
              {hasDiscount && (
                <span className="text-[9px] md:text-xs text-slate-300 line-through font-bold">
                  ৳{product.price}
                </span>
              )}
            </div>
          </div>
          <Button size="icon" className="h-7 w-7 md:h-10 md:w-10 rounded-lg md:rounded-xl shadow-md shadow-primary/10 bg-primary group-hover:translate-x-0.5 transition-all border-none" asChild>
             <Link href={`/product/${product.id}`}>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
             </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const ProductCard = React.memo(ProductCardComponent);
