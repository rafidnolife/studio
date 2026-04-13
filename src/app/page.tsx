
"use client";

import { useMemo, useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, limit, where, getDoc, doc } from 'firebase/firestore';
import { Product, ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Zap, Star, ShieldCheck, ShoppingBag, LayoutGrid } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const db = useFirestore();
  const [settings, setSettings] = useState({
    heroTitle: 'সেরা পণ্যের সেরা বাজার',
    heroSubtitle: 'সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন ঝামেলাহীন কেনাকাটায়। ১০০% ক্যাশ অন ডেলিভারি।'
  });

  useEffect(() => {
    getDoc(doc(db, 'settings', 'site')).then(s => {
      if (s.exists()) setSettings(s.data() as any);
    });
  }, [db]);
  
  const featuredQuery = useMemo(() => {
    return query(collection(db, 'products'), where('isFeatured', '==', true), limit(8));
  }, [db]);

  const allProductsQuery = useMemo(() => {
    return query(collection(db, 'products'), limit(8));
  }, [db]);

  const { data: featuredProducts, loading: featLoading } = useCollection<Product>(featuredQuery);
  const { data: recentProducts, loading: recentLoading } = useCollection<Product>(allProductsQuery);

  const categories = [
    { name: 'ইলেকট্রনিক্স', icon: '📱' },
    { name: 'লাইফস্টাইল', icon: '👕' },
    { name: 'গ্যাজেট', icon: '🎧' },
    { name: 'হোম অ্যাপ্লায়েন্স', icon: '🏠' },
    { name: 'অন্যান্য', icon: '📦' },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 bg-[#F9FBF9]">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-6 space-y-16">
        {/* Hero Section */}
        <section className="relative rounded-[3rem] overflow-hidden h-[350px] sm:h-[550px] group shadow-2xl border-4 border-white">
          <ImageWithFallback 
            src="https://picsum.photos/seed/dokaan-express-v2/1200/600" 
            alt="Dokaan Express Banner" 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-1000"
            data-ai-hint="luxury shopping"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-8 sm:px-20 text-white space-y-6">
            <Badge className="w-fit bg-primary text-white border-none px-6 py-2 text-sm rounded-full animate-bounce">
              অফিশিয়াল লঞ্চ অফার! 🚀
            </Badge>
            <h1 className="text-4xl sm:text-7xl font-black max-w-2xl leading-tight drop-shadow-2xl">
              {settings.heroTitle.split(' ')[0]} <br />
              <span className="text-primary">{settings.heroTitle.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-sm sm:text-2xl text-gray-200 max-w-xl font-medium opacity-90">
              {settings.heroSubtitle}
            </p>
            <div className="flex gap-4 pt-4">
              <Button size="lg" className="rounded-full px-10 h-16 bg-primary hover:bg-primary/90 text-xl font-bold shadow-xl shadow-primary/40" asChild>
                <Link href="/products">এখনই কিনুন</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Zap, label: 'দ্রুত ডেলিভারি', sub: 'সারা দেশে ২৪ ঘণ্টায়' },
            { icon: ShieldCheck, label: 'নিরাপদ অর্ডার', sub: 'হোয়াটসঅ্যাপ ভেরিফাইড' },
            { icon: Star, label: '১০০% অরিজিনাল', sub: 'কোয়ালিটি গ্যারান্টি' },
            { icon: ShoppingBag, label: 'ক্যাশ অন ডেলিভারি', sub: 'পণ্য দেখে টাকা' }
          ].map((f, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border-none shadow-sm flex flex-col items-center text-center space-y-3 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <f.icon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{f.label}</h3>
                <p className="text-xs text-muted-foreground">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-400 fill-current" />
              আপনার জন্য স্পেশাল
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {featLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-80 rounded-[2rem]" />) : 
              featuredProducts.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>

        {/* Categories */}
        <section className="bg-white p-12 rounded-[3rem] shadow-sm border space-y-8">
          <h2 className="text-2xl font-bold text-center">ক্যাটাগরি অনুযায়ী খুঁজুন</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {categories.map((cat, i) => (
              <Link key={i} href={`/products?category=${cat.name}`} className="group flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-muted/50 rounded-3xl flex items-center justify-center text-4xl group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:-translate-y-2 shadow-sm">
                  {cat.icon}
                </div>
                <span className="font-bold group-hover:text-primary">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Products */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black">নতুন পণ্যসমূহ</h2>
            <Button variant="link" className="text-primary text-lg font-bold" asChild>
              <Link href="/products">সব দেখুন <ChevronRight /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {recentLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-80 rounded-[2rem]" />) : 
              recentProducts.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>
      </main>
    </div>
  );
}
