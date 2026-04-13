
"use client";

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Button } from '@/components/ui/button';
import { Heart, Star, Sparkles, ArrowRight } from 'lucide-react';
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
      "group relative overflow-hidden border-none transition-all duration-1000 bg-white rounded-[3rem] flex flex-col h-full",
      product.isFeatured ? "shadow-[0_20px_50px_rgba(16,185,129,0.15)] ring-1 ring-primary/10 scale-[1.02] z-10" : "shadow-xl hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] hover:-translate-y-2"
    )}>
      {/* Badges Overlay - Now perfectly in corners to not obscure image */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
        {hasDiscount && (
          <Badge className="bg-red-500 text-white border-none px-4 py-1.5 rounded-xl font-black text-[10px] shadow-lg shadow-red-500/20">
            -{discountPercent}%
          </Badge>
        )}
      </div>
      
      <div className="absolute top-6 right-6 z-20">
        <Button 
          size="icon" 
          variant="ghost" 
          className={cn(
            "rounded-2xl h-11 w-11 glass border-none shadow-sm transition-all hover:scale-110 active:scale-90",
            isWishlisted ? "text-red-500 bg-red-50/80" : "text-slate-400 bg-white/60"
          )}
          onClick={toggleWishlist}
        >
          <Heart className={cn("w-5 h-5 transition-transform duration-500", isWishlisted && "fill-current scale-110")} />
        </Button>
      </div>

      {/* Image Container with large padding to center product image perfectly */}
      <div className="relative aspect-square overflow-hidden bg-slate-50/30 p-10 md:p-12">
        <Link href={`/product/${product.id}`} className="block w-full h-full relative z-10">
          <ImageWithFallback
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            className="group-hover:scale-110 transition-transform duration-[2s] object-contain drop-shadow-2xl"
          />
        </Link>
        
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px] z-30">
            <Badge variant="outline" className="text-slate-900 border-slate-900 border-2 font-black text-lg px-8 py-3 rounded-2xl shadow-xl">
              স্টক শেষ
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-8 md:p-10 flex flex-col flex-grow space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{product.category}</span>
            {product.isFeatured && (
              <Badge className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-0.5 h-5 rounded-full font-black text-[8px] uppercase tracking-tighter">
                <Sparkles className="w-2.5 h-2.5 mr-1" /> Featured
              </Badge>
            )}
          </div>
          <Link href={`/product/${product.id}`}>
            <h3 className="font-black text-xl text-slate-900 line-clamp-1 leading-tight group-hover:text-primary transition-colors duration-500">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="pt-6 mt-auto flex items-center justify-between border-t border-slate-50">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-black text-2xl text-slate-900">
                ৳{hasDiscount ? product.discountPrice : product.price}
              </span>
              {hasDiscount && (
                <span className="text-sm text-slate-300 line-through font-bold">
                  ৳{product.price}
                </span>
              )}
            </div>
          </div>
          <Button size="icon" className="h-14 w-14 rounded-2xl shadow-2xl shadow-primary/30 hover:scale-110 transition-all duration-500 bg-primary hover:bg-primary/90" asChild>
             <Link href={`/product/${product.id}`}>
              <ArrowRight className="w-6 h-6" />
             </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
