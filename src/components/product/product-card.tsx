
"use client";

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  imageUrls: string[];
  category: string;
  stock: number;
  isFeatured?: boolean;
  description?: string;
}

export function ProductCard({ product }: { product: Product }) {
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

  return (
    <Card className={cn(
      "group relative overflow-hidden border-none transition-all duration-700 bg-white glass rounded-[2rem] md:rounded-[3rem] flex flex-col h-full shadow-lg hover:shadow-[0_40px_80px_-20px_rgba(16,185,129,0.25)] hover:-translate-y-2",
      product.isFeatured && "ring-1 ring-primary/30"
    )}>
      {/* Small & Clean Discount Tag */}
      {hasDiscount && (
        <div className="absolute top-4 left-4 z-20">
          <Badge className="bg-red-500 text-white border-none px-2 py-0.5 rounded-lg font-black text-[9px] md:text-[10px] shadow-xl uppercase tracking-tighter">
            {discountPercent}% OFF
          </Badge>
        </div>
      )}
      
      {/* Wishlist Button */}
      <div className="absolute top-4 right-4 z-20">
        <button 
          className={cn(
            "rounded-2xl h-10 w-10 md:h-12 md:w-12 bg-white/80 backdrop-blur-xl flex items-center justify-center transition-all hover:scale-110 shadow-lg border border-white/50",
            isWishlisted ? "text-red-500" : "text-slate-400"
          )}
          onClick={toggleWishlist}
        >
          <Heart className={cn("w-5 h-5 md:w-6 md:h-6", isWishlisted && "fill-current")} />
        </button>
      </div>

      {/* Product Image - Large & Prominent */}
      <div className="relative aspect-square overflow-hidden bg-slate-50/50 flex items-center justify-center p-2 md:p-4">
        <Link href={`/product/${product.id}`} className="block w-full h-full relative z-10">
          <div className="relative w-full h-full transition-all duration-700 group-hover:scale-105">
             <ImageWithFallback
                src={product.imageUrls[0]}
                alt={product.name}
                fill
                className="object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.15)] group-hover:drop-shadow-[0_45px_70px_rgba(0,0,0,0.25)]"
              />
          </div>
        </Link>
        
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm z-30">
            <span className="text-slate-900 border-slate-900 border-2 font-black text-xs md:text-base px-6 py-2 rounded-full uppercase tracking-widest rotate-12 shadow-2xl">
              STOCK OUT
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4 md:p-6 flex flex-col flex-grow space-y-2 md:space-y-4 bg-white/40">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[8px] md:text-[9px] font-black text-primary/70 uppercase tracking-widest px-2 py-0.5 bg-primary/5 rounded-md">
              {product.category}
            </span>
            {product.isFeatured && (
              <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[7px] md:text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles className="w-2.5 h-2.5" /> SPECIAL
              </Badge>
            )}
          </div>
          <Link href={`/product/${product.id}`}>
            <h3 className="font-black text-xs md:text-lg text-slate-900 line-clamp-1 leading-tight group-hover:text-primary transition-colors tracking-tight">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="pt-2 mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 md:gap-2">
              <span className="font-black text-sm md:text-xl text-slate-900">
                ৳{hasDiscount ? product.discountPrice : product.price}
              </span>
              {hasDiscount && (
                <span className="text-[9px] md:text-xs text-slate-300 line-through font-bold">
                  ৳{product.price}
                </span>
              )}
            </div>
          </div>
          <Button size="icon" className="h-8 w-8 md:h-12 md:w-12 rounded-xl md:rounded-2xl shadow-2xl shadow-primary/30 bg-primary group-hover:scale-110 transition-all border-none shrink-0" asChild>
             <Link href={`/product/${product.id}`}>
              <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-white" />
             </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
