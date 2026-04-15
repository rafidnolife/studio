
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
import { CheckCircle, Info, Zap, ShieldCheck, ArrowLeft, ShoppingCart, MapPin, Truck, ChevronRight } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 lg:py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
          <Skeleton className="aspect-square w-full rounded-[2.5rem]" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-6">
        <Info className="w-10 h-10 text-slate-400" />
        <h2 className="text-2xl font-black text-slate-800">পণ্যটি খুঁজে পাওয়া যায়নি!</h2>
        <Button onClick={() => router.push('/products')} variant="outline" className="rounded-full">
          <ArrowLeft className="mr-2" /> সব পণ্য দেখুন
        </Button>
      </div>
    </div>
  );

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F8FAFC]">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
          <div className="space-y-6">
            <div className="relative aspect-square w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-white border border-slate-100 shadow-2xl transition-all duration-700">
              <ImageWithFallback 
                src={product.imageUrls[activeImageIndex]} 
                alt={product.name} 
                className="object-contain p-4 md:p-12" 
              />
              {hasDiscount && (
                <Badge className="absolute top-6 left-6 bg-red-500 text-white font-black px-6 py-2 rounded-2xl text-lg shadow-xl border-none">
                  {Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% ছাড়
                </Badge>
              )}
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
              {product.imageUrls.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn(
                    "w-20 h-20 md:w-28 md:h-28 rounded-[1.5rem] overflow-hidden bg-white border-4 transition-all shrink-0 shadow-lg",
                    activeImageIndex === idx ? "border-primary scale-110 shadow-primary/20" : "border-transparent opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
                  )}
                >
                  <img src={url} alt="" className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-8 md:space-y-10">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] text-[10px] md:text-xs">{product.category}</Badge>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-none tracking-tighter">{product.name}</h1>
              <div className="flex items-center gap-6">
                <span className="text-4xl md:text-6xl font-black text-primary">৳{hasDiscount ? product.discountPrice : product.price}</span>
                {hasDiscount && <span className="text-xl md:text-2xl text-slate-300 line-through font-bold">৳{product.price}</span>}
              </div>
            </div>

            <Card className="p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-none shadow-2xl bg-white space-y-10">
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-800 text-xl">{product.unit || 'বিকল্প'} বেছে নিন:</span>
                    <Badge variant="outline" className="rounded-full font-black text-[10px] tracking-widest text-primary border-primary/20 bg-primary/5 px-4 py-1.5">
                      {selectedVariant || 'REQUIRED'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((v) => (
                      <button
                        key={v}
                        onClick={() => setSelectedVariant(v)}
                        className={cn(
                          "px-6 py-4 rounded-2xl font-black text-sm md:text-lg border-2 transition-all flex items-center gap-2",
                          selectedVariant === v 
                            ? "bg-primary text-white border-primary shadow-2xl scale-105 shadow-primary/30" 
                            : "bg-slate-50 border-slate-100 text-slate-600 hover:border-primary/30"
                        )}
                      >
                        {v}
                        {selectedVariant === v && <CheckCircle className="w-5 h-5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div className="space-y-5">
                  <span className="font-black text-slate-800 text-xl">কালার বেছে নিন:</span>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={cn(
                          "px-6 py-4 rounded-2xl font-black text-sm md:text-lg border-2 transition-all flex items-center gap-2",
                          selectedColor === c 
                            ? "bg-primary text-white border-primary shadow-2xl scale-105 shadow-primary/30" 
                            : "bg-slate-50 border-slate-100 text-slate-600 hover:border-primary/30"
                        )}
                      >
                        {c}
                        {selectedColor === c && <CheckCircle className="w-5 h-5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="font-black text-slate-800 text-xl">পরিমাণ:</span>
                <div className="flex items-center gap-8 bg-slate-50 px-8 py-3 rounded-3xl border-none shadow-inner">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-3xl font-black text-slate-400 hover:text-primary transition-colors">-</button>
                  <span className="text-3xl font-black w-10 text-center text-slate-900">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="text-3xl font-black text-slate-400 hover:text-primary transition-colors">+</button>
                </div>
              </div>
              
              <div className="space-y-6 pt-4">
                <Button 
                  onClick={handleOrderRedirect} 
                  disabled={product.stock <= 0}
                  className="w-full h-20 md:h-24 rounded-[1.5rem] md:rounded-[2rem] text-2xl md:text-3xl font-black gap-6 shadow-[0_25px_50px_-12px_rgba(16,185,129,0.4)] bg-primary group transition-all active:scale-95"
                >
                  <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 group-hover:rotate-12 transition-transform" />
                  অর্ডার করুন
                </Button>
                <div className="flex items-center justify-center gap-3 text-xs md:text-sm text-primary font-black uppercase tracking-widest">
                  <Truck className="w-5 h-5 animate-bounce-horizontal" />
                  সারা বাংলাদেশে ক্যাশ অন ডেলিভারি
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-lg">
                   <Info className="w-6 h-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter">পণ্যের বিবরণ</h3>
              </div>
              <p className="text-slate-600 leading-relaxed font-bold text-lg md:text-xl bg-white/70 glass p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl">
                {product.description || 'এই পণ্যটির কোনো বিস্তারিত বিবরণ বর্তমানে পাওয়া যায়নি। তবে এটি অত্যন্ত প্রিমিয়াম কোয়ালিটির পণ্য যা সরাসরি আমদানিকৃত।'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
