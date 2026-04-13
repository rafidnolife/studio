
"use client";

import { useMemo, useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, limit, where, getDoc, doc, orderBy } from 'firebase/firestore';
import { Product, ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Star, ShieldCheck, Zap, Award, Sparkles, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(10));
  }, [db]);

  const { data: featuredProducts, loading: featLoading } = useCollection<Product>(featuredQuery);
  const { data: recentProducts, loading: recentLoading } = useCollection<Product>(recentProductsQuery);
  const { data: allProducts } = useCollection<Product>(collection(db, 'products'));

  const availableCategories = useMemo(() => {
    const hardcodedCats = [
      { name: 'ইলেকট্রনিক্স', icon: '📱', color: 'bg-blue-500' },
      { name: 'লাইফস্টাইল', icon: '👕', color: 'bg-pink-500' },
      { name: 'গ্যাজেট', icon: '🎧', color: 'bg-purple-500' },
      { name: 'হোম অ্যাপ্লায়েন্স', icon: '🏠', color: 'bg-orange-500' },
      { name: 'অন্যান্য', icon: '📦', color: 'bg-slate-500' },
    ];
    
    const existingCatNames = new Set(allProducts.map(p => p.category?.trim()).filter(Boolean));
    return hardcodedCats.filter(cat => existingCatNames.has(cat.name));
  }, [allProducts]);

  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/20 overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow pb-20 pt-8">
        {/* Minimal Headline - Fully Responsive */}
        <section className="container mx-auto px-4 mb-12">
          <div className="flex items-center gap-3 bg-white/60 glass w-fit max-w-full px-5 md:px-8 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] shadow-xl border-primary/10 overflow-hidden">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary shrink-0">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
            </div>
            <h1 className="text-sm md:text-3xl font-black text-slate-800 tracking-tighter uppercase flex flex-wrap items-center gap-2 md:gap-3 leading-tight break-words">
              {settings.heroTitle}
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full hidden sm:inline-block"></span>
            </h1>
          </div>
        </section>

        {/* SPECIAL COLLECTION - Responsive Grid */}
        <section className="container mx-auto px-4 mb-20">
          <div className="flex items-center justify-between mb-8 md:mb-10 border-b border-primary/10 pb-6 gap-4">
            <div className="flex flex-col gap-1 min-w-0">
               <h2 className="text-xl md:text-6xl font-black tracking-tighter text-slate-900 flex items-center gap-2 md:gap-4 flex-wrap">
                স্পেশাল <span className="text-primary">কালেকশন</span>
                <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[8px] md:text-xs py-1 px-2 md:px-4 rounded-full flex items-center gap-1 shrink-0">
                  <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3" /> TRENDING
                </Badge>
              </h2>
            </div>
            <Link href="/products" className="group bg-primary text-white font-black text-[9px] md:text-sm flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-all uppercase tracking-widest shrink-0">
              সব <ChevronRight className="w-3.5 h-3.5 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 md:gap-12">
            {featLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-[2rem] md:rounded-[3rem]" />)
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map(p => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-full py-16 md:py-24 text-center text-slate-400 font-bold bg-white/40 glass rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-slate-200">
                কোনো হাইলাইটেড পণ্য নেই।
              </div>
            )}
          </div>
        </section>

        {/* Categories Section */}
        {availableCategories.length > 0 && (
          <section className="py-12 md:py-20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 mb-16 md:mb-20">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center mb-10 md:mb-12">
                <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Explore Your Style</span>
                <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tighter">ক্যাটাগরি <span className="text-primary">অনুসারে</span></h2>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex items-center justify-start md:justify-center gap-4 md:gap-10 min-w-max pb-8 px-4">
                  {availableCategories.map((cat, i) => (
                    <Link key={i} href={`/products?category=${cat.name}`} className="group flex flex-col items-center gap-3 md:gap-5">
                      <div className={cn(
                        "w-16 h-16 md:w-32 md:h-32 bg-white rounded-[1.25rem] md:rounded-[2.5rem] flex items-center justify-center text-3xl md:text-5xl shadow-xl md:shadow-2xl border border-slate-100 transition-all group-hover:-translate-y-4 group-hover:shadow-[0_25px_50px_rgba(0,0,0,0.1)]",
                        "relative overflow-hidden"
                      )}>
                        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity", cat.color)}></div>
                        {cat.icon}
                      </div>
                      <span className="font-black text-[9px] md:text-sm text-slate-700 uppercase tracking-widest group-hover:text-primary transition-colors">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Recent Arrivals */}
        <section className="container mx-auto px-4 mb-16 md:mb-24">
          <div className="flex items-center justify-between mb-8 md:mb-10 border-b border-primary/10 pb-6">
            <h2 className="text-2xl md:text-6xl font-black tracking-tighter text-slate-900">
              নতুন <span className="text-primary">পণ্যসমূহ</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 md:gap-12">
            {recentLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-[2rem] md:rounded-[3rem]" />) : 
              recentProducts.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>

        {/* Value Props */}
        <section className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
            {[
              { icon: Zap, title: 'দ্রুত ডেলিভারি', color: 'bg-emerald-500', text: 'Fast Delivery' },
              { icon: ShieldCheck, title: 'নিরাপদ পেমেন্ট', color: 'bg-primary', text: 'Secure' },
              { icon: Star, title: 'সেরা কোয়ালিটি', color: 'bg-amber-500', text: 'Premium' },
              { icon: Award, title: 'বিশ্বস্ত বাজার', color: 'bg-indigo-600', text: 'Trusted' }
            ].map((v, i) => (
              <div key={i} className="bg-white/70 glass p-5 md:p-10 rounded-[1.5rem] md:rounded-[3rem] flex flex-col items-center text-center space-y-3 md:space-y-6 shadow-xl md:shadow-2xl hover:scale-105 transition-all border-none">
                <div className={`w-12 h-12 md:w-20 md:h-20 ${v.color} rounded-[1rem] md:rounded-[2rem] flex items-center justify-center shadow-xl text-white`}>
                  <v.icon className="w-6 h-6 md:w-10 md:h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-[9px] md:text-base text-slate-900 uppercase tracking-widest">{v.title}</h3>
                  <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{v.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
