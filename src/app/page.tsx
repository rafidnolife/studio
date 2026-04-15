
"use client";

import { useMemo, useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, limit, where, getDoc, doc, orderBy } from 'firebase/firestore';
import { Product, ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Star, ShieldCheck, Zap, Award, Sparkles, TrendingUp, Download, Smartphone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Home() {
  const db = useFirestore();
  const [settings, setSettings] = useState({
    heroTitle: 'সেরা পণ্যের সেরা বাজার',
    heroSubtitle: 'সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন ঝামেলাহীন কেনাকাটায়।',
    apkUrl: ''
  });

  useEffect(() => {
    if (!db) return;
    getDoc(doc(db, 'settings', 'site')).then(s => {
      if (s.exists()) setSettings(s.data() as any);
    });
  }, [db]);
  
  const featuredQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'), 
      where('isFeatured', '==', true), 
      limit(8)
    );
  }, [db]);

  const recentProductsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(10));
  }, [db]);

  const allProductsQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);

  const { data: featuredProducts, loading: featLoading } = useCollection<Product>(featuredQuery);
  const { data: recentProducts, loading: recentLoading } = useCollection<Product>(recentProductsQuery);
  const { data: allProducts } = useCollection<Product>(allProductsQuery);

  const availableCategories = useMemo(() => {
    const hardcodedCats = [
      { name: 'ইলেকট্রনিক্স', icon: '📱', color: 'bg-blue-500' },
      { name: 'লাইফস্টাইল', icon: '👕', color: 'bg-pink-500' },
      { name: 'গ্যাজেট', icon: '🎧', color: 'bg-purple-500' },
      { name: 'হোম অ্যাপ্লায়েন্স', icon: '🏠', color: 'bg-orange-500' },
      { name: 'অন্যান্য', icon: '📦', color: 'bg-slate-500' },
    ];
    
    if (!allProducts) return [];
    const existingCatNames = new Set(allProducts.map(p => p.category?.trim()).filter(Boolean));
    return hardcodedCats.filter(cat => existingCatNames.has(cat.name));
  }, [allProducts]);

  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/20 overflow-x-hidden w-full max-w-full">
      <Navbar />
      
      <main className="flex-grow pb-16 pt-0">
        <section className="container mx-auto px-4 mt-2 md:mt-4 mb-2 md:mb-4">
          <div className="flex items-center gap-3 bg-white/70 glass w-fit max-w-full px-4 md:px-8 py-2 md:py-4 rounded-2xl md:rounded-[2.5rem] shadow-xl border-primary/10 overflow-hidden">
            <div className="w-6 h-6 md:w-10 md:h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary shrink-0 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 md:w-6 md:h-6 animate-pulse" />
            </div>
            <h1 className="text-xs sm:text-lg md:text-2xl lg:text-3xl font-black text-slate-800 tracking-tighter uppercase flex flex-wrap items-center gap-2 md:gap-3 leading-tight break-words max-w-[calc(100vw-80px)] text-wrap-fix">
              {settings.heroTitle}
              <span className="w-1.5 md:w-2 h-1.5 md:h-2 bg-primary rounded-full hidden sm:inline-block"></span>
            </h1>
          </div>
        </section>

        <section className="container mx-auto px-4 mb-8 md:mb-12">
          <div className="flex items-center justify-between mb-4 md:mb-8 border-b border-primary/10 pb-3 gap-4">
            <div className="flex flex-col gap-1 min-w-0">
               <h2 className="text-base md:text-3xl lg:text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-2 md:gap-3">
                স্পেশাল <span className="text-primary">কালেকশন</span>
                <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[7px] md:text-[10px] py-1 px-2 rounded-full flex items-center gap-1 shrink-0">
                  <TrendingUp className="w-2.5 h-2.5" /> TRENDING
                </Badge>
              </h2>
            </div>
            <Link href="/products" className="group bg-primary text-white font-black text-[7px] md:text-xs flex items-center gap-1 md:gap-2 px-3 md:px-6 py-1.5 md:py-3 rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-all uppercase tracking-widest shrink-0">
              সব দেখুন <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
            {featLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl md:rounded-[2.5rem]" />)
            ) : featuredProducts && featuredProducts.length > 0 ? (
              featuredProducts.map(p => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400 font-bold bg-white/40 glass rounded-2xl md:rounded-[2.5rem] border-2 border-dashed border-slate-200">
                কোনো হাইলাইটেড পণ্য নেই।
              </div>
            )}
          </div>
        </section>

        {settings.apkUrl && (
          <section className="container mx-auto px-4 mb-10 md:mb-16">
            <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-6 md:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center gap-6 md:gap-12">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[80px] rounded-full -mr-16 -mt-16"></div>
              
              <div className="relative z-10 w-20 h-20 md:w-28 md:h-28 bg-white/10 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center border border-white/20 shadow-2xl shrink-0">
                <Smartphone className="w-10 h-10 md:w-16 md:h-16 text-primary" />
              </div>
              
              <div className="relative z-10 flex-grow text-center md:text-left space-y-4">
                <div className="space-y-1.5">
                  <Badge className="bg-primary text-white border-none font-black text-[9px] tracking-widest px-3 py-1 rounded-full uppercase">Official App</Badge>
                  <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">এখনই <span className="text-primary">অ্যাপটি</span> ডাউনলোড করুন!</h2>
                  <p className="text-slate-400 font-bold text-xs md:text-sm max-w-md">সবচেয়ে দ্রুত কেনাকাটার অভিজ্ঞতা পেতে আমাদের অফিসিয়াল অ্যান্ড্রয়েড অ্যাপটি ব্যবহার করুন।</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Button 
                    asChild 
                    className="h-12 md:h-14 px-8 md:px-10 rounded-xl bg-primary text-white font-black text-lg gap-2 shadow-xl shadow-primary/30 hover:scale-105 transition-all w-full sm:w-auto"
                  >
                    <a href={settings.apkUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="w-5 h-5" /> ডাউনলোড অ্যাপ
                    </a>
                  </Button>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center sm:text-left">
                    * ডাউনলোড করার পর ইনস্টল করুন
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {availableCategories.length > 0 && (
          <section className="py-8 md:py-16 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 mb-8 md:mb-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center mb-6 md:mb-10">
                <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Explore Your Style</span>
                <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter text-center">ক্যাটাগরি <span className="text-primary">অনুসারে</span></h2>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex items-center justify-start md:justify-center gap-4 md:gap-10 min-w-max pb-4 px-2">
                  {availableCategories.map((cat, i) => (
                    <Link key={i} href={`/products?category=${cat.name}`} className="group flex flex-col items-center gap-2 md:gap-4">
                      <div className={cn(
                        "w-12 h-12 md:w-24 md:h-24 bg-white rounded-xl md:rounded-[2rem] flex items-center justify-center text-xl md:text-4xl shadow-xl border border-slate-100 transition-all group-hover:-translate-y-1 group-hover:shadow-2xl",
                        "relative overflow-hidden"
                      )}>
                        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity", cat.color)}></div>
                        {cat.icon}
                      </div>
                      <span className="font-black text-[7px] md:text-xs text-slate-700 uppercase tracking-widest group-hover:text-primary transition-colors">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="container mx-auto px-4 mb-10 md:mb-16">
          <div className="flex items-center justify-between mb-6 md:mb-10 border-b border-primary/10 pb-4">
            <h2 className="text-lg md:text-3xl lg:text-4xl font-black tracking-tighter text-slate-900">
              নতুন <span className="text-primary">পণ্যসমূহ</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
            {recentLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl md:rounded-[2.5rem]" />) : 
              recentProducts && recentProducts.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>

        <section className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
            {[
              { icon: Zap, title: 'দ্রুত ডেলিভারি', color: 'bg-emerald-500', text: 'Fast Delivery' },
              { icon: ShieldCheck, title: 'নিরাপদ পেমেন্ট', color: 'bg-primary', text: 'Secure' },
              { icon: Star, title: 'সেরা কোয়ালিটি', color: 'bg-amber-500', text: 'Premium' },
              { icon: Award, title: 'বিশ্বস্ত বাজার', color: 'bg-indigo-600', text: 'Trusted' }
            ].map((v, i) => (
              <div key={i} className="bg-white/70 glass p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col items-center text-center space-y-2 md:space-y-4 shadow-xl hover:scale-105 transition-all border-none">
                <div className={`w-10 h-10 md:w-16 md:h-16 ${v.color} rounded-lg md:rounded-2xl flex items-center justify-center shadow-xl text-white`}>
                  <v.icon className="w-5 h-5 md:w-8 md:h-8" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-black text-[8px] md:text-sm text-slate-900 uppercase tracking-widest">{v.title}</h3>
                  <p className="text-[6px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">{v.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
