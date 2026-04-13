
"use client";

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
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
    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-white rounded-[1.5rem]">
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/product/${product.id}`}>
          <ImageWithFallback
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            className="group-hover:scale-110 transition-transform duration-700"
          />
        </Link>
        
        {/* Floating Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
          <Button 
            size="icon" 
            variant="secondary" 
            className={`rounded-full shadow-md ${isWishlisted ? 'text-red-500' : 'text-muted-foreground'}`}
            onClick={toggleWishlist}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {hasDiscount && (
          <Badge className="absolute top-3 left-3 bg-destructive hover:bg-destructive px-3 py-1 rounded-full shadow-lg">
            {discountPercent}% ছাড়
          </Badge>
        )}
        
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-[2px]">
            <Badge variant="outline" className="text-destructive border-destructive font-bold text-lg px-4 py-1 bg-white/80">
              স্টক শেষ
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-2">
        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{product.category}</p>
        <Link href={`/product/${product.id}`}>
          <h3 className="font-bold text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <span className="font-black text-lg text-foreground">
              ৳{hasDiscount ? product.discountPrice : product.price}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-muted-foreground line-through">
                ৳{product.price}
              </span>
            )}
          </div>
          <Button size="icon" className="h-10 w-10 rounded-xl shadow-lg shadow-primary/20" asChild>
             <Link href={`/product/${product.id}`}>
              <ShoppingCart className="w-5 h-5" />
             </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
