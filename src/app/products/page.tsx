"use client";

import { useState, useMemo, Suspense, useEffect } from 'react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
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
    <main className="container mx-auto px-4 py-4 space-y-4 max-w-7xl">
      <section className="space-y-3">
        <div className="flex flex-col gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary" />
            <Input 
              placeholder="পণ্য খুঁজুন..." 
              className="pl-9 h-10 rounded-xl bg-white border-none shadow-md text-xs font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <Button 
                key={cat} 
                size="sm"
                variant={selectedCategory === cat ? 'default' : 'outline'} 
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-full flex-shrink-0 h-8 px-4 font-black text-[8px] uppercase tracking-widest transition-all",
                  selectedCategory === cat ? "bg-primary text-white" : "bg-white/70 glass border-slate-100 text-slate-500"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between border-b border-primary/5 pb-2">
        <div className="flex flex-col">
          <h2 className="text-sm font-black text-slate-900">
            {selectedCategory === 'সব' ? 'সব পণ্য' : selectedCategory}
          </h2>
          <p className="text-[7px] font-black text-slate-400 uppercase">
            {filteredProducts.length}টি পণ্য
          </p>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 rounded-full h-8 px-3 font-black text-[8px] uppercase tracking-widest text-primary">
              <SlidersHorizontal className="w-3 h-3" />
              ফিল্টার
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl p-6 pb-12 z-[100]">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-lg font-black">পণ্য সাজান</SheetTitle>
            </SheetHeader>
            <RadioGroup 
              value={sortBy} 
              onValueChange={(val: any) => setSortBy(val)}
              className="space-y-2"
            >
              {[
                { id: 'newest', label: 'নতুন পণ্য (Newest)' },
                { id: 'price-low', label: 'দাম: কম থেকে বেশি' },
                { id: 'price-high', label: 'দাম: বেশি থেকে কম' }
              ].map(opt => (
                <div key={opt.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <Label htmlFor={opt.id} className="font-bold text-slate-700 flex-grow cursor-pointer text-xs">{opt.label}</Label>
                  <RadioGroupItem value={opt.id} id={opt.id} />
                </div>
              ))}
            </RadioGroup>
            <SheetClose asChild>
              <Button className="w-full mt-6 h-11 rounded-xl font-black text-sm bg-primary shadow-lg">
                প্রয়োগ করুন
              </Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>

      <section className="pb-20">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-xl" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-4 bg-white/50 glass rounded-2xl border-2 border-dashed border-primary/10 max-w-sm mx-auto">
            <ShoppingBag className="w-8 h-8 text-primary/20 mx-auto" />
            <h3 className="text-sm font-black text-slate-800">কোনো পণ্য নেই!</h3>
          </div>
        )}
      </section>
    </main>
  );
}

export default function ProductListing() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <Suspense fallback={<div className="p-20 text-center font-black text-xs">লোড হচ্ছে...</div>}>
        <ProductListingContent />
      </Suspense>
    </div>
  );
}
