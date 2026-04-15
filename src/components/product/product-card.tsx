
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
      "group relative overflow-hidden border-none transition-all duration-500 bg-white rounded-2xl md:rounded-[2rem] flex flex-col h-full shadow-md hover:shadow-xl",
      product.isFeatured && "ring-1 ring-primary/10"
    )}>
      {hasDiscount && (
        <div className="absolute top-1.5 left-1.5 z-20">
          <Badge className="bg-red-500 text-white border-none px-1.5 py-0.5 rounded-md font-black text-[7px] md:text-[9px] uppercase shadow-sm">
            {discountPercent}% OFF
          </Badge>
        </div>
      )}
      
      <div className="absolute top-1.5 right-1.5 z-20">
        <button 
          className={cn(
            "rounded-lg h-7 w-7 md:h-9 md:w-9 bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 shadow-sm border border-white/50",
            isWishlisted ? "text-red-500" : "text-slate-400"
          )}
          onClick={toggleWishlist}
        >
          <Heart className={cn("w-3.5 h-3.5 md:w-4.5 md:h-4.5", isWishlisted && "fill-current")} />
        </button>
      </div>

      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-50">
        <div className="w-full h-full transition-all duration-700 group-hover:scale-110">
           <ImageWithFallback
              src={displayImage}
              alt={product.name}
              className="object-cover" 
            />
        </div>
        
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[1px] z-30">
            <span className="text-white bg-slate-900/80 font-black text-[8px] md:text-xs px-2 py-1 rounded uppercase tracking-tighter rotate-12">
              STOCK OUT
            </span>
          </div>
        )}
      </Link>

      <CardContent className="p-2 md:p-4 flex flex-col flex-grow space-y-1.5">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[6px] md:text-[8px] font-black text-primary/70 uppercase tracking-widest px-1 py-0.5 bg-primary/5 rounded">
              {product.category}
            </span>
            {product.isFeatured && (
              <Badge className="bg-amber-50 text-amber-600 border-none font-black text-[6px] md:text-[8px] px-1 py-0.5 rounded-full flex items-center gap-0.5">
                <Sparkles className="w-2 h-2" /> SPECIAL
              </Badge>
            )}
          </div>
          <Link href={`/product/${product.id}`}>
            <h3 className="font-bold text-[10px] md:text-base text-slate-800 line-clamp-1 leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="pt-0.5 mt-auto flex items-center justify-between gap-1">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="font-black text-[11px] md:text-lg text-slate-900">
                ৳{hasDiscount ? product.discountPrice : product.price}
              </span>
              {hasDiscount && (
                <span className="text-[8px] md:text-xs text-slate-300 line-through font-bold">
                  ৳{product.price}
                </span>
              )}
            </div>
          </div>
          <Button size="icon" className="h-6 w-6 md:h-9 md:w-9 rounded-md md:rounded-xl shadow-sm bg-primary border-none" asChild>
             <Link href={`/product/${product.id}`}>
              <ArrowRight className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 text-white" />
             </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const ProductCard = React.memo(ProductCardComponent);
