
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
      "group relative overflow-hidden border-none transition-all duration-500 bg-white/80 glass rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col h-full shadow-lg hover:shadow-2xl hover:-translate-y-1",
      product.isFeatured && "ring-1 ring-primary/20"
    )}>
      {/* Small Discount Badge - Non-obstructive Corner */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-20">
          <Badge className="bg-red-500 text-white border-none px-2 py-0.5 rounded-lg font-black text-[8px] md:text-[10px] shadow-md uppercase tracking-tighter">
            {discountPercent}% OFF
          </Badge>
        </div>
      )}
      
      {/* Wishlist Button */}
      <div className="absolute top-3 right-3 z-20">
        <button 
          className={cn(
            "rounded-full h-8 w-8 md:h-10 md:w-10 bg-white/60 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 shadow-sm",
            isWishlisted ? "text-red-500" : "text-slate-400"
          )}
          onClick={toggleWishlist}
        >
          <Heart className={cn("w-4 h-4 md:w-5 md:h-5", isWishlisted && "fill-current")} />
        </button>
      </div>

      {/* Image Container - Fixed Aspect Ratio (1:1 Square) */}
      <div className="relative aspect-square overflow-hidden bg-slate-50/30 flex items-center justify-center p-3 md:p-6">
        <Link href={`/product/${product.id}`} className="block w-full h-full relative z-10">
          <ImageWithFallback
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            className="group-hover:scale-110 transition-transform duration-700 object-contain drop-shadow-lg"
          />
        </Link>
        
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm z-30">
            <span className="text-slate-900 border-slate-900 border-2 font-black text-[10px] md:text-sm px-4 py-1.5 rounded-full uppercase tracking-widest rotate-12">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-3 md:p-6 flex flex-col flex-grow space-y-2 md:space-y-4 bg-white/40">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[7px] md:text-[9px] font-black text-primary/70 uppercase tracking-widest">
              {product.category}
            </span>
            {product.isFeatured && (
              <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[6px] md:text-[8px] px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2 h-2" /> SPECIAL
              </Badge>
            )}
          </div>
          <Link href={`/product/${product.id}`}>
            <h3 className="font-black text-[12px] md:text-lg text-slate-900 line-clamp-1 leading-tight group-hover:text-primary transition-colors tracking-tight">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="pt-2 mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1 md:gap-2">
              <span className="font-black text-sm md:text-xl text-slate-900">
                ৳{hasDiscount ? product.discountPrice : product.price}
              </span>
              {hasDiscount && (
                <span className="text-[8px] md:text-xs text-slate-300 line-through font-bold">
                  ৳{product.price}
                </span>
              )}
            </div>
          </div>
          <Button size="icon" className="h-8 w-8 md:h-10 md:w-10 rounded-xl shadow-lg shadow-primary/20 bg-primary group-hover:scale-110 transition-all" asChild>
             <Link href={`/product/${product.id}`}>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
             </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
