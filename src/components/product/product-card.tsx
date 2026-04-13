
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
      "group relative overflow-hidden border-none transition-all duration-700 bg-white rounded-[2.5rem] flex flex-col h-full",
      product.isFeatured ? "shadow-2xl ring-2 ring-primary/20 scale-[1.01] z-10" : "shadow-xl hover:shadow-2xl shadow-slate-200/50"
    )}>
      {/* Badges Overlay - Positioned carefully to not hide image center */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {hasDiscount && (
          <Badge className="bg-red-500 text-white border-none px-3 py-1 rounded-xl font-black text-[9px] shadow-lg">
            -{discountPercent}%
          </Badge>
        )}
      </div>
      
      <div className="absolute top-4 right-4 z-20">
        <Button 
          size="icon" 
          variant="ghost" 
          className={cn(
            "rounded-xl h-10 w-10 glass border-none shadow-sm transition-all hover:scale-110",
            isWishlisted ? "text-red-500 bg-red-50" : "text-slate-400 bg-white/50"
          )}
          onClick={toggleWishlist}
        >
          <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
        </Button>
      </div>

      {/* Image Container with Padding so Badges don't obscure content */}
      <div className="relative aspect-[1/1] overflow-hidden bg-slate-50 p-6 md:p-8">
        <Link href={`/product/${product.id}`} className="block w-full h-full relative">
          <ImageWithFallback
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            className="group-hover:scale-110 transition-transform duration-[2s] object-contain"
          />
        </Link>
        
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[4px] z-30">
            <Badge variant="outline" className="text-white border-white border-2 font-black text-lg px-6 py-2 rounded-2xl">
              স্টক শেষ
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-6 md:p-8 flex flex-col flex-grow space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">{product.category}</span>
            {product.isFeatured && <Badge className="bg-amber-100 text-amber-600 border-none px-2 py-0 h-4 rounded-full font-black text-[7px] uppercase tracking-tighter">Featured</Badge>}
          </div>
          <Link href={`/product/${product.id}`}>
            <h3 className="font-black text-lg text-slate-900 line-clamp-1 leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="pt-4 mt-auto flex items-center justify-between border-t border-slate-50">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-black text-xl text-slate-900">
                ৳{hasDiscount ? product.discountPrice : product.price}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-300 line-through font-bold">
                  ৳{product.price}
                </span>
              )}
            </div>
          </div>
          <Button size="icon" className="h-12 w-12 rounded-2xl shadow-xl shadow-primary/20 hover:scale-110 transition-transform" asChild>
             <Link href={`/product/${product.id}`}>
              <ArrowRight className="w-5 h-5" />
             </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
