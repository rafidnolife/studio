
"use client";

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Product, ProductCard } from '@/components/product/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, ShoppingBag, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function ProductListingContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'সব';
  
  const db = useFirestore();
  const productsQuery = useMemo(() => query(collection(db, 'products'), orderBy('createdAt', 'desc')), [db]);
  const { data: products, loading } = useCollection<Product>(productsQuery);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map(p => p.category?.trim()).filter(Boolean))
    );
    return ['সব', ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'সব' || p.category?.trim() === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, products]);

  return (
    <main className="container mx-auto px-4 py-12 space-y-12 max-w-7xl">
      <section className="space-y-10">
        <div className="flex flex-col gap-10">
          <div className="relative flex-grow">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
            <Input 
              placeholder="পছন্দের পণ্যটি খুঁজুন..." 
              className="pl-20 h-20 rounded-[2.5rem] bg-white border-none shadow-2xl text-xl font-medium focus:ring-4 ring-primary/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 px-6 py-2 bg-primary/5 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> Quick Search
            </div>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide px-2">
            {categories.map(cat => (
              <Button 
                key={cat} 
                variant={selectedCategory === cat ? 'default' : 'outline'} 
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-[1.5rem] flex-shrink-0 h-16 px-10 font-black text-sm uppercase tracking-widest transition-all duration-500",
                  selectedCategory === cat 
                    ? "bg-primary text-white shadow-[0_15px_40px_rgba(16,185,129,0.3)] scale-110" 
                    : "bg-white/70 glass border-slate-100 text-slate-500 hover:bg-white hover:text-primary hover:shadow-xl"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between border-b border-primary/10 pb-10">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">
            {selectedCategory === 'সব' ? 'সব পণ্য' : selectedCategory}
            <span className="text-primary ml-2">.</span>
          </h2>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Explore <span className="text-primary">{filteredProducts.length}</span> Premium Products
            </p>
          </div>
        </div>
        <Button variant="ghost" className="gap-3 rounded-[1.5rem] h-14 px-8 font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/5 text-primary">
          <SlidersHorizontal className="w-5 h-5" />
          ফিল্টার
        </Button>
      </div>

      <section>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-8 md:gap-16">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="space-y-10">
                <Skeleton className="aspect-square w-full rounded-[3rem]" />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4 rounded-full" />
                  <Skeleton className="h-6 w-1/2 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-8 md:gap-16">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center space-y-10 bg-white/50 glass rounded-[4rem] border-2 border-dashed border-primary/20 max-w-3xl mx-auto shadow-2xl">
            <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-16 h-16 text-primary opacity-30" />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-black text-slate-800 tracking-tighter">পণ্য পাওয়া যায়নি!</h3>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">অনুগ্রহ করে অন্য কোনো ক্যাটাগরি ট্রাই করুন।</p>
            </div>
            <Button 
              className="rounded-full px-16 h-16 text-lg font-black shadow-2xl shadow-primary/20 transition-all hover:scale-110 bg-primary" 
              onClick={() => { setSearchTerm(''); setSelectedCategory('সব'); }}
            >
              সব পণ্য দেখুন
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}

export default function ProductListing() {
  return (
    <div className="min-h-screen pb-20 md:pb-12 overflow-x-hidden">
      <Navbar />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-24 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      }>
        <ProductListingContent />
      </Suspense>
    </div>
  );
}
