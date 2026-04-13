"use client";

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
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
      toast({ title: 'রিমুভ করা হয়েছে', description: 'উইশলিস্ট থেকে পণ্যটি সরানো হয়েছে।' });
    } else {
      updated = [...wishlist, product];
      toast({ title: 'যুক্ত করা হয়েছে', description: 'পণ্যটি আপনার উইশলিস্টে যুক্ত হয়েছে।' });
    }
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setIsWishlisted(!isWishlisted);
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden border-none transition-all duration-500 bg-white rounded-[2rem] flex flex-col h-full shadow-lg hover:shadow-2xl",
      product.isFeatured && "ring-2 ring-primary/20"
    )}>
      {/* Badges Overlay - Moved to very edges to avoid blocking the image */}
      <div className="absolute top-2 left-2 z-20">
        {hasDiscount && (
          <Badge className="bg-red-500 text-white border-none px-2 py-0.5 rounded-lg font-black text-[9px] shadow-lg">
            -{discountPercent}%
          </Badge>
        )}
      </div>
      
      <div className="absolute top-2 right-2 z-20">
        <Button 
          size="icon" 
          variant="ghost" 
          className={cn(
            "rounded-xl h-8 w-8 glass border-none shadow-sm transition-all hover:scale-110",
            isWishlisted ? "text-red-500 bg-red-50/80" : "text-slate-300 bg-white/40"
          )}
          onClick={toggleWishlist}
        >
          <Heart className={cn("w-4 h-4 transition-transform", isWishlisted && "fill-current")} />
        </Button>
      </div>

      {/* Large Image Container - Reduced padding for bigger product view */}
      <div className="relative aspect-square overflow-hidden bg-slate-50/30 p-2 sm:p-4 flex items-center justify-center">
        <Link href={`/product/${product.id}`} className="block w-full h-full relative z-10">
          <ImageWithFallback
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            className="group-hover:scale-105 transition-transform duration-700 object-contain drop-shadow-xl"
          />
        </Link>
        
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm z-30">
            <span className="text-slate-900 border-slate-900 border-2 font-black text-xs px-4 py-1.5 rounded-full uppercase">
              স্টক শেষ
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4 md:p-6 flex flex-col flex-grow space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">{product.category}</span>
          </div>
          <Link href={`/product/${product.id}`}>
            <h3 className="font-bold text-sm md:text-base text-slate-900 line-clamp-1 leading-snug group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="pt-2 mt-auto flex items-center justify-between border-t border-slate-100">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-lg text-slate-900 tracking-tighter">
                ৳{hasDiscount ? product.discountPrice : product.price}
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-slate-300 line-through font-bold">
                  ৳{product.price}
                </span>
              )}
            </div>
          </div>
          <Button size="icon" className="h-10 w-10 rounded-xl shadow-lg bg-primary" asChild>
             <Link href={`/product/${product.id}`}>
              <ArrowRight className="w-5 h-5 text-white" />
             </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}