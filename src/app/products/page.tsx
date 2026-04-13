
"use client";

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Product, ProductCard } from '@/components/product/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function ProductListing() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'সব';
  
  const db = useFirestore();
  const productsQuery = useMemo(() => query(collection(db, 'products'), orderBy('createdAt', 'desc')), [db]);
  const { data: products, loading } = useCollection<Product>(productsQuery);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Dynamic categories: Filter unique and trimmed categories from actual products
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
    <div className="min-h-screen pb-20 md:pb-12 overflow-x-hidden">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-10 max-w-7xl">
        <section className="space-y-6">
          <div className="flex flex-col gap-6">
            <div className="relative flex-grow">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="পছন্দের পণ্যটি খুঁজুন..." 
                className="pl-14 h-16 rounded-3xl bg-white border-none shadow-xl text-lg font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
              {categories.map(cat => (
                <Button 
                  key={cat} 
                  variant={selectedCategory === cat ? 'default' : 'outline'} 
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-2xl flex-shrink-0 h-12 px-8 font-black text-sm uppercase tracking-tighter transition-all",
                    selectedCategory === cat 
                      ? "bg-primary text-white shadow-2xl shadow-primary/30 scale-105" 
                      : "bg-white/60 glass border-slate-200 text-slate-600 hover:bg-white"
                  )}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between border-b border-slate-200/50 pb-6">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black tracking-tighter text-slate-900">
              {selectedCategory === 'সব' ? 'সব পণ্য' : selectedCategory}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              মোট <span className="text-primary">{filteredProducts.length}</span> টি পণ্য পাওয়া গেছে
            </p>
          </div>
          <Button variant="ghost" className="gap-2 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/5">
            <SlidersHorizontal className="w-4 h-4" />
            ফিল্টার
          </Button>
        </div>

        <section>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-6">
                  <Skeleton className="aspect-square w-full rounded-[2.5rem]" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4 rounded-full" />
                    <Skeleton className="h-4 w-1/2 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-32 text-center space-y-6 bg-white/40 glass rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800">পণ্য পাওয়া যায়নি!</h3>
                <p className="text-slate-500 font-bold">অনুগ্রহ করে অন্য কোনো ক্যাটাগরি বা শব্দ দিয়ে চেষ্টা করুন।</p>
              </div>
              <Button 
                variant="outline" 
                className="rounded-2xl px-10 h-12 font-black border-slate-200 hover:bg-primary hover:text-white transition-all" 
                onClick={() => { setSearchTerm(''); setSelectedCategory('সব'); }}
              >
                সব পণ্য দেখুন
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
