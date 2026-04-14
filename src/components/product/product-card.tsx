
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
      "group relative overflow-hidden border-none transition-all duration-700 bg-white rounded-[2rem] md:rounded-[3rem] flex flex-col h-full shadow-xl hover:shadow-[0_30px_60px_rgba(16,185,129,0.15)] hover:-translate-y-2",
      product.isFeatured && "ring-2 ring-primary/10"
    )}>
      {/* Discount Badge - Floating and Subtle */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        {hasDiscount && (
          <Badge className="bg-red-500 text-white border-none px-3 py-1.5 rounded-xl font-black text-[9px] md:text-[11px] shadow-lg uppercase tracking-widest animate-pulse">
            {discountPercent}% ছাড়
          </Badge>
        )}
      </div>
      
      {/* Wishlist Button */}
      <div className="absolute top-4 right-4 z-20">
        <Button 
          size="icon" 
          variant="ghost" 
          className={cn(
            "rounded-2xl h-10 w-10 md:h-12 md:w-12 glass border-none shadow-xl transition-all hover:scale-110",
            isWishlisted ? "text-red-500 bg-red-50/90" : "text-slate-300 bg-white/40"
          )}
          onClick={toggleWishlist}
        >
          <Heart className={cn("w-5 h-5 md:w-6 md:h-6 transition-transform", isWishlisted && "fill-current")} />
        </Button>
      </div>

      {/* Large Image Container - HD and Centered */}
      <div className="relative aspect-square overflow-hidden bg-slate-50/20 flex items-center justify-center p-2 md:p-4">
        <Link href={`/product/${product.id}`} className="block w-full h-full relative z-10">
          <ImageWithFallback
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            unoptimized={true}
            className="group-hover:scale-105 transition-transform duration-1000 object-contain drop-shadow-2xl"
          />
        </Link>
        
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-md z-30">
            <span className="text-slate-900 border-slate-900 border-2 md:border-4 font-black text-xs md:text-lg px-8 py-3 md:px-10 md:py-4 rounded-full uppercase tracking-[0.3em] rotate-12">
              স্টক নেই
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-6 md:p-10 flex flex-col flex-grow space-y-4 md:space-y-8 bg-white">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] px-3 py-1 bg-primary/5 rounded-full inline-block">
              {product.category}
            </span>
            {product.isFeatured && (
              <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[8px] md:text-[9px] px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> স্পেশাল
              </Badge>
            )}
          </div>
          <Link href={`/product/${product.id}`}>
            <h3 className="font-black text-sm md:text-2xl text-slate-900 line-clamp-1 leading-tight group-hover:text-primary transition-colors tracking-tighter">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="pt-4 mt-auto flex items-center justify-between border-t border-slate-50">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2 md:gap-3">
              <span className="font-black text-lg md:text-3xl text-slate-900 tracking-tighter">
                ৳{hasDiscount ? product.discountPrice : product.price}
              </span>
              {hasDiscount && (
                <span className="text-[10px] md:text-sm text-slate-300 line-through font-bold">
                  ৳{product.price}
                </span>
              )}
            </div>
          </div>
          <Button size="icon" className="h-10 w-10 md:h-14 md:w-14 rounded-2xl shadow-2xl shadow-primary/30 bg-primary group-hover:scale-110 transition-all" asChild>
             <Link href={`/product/${product.id}`}>
              <ArrowRight className="w-5 h-5 md:w-7 md:h-7 text-white" />
             </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
