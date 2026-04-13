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

  const categories = ['সব', 'ইলেকট্রনিক্স', 'লাইফস্টাইল', 'গ্যাজেট', 'হোম অ্যাপ্লায়েন্স', 'অন্যান্য'];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'সব' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, products]);

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20 md:pb-0">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <section className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="খুঁজুন..." 
                className="pl-12 h-12 rounded-2xl bg-white border-none shadow-sm text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <Button 
                  key={cat} 
                  variant={selectedCategory === cat ? 'default' : 'outline'} 
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-xl flex-shrink-0 h-10 px-4 font-bold text-xs",
                    selectedCategory === cat ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white border-slate-200"
                  )}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span className="text-primary">{filteredProducts.length}</span> পন্য
          </p>
          <Button variant="ghost" size="sm" className="gap-2 rounded-xl font-bold text-xs">
            <SlidersHorizontal className="w-3 h-3" />
            ফিল্টার
          </Button>
        </div>

        <section>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-[2rem]" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center space-y-4 bg-white/50 glass rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-xl font-black">পণ্য পাওয়া যায়নি!</h3>
              <Button variant="outline" className="rounded-xl" onClick={() => { setSearchTerm(''); setSelectedCategory('সব'); }}>সব পণ্য দেখুন</Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}