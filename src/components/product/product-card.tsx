"use client";

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

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
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300">
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square">
          <ImageWithFallback
            src={product.imageUrls[0]}
            alt={product.name}
            fill
            className="group-hover:scale-105 transition-transform duration-500"
          />
          {hasDiscount && (
            <Badge className="absolute top-2 right-2 bg-destructive hover:bg-destructive">
              {discountPercent}% ছাড়
            </Badge>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-[2px]">
              <Badge variant="outline" className="text-destructive border-destructive font-bold text-lg">
                স্টক শেষ
              </Badge>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-primary">
              ৳{hasDiscount ? product.discountPrice : product.price}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-muted-foreground line-through">
                ৳{product.price}
              </span>
            )}
          </div>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-primary hover:text-primary-foreground" asChild>
             <Link href={`/product/${product.id}`}>
              <ShoppingCart className="w-4 h-4" />
             </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}