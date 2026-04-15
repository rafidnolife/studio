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
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8));
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
      { name: 'অন্যান্য', icon: '📦', color: 'bg-slate-500' },
    ];
    
    if (!allProducts) return [];
    const existingCatNames = new Set(allProducts.map(p => p.category?.trim()).filter(Boolean));
    return hardcodedCats.filter(cat => existingCatNames.has(cat.name));
  }, [allProducts]);

  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/20 overflow-x-hidden w-full max-w-full">
      <Navbar />
      
      <main className="flex-grow pb-16">
        <section className="container mx-auto px-4 mt-4 mb-4">
          <div className="flex items-center gap-2 bg-white/70 glass w-fit px-4 py-2 rounded-xl shadow-md border-primary/10">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            <h1 className="text-xs sm:text-sm md:text-lg font-black text-slate-800 tracking-tight uppercase">
              {settings.heroTitle}
            </h1>
          </div>
        </section>

        <section className="container mx-auto px-4 mb-8">
          <div className="flex items-center justify-between mb-4 border-b border-primary/10 pb-2">
            <h2 className="text-sm md:text-xl font-black text-slate-900 flex items-center gap-2">
              স্পেশাল <span className="text-primary">কালেকশন</span>
              <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[7px] py-0.5 px-1.5 rounded-full">
                TRENDING
              </Badge>
            </h2>
            <Link href="/products" className="group bg-primary text-white font-black text-[8px] flex items-center gap-1 px-3 py-1.5 rounded-full shadow-lg uppercase tracking-widest">
              সব দেখুন <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {featLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)
            ) : featuredProducts && featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {settings.apkUrl && (
          <section className="container mx-auto px-4 mb-10">
            <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center gap-4">
              <div className="relative z-10 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20 shrink-0">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div className="relative z-10 flex-grow text-center md:text-left">
                <h2 className="text-lg md:text-xl font-black">আমাদের <span className="text-primary">অফিসিয়াল অ্যাপ</span></h2>
                <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">দ্রুত কেনাকাটার জন্য ডাউনলোড করুন</p>
              </div>
              <Button asChild size="sm" className="h-10 px-6 rounded-lg bg-primary text-white font-black text-xs gap-2 shadow-lg w-full md:w-auto">
                <a href={settings.apkUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="w-3 h-3" /> ডাউনলোড করুন
                </a>
              </Button>
            </div>
          </section>
        )}

        <section className="container mx-auto px-4 mb-10">
          <div className="flex items-center justify-between mb-4 border-b border-primary/10 pb-2">
            <h2 className="text-sm md:text-xl font-black text-slate-900">নতুন <span className="text-primary">পণ্যসমূহ</span></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {recentLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />) : 
              recentProducts && recentProducts.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>
      </main>
    </div>
  );
}
