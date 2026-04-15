
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Product } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Info, ShoppingCart, Truck, ArrowLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProduct() {
      if (!id || !db) return;
      try {
        const docRef = doc(db, 'products', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(productData);
          setActiveImageIndex(productData.mainImageIndex || 0);

          // Save to Recently Viewed
          const recent = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
          const filtered = recent.filter((p: Product) => p.id !== productData.id);
          const updated = [productData, ...filtered].slice(0, 10);
          localStorage.setItem('recently_viewed', JSON.stringify(updated));
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, db]);

  const handleOrderRedirect = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "লগইন প্রয়োজন",
        description: "অর্ডার করতে আগে আপনার অ্যাকাউন্টে লগইন করুন।"
      });
      router.push('/login');
      return;
    }
    
    if (product?.variants && product.variants.length > 0 && !selectedVariant) {
      toast({
        variant: "destructive",
        title: "ভেরিয়েন্ট সিলেক্ট করুন",
        description: `অনুগ্রহ করে একটি ${product.unit || 'বিকল্প'} বেছে নিন।`
      });
      return;
    }

    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      toast({
        variant: "destructive",
        title: "কালার সিলেক্ট করুন",
        description: `অনুগ্রহ করে একটি কালার বেছে নিন।`
      });
      return;
    }

    const variantParam = selectedVariant ? `&variant=${encodeURIComponent(selectedVariant)}` : '';
    const colorParam = selectedColor ? `&color=${encodeURIComponent(selectedColor)}` : '';
    router.push(`/checkout?productId=${product?.id}&qty=${qty}${variantParam}${colorParam}`);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Info className="w-12 h-12 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-800">পণ্যটি খুঁজে পাওয়া যায়নি!</h2>
        <Button onClick={() => router.push('/products')} variant="outline" className="rounded-full">
          <ArrowLeft className="mr-2 w-4 h-4" /> সব পণ্য দেখুন
        </Button>
      </div>
    </div>
  );

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:py-10 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left: Images */}
          <div className="space-y-4 sticky top-24">
            <div className="relative aspect-square w-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-white border shadow-sm">
              <ImageWithFallback 
                src={product.imageUrls[activeImageIndex]} 
                alt={product.name} 
                className="object-contain p-4 md:p-8" 
              />
              {hasDiscount && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white font-black px-3 py-1 rounded-lg text-xs shadow-md border-none">
                  {Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% ছাড়
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {product.imageUrls.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn(
                    "w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-white border-2 transition-all shrink-0",
                    activeImageIndex === idx ? "border-primary shadow-md scale-105" : "border-slate-100 opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={url} alt="" className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold px-3 py-0.5 rounded-full text-[10px] uppercase tracking-wider">{product.category}</Badge>
                {product.stock > 0 ? (
                  <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] px-3 py-0.5 rounded-full">স্টকে আছে</Badge>
                ) : (
                  <Badge variant="destructive" className="font-bold text-[10px] px-3 py-0.5 rounded-full">স্টক আউট</Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight">{product.name}</h1>
              <div className="flex items-center gap-4">
                <span className="text-3xl md:text-4xl font-black text-primary">৳{hasDiscount ? product.discountPrice : product.price}</span>
                {hasDiscount && <span className="text-lg text-slate-300 line-through font-bold">৳{product.price}</span>}
              </div>
            </div>

            <Card className="p-5 md:p-8 rounded-[1.5rem] border-none shadow-lg bg-white space-y-6">
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                  <span className="font-bold text-slate-700 text-sm">{product.unit || 'বিকল্প'} বেছে নিন:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v}
                        onClick={() => setSelectedVariant(v)}
                        className={cn(
                          "px-4 py-2 rounded-xl font-bold text-xs md:text-sm border transition-all flex items-center gap-2",
                          selectedVariant === v 
                            ? "bg-primary text-white border-primary shadow-md" 
                            : "bg-slate-50 border-slate-100 text-slate-600 hover:border-primary/20"
                        )}
                      >
                        {v}
                        {selectedVariant === v && <CheckCircle className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div className="space-y-3">
                  <span className="font-bold text-slate-700 text-sm">কালার বেছে নিন:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={cn(
                          "px-4 py-2 rounded-xl font-bold text-xs md:text-sm border transition-all flex items-center gap-2",
                          selectedColor === c 
                            ? "bg-primary text-white border-primary shadow-md" 
                            : "bg-slate-50 border-slate-100 text-slate-600 hover:border-primary/20"
                        )}
                      >
                        {c}
                        {selectedColor === c && <CheckCircle className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <span className="font-bold text-slate-700 text-sm">পরিমাণ:</span>
                <div className="flex items-center gap-6 bg-slate-50 px-4 py-2 rounded-xl border">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-xl font-bold text-slate-400 hover:text-primary">-</button>
                  <span className="text-lg font-black w-6 text-center text-slate-900">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="text-xl font-bold text-slate-400 hover:text-primary">+</button>
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <Button 
                  onClick={handleOrderRedirect} 
                  disabled={product.stock <= 0}
                  className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl text-lg md:text-xl font-black gap-3 shadow-lg bg-primary transition-all active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                  অর্ডার করুন
                </Button>
                <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">
                  <Truck className="w-4 h-4 text-primary" />
                  সারা বাংলাদেশে ক্যাশ অন ডেলিভারি
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold border-b pb-2">
                 <Info className="w-4 h-4 text-primary" />
                 <span>পণ্যের বিবরণ</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base bg-white p-5 rounded-2xl border shadow-sm">
                {product.description || 'এই পণ্যটির কোনো বিস্তারিত বিবরণ বর্তমানে পাওয়া যায়নি। তবে এটি অত্যন্ত প্রিমিয়াম কোয়ালিটির পণ্য যা সরাসরি আমদানিকৃত।'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
