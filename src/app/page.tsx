"use client";

import { useMemo, useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, limit, where, getDoc, doc, orderBy } from 'firebase/firestore';
import { Product, ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Star, ShieldCheck, Zap, Award, Sparkles } from 'lucide-react';
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
    <div className="flex flex-col min-h-screen selection:bg-primary/20">
      <Navbar />
      
      <main className="flex-grow space-y-24 pb-20">
        {/* Simplified Header with corner text as requested */}
        <section className="container mx-auto px-4 pt-12">
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-2xl shadow-slate-200/50 px-10 py-5 rounded-[2.5rem] animate-in fade-in slide-in-from-left-4 duration-1000">
               <div className="w-12 h-12 bg-primary rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-primary/30">
                  <Sparkles className="w-6 h-6" />
               </div>
               <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">
                  {settings.heroTitle}
               </h1>
            </div>
          </div>
        </section>

        {/* SPECIAL COLLECTION - MOVED TO THE VERY TOP AFTER HEADER */}
        <section className="container mx-auto px-4 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[11px] px-1">
                <Star className="w-5 h-5 fill-current" /> Premium Picks
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-tight">
                স্পেশাল <span className="text-primary">কালেকশন</span>
              </h2>
              <p className="text-slate-500 text-lg font-medium px-1">আপনার জন্য নির্বাচিত সেরা এবং সব থেকে জনপ্রিয় পণ্যসমূহ।</p>
            </div>
            <Button variant="ghost" className="text-primary font-black h-auto p-0 group hidden md:flex text-lg" asChild>
              <Link href="/products" className="flex items-center gap-2">সব দেখুন <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {featLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[500px] rounded-[4rem]" />)
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map(p => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-full py-24 text-center text-slate-400 font-bold bg-white/50 rounded-[4rem] border-4 border-dashed border-slate-100">
                বর্তমানে কোনো হাইলাইটেড পণ্য নেই।
              </div>
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-24 bg-slate-900/5 relative overflow-hidden">
          <div className="container mx-auto px-4 space-y-16 relative z-10">
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-800">ক্যাটাগরি অনুযায়ী খুঁজুন</h2>
              <p className="text-slate-500 font-medium text-lg">আপনার পছন্দের ক্যাটাগরি বেছে নিন।</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-14">
              {categories.map((cat, i) => (
                <Link key={i} href={`/products?category=${cat.name}`} className="group flex flex-col items-center gap-5">
                  <div className="w-20 h-20 md:w-32 md:h-32 bg-white rounded-[2.5rem] md:rounded-[3.5rem] flex items-center justify-center text-5xl shadow-xl border border-slate-100 transition-all duration-500 group-hover:-translate-y-4 group-hover:bg-primary group-hover:text-white group-hover:shadow-primary/30 group-hover:border-primary">
                    {cat.icon}
                  </div>
                  <span className="font-black text-sm md:text-base text-slate-700 group-hover:text-primary transition-colors tracking-wide uppercase">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Arrivals */}
        <section className="container mx-auto px-4 space-y-12">
          <div className="flex items-end justify-between border-b-4 border-slate-100 pb-8">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">নতুন <span className="text-primary">পণ্যসমূহ</span></h2>
            <Button variant="link" className="text-primary font-black h-auto p-0 group" asChild>
              <Link href="/products" className="flex items-center gap-2 text-xl">সব দেখুন <ChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {recentLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[450px] rounded-[4rem]" />) : 
              recentProducts.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>

        {/* Value Props */}
        <section className="container mx-auto px-4 pt-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: 'দ্রুত ডেলিভারি', desc: '২৪-৪৮ ঘণ্টায় শিপিং', color: 'bg-emerald-50 text-emerald-500' },
              { icon: ShieldCheck, title: 'নিরাপদ পেমেন্ট', desc: 'ক্যাশ অন ডেলিভারি', color: 'bg-primary/10 text-primary' },
              { icon: Star, title: 'সেরা কোয়ালিটি', desc: 'অরিজিনাল পণ্য গ্যারান্টি', color: 'bg-amber-50 text-amber-500' },
              { icon: Award, title: 'বিশ্বস্ত বাজার', desc: 'হাজারো সন্তুষ্ট কাস্টমার', color: 'bg-indigo-50 text-indigo-500' }
            ].map((v, i) => (
              <div key={i} className="bg-white p-10 rounded-[3rem] shadow-xl flex flex-col items-center text-center space-y-5 border border-slate-50 hover:-translate-y-2 transition-transform">
                <div className={`w-16 h-16 ${v.color} rounded-[1.5rem] flex items-center justify-center`}>
                  <v.icon className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-base text-slate-900 uppercase tracking-tighter">{v.title}</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}