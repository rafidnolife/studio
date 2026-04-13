"use client";

import { useMemo, useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, limit, where, getDoc, doc } from 'firebase/firestore';
import { Product, ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Star, ShieldCheck, ShoppingBag, Zap, Award } from 'lucide-react';
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
    <div className="flex flex-col min-h-screen bg-[#FDFDFD]">
      <Navbar />
      
      <main className="flex-grow space-y-24 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-8">
          <div className="relative rounded-[3.5rem] overflow-hidden h-[450px] md:h-[650px] shadow-2xl border-8 border-white group">
            <ImageWithFallback 
              src="https://picsum.photos/seed/luxury-market/1200/800" 
              alt="Hero Banner" 
              fill 
              className="object-cover transition-transform duration-[3s] group-hover:scale-110"
              data-ai-hint="premium shopping"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent flex flex-col justify-center px-10 md:px-24 text-white space-y-8">
              <Badge className="w-fit bg-primary/90 text-white border-none px-6 py-2 text-sm rounded-full backdrop-blur-md animate-pulse">
                লঞ্চিং অফার: ২০% পর্যন্ত ছাড়! ⚡
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black leading-tight tracking-tighter drop-shadow-2xl max-w-3xl">
                {settings.heroTitle.split(' ').map((word, i) => (
                  <span key={i} className={i === 1 ? 'text-primary' : ''}>{word} </span>
                ))}
              </h1>
              <p className="text-lg md:text-3xl text-gray-200 max-w-2xl font-medium leading-relaxed opacity-90">
                {settings.heroSubtitle}
              </p>
              <div className="flex flex-wrap gap-5 pt-4">
                <Button size="lg" className="rounded-full px-12 h-16 bg-primary hover:bg-primary/90 text-xl font-black shadow-2xl shadow-primary/40 transition-all hover:scale-105" asChild>
                  <Link href="/products">অর্ডার করুন</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-12 h-16 border-2 border-white/30 bg-white/10 backdrop-blur-md text-xl font-black text-white hover:bg-white/20 transition-all" asChild>
                  <Link href="/products">সব পণ্য</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {[
              { icon: Zap, title: 'ফাস্ট ডেলিভারি', desc: '২৪ ঘণ্টায় শিপিং', color: 'bg-amber-100 text-amber-600' },
              { icon: ShieldCheck, title: 'নিরাপদ পেমেন্ট', desc: '১০০% ক্যাশ অন ডেলিভারি', color: 'bg-green-100 text-green-600' },
              { icon: Star, title: 'সেরা কোয়ালিটি', desc: 'অরিজিনাল পণ্য গ্যারান্টি', color: 'bg-blue-100 text-blue-600' },
              { icon: Award, title: 'সেরা ডিল', desc: 'প্রতিদিন নতুন অফার', color: 'bg-purple-100 text-purple-600' }
            ].map((v, i) => (
              <div key={i} className="bg-white p-8 rounded-[3rem] shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center space-y-4 border border-slate-50 group hover:-translate-y-2">
                <div className={`w-16 h-16 ${v.color} rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:rotate-12`}>
                  <v.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-900">{v.title}</h3>
                  <p className="text-sm text-slate-500 font-medium">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="container mx-auto px-4 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 flex items-center gap-4">
                <Star className="w-10 h-10 text-amber-400 fill-current" />
                স্পেশাল <span className="text-primary">কালেকশন</span>
              </h2>
              <p className="text-slate-500 text-lg font-medium">অ্যাডমিনের পছন্দের সেরা কিছু পণ্য।</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {featLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[400px] rounded-[3rem]" />) : 
              featuredProducts.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-slate-50 py-24">
          <div className="container mx-auto px-4 space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black tracking-tight">পণ্য খুঁজুন ক্যাটাগরি অনুযায়ী</h2>
              <p className="text-slate-500 font-medium">সহজেই খুঁজে নিন আপনার প্রয়োজনীয় পণ্যসমূহ।</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              {categories.map((cat, i) => (
                <Link key={i} href={`/products?category=${cat.name}`} className="group flex flex-col items-center gap-5">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2.5rem] flex items-center justify-center text-5xl shadow-sm border group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl group-hover:shadow-primary/30">
                    {cat.icon}
                  </div>
                  <span className="font-bold text-lg md:text-xl text-slate-700 group-hover:text-primary transition-colors">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Arrivals */}
        <section className="container mx-auto px-4 space-y-12">
          <div className="flex items-end justify-between">
            <h2 className="text-4xl font-black tracking-tighter">নতুন <span className="text-primary">পণ্যসমূহ</span></h2>
            <Button variant="link" className="text-primary text-xl font-bold h-auto p-0" asChild>
              <Link href="/products" className="flex items-center gap-1">সব দেখুন <ChevronRight className="w-6 h-6" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {recentLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[400px] rounded-[3rem]" />) : 
              recentProducts.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>
      </main>
    </div>
  );
}