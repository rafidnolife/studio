
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="পণ্যের নাম দিয়ে খুঁজুন..." 
                className="pl-12 h-14 rounded-2xl bg-white border-none shadow-sm focus-visible:ring-primary text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {categories.map(cat => (
                <Button 
                  key={cat} 
                  variant={selectedCategory === cat ? 'default' : 'outline'} 
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-xl flex-shrink-0 h-12 px-6 font-bold",
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
          <p className="text-sm font-bold text-slate-500">
            মোট <span className="text-primary">{filteredProducts.length}</span> টি পণ্য পাওয়া গেছে
          </p>
          <Button variant="ghost" size="sm" className="gap-2 rounded-xl font-bold">
            <SlidersHorizontal className="w-4 h-4" />
            সর্টিং
          </Button>
        </div>

        <section>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-[2.5rem]" />
                  <Skeleton className="h-6 w-2/3 rounded-lg" />
                  <Skeleton className="h-6 w-1/3 rounded-lg" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center space-y-6 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black">দুঃখিত, কোনো পণ্য পাওয়া যায়নি!</h3>
                <p className="text-slate-500 font-medium">অন্য কোনো কীওয়ার্ড বা ক্যাটাগরি ট্রাই করুন।</p>
              </div>
              <Button variant="outline" className="rounded-2xl px-8 h-12 font-bold" onClick={() => { setSearchTerm(''); setSelectedCategory('সব'); }}>সব পণ্য দেখুন</Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
