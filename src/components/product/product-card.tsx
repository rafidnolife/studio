"use client";

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Star, Sparkles } from 'lucide-react';
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
      toast({ title: 'মুছে ফেলা হয়েছে', description: 'উইশলিস্ট থেকে সরানো হয়েছে।' });
    } else {
      updated = [...wishlist, product];
      toast({ title: 'যুক্ত করা হয়েছে', description: 'উইশলিস্টে যুক্ত করা হয়েছে।' });
    }
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setIsWishlisted(!isWishlisted);
  };

  return (
    <Card className={cn(
      "group overflow-hidden border-none transition-all duration-700 bg-white rounded-[2.5rem] flex flex-col h-full",
      product.isFeatured ? "shadow-2xl shadow-primary/5 ring-1 ring-primary/10" : "shadow-sm hover:shadow-xl"
    )}>
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        <Link href={`/product/${product.id}`} className="block h-full">
          <ImageWithFallback
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            className="group-hover:scale-110 transition-transform duration-[2s] object-cover"
          />
        </Link>
        
        {/* Actions Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
          <Button 
            size="icon" 
            variant="secondary" 
            className={cn(
              "rounded-xl shadow-xl glass h-10 w-10 border-none",
              isWishlisted ? "text-red-500" : "text-slate-600"
            )}
            onClick={toggleWishlist}
          >
            <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
          </Button>
        </div>

        {hasDiscount && (
          <Badge className="absolute top-4 left-4 bg-destructive text-white border-none px-3 py-1 rounded-lg font-black text-xs">
            -{discountPercent}% ছাড়
          </Badge>
        )}

        {product.isFeatured && (
          <Badge className="absolute bottom-4 left-4 bg-primary text-white px-3 py-1 rounded-lg shadow-lg font-black text-[9px] gap-1 animate-pulse">
            <Star className="w-3 h-3 fill-current" /> BEST CHOICE
          </Badge>
        )}
        
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
            <Badge variant="outline" className="text-white border-white border-2 font-black text-lg px-6 py-2 rounded-full">
              স্টক শেষ
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-6 flex flex-col flex-grow space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">{product.category}</p>
            {product.isFeatured && <Sparkles className="w-3 h-3 text-primary" />}
          </div>
          <Link href={`/product/${product.id}`}>
            <h3 className="font-black text-lg text-slate-800 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="pt-2 mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
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
          <Button size="icon" className="h-12 w-12 rounded-xl shadow-lg shadow-primary/20" asChild>
             <Link href={`/product/${product.id}`}>
              <ShoppingCart className="w-5 h-5" />
             </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
