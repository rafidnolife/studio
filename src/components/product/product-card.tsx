
"use client";

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Star, Sparkles, ArrowRight } from 'lucide-react';
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
      product.isFeatured ? "shadow-2xl ring-2 ring-primary/20 scale-[1.02] z-10" : "shadow-xl hover:shadow-2xl shadow-slate-200/50"
    )}>
      {/* Badge container for clean overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {hasDiscount && (
          <Badge className="bg-destructive text-white border-none px-4 py-1 rounded-xl font-black text-[10px] shadow-lg">
            -{discountPercent}% OFF
          </Badge>
        )}
        {product.isFeatured && (
          <Badge className="bg-primary text-white border-none px-4 py-1 rounded-xl font-black text-[10px] shadow-lg flex items-center gap-1.5 animate-pulse">
            <Star className="w-3 h-3 fill-current" /> BEST CHOICE
          </Badge>
        )}
      </div>

      <div className="relative aspect-[1/1.1] overflow-hidden bg-slate-50">
        <Link href={`/product/${product.id}`} className="block h-full">
          <ImageWithFallback
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            className="group-hover:scale-110 transition-transform duration-[2s] object-cover"
          />
        </Link>
        
        {/* Wishlist Button Overlay */}
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
          <Button 
            size="icon" 
            variant="secondary" 
            className={cn(
              "rounded-2xl shadow-2xl glass h-12 w-12 border-none",
              isWishlisted ? "text-red-500" : "text-slate-600 hover:text-red-500"
            )}
            onClick={toggleWishlist}
          >
            <Heart className={cn("w-6 h-6", isWishlisted && "fill-current")} />
          </Button>
        </div>
        
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[4px] z-30">
            <Badge variant="outline" className="text-white border-white border-2 font-black text-xl px-8 py-3 rounded-2xl">
              স্টক শেষ
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-8 flex flex-col flex-grow space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{product.category}</span>
            {product.isFeatured && <Sparkles className="w-4 h-4 text-amber-500" />}
          </div>
          <Link href={`/product/${product.id}`}>
            <h3 className="font-black text-xl text-slate-900 line-clamp-1 leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="pt-4 mt-auto flex items-center justify-between border-t border-slate-50">
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
          <Button size="icon" className="h-14 w-14 rounded-2xl shadow-xl shadow-primary/20 hover:scale-110 transition-transform" asChild>
             <Link href={`/product/${product.id}`}>
              <ArrowRight className="w-6 h-6" />
             </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
