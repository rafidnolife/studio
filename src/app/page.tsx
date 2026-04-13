
"use client";

import { useMemo, useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, limit, where, getDoc, doc, orderBy } from 'firebase/firestore';
import { Product, ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Star, ShieldCheck, ShoppingBag, Zap, Award, Sparkles } from 'lucide-react';
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
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] selection:bg-primary/20">
      <Navbar />
      
      <main className="flex-grow space-y-16 pb-20">
        {/* Minimal Hero Header */}
        <section className="container mx-auto px-4 pt-10 text-center">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md border border-slate-100 shadow-xl shadow-slate-200/50 px-8 py-4 rounded-[2rem] animate-in fade-in slide-in-from-top-4 duration-1000">
             <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
             </div>
             <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">
                {settings.heroTitle}
             </h1>
          </div>
        </section>

        {/* SPECIAL COLLECTION - NOW AT THE VERY TOP */}
        <section className="container mx-auto px-4 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-8 border-primary pl-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                <Star className="w-4 h-4 fill-current" /> Premium Picks
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900">
                স্পেশাল <span className="text-primary underline decoration-primary/20 underline-offset-8">কালেকশন</span>
              </h2>
              <p className="text-slate-500 text-sm font-medium">আপনার জন্য নির্বাচিত সেরা এবং সব থেকে জনপ্রিয় পণ্যসমূহ।</p>
            </div>
            <Button variant="ghost" className="text-primary font-bold h-auto p-0 group hidden md:flex" asChild>
              <Link href="/products" className="flex items-center gap-1">সব দেখুন <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {featLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[450px] rounded-[3rem]" />)
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map(p => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-full py-20 text-center text-slate-400 font-medium bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                বর্তমানে কোনো হাইলাইটেড পণ্য নেই।
              </div>
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-slate-50/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03),transparent)]"></div>
          <div className="container mx-auto px-4 space-y-12 relative z-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-800">ক্যাটাগরি অনুযায়ী খুঁজুন</h2>
              <p className="text-slate-500 font-medium">আপনার পছন্দের ক্যাটাগরি বেছে নিন।</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-10">
              {categories.map((cat, i) => (
                <Link key={i} href={`/products?category=${cat.name}`} className="group flex flex-col items-center gap-4">
                  <div className="w-16 h-16 md:w-28 md:h-28 bg-white rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-4xl shadow-sm border border-slate-100 transition-all duration-700 group-hover:-translate-y-3 group-hover:bg-primary group-hover:text-white group-hover:shadow-2xl group-hover:shadow-primary/30 group-hover:border-primary">
                    {cat.icon}
                  </div>
                  <span className="font-bold text-xs md:text-sm text-slate-700 group-hover:text-primary transition-colors tracking-wide">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Arrivals */}
        <section className="container mx-auto px-4 space-y-10">
          <div className="flex items-end justify-between border-b-2 border-slate-100 pb-6">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter">নতুন <span className="text-primary">পণ্যসমূহ</span></h2>
            <Button variant="link" className="text-primary font-bold h-auto p-0 group" asChild>
              <Link href="/products" className="flex items-center gap-1 text-lg">সব দেখুন <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {recentLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[400px] rounded-[3rem]" />) : 
              recentProducts.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>

        {/* VALUE PROPS / DISCLAIMERS - AT THE BOTTOM */}
        <section className="container mx-auto px-4 pt-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'দ্রুত ডেলিভারি', desc: 'সারা দেশে ২৪-৪৮ ঘণ্টায় শিপিং', color: 'bg-emerald-50 text-emerald-500' },
              { icon: ShieldCheck, title: 'নিরাপদ পেমেন্ট', desc: '১০০% ক্যাশ অন ডেলিভারি', color: 'bg-primary/10 text-primary' },
              { icon: Star, title: 'সেরা কোয়ালিটি', desc: 'অরিজিনাল পণ্য গ্যারান্টি', color: 'bg-amber-50 text-amber-500' },
              { icon: Award, title: 'বিশ্বস্ত বাজার', desc: 'হাজারো সন্তুষ্ট কাস্টমার', color: 'bg-indigo-50 text-indigo-500' }
            ].map((v, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center space-y-4 border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className={`w-14 h-14 ${v.color} rounded-[1.25rem] flex items-center justify-center`}>
                  <v.icon className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-sm text-slate-900">{v.title}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
