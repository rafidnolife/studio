"use client";

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { Product, ProductCard } from '@/components/product/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductListing() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'সব';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const categories = ['সব', 'ইলেকট্রনিক্স', 'লাইফস্টাইল', 'গ্যাজেট', 'হোম অ্যাপ্লায়েন্স', 'অন্যান্য'];

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'সব' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, products]);

  return (
    <div className="min-h-screen bg-muted/10 pb-20 md:pb-0">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Search and Filters */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="পণ্যের নাম দিয়ে খুঁজুন..." 
                className="pl-12 h-12 rounded-2xl bg-white border-none shadow-sm focus-visible:ring-primary"
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
                  className="rounded-full flex-shrink-0"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            মোট <span className="font-bold text-foreground">{filteredProducts.length}</span> টি পণ্য পাওয়া গেছে
          </p>
          <Button variant="ghost" size="sm" className="gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            সর্টিং
          </Button>
        </div>

        {/* Grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center space-y-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold">দুঃখিত, কোনো পণ্য পাওয়া যায়নি!</h3>
              <p className="text-muted-foreground">অন্য কোনো কীওয়ার্ড বা ক্যাটাগরি ট্রাই করুন।</p>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory('সব'); }}>সব পণ্য দেখুন</Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}