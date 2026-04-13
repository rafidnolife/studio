
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

  // Filter category buttons to only show unique categories that actually have products
  const availableCategories = useMemo(() => {
    const hardcodedCats = [
      { name: 'ইলেকট্রনিক্স', icon: '📱' },
      { name: 'লাইফস্টাইল', icon: '👕' },
      { name: 'গ্যাজেট', icon: '🎧' },
      { name: 'হোম অ্যাপ্লায়েন্স', icon: '🏠' },
      { name: 'অন্যান্য', icon: '📦' },
    ];
    
    // Create a Set of unique, trimmed categories from existing products
    const existingCatNames = new Set(allProducts.map(p => p.category?.trim()).filter(Boolean));
    return hardcodedCats.filter(cat => existingCatNames.has(cat.name));
  }, [allProducts]);

  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/20">
      <Navbar />
      
      <main className="flex-grow pb-20 pt-4">
        {/* Minimal Headline - Only the text as requested */}
        <section className="container mx-auto px-4 mb-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-lg md:text-2xl font-black text-slate-800 tracking-tighter uppercase">
              {settings.heroTitle}
            </h1>
          </div>
        </section>

        {/* SPECIAL COLLECTION - ABSOLUTE TOP */}
        <section className="container mx-auto px-4 mb-16">
          <div className="flex items-center justify-between mb-8 border-b border-slate-200/50 pb-4">
            <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-slate-900">
              স্পেশাল <span className="text-primary">কালেকশন</span>
            </h2>
            <Link href="/products" className="text-primary font-black text-xs md:text-sm flex items-center gap-1 uppercase tracking-widest">
              সব দেখুন <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
            {featLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-[2.5rem]" />)
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map(p => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold bg-white/30 rounded-[3rem] border-2 border-dashed border-slate-200">
                কোনো হাইলাইটেড পণ্য নেই।
              </div>
            )}
          </div>
        </section>

        {/* Categories Section - Only shows active categories */}
        {availableCategories.length > 0 && (
          <section className="py-12 bg-primary/5 mb-16">
            <div className="container mx-auto px-4 overflow-x-auto scrollbar-hide">
              <div className="flex items-center justify-start gap-6 min-w-max pb-4">
                {availableCategories.map((cat, i) => (
                  <Link key={i} href={`/products?category=${cat.name}`} className="group flex flex-col items-center gap-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-[2rem] flex items-center justify-center text-4xl shadow-xl border border-slate-100 transition-all group-hover:bg-primary group-hover:scale-110">
                      {cat.icon}
                    </div>
                    <span className="font-black text-[10px] md:text-xs text-slate-700 uppercase tracking-tighter">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recent Arrivals */}
        <section className="container mx-auto px-4 mb-16">
          <div className="flex items-center justify-between mb-8 border-b border-slate-200/50 pb-4">
            <h2 className="text-2xl md:text-5xl font-black tracking-tighter">নতুন <span className="text-primary">পণ্যসমূহ</span></h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
            {recentLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-[2.5rem]" />) : 
              recentProducts.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>

        {/* Value Props */}
        <section className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Zap, title: 'দ্রুত ডেলিভারি', color: 'bg-emerald-50 text-emerald-500' },
              { icon: ShieldCheck, title: 'নিরাপদ পেমেন্ট', color: 'bg-primary/10 text-primary' },
              { icon: Star, title: 'সেরা কোয়ালিটি', color: 'bg-amber-50 text-amber-500' },
              { icon: Award, title: 'বিশ্বস্ত বাজার', color: 'bg-indigo-50 text-indigo-500' }
            ].map((v, i) => (
              <div key={i} className="bg-white/60 glass p-8 rounded-[3rem] flex flex-col items-center text-center space-y-4 shadow-xl">
                <div className={`w-14 h-14 ${v.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <v.icon className="w-7 h-7" />
                </div>
                <h3 className="font-black text-xs md:text-sm text-slate-900 uppercase tracking-widest">{v.title}</h3>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
