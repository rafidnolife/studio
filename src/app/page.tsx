
"use client";

import { useMemo } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { Product, ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Zap, Star, ShieldCheck, ShoppingBag, LayoutGrid } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const db = useFirestore();
  
  const featuredQuery = useMemo(() => {
    return query(collection(db, 'products'), limit(8));
  }, [db]);

  const { data: featuredProducts, loading } = useCollection<Product>(featuredQuery);

  const categories = [
    { name: 'ইলেকট্রনিক্স', icon: '📱', color: 'bg-blue-500' },
    { name: 'লাইফস্টাইল', icon: '👕', color: 'bg-pink-500' },
    { name: 'গ্যাজেট', icon: '🎧', color: 'bg-purple-500' },
    { name: 'হোম অ্যাপ্লায়েন্স', icon: '🏠', color: 'bg-orange-500' },
    { name: 'অন্যান্য', icon: '📦', color: 'bg-gray-500' },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 bg-[#F9FBF9]">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-6 space-y-12">
        {/* Hero Section */}
        <section className="relative rounded-[2rem] overflow-hidden h-[250px] sm:h-[450px] group shadow-2xl">
          <ImageWithFallback 
            src="https://picsum.photos/seed/dokaan-banner/1200/400" 
            alt="Dokaan Express Banner" 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex flex-col justify-center px-8 sm:px-16 text-white space-y-4">
            <Badge className="w-fit bg-accent text-accent-foreground border-none px-4 py-1 text-xs sm:text-sm animate-pulse">
              ঈদ ধামাকা অফার!
            </Badge>
            <h1 className="text-3xl sm:text-6xl font-bold max-w-xl leading-tight drop-shadow-lg">
              সেরা পণ্যের <br />
              <span className="text-accent">সেরা বাজার</span>
            </h1>
            <p className="text-xs sm:text-xl text-gray-200 max-w-md drop-shadow-md">
              সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন ঝামেলাহীন কেনাকাটায়। ১০০% ক্যাশ অন ডেলিভারি।
            </p>
            <div className="flex gap-4 pt-2">
              <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-lg shadow-lg" asChild>
                <Link href="/products">শুরু করুন</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 text-lg hidden sm:flex" asChild>
                <Link href="/wishlist">উইশলিস্ট</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <LayoutGrid className="w-6 h-6 text-primary" />
              ক্যাটাগরি
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((cat, i) => (
              <Link 
                key={i} 
                href={`/products?category=${cat.name}`}
                className="flex flex-col items-center gap-3 min-w-[100px] group"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all bg-white border`}>
                  {cat.icon}
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Zap, label: 'দ্রুত ডেলিভারি', sub: 'সারা দেশে ২৪-৪৮ ঘণ্টায়' },
            { icon: ShieldCheck, label: 'নিরাপদ অর্ডার', sub: 'সরাসরি হোয়াটসঅ্যাপে' },
            { icon: Star, label: 'প্রিমিয়াম মান', sub: '১০০% অরিজিনাল গ্যারান্টি' },
            { icon: ShoppingBag, label: 'ক্যাশ অন ডেলিভারি', sub: 'পণ্য বুঝে পেমেন্ট' }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-muted space-y-3 hover:border-primary/20 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <feature.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm sm:text-base">{feature.label}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{feature.sub}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Featured Products */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-accent fill-current" />
              সেরা বিক্রীত পণ্য
            </h2>
            <Button variant="link" className="text-primary gap-1 text-lg font-bold" asChild>
              <Link href="/products">সব দেখুন <ChevronRight className="w-5 h-5" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-[1.5rem]" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-muted-foreground/30 text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg">এখনো কোনো পণ্য যোগ করা হয়নি।</p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter/Banner */}
        <section className="bg-primary rounded-[2rem] p-8 sm:p-12 text-center text-white space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          
          <h2 className="text-3xl sm:text-4xl font-bold relative z-10">সরাসরি আপডেট পেতে যুক্ত হোন</h2>
          <p className="text-primary-foreground/80 max-w-lg mx-auto relative z-10">
            নতুন পণ্য এবং স্পেশাল অফার সবার আগে পেতে আমাদের সাথেই থাকুন।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Button size="lg" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 px-10 h-14 text-lg font-bold">
              হোয়াটসঅ্যাপ গ্রুপে জয়েন করুন
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">ড</div>
                <span className="font-bold text-2xl">দোকান <span className="text-primary">এক্সপ্রেস</span></span>
              </div>
              <p className="text-muted-foreground max-w-sm">
                আমরা বিশ্বাস করি কোয়ালিটি এবং কাস্টমার সন্তুষ্টিতে। সারা বাংলাদেশে দ্রুততম সময়ে পণ্য পৌঁছে দেয়াই আমাদের লক্ষ্য।
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-lg">গুরুত্বপূর্ণ লিঙ্ক</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/products" className="hover:text-primary">সব পণ্য</Link></li>
                <li><Link href="/about" className="hover:text-primary">আমাদের সম্পর্কে</Link></li>
                <li><Link href="/contact" className="hover:text-primary">যোগাযোগ</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-lg">সাপোর্ট</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>রিফান্ড পলিসি</li>
                <li>ডেলিভারি ট্র্যাকিং</li>
                <li>প্রাইভেসি পলিসি</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© ২০২৪ দোকান এক্সপ্রেস। সর্বস্বত্ব সংরক্ষিত।</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
