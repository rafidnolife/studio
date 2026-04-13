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
      "group relative overflow-hidden border-none transition-all duration-700 bg-white rounded-[3.5rem] flex flex-col h-full",
      product.isFeatured ? "shadow-[0_40px_80px_rgba(16,185,129,0.12)] ring-1 ring-primary/5 scale-[1.01]" : "shadow-xl hover:shadow-2xl hover:-translate-y-2"
    )}>
      {/* Badges Overlay - Positions improved to not overlap the large image */}
      <div className="absolute top-6 left-6 z-20">
        {hasDiscount && (
          <Badge className="bg-red-500 text-white border-none px-4 py-1.5 rounded-2xl font-black text-[10px] shadow-lg shadow-red-500/20">
            -{discountPercent}%
          </Badge>
        )}
      </div>
      
      <div className="absolute top-6 right-6 z-20">
        <Button 
          size="icon" 
          variant="ghost" 
          className={cn(
            "rounded-2xl h-12 w-12 glass border-none shadow-sm transition-all hover:scale-110",
            isWishlisted ? "text-red-500 bg-red-50/80" : "text-slate-300 bg-white/40"
          )}
          onClick={toggleWishlist}
        >
          <Heart className={cn("w-6 h-6 transition-transform duration-500", isWishlisted && "fill-current scale-110")} />
        </Button>
      </div>

      {/* Enlarged Image Container - Reduced padding to make image big and fulfill the card */}
      <div className="relative aspect-square overflow-hidden bg-slate-50/50 p-4 sm:p-6 flex items-center justify-center">
        <Link href={`/product/${product.id}`} className="block w-full h-full relative z-10">
          <ImageWithFallback
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            className="group-hover:scale-110 transition-transform duration-700 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
          />
        </Link>
        
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm z-30">
            <Badge variant="outline" className="text-slate-900 border-slate-900 border-2 font-black text-xl px-10 py-4 rounded-3xl">
              স্টক শেষ
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-8 md:p-10 flex flex-col flex-grow space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-primary uppercase tracking-[0.25em]">{product.category}</span>
            {product.isFeatured && (
              <Badge className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-tighter">
                <Sparkles className="w-3 h-3 mr-1" /> Premium
              </Badge>
            )}
          </div>
          <Link href={`/product/${product.id}`}>
            <h3 className="font-black text-xl text-slate-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="pt-8 mt-auto flex items-center justify-between border-t border-slate-50">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-black text-2xl text-slate-900 tracking-tighter">
                ৳{hasDiscount ? product.discountPrice : product.price}
              </span>
              {hasDiscount && (
                <span className="text-sm text-slate-300 line-through font-bold">
                  ৳{product.price}
                </span>
              )}
            </div>
          </div>
          <Button size="icon" className="h-14 w-14 rounded-3xl shadow-2xl shadow-primary/30 hover:scale-110 transition-all duration-500 bg-primary" asChild>
             <Link href={`/product/${product.id}`}>
              <ArrowRight className="w-7 h-7" />
             </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}