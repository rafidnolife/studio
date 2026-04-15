
"use client";

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Product, ProductCard } from '@/components/product/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, ShoppingBag, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

function ProductListingContent() {
  const searchParams = useSearchParams();
  const db = useFirestore();
  
  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db]);
  
  const { data: products, loading } = useCollection<Product>(productsQuery);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সব');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');

  // Sync category from URL
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const categories = useMemo(() => {
    if (!products) return ['সব'];
    const uniqueCategories = Array.from(
      new Set(products.map(p => p.category?.trim()).filter(Boolean))
    );
    return ['সব', ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let filtered = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'সব' || p.category?.trim() === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    }
    
    return filtered;
  }, [searchTerm, selectedCategory, products, sortBy]);

  return (
    <main className="container mx-auto px-4 py-4 md:py-8 space-y-6 max-w-7xl">
      <section className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <Input 
              placeholder="পছন্দের পণ্যটি খুঁজুন..." 
              className="pl-12 h-12 rounded-full bg-white border-none shadow-lg text-sm font-medium focus:ring-2 ring-primary/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
            {categories.map(cat => (
              <Button 
                key={cat} 
                variant={selectedCategory === cat ? 'default' : 'outline'} 
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-full flex-shrink-0 h-10 px-6 font-black text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300",
                  selectedCategory === cat 
                    ? "bg-primary text-white shadow-lg scale-105" 
                    : "bg-white/70 glass border-slate-100 text-slate-500 hover:bg-white hover:text-primary"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between border-b border-primary/10 pb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl md:text-3xl font-black tracking-tighter text-slate-900">
            {selectedCategory === 'সব' ? 'সব পণ্য' : selectedCategory}
            <span className="text-primary">.</span>
          </h2>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Total <span className="text-primary">{filteredProducts.length}</span> Products
          </p>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="gap-2 rounded-full h-10 px-4 font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 text-primary">
              <SlidersHorizontal className="w-4 h-4" />
              ফিল্টার
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-[2rem] p-8">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl font-black text-slate-900">পণ্য সাজান</SheetTitle>
            </SheetHeader>
            <RadioGroup 
              value={sortBy} 
              onValueChange={(val: any) => setSortBy(val)}
              className="space-y-4"
            >
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <Label htmlFor="newest" className="font-bold text-slate-700 flex-grow cursor-pointer">নতুন পণ্য (Newest)</Label>
                <RadioGroupItem value="newest" id="newest" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <Label htmlFor="price-low" className="font-bold text-slate-700 flex-grow cursor-pointer">দাম: কম থেকে বেশি (Low to High)</Label>
                <RadioGroupItem value="price-low" id="price-low" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <Label htmlFor="price-high" className="font-bold text-slate-700 flex-grow cursor-pointer">দাম: বেশি থেকে কম (High to Low)</Label>
                <RadioGroupItem value="price-high" id="price-high" />
              </div>
            </RadioGroup>
            <Button className="w-full mt-8 h-14 rounded-2xl font-black text-lg bg-primary shadow-xl" onClick={() => {}}>
              ফিল্টার প্রয়োগ করুন
            </Button>
          </SheetContent>
        </Sheet>
      </div>

      <section>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-6 bg-white/50 glass rounded-3xl border-2 border-dashed border-primary/20 max-w-xl mx-auto">
            <ShoppingBag className="w-12 h-12 text-primary/30 mx-auto" />
            <h3 className="text-xl font-black text-slate-800 tracking-tighter">পণ্য পাওয়া যায়নি!</h3>
            <Button 
              className="rounded-full px-8 h-12 text-sm font-black shadow-lg bg-primary" 
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
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      }>
        <ProductListingContent />
      </Suspense>
    </div>
  );
}
