"use client";

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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
    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-700 bg-white rounded-[2.5rem] flex flex-col h-full">
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
        <div className="absolute top-5 right-5 flex flex-col gap-3 opacity-0 group-hover:opacity-100 translate-x-5 group-hover:translate-x-0 transition-all duration-500">
          <Button 
            size="icon" 
            variant="secondary" 
            className={`rounded-2xl shadow-xl glass h-12 w-12 border-none ${isWishlisted ? 'text-red-500 bg-red-50' : 'text-slate-600'}`}
            onClick={toggleWishlist}
          >
            <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {hasDiscount && (
          <Badge className="absolute top-5 left-5 bg-destructive hover:bg-destructive px-4 py-1.5 rounded-full shadow-xl font-black text-sm">
            -{discountPercent}%
          </Badge>
        )}

        {product.isFeatured && (
          <Badge className="absolute bottom-5 left-5 bg-amber-400 hover:bg-amber-400 text-slate-900 px-4 py-1.5 rounded-full shadow-xl font-black text-[10px] gap-1">
            <Star className="w-3 h-3 fill-current" /> BEST SELLER
          </Badge>
        )}
        
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
            <Badge variant="outline" className="text-white border-white border-2 font-black text-xl px-6 py-2 rounded-full">
              স্টক আউট
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-8 flex flex-col flex-grow space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{product.category}</p>
          <Link href={`/product/${product.id}`}>
            <h3 className="font-black text-xl text-slate-900 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="pt-2 mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-slate-400 font-bold mb-[-4px]">মূল্য</span>
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl text-slate-900 tracking-tighter">
                ৳{hasDiscount ? product.discountPrice : product.price}
              </span>
              {hasDiscount && (
                <span className="text-sm text-slate-300 line-through font-bold decoration-2">
                  ৳{product.price}
                </span>
              )}
            </div>
          </div>
          <Button size="icon" className="h-14 w-14 rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-110" asChild>
             <Link href={`/product/${product.id}`}>
              <ShoppingCart className="w-6 h-6" />
             </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}