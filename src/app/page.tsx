"use client";

import { useMemo, useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, limit, where, getDoc, doc, orderBy } from 'firebase/firestore';
import { Product, ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Star, ShieldCheck, ShoppingBag, Zap, Award, Sparkles } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const db = useFirestore();
  const [settings, setSettings] = useState({
    heroTitle: 'সেরা পণ্যের সেরা বাজার',
    heroSubtitle: 'সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন ঝামেলাহীন কেনাকাটায়।'
  });

  useEffect(() => {
    getDoc(doc(db, 'settings', 'site')).then(s => {
      if (s.exists()) setSettings(s.data() as any);
    });
  }, [db]);
  
  const featuredQuery = useMemo(() => {
    return query(
      collection(db, 'products'), 
      where('isFeatured', '==', true), 
      limit(8)
    );
  }, [db]);

  const recentProductsQuery = useMemo(() => {
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8));
  }, [db]);

  const { data: featuredProducts, loading: featLoading } = useCollection<Product>(featuredQuery);
  const { data: recentProducts, loading: recentLoading } = useCollection<Product>(recentProductsQuery);

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
      
      <main className="flex-grow space-y-20 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-6">
          <div className="relative rounded-[3rem] overflow-hidden h-[350px] md:h-[550px] shadow-2xl group">
            <ImageWithFallback 
              src="https://picsum.photos/seed/luxury-shop/1200/800" 
              alt="Hero Banner" 
              fill 
              className="object-cover transition-transform duration-[4s] group-hover:scale-105"
              data-ai-hint="premium shopping"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-20 text-white space-y-4">
              <h1 className="text-4xl md:text-7xl font-black leading-tight tracking-tighter drop-shadow-2xl max-w-4xl">
                {settings.heroTitle}
              </h1>
              <p className="text-base md:text-2xl text-gray-200 max-w-2xl font-medium opacity-90">
                {settings.heroSubtitle}
              </p>
              <div className="flex gap-4 pt-4">
                <Button size="lg" className="rounded-2xl px-10 h-14 bg-primary hover:bg-primary/90 text-lg font-black shadow-xl shadow-primary/30" asChild>
                  <Link href="/products">অর্ডার শুরু করুন</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* EYE-CATCHING FEATURED PRODUCTS (Sits right under Hero) */}
        <section className="container mx-auto px-4 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-8 border-primary pl-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                <Sparkles className="w-4 h-4" /> Recommended for you
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">
                স্পেশাল <span className="text-primary underline decoration-primary/20">কালেকশন</span>
              </h2>
              <p className="text-slate-500 text-lg font-medium">আমাদের সেরা এবং সব থেকে জনপ্রিয় পণ্যসমূহ।</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {featLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[450px] rounded-[2.5rem]" />)
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map(p => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-full py-10 text-center text-slate-400 font-medium bg-slate-50 rounded-[2.5rem] border-2 border-dashed">
                বর্তমানে কোনো হাইলাইটেড পণ্য নেই।
              </div>
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-slate-800">পণ্য খুঁজুন ক্যাটাগরি অনুযায়ী</h2>
              <p className="text-slate-500 font-medium">আপনার পছন্দের ক্যাটাগরি বেছে নিন।</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {categories.map((cat, i) => (
                <Link key={i} href={`/products?category=${cat.name}`} className="group flex flex-col items-center gap-4">
                  <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-[2rem] flex items-center justify-center text-4xl shadow-sm border transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-primary group-hover:text-white group-hover:shadow-2xl group-hover:shadow-primary/20">
                    {cat.icon}
                  </div>
                  <span className="font-bold text-slate-700 group-hover:text-primary transition-colors">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Arrivals */}
        <section className="container mx-auto px-4 space-y-10">
          <div className="flex items-end justify-between border-b-2 border-slate-100 pb-4">
            <h2 className="text-3xl font-black tracking-tighter">নতুন <span className="text-primary">পণ্যসমূহ</span></h2>
            <Button variant="link" className="text-primary font-bold h-auto p-0 group" asChild>
              <Link href="/products" className="flex items-center gap-1">সব দেখুন <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {recentLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[400px] rounded-[2.5rem]" />) : 
              recentProducts.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>

        {/* VALUE PROPS / DISCLAIMERS (Moved to bottom) */}
        <section className="container mx-auto px-4 border-t-2 border-slate-50 pt-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'দ্রুত ডেলিভারি', desc: 'সারা দেশে ২৪-৪৮ ঘণ্টায় শিপিং', color: 'bg-amber-50 text-amber-500' },
              { icon: ShieldCheck, title: 'নিরাপদ পেমেন্ট', desc: '১০০% ক্যাশ অন ডেলিভারি', color: 'bg-green-50 text-green-500' },
              { icon: Star, title: 'সেরা কোয়ালিটি', desc: 'অরিজিনাল পণ্য গ্যারান্টি', color: 'bg-blue-50 text-blue-500' },
              { icon: Award, title: 'বিশ্বস্ত বাজার', desc: 'হাজারো সন্তুষ্ট কাস্টমার', color: 'bg-purple-50 text-purple-500' }
            ].map((v, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col items-center text-center space-y-3 border border-slate-100">
                <div className={`w-14 h-14 ${v.color} rounded-2xl flex items-center justify-center`}>
                  <v.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{v.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
