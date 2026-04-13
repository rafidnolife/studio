
"use client";

import { useMemo } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { Product, ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Zap, Star, ShieldCheck, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const db = useFirestore();
  
  const featuredQuery = useMemo(() => {
    return query(collection(db, 'products'), limit(8));
  }, [db]);

  const { data: featuredProducts, loading } = useCollection<Product>(featuredQuery);

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-6 space-y-12">
        {/* Hero Section */}
        <section className="relative rounded-2xl overflow-hidden h-[200px] sm:h-[400px]">
          <ImageWithFallback 
            src="https://picsum.photos/seed/dokaan-banner/1200/400" 
            alt="Dokaan Express Banner" 
            fill 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-8 sm:px-16 text-white space-y-2 sm:space-y-4">
            <Badge className="w-fit bg-accent text-accent-foreground border-none">নতুন অফার</Badge>
            <h1 className="text-2xl sm:text-5xl font-bold max-w-md leading-tight">সেরা পণ্যের সেরা বাজার</h1>
            <p className="text-xs sm:text-lg text-gray-200 max-w-sm">সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন ঝামেলাহীন কেনাকাটায়।</p>
            <Button className="w-fit rounded-full px-8" asChild>
              <Link href="/products">এখনই কিনুন</Link>
            </Button>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Zap, label: 'দ্রুত ডেলিভারি', sub: 'সারা দেশে ক্যাশ অন ডেলিভারি' },
            { icon: ShieldCheck, label: 'সুরক্ষিত পেমেন্ট', sub: 'হোয়াটসঅ্যাপে সরাসরি অর্ডার' },
            { icon: Star, label: 'সেরা মান', sub: '১০০% অরিজিনাল পণ্য' },
            { icon: ShoppingBag, label: 'সহজ কেনাকাটা', sub: 'কোনো কার্ড ছাড়াই অর্ডার' }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm">{feature.label}</h3>
              <p className="text-[10px] text-muted-foreground">{feature.sub}</p>
            </div>
          ))}
        </section>

        {/* Featured Products */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" fill="currentColor" />
              ফিচারড পণ্য
            </h2>
            <Button variant="link" className="text-primary gap-1" asChild>
              <Link href="/products">সব দেখুন <ChevronRight className="w-4 h-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                এখনো কোনো পণ্য যোগ করা হয়নি।
              </div>
            )}
          </div>
        </section>

        {/* Categories Section (Simplified) */}
        <section className="bg-primary/5 rounded-2xl p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold">ক্যাটাগরি অনুযায়ী খুঁজুন</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['ইলেকট্রনিক্স', 'লাইফস্টাইল', 'গ্যাজেট', 'হোম অ্যাপ্লায়েন্স', 'অন্যান্য'].map(cat => (
              <Button key={cat} variant="outline" className="rounded-full bg-white hover:bg-primary hover:text-white border-none shadow-sm" asChild>
                <Link href={`/products?category=${cat}`}>{cat}</Link>
              </Button>
            ))}
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-12 border-t mt-12 text-center text-muted-foreground space-y-4">
        <p className="text-sm">© ২০২৪ দোকান এক্সপ্রেস। সর্বস্বত্ব সংরক্ষিত।</p>
        <p className="text-xs">এটি একটি ডেমো ই-কমার্স সাইট।</p>
      </footer>
    </div>
  );
}
