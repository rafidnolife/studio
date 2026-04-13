
"use client";

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Product, ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const items = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlist(items);
    }
  }, []);

  return (
    <div className="min-h-screen bg-muted/10 pb-20 md:pb-0">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/products">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">আপনার উইশলিস্ট ({wishlist.length})</h1>
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center space-y-6 bg-white rounded-3xl border shadow-sm max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <Heart className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">উইশলিস্টে কোনো পণ্য নেই!</h3>
              <p className="text-muted-foreground">আপনার পছন্দের পণ্যগুলো এখানে সেভ করে রাখতে পারবেন।</p>
            </div>
            <Button className="rounded-full px-8 h-12 text-lg" asChild>
              <Link href="/products">
                <ShoppingBag className="w-5 h-5 mr-2" />
                পণ্য খুঁজুন
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
