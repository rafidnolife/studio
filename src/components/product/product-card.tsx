
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
      "group relative overflow-hidden border-none transition-all duration-700 bg-white rounded-[2.5rem] flex flex-col h-full shadow-xl hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] hover:-translate-y-2",
      product.isFeatured && "ring-2 ring-primary/20"
    )}>
      {/* Badges Overlay - Strictly in corners */}
      <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
        {hasDiscount && (
          <Badge className="bg-red-500 text-white border-none px-4 py-1.5 rounded-2xl font-black text-[10px] shadow-xl uppercase tracking-widest">
            -{discountPercent}%
          </Badge>
        )}
        {product.isFeatured && (
          <Badge className="bg-amber-500 text-white border-none px-4 py-1.5 rounded-2xl font-black text-[10px] shadow-xl uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> SPECIAL
          </Badge>
        )}
      </div>
      
      <div className="absolute top-5 right-5 z-20">
        <Button 
          size="icon" 
          variant="ghost" 
          className={cn(
            "rounded-2xl h-12 w-12 glass border-none shadow-xl transition-all hover:scale-110",
            isWishlisted ? "text-red-500 bg-red-50/90" : "text-slate-300 bg-white/40"
          )}
          onClick={toggleWishlist}
        >
          <Heart className={cn("w-6 h-6 transition-transform", isWishlisted && "fill-current")} />
        </Button>
      </div>

      {/* HUGE Image Container - Edge to Edge */}
      <div className="relative aspect-square overflow-hidden bg-slate-50/10 flex items-center justify-center">
        <Link href={`/product/${product.id}`} className="block w-full h-full relative z-10">
          <ImageWithFallback
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            unoptimized={true}
            className="group-hover:scale-110 transition-transform duration-700 object-contain drop-shadow-2xl p-4"
          />
        </Link>
        
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm z-30">
            <span className="text-slate-900 border-slate-900 border-4 font-black text-sm px-8 py-3 rounded-full uppercase tracking-[0.2em] rotate-12">
              স্টক শেষ
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-8 md:p-10 flex flex-col flex-grow space-y-8 bg-gradient-to-b from-transparent to-slate-50/30">
        <div className="space-y-3">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-3 py-1 bg-primary/5 rounded-full inline-block">{product.category}</span>
          <Link href={`/product/${product.id}`}>
            <h3 className="font-black text-xl md:text-2xl text-slate-900 line-clamp-1 leading-tight group-hover:text-primary transition-colors tracking-tighter">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="pt-6 mt-auto flex items-center justify-between border-t border-slate-100/50">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-black text-3xl text-slate-900 tracking-tighter">
                ৳{hasDiscount ? product.discountPrice : product.price}
              </span>
              {hasDiscount && (
                <span className="text-sm text-slate-300 line-through font-bold">
                  ৳{product.price}
                </span>
              )}
            </div>
          </div>
          <Button size="icon" className="h-14 w-14 rounded-2xl shadow-2xl shadow-primary/30 bg-primary group-hover:scale-110 transition-all" asChild>
             <Link href={`/product/${product.id}`}>
              <ArrowRight className="w-7 h-7 text-white" />
             </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
