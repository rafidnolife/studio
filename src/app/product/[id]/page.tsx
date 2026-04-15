
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
import { CheckCircle, Info, ShoppingCart, Truck, ArrowLeft } from 'lucide-react';
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
          if (typeof window !== 'undefined') {
            const recent = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
            const filtered = recent.filter((p: any) => p.id !== productData.id);
            const updated = [productData, ...filtered].slice(0, 10);
            localStorage.setItem('recently_viewed', JSON.stringify(updated));
          }
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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
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
      <main className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left: Images */}
          <div className="space-y-3 sticky top-24">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border shadow-sm">
              <ImageWithFallback 
                src={product.imageUrls[activeImageIndex]} 
                alt={product.name} 
                className="object-cover" 
              />
              {hasDiscount && (
                <Badge className="absolute top-3 left-3 bg-red-500 text-white font-black px-2 py-0.5 rounded-lg text-[10px] shadow-md border-none">
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
                    "w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-white border-2 transition-all shrink-0",
                    activeImageIndex === idx ? "border-primary shadow-sm scale-105" : "border-slate-100 opacity-60"
                  )}
                >
                  <img src={url} alt="" className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider">{product.category}</Badge>
                {product.stock > 0 ? (
                  <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] px-2 py-0.5 rounded-full">স্টকে আছে</Badge>
                ) : (
                  <Badge variant="destructive" className="font-bold text-[9px] px-2 py-0.5 rounded-full">স্টক আউট</Badge>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight tracking-tight">{product.name}</h1>
              <div className="flex items-center gap-3">
                <span className="text-2xl md:text-3xl font-black text-primary">৳{hasDiscount ? product.discountPrice : product.price}</span>
                {hasDiscount && <span className="text-base text-slate-300 line-through font-bold">৳{product.price}</span>}
              </div>
            </div>

            <Card className="p-5 md:p-6 rounded-2xl border-none shadow-lg bg-white space-y-5">
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2.5">
                  <span className="font-bold text-slate-700 text-xs">{product.unit || 'বিকল্প'} বেছে নিন:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v}
                        onClick={() => setSelectedVariant(v)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg font-bold text-[11px] md:text-xs border transition-all flex items-center gap-1.5",
                          selectedVariant === v 
                            ? "bg-primary text-white border-primary shadow-sm" 
                            : "bg-slate-50 border-slate-100 text-slate-600"
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
                <div className="space-y-2.5">
                  <span className="font-bold text-slate-700 text-xs">কালার বেছে নিন:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg font-bold text-[11px] md:text-xs border transition-all flex items-center gap-1.5",
                          selectedColor === c 
                            ? "bg-primary text-white border-primary shadow-sm" 
                            : "bg-slate-50 border-slate-100 text-slate-600"
                        )}
                      >
                        {c}
                        {selectedColor === c && <CheckCircle className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-slate-700 text-xs">পরিমাণ:</span>
                <div className="flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-lg border">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-lg font-bold text-slate-400 hover:text-primary">-</button>
                  <span className="text-base font-black w-5 text-center text-slate-900">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="text-lg font-bold text-slate-400 hover:text-primary">+</button>
                </div>
              </div>
              
              <div className="space-y-2 pt-1">
                <Button 
                  onClick={handleOrderRedirect} 
                  disabled={product.stock <= 0}
                  className="w-full h-12 md:h-14 rounded-xl text-base md:text-lg font-black gap-2 shadow-md bg-primary"
                >
                  <ShoppingCart className="w-4.5 h-4.5 md:w-5 md:h-5" />
                  অর্ডার করুন
                </Button>
                <div className="flex items-center justify-center gap-1.5 text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <Truck className="w-3.5 h-3.5 text-primary" />
                  সারা বাংলাদেশে ক্যাশ অন ডেলিভারি
                </div>
              </div>
            </Card>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-slate-800 font-bold border-b pb-1.5 text-sm">
                 <Info className="w-4 h-4 text-primary" />
                 <span>পণ্যের বিবরণ</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-xs md:text-sm bg-white p-4 rounded-xl border shadow-sm">
                {product.description || 'এই পণ্যটির কোনো বিস্তারিত বিবরণ বর্তমানে পাওয়া যায়নি। তবে এটি অত্যন্ত প্রিমিয়াম কোয়ালিটির পণ্য যা সরাসরি আমদানিকৃত।'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
